import mongoose from "mongoose";
import { getKnowledgeItemCount } from "../config/knowledge.js";

const knowledgeItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    category: {
      type: String,
      enum: ["vocabulary", "science", "history", "geography", "arts_culture", "technology", "general_knowledge"],
      required: true
    },
    type: { type: String, enum: ["word", "question", "fact", "concept"], required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    question: { type: String, default: null },
    answer: { type: String, default: null },
    example: { type: String, default: null },
    sourceNote: { type: String, default: null }
  },
  { _id: false, strict: true }
);

const dailyKnowledgeSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    items: {
      type: [knowledgeItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length === getKnowledgeItemCount(),
        message: "Daily knowledge has an invalid item count"
      }
    }
  },
  { timestamps: true }
);

dailyKnowledgeSchema.index({ date: 1 }, { unique: true });

export const DailyKnowledge = mongoose.model("DailyKnowledge", dailyKnowledgeSchema);
