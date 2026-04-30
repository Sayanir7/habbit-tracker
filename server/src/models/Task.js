import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
