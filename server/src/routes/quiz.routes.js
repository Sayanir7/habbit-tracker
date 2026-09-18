import { Router } from "express";
import { dailyQuiz, submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();
router.get("/daily", dailyQuiz);
router.post("/attempts", requireAuth, submitQuiz);
export default router;
