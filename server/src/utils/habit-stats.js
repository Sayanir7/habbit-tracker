const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCurrentStreak = (history, today = new Date()) => {
  let streak = 0;
  const cursor = typeof today === "string" ? new Date(`${today}T12:00:00`) : new Date(today);
  cursor.setHours(12, 0, 0, 0);

  while (history?.[formatDateKey(cursor)] === true) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const getStreakEndingOn = (history, dateKey) => getCurrentStreak(history, dateKey);

export const getMaxStreak = (history = {}) => {
  const entries = history instanceof Map ? Object.fromEntries(history) : history;
  const dates = Object.keys(entries).sort();
  let maxStreak = 0;
  let runningStreak = 0;
  let previousDate = null;
  let previousDone = false;

  dates.forEach((dateKey) => {
    const currentDate = new Date(`${dateKey}T12:00:00Z`);
    const isConsecutive = previousDate && currentDate - previousDate === 86400000;

    if (entries[dateKey] && isConsecutive && previousDone) runningStreak += 1;
    else if (entries[dateKey]) runningStreak = 1;
    else runningStreak = 0;

    maxStreak = Math.max(maxStreak, runningStreak);
    previousDate = currentDate;
    previousDone = Boolean(entries[dateKey]);
  });

  return maxStreak;
};
