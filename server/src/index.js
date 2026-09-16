import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000;
const app = createApp();

connectDb()
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Habit Quest API listening on http://localhost:${PORT}`);
    });
  });
