import { Habit } from "../models/Habit.js";
import { Note } from "../models/Note.js";
import { Task } from "../models/Task.js";
import { toHabit, toNote, toTask } from "../utils/serializers.js";
import { getCurrentStreak } from "../utils/habit-stats.js";

export const getTracker = async (req, res) => {
  const [habits, tasks, notes] = await Promise.all([
    Habit.find({ userId: req.user._id }).sort({ createdAt: 1 }),
    Task.find({ userId: req.user._id }).sort({ date: 1, createdAt: 1 }),
    Note.find({ userId: req.user._id }).sort({ date: 1 })
  ]);

  await Promise.all(habits.map(async (habit) => {
    const currentStreak = getCurrentStreak(Object.fromEntries(habit.history ?? []));
    if ((habit.currentStreak || 0) !== currentStreak) {
      habit.currentStreak = currentStreak;
      await habit.save();
    }
  }));

  res.json({
    habits: habits.map(toHabit),
    tasks: tasks.reduce((acc, task) => {
      acc[task.date] = [...(acc[task.date] ?? []), toTask(task)];
      return acc;
    }, {}),
    notes: notes.reduce((acc, note) => {
      acc[note.date] = [...(acc[note.date] ?? []), toNote(note)];
      return acc;
    }, {})
  });
};
