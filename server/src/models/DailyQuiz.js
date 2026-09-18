import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [{ type: String, trim: true }], required: true },
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    numericalAnswer: { type: String, default: null, trim: true }
  },
  { _id: false, strict: true }
);

const dailyQuizSchema = new mongoose.Schema(
  { date: { type: String, required: true }, questions: { type: [quizQuestionSchema], required: true } },
  { timestamps: true }
);

dailyQuizSchema.index({ date: 1 }, { unique: true });
export const DailyQuiz = mongoose.model("DailyQuiz", dailyQuizSchema);
