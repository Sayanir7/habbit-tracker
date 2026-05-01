import { useEffect, useState } from "react";
import { createDemoState, emptyTrackerState, habitColors, makeId } from "../constants/tracker.js";
import { api } from "../services/api.js";
import { formatKey } from "../utils/date.js";

const GUEST_STORAGE_KEY = "habit-quest-guest-state";
const TOKEN_KEY = "habit-quest-token";
const USER_KEY = "habit-quest-user";
const THEME_STORAGE_KEY = "habit-quest-theme";

const readTheme = (fallback = false) => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "dark") return true;
  if (savedTheme === "light") return false;
  return fallback;
};

const confirmDelete = (message) => typeof window === "undefined" || window.confirm(message);

const readGuestState = () => {
  const raw = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!raw) return createDemoState();

  try {
    return { ...createDemoState(), ...JSON.parse(raw) };
  } catch {
    return createDemoState();
  }
};

const readUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const useTracker = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readUser);
  const [state, setState] = useState(() => {
    const initialState = localStorage.getItem(TOKEN_KEY) ? emptyTrackerState() : readGuestState();
    return { ...initialState, darkMode: readTheme(initialState.darkMode) };
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [authError, setAuthError] = useState("");

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(state.darkMode));
    localStorage.setItem(THEME_STORAGE_KEY, state.darkMode ? "dark" : "light");
  }, [state.darkMode]);

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state));
  }, [isAuthenticated, state]);

  useEffect(() => {
    if (!token) return;

    const loadAccount = async () => {
      setLoading(true);
      try {
        const [{ user: account }, tracker] = await Promise.all([api.me(), api.tracker()]);
        setUser(account);
        localStorage.setItem(USER_KEY, JSON.stringify(account));
        setState((current) => ({
          ...emptyTrackerState(),
          darkMode: current.darkMode,
          selectedDate: current.selectedDate || formatKey(new Date()),
          user: account,
          ...tracker
        }));
      } catch (error) {
        logout();
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [token]);

  const setGuestState = (recipe) => {
    setState((current) => (typeof recipe === "function" ? recipe(current) : recipe));
  };

  const applyAuth = async (authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    setToken(authResponse.token);
    setUser(authResponse.user);
    setAuthError("");

    const tracker = await api.tracker();
    setState((current) => ({
      ...emptyTrackerState(),
      darkMode: current.darkMode,
      selectedDate: formatKey(new Date()),
      user: authResponse.user,
      ...tracker
    }));
  };

  const login = async (payload) => {
    setAuthError("");
    try {
      await applyAuth(await api.login(payload));
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const signup = async (payload) => {
    setAuthError("");
    try {
      await applyAuth(await api.signup(payload));
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    const guestState = readGuestState();
    setState({ ...guestState, darkMode: readTheme(guestState.darkMode) });
  }

  const setDarkMode = () => setGuestState((current) => ({ ...current, darkMode: !current.darkMode }));

  const setSelectedDate = (selectedDate) => setGuestState((current) => ({ ...current, selectedDate }));

  const addHabit = async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (isAuthenticated) {
      const habit = await api.createHabit({
        name: trimmedName,
        color: habitColors[state.habits.length % habitColors.length]
      });
      setState((current) => ({ ...current, habits: [...current.habits, habit] }));
      return;
    }

    setGuestState((current) => ({
      ...current,
      habits: [
        ...current.habits,
        {
          id: makeId(),
          name: trimmedName,
          color: habitColors[current.habits.length % habitColors.length],
          reminder: "",
          history: {}
        }
      ]
    }));
  };

  const updateHabitName = async (habitId, name) => {
    const apply = (habit) => (habit.id === habitId ? { ...habit, name } : habit);
    setGuestState((current) => ({ ...current, habits: current.habits.map(apply) }));
    if (isAuthenticated) await api.updateHabit(habitId, { name });
  };

  const toggleHabit = async (habitId, dateKey) => {
    const habit = state.habits.find((item) => item.id === habitId);
    if (!habit) return;

    const history = { ...habit.history, [dateKey]: !habit.history?.[dateKey] };
    setGuestState((current) => ({
      ...current,
      habits: current.habits.map((item) => (item.id === habitId ? { ...item, history } : item))
    }));
    if (isAuthenticated) await api.updateHabit(habitId, { history });
  };

  const deleteHabit = async (habitId) => {
    const habit = state.habits.find((item) => item.id === habitId);
    if (!confirmDelete(`Delete "${habit?.name ?? "this habit"}"? This cannot be undone.`)) return;

    setGuestState((current) => ({ ...current, habits: current.habits.filter((habit) => habit.id !== habitId) }));
    if (isAuthenticated) await api.deleteHabit(habitId);
  };

  const addTask = async (date, title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (isAuthenticated) {
      const task = await api.createTask({ date, title: trimmedTitle, done: false });
      setState((current) => ({
        ...current,
        tasks: { ...current.tasks, [date]: [...(current.tasks[date] ?? []), task] }
      }));
      return;
    }

    setGuestState((current) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [date]: [...(current.tasks[date] ?? []), { id: makeId(), title: trimmedTitle, done: false }]
      }
    }));
  };

  const toggleTask = async (date, taskId) => {
    const task = (state.tasks[date] ?? []).find((item) => item.id === taskId);
    if (!task) return;

    const done = !task.done;
    setGuestState((current) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [date]: (current.tasks[date] ?? []).map((item) => (item.id === taskId ? { ...item, done } : item))
      }
    }));
    if (isAuthenticated) await api.updateTask(taskId, { done });
  };

  const deleteTask = async (date, taskId) => {
    const task = (state.tasks[date] ?? []).find((item) => item.id === taskId);
    if (!confirmDelete(`Delete "${task?.title ?? "this task"}"? This cannot be undone.`)) return;

    setGuestState((current) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [date]: (current.tasks[date] ?? []).filter((task) => task.id !== taskId)
      }
    }));
    if (isAuthenticated) await api.deleteTask(taskId);
  };

  const updateNote = async (date, body) => {
    setGuestState((current) => ({ ...current, notes: { ...current.notes, [date]: body } }));
    if (isAuthenticated) await api.upsertNote(date, body);
  };

  return {
    state: { ...state, user: user ?? state.user },
    loading,
    authError,
    isAuthenticated,
    actions: {
      login,
      signup,
      logout,
      setDarkMode,
      setSelectedDate,
      addHabit,
      updateHabitName,
      toggleHabit,
      deleteHabit,
      addTask,
      toggleTask,
      deleteTask,
      updateNote
    }
  };
};
