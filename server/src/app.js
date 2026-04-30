import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import trackerRoutes from "./routes/tracker.routes.js";
import habitRoutes from "./routes/habit.routes.js";
import taskRoutes from "./routes/task.routes.js";
import noteRoutes from "./routes/note.routes.js";

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174"
].filter(Boolean);

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: "Habit Quest API" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/tracker", trackerRoutes);
  app.use("/api/habits", habitRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/notes", noteRoutes);

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Server error" });
  });

  return app;
};
