import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DailyQuiz } from "../models/DailyQuiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { askGemini } from "./assistant/gemini.service.js";
import { getQuizQuestionCount } from "../config/quiz.js";
import { getContentRetentionDays } from "../config/content.js";
import { dateBefore, getDateKey, getOrGenerateDailyContent, listRecentDailyContent, startDailyContentScheduler } from "./daily-content.service.js";

const promptPath = fileURLToPath(new URL("../utils/aptitude-system-prompt.md", import.meta.url));
const generationLocks = new Map();
const difficulties = new Set(["easy", "medium", "hard"]);
const responseSchema = {
  type: "OBJECT",
  properties: {
    date: { type: "STRING" },
    questions: { type: "ARRAY", items: { type: "OBJECT", properties: {
      question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, correctAnswer: { type: "STRING" }, explanation: { type: "STRING" }, topic: { type: "STRING" }, difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] }, numericalAnswer: { type: "STRING", nullable: true }
    }, required: ["question", "options", "correctAnswer", "explanation", "topic", "difficulty"] } }
  }, required: ["date", "questions"]
};

export const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const parseJson = (raw) => {
  try {
    return JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""));
  } catch {
    throw Object.assign(new Error("Gemini returned malformed daily quiz JSON"), { status: 502 });
  }
};

const validatePayload = (payload, date) => {
  const questionCount = getQuizQuestionCount();
  if (!payload || payload.date !== date || !Array.isArray(payload.questions) || payload.questions.length !== questionCount) {
    throw Object.assign(new Error("Gemini returned an invalid daily quiz"), { status: 502 });
  }
  const seen = new Set();
  const questions = payload.questions.map((item) => {
    if (!item || typeof item.question !== "string" || !item.question.trim() || seen.has(item.question.trim().toLowerCase()) || !Array.isArray(item.options) || item.options.length !== 4 || new Set(item.options.map((option) => option?.trim())).size !== 4 || !item.options.every((option) => typeof option === "string" && option.trim()) || !item.options.includes(item.correctAnswer) || typeof item.explanation !== "string" || !item.explanation.trim() || typeof item.topic !== "string" || !item.topic.trim() || !difficulties.has(item.difficulty)) {
      throw Object.assign(new Error("Gemini returned an invalid quiz question"), { status: 502 });
    }
    seen.add(item.question.trim().toLowerCase());
    return { ...item, question: item.question.trim(), options: item.options.map((option) => option.trim()), correctAnswer: item.correctAnswer.trim(), explanation: item.explanation.trim(), topic: item.topic.trim(), numericalAnswer: typeof item.numericalAnswer === "string" && item.numericalAnswer.trim() ? item.numericalAnswer.trim() : null };
  });
  return { date, questions };
};

const generateAndStore = async (date) => {
  const questionCount = getQuizQuestionCount();
  const prompt = (await readFile(promptPath, "utf8")).replaceAll("{{QUIZ_QUESTION_COUNT}}", String(questionCount));
  const retentionDays = getContentRetentionDays();
  const previous = await DailyQuiz.find({ date: { $lt: date } }).sort({ date: -1 }).limit(retentionDays).lean();
  const reference = previous.map((entry) => ({ date: entry.date, questions: entry.questions.map(({ question, topic, difficulty, options, correctAnswer }) => ({ question, topic, difficulty, options, correctAnswer })) }));
  const raw = await askGemini(`SYSTEM PROMPT\n${prompt}\n\nPREVIOUS CONTENT (reference only; avoid duplication):\n${JSON.stringify(reference)}\n\nGENERATION REQUEST\nGenerate exactly ${questionCount} aptitude/reasoning MCQs for date ${date}. Return the required JSON object with date and questions.`, [], { json: true, model: "gemini-2.5-flash", responseSchema });
  const payload = validatePayload(parseJson(raw), date);
  try { return await DailyQuiz.create(payload); } catch (error) { if (error?.code === 11000) return DailyQuiz.findOne({ date }); throw error; }
};

export const cleanupDailyQuizzes = async (date = todayKey()) => {
  const retentionDays = getContentRetentionDays();
  return DailyQuiz.deleteMany({ date: { $lt: dateBefore(date, retentionDays - 1) } });
};

export const getDailyQuiz = async () =>
  getOrGenerateDailyContent({
    model: DailyQuiz,
    date: todayKey(),
    generate: generateAndStore,
    retentionDays: getContentRetentionDays()
  });

export const getQuizHistory = () => listRecentDailyContent(DailyQuiz, getDateKey(), getContentRetentionDays());

export const saveAttempt = async (userId, { quizDate, answers, timeTakenSeconds }) => {
  const quiz = await DailyQuiz.findOne({ date: quizDate }).lean();
  if (!quiz) throw Object.assign(new Error("This daily quiz is unavailable"), { status: 404 });
  const expectedCount = quiz.questions.length;
  if (!Array.isArray(answers) || answers.length !== expectedCount || new Set(answers.map((item) => item?.questionIndex)).size !== expectedCount || !answers.every((item) => Number.isInteger(item?.questionIndex) && item.questionIndex >= 0 && item.questionIndex < expectedCount) || !Number.isFinite(timeTakenSeconds) || timeTakenSeconds < 0) throw Object.assign(new Error("Invalid quiz submission"), { status: 400 });
  const normalized = quiz.questions.map((question, index) => { const answer = answers.find((item) => item?.questionIndex === index)?.selectedAnswer ?? null; return { questionIndex: index, selectedAnswer: question.options.includes(answer) ? answer : null, isCorrect: answer === question.correctAnswer }; });
  const score = normalized.filter((answer) => answer.isCorrect).length;
  const attempt = await QuizAttempt.findOneAndUpdate({ user: userId, quizDate }, { user: userId, quizDate, score, total: expectedCount, timeTakenSeconds: Math.round(timeTakenSeconds), answers: normalized }, { upsert: true, new: true, runValidators: true });
  return { attempt, quiz };
};

export const startDailyQuizScheduler = () => startDailyContentScheduler(getDailyQuiz, "quiz");
