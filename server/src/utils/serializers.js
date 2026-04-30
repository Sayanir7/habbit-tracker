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
  history: Object.fromEntries(habit.history ?? [])
});

export const toTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  done: task.done,
  date: task.date
});
