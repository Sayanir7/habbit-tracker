import { Router } from "express";
import { chat } from "../controllers/assistant.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/chat", requireAuth, chat);

export default router;
