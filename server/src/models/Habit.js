import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#16a34a" },
    reminder: { type: String, default: "" },
    history: { type: Map, of: Boolean, default: {} }
  },
  { timestamps: true }
);

export const Habit = mongoose.model("Habit", habitSchema);
