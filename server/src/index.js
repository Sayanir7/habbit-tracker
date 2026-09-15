import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["172.17.1.1", "172.17.1.2"]);
dotenv.config();

const PORT = process.env.PORT || 4000;
const app = createApp();

connectDb()
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Habit Quest API listening on http://localhost:${PORT}`);
    });
  });
