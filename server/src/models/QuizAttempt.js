import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  { questionIndex: { type: Number, required: true }, selectedAnswer: { type: String, default: null }, isCorrect: { type: Boolean, required: true } },
  { _id: false, strict: true }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quizDate: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
    answers: { type: [answerSchema], required: true }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ user: 1, quizDate: 1 }, { unique: true });
export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
