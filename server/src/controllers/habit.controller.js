import { Habit } from "../models/Habit.js";
import { toHabit } from "../utils/serializers.js";

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
  if (typeof updates.name === "string") updates.name = updates.name.trim();

  const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true });
  if (!habit) return res.status(404).json({ message: "Habit not found" });

  res.json(toHabit(habit));
};

export const deleteHabit = async (req, res) => {
  await Habit.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.status(204).end();
};
