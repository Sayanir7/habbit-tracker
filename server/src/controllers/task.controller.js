import { Task } from "../models/Task.js";
import { toTask } from "../utils/serializers.js";

export const createTask = async (req, res) => {
  if (!req.body.date || !req.body.title?.trim()) {
    return res.status(400).json({ message: "Date and task title are required" });
  }

  const task = await Task.create({
    userId: req.user._id,
    date: req.body.date,
    title: req.body.title.trim(),
    done: Boolean(req.body.done)
  });

  res.status(201).json(toTask(task));
};

export const updateTask = async (req, res) => {
  const updates = { ...req.body };
  if (typeof updates.title === "string") updates.title = updates.title.trim();

  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true });
  if (!task) return res.status(404).json({ message: "Task not found" });

  res.json(toTask(task));
};

export const deleteTask = async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.status(204).end();
};
