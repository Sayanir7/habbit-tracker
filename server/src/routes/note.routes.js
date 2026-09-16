import { Router } from "express";
import { createNote, listNotes, searchLocations } from "../controllers/note.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/locations", requireAuth, searchLocations);
router.get("/", requireAuth, listNotes);
router.post("/:date", requireAuth, createNote);

export default router;
