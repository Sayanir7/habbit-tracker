import { Router } from "express";
import { dailyKnowledge, knowledgeHistory } from "../controllers/knowledge.controller.js";

const router = Router();

router.get("/daily", dailyKnowledge);
router.get("/history", knowledgeHistory);

export default router;
