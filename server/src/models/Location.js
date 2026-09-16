import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

locationSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Location = mongoose.model("Location", locationSchema);