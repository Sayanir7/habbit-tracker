import { LEVEL_SIZE, XP_PER_HABIT, XP_PER_TASK } from "../constants/tracker.js";
import { addDays, formatKey } from "./date.js";

export const percentage = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

export const getDayCompletion = (state, dateKey) => {
  const habitTotal = state.habits.length;
  const habitDone = state.habits.filter((habit) => habit.history?.[dateKey]).length;
  const tasks = state.tasks[dateKey] ?? [];
  const taskDone = tasks.filter((task) => task.done).length;
  return percentage(habitDone + taskDone, habitTotal + tasks.length);
};

export const getHabitStats = (habit) => {
  const entries = Object.entries(habit.history ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const completed = entries.filter(([, done]) => done).length;
  let streak = 0;

  for (let cursor = new Date(); cursor >= addDays(new Date(), -90); cursor = addDays(cursor, -1)) {
    if (habit.history?.[formatKey(cursor)]) streak += 1;
    else break;
  }

  return {
    completion: percentage(completed, entries.length || 1),
    streak
  };
};

export const getTotalXp = (state) => {
  const habitXp = state.habits.reduce(
    (sum, habit) => sum + Object.values(habit.history ?? {}).filter(Boolean).length * XP_PER_HABIT,
    0
  );
  const taskXp = Object.values(state.tasks).flat().filter((task) => task.done).length * XP_PER_TASK;
  return habitXp + taskXp;
};

export const getLevel = (xp) => ({
  level: Math.floor(xp / LEVEL_SIZE) + 1,
  levelProgress: Math.round(((xp % LEVEL_SIZE) / LEVEL_SIZE) * 100)
});

export const getAchievements = (state) => {
  const totalTasks = Object.values(state.tasks).flat().filter((task) => task.done).length;
  const bestStreak = Math.max(0, ...state.habits.map((habit) => getHabitStats(habit).streak));
  const perfectDays = Array.from({ length: 30 }, (_, index) => formatKey(addDays(new Date(), index - 29))).filter(
    (key) => getDayCompletion(state, key) === 100
  ).length;

  return { totalTasks, bestStreak, perfectDays };
};
