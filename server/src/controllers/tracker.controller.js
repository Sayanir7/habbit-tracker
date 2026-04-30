import { Habit } from "../models/Habit.js";
import { Note } from "../models/Note.js";
import { Task } from "../models/Task.js";
import { toHabit, toTask } from "../utils/serializers.js";

export const getTracker = async (req, res) => {
  const [habits, tasks, notes] = await Promise.all([
    Habit.find({ userId: req.user._id }).sort({ createdAt: 1 }),
    Task.find({ userId: req.user._id }).sort({ date: 1, createdAt: 1 }),
    Note.find({ userId: req.user._id }).sort({ date: 1 })
  ]);

  res.json({
    habits: habits.map(toHabit),
    tasks: tasks.reduce((acc, task) => {
      acc[task.date] = [...(acc[task.date] ?? []), toTask(task)];
      return acc;
    }, {}),
    notes: notes.reduce((acc, note) => {
      acc[note.date] = note.body;
      return acc;
    }, {})
  });
};
