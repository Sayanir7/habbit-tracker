import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    body: { type: String, default: "" }
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Note = mongoose.model("Note", noteSchema);
