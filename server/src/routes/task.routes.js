import { Router } from "express";
import { createTask, deleteTask, updateTask } from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/", requireAuth, createTask);
router.patch("/:id", requireAuth, updateTask);
router.delete("/:id", requireAuth, deleteTask);

export default router;
