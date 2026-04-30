import { Note } from "../models/Note.js";

export const upsertNote = async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { userId: req.user._id, date: req.params.date },
    { body: req.body.body ?? "" },
    { upsert: true, new: true }
  );

  res.json({ date: note.date, body: note.body });
};
