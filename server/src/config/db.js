import mongoose from "mongoose";

export const connectDb = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/habit_quest";
  mongoose.set("bufferCommands", false);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};
