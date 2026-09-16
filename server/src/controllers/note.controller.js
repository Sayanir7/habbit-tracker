import { Location } from "../models/Location.js";
import { Note } from "../models/Note.js";
import { toLocation, toNote } from "../utils/serializers.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const validateNote = (date, fields, location) => {
  if (!datePattern.test(date)) return "Date must use YYYY-MM-DD format";
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return "Fields must be an object";
  if (!String(fields.text || "").trim()) return "Note text is required";
  if (location !== undefined && typeof location !== "string") return "Location must be text";
  return null;
};

const saveLocation = async (userId, name) => {
  const trimmed = name.trim();
  if (!trimmed) return;
  await Location.findOneAndUpdate(
    { userId, name: trimmed },
    { $setOnInsert: { userId, name: trimmed } },
    { upsert: true, new: true }
  );
};

export const createNote = async (req, res) => {
  const { date } = req.params;
  const { fields = {}, location = "" } = req.body;
  const validationError = validateNote(date, fields, location);
  if (validationError) return res.status(400).json({ message: validationError });

  const note = await Note.create({ userId: req.user._id, date, fields, location: location.trim() });
  await saveLocation(req.user._id, location);
  res.status(201).json(toNote(note));
};

export const listNotes = async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  const [notes, total] = await Promise.all([
    Note.find({ userId: req.user._id }).sort({ date: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Note.countDocuments({ userId: req.user._id })
  ]);
  res.json({ notes: notes.map(toNote), page, limit, total, pages: Math.ceil(total / limit) });
};

export const searchLocations = async (req, res) => {
  const query = String(req.query.query || "").trim();
  if (!query) return res.json({ locations: [] });
  const locations = await Location.find({ userId: req.user._id, name: { $regex: query, $options: "i" } }).lean();
  const normalizedQuery = query.toLowerCase();
  locations.sort((first, second) => {
    const firstName = first.name.toLowerCase();
    const secondName = second.name.toLowerCase();
    const firstRank = firstName === normalizedQuery ? 0 : firstName.startsWith(normalizedQuery) ? 1 : 2;
    const secondRank = secondName === normalizedQuery ? 0 : secondName.startsWith(normalizedQuery) ? 1 : 2;
    return firstRank - secondRank || firstName.localeCompare(secondName);
  });
  const topLocations = locations.slice(0, 5);
  res.json({ locations: topLocations.map(toLocation) });
};
