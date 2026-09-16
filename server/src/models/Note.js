import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    fields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    location: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, date: 1, createdAt: -1 });

export const Note = mongoose.model("Note", noteSchema);
