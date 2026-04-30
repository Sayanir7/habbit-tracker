import { Router } from "express";
import { createHabit, deleteHabit, updateHabit } from "../controllers/habit.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/", requireAuth, createHabit);
router.patch("/:id", requireAuth, updateHabit);
router.delete("/:id", requireAuth, deleteHabit);

export default router;
