import { Router } from "express";
import { dailyKnowledge } from "../controllers/knowledge.controller.js";

const router = Router();

router.get("/daily", dailyKnowledge);

export default router;
