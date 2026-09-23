import { getDailyQuiz, getQuizHistory, saveAttempt } from "../services/quiz.service.js";

export const dailyQuiz = async (_req, res, next) => {
  try {
    const quiz = await getDailyQuiz();
    const questions = quiz.fallback
      ? quiz.questions
      : quiz.questions.map(({ correctAnswer, explanation, numericalAnswer, ...question }) => question);
    res.json({ date: quiz.date, fallback: Boolean(quiz.fallback), questions });
  } catch (error) {
    next(error);
  }
};

export const quizHistory = async (_req, res, next) => {
  try {
    res.json({ entries: await getQuizHistory() });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => { try { const { attempt, quiz } = await saveAttempt(req.user._id, req.body); res.json({ score: attempt.score, total: attempt.total, timeTakenSeconds: attempt.timeTakenSeconds, questions: quiz.questions, answers: attempt.answers }); } catch (error) { next(error); } };
