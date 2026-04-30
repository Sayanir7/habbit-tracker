import { addDays, formatKey } from "../utils/date.js";

export const XP_PER_HABIT = 15;
export const XP_PER_TASK = 10;
export const LEVEL_SIZE = 250;
export const habitColors = ["#16a34a", "#14b8a6", "#84cc16", "#f59e0b", "#0ea5e9", "#a855f7"];

export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const emptyTrackerState = () => ({
  habits: [],
  tasks: {},
  notes: {},
  darkMode: false,
  selectedDate: formatKey(new Date()),
  user: null
});

export const createDemoState = () => {
  const today = new Date();
  const keys = Array.from({ length: 30 }, (_, index) => formatKey(addDays(today, index - 29)));
  const pattern = {
    0: [true, true, false, true, true, true, false],
    1: [true, false, true, true, true, false, true],
    2: [false, true, true, true, false, true, true],
    3: [true, true, true, false, true, false, true]
  };

  const habits = ["Wake up early", "Gym", "Study", "No social media"].map((name, index) => ({
    id: makeId(),
    name,
    color: habitColors[index],
    reminder: index === 0 ? "07:00" : "",
    history: keys.reduce((acc, key, keyIndex) => {
      acc[key] = pattern[index][keyIndex % 7];
      return acc;
    }, {})
  }));

  const todayKey = formatKey(today);

  return {
    ...emptyTrackerState(),
    habits,
    tasks: {
      [todayKey]: [
        { id: makeId(), title: "Review weekly goals", done: true },
        { id: makeId(), title: "Deep work block", done: false },
        { id: makeId(), title: "Plan tomorrow", done: false }
      ]
    },
    notes: {
      [todayKey]: "Keep the list short and protect the first focus block."
    },
    user: {
      name: "Guest",
      email: ""
    }
  };
};
