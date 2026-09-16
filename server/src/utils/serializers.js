export const toUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

export const toHabit = (habit) => ({
  id: habit._id.toString(),
  name: habit.name,
  color: habit.color,
  reminder: habit.reminder,
  history: Object.fromEntries(habit.history ?? []),
  currentStreak: habit.currentStreak || 0,
  maxStreak: habit.maxStreak || 0
});

export const toTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  done: task.done,
  date: task.date
});

export const toNote = (note) => {
  const fields = Object.fromEntries(note.fields ?? []);
  if (Object.keys(fields).length === 0 && note.body) fields.text = note.body;

  return {
    id: note._id.toString(),
    date: note.date,
    fields,
    location: note.location || "",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
};

export const toLocation = (location) => ({
  id: location._id.toString(),
  name: location.name
});
