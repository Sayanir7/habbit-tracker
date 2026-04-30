import { Router } from "express";
import { getTracker } from "../controllers/tracker.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getTracker);

export default router;
