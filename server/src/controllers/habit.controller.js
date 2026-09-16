import { Habit } from "../models/Habit.js";
import { toHabit } from "../utils/serializers.js";
import { getStreakEndingOn } from "../utils/habit-stats.js";

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export const createHabit = async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ message: "Habit name is required" });

  const habit = await Habit.create({
    userId: req.user._id,
    name: req.body.name.trim(),
    color: req.body.color,
    reminder: req.body.reminder
  });

  res.status(201).json(toHabit(habit));
};

export const updateHabit = async (req, res) => {
  const updates = { ...req.body };
  const changedDate = updates.changedDate;
  delete updates.changedDate;
  delete updates.currentDate;
  if (typeof updates.name === "string") updates.name = updates.name.trim();
  delete updates.maxStreak;
  delete updates.currentStreak;
  if (updates.history && typeof updates.history === "object") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(changedDate || "")) {
      return res.status(400).json({ message: "A valid changed date is required" });
    }
    const existingHabit = await Habit.findOne({ _id: req.params.id, userId: req.user._id }).select("maxStreak currentStreak");
    if (!existingHabit) return res.status(404).json({ message: "Habit not found" });
    if (changedDate !== getTodayKey()) {
      return res.status(400).json({ message: "Habits can only be marked for the current day" });
    }
    updates.currentStreak = getStreakEndingOn(updates.history, changedDate);
    updates.maxStreak = Math.max(existingHabit.maxStreak || 0, updates.currentStreak);
  }
  const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true });
  if (!habit) return res.status(404).json({ message: "Habit not found" });

  res.json(toHabit(habit));
};

export const deleteHabit = async (req, res) => {
  await Habit.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.status(204).end();
};
