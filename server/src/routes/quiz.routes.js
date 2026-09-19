import { Router } from "express";
import { dailyQuiz, quizHistory, submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();
router.get("/daily", dailyQuiz);
router.get("/history", quizHistory);
router.post("/attempts", requireAuth, submitQuiz);
export default router;
