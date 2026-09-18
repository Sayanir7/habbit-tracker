import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DailyQuiz } from "../models/DailyQuiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { askGemini } from "./assistant/gemini.service.js";

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
const dateBefore = (key, days) => { const d = new Date(`${key}T12:00:00`); d.setDate(d.getDate() - days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const parseJson = (raw) => {
  try {
    return JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, ""));
  } catch {
    throw Object.assign(new Error("Gemini returned malformed daily quiz JSON"), { status: 502 });
  }
};

const validatePayload = (payload, date) => {
  if (!payload || payload.date !== date || !Array.isArray(payload.questions) || payload.questions.length !== 10) throw Object.assign(new Error("Gemini returned an invalid daily quiz"), { status: 502 });
  const seen = new Set();
  const questions = payload.questions.map((item) => {
    if (!item || typeof item.question !== "string" || !item.question.trim() || seen.has(item.question.trim().toLowerCase()) || !Array.isArray(item.options) || item.options.length !== 4 || new Set(item.options.map((option) => option?.trim())).size !== 4 || !item.options.every((option) => typeof option === "string" && option.trim()) || !item.options.includes(item.correctAnswer) || typeof item.explanation !== "string" || !item.explanation.trim() || typeof item.topic !== "string" || !item.topic.trim() || !difficulties.has(item.difficulty)) throw Object.assign(new Error("Gemini returned an invalid quiz question"), { status: 502 });
    seen.add(item.question.trim().toLowerCase());
    return { ...item, question: item.question.trim(), options: item.options.map((option) => option.trim()), correctAnswer: item.correctAnswer.trim(), explanation: item.explanation.trim(), topic: item.topic.trim(), numericalAnswer: typeof item.numericalAnswer === "string" && item.numericalAnswer.trim() ? item.numericalAnswer.trim() : null };
  });
  return { date, questions };
};

const generateAndStore = async (date) => {
  const prompt = await readFile(promptPath, "utf8");
  const raw = await askGemini(`${prompt}\n\nGenerate the quiz for date ${date}. Return the required JSON object with date and questions.`, [], { json: true, model: "gemini-2.5-flash", responseSchema });
  const payload = validatePayload(parseJson(raw), date);
  try { return await DailyQuiz.create(payload); } catch (error) { if (error?.code === 11000) return DailyQuiz.findOne({ date }); throw error; }
};

export const cleanupDailyQuizzes = async (date = todayKey()) => DailyQuiz.deleteMany({ date: { $lt: dateBefore(date, 2) } });
export const getDailyQuiz = async () => {
  const date = todayKey();
  const existing = await DailyQuiz.findOne({ date }).lean();
  await cleanupDailyQuizzes(date);
  if (existing) return existing;
  let generation = generationLocks.get(date);
  if (!generation) { generation = generateAndStore(date).finally(() => generationLocks.delete(date)); generationLocks.set(date, generation); }
  return generation;
};

export const saveAttempt = async (userId, { quizDate, answers, timeTakenSeconds }) => {
  const quiz = await DailyQuiz.findOne({ date: quizDate }).lean();
  if (!quiz) throw Object.assign(new Error("This daily quiz is unavailable"), { status: 404 });
  if (!Array.isArray(answers) || answers.length !== 10 || new Set(answers.map((item) => item?.questionIndex)).size !== 10 || !answers.every((item) => Number.isInteger(item?.questionIndex) && item.questionIndex >= 0 && item.questionIndex < 10) || !Number.isFinite(timeTakenSeconds) || timeTakenSeconds < 0) throw Object.assign(new Error("Invalid quiz submission"), { status: 400 });
  const normalized = quiz.questions.map((question, index) => { const answer = answers.find((item) => item?.questionIndex === index)?.selectedAnswer ?? null; return { questionIndex: index, selectedAnswer: question.options.includes(answer) ? answer : null, isCorrect: answer === question.correctAnswer }; });
  const score = normalized.filter((answer) => answer.isCorrect).length;
  const attempt = await QuizAttempt.findOneAndUpdate({ user: userId, quizDate }, { user: userId, quizDate, score, total: 10, timeTakenSeconds: Math.round(timeTakenSeconds), answers: normalized }, { upsert: true, new: true, runValidators: true });
  return { attempt, quiz };
};

export const startDailyQuizScheduler = () => {
  const run = () => getDailyQuiz().catch((error) => console.error("Daily quiz generation failed:", error.message));
  run();
  const scheduleNext = () => { const now = new Date(); const next = new Date(now); next.setHours(24, 5, 0, 0); setTimeout(() => { run(); scheduleNext(); }, next - now); };
  scheduleNext();
};
