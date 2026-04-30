import { Router } from "express";
import { upsertNote } from "../controllers/note.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.put("/:date", requireAuth, upsertNote);

export default router;
