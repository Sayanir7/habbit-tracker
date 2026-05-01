import React, { useEffect, useMemo, useState } from "react";
import { AuthModal } from "../components/auth/AuthModal.jsx";
import { DashboardSummary } from "../components/dashboard/DashboardSummary.jsx";
import { WeeklyOverview } from "../components/dashboard/WeeklyOverview.jsx";
import { AiSuggestions } from "../components/gamification/AiSuggestions.jsx";
import { BadgesPanel, InsightsPanel } from "../components/gamification/BadgesPanel.jsx";
import { HabitTracker } from "../components/habits/HabitTracker.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";
import { TaskManager } from "../components/tasks/TaskManager.jsx";
import { UniversalTaskCard } from "../components/tasks/UniversalTaskCard.jsx";
import { CalendarHeatmap } from "../components/visualization/CalendarHeatmap.jsx";
import { ProgressChart } from "../components/visualization/ProgressChart.jsx";
import { useTracker } from "../hooks/useTracker.js";
import { addDays, formatKey, getMonthDays } from "../utils/date.js";
import { getAchievements, getDayCompletion, getHabitStats, getLevel, getTotalXp, percentage } from "../utils/stats.js";

const REMINDERS_KEY = "habit-quest-reminders-enabled";
const LAST_REMINDER_KEY = "habit-quest-last-reminder-date";

const getOutstandingItems = (state, dateKey) => {
  const tasks = Object.entries(state.tasks)
    .flatMap(([taskDate, dayTasks]) => dayTasks.map((task) => ({ ...task, taskDate })))
    .filter((task) => !task.done && task.taskDate <= dateKey)
    .sort((a, b) => a.taskDate.localeCompare(b.taskDate))
    .map((task) => (task.taskDate === dateKey ? task.title : `${task.title} (${task.taskDate})`));
  const habits = state.habits.filter((habit) => !habit.history?.[dateKey]).map((habit) => habit.name);
  return { tasks, habits };
};

const formatReminderBody = ({ tasks, habits }) => {
  const sections = [];
  if (tasks.length) sections.push(`Tasks: ${tasks.slice(0, 4).join(", ")}${tasks.length > 4 ? "..." : ""}`);
  if (habits.length) sections.push(`Habits: ${habits.slice(0, 4).join(", ")}${habits.length > 4 ? "..." : ""}`);
  return sections.join("\n") || "Everything for today is complete.";
};

export function TrackerPage() {
  const { state, loading, authError, isAuthenticated, actions } = useTracker();
  const [authOpen, setAuthOpen] = useState(false);
  const today = new Date();
  const todayKey = formatKey(today);
  const selectedDateKey = state.selectedDate || todayKey;
  const selectedDate = new Date(`${selectedDateKey}T12:00:00`);

  const monthDays = useMemo(() => getMonthDays(selectedDate), [selectedDateKey]);
  const weeklyData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(today, index - 6);
        const key = formatKey(date);
        return {
          day: date.toLocaleDateString(undefined, { weekday: "short" }),
          value: getDayCompletion(state, key)
        };
      }),
    [state]
  );
  const trendData = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const date = addDays(today, index - 13);
        const key = formatKey(date);
        return {
          date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          progress: getDayCompletion(state, key)
        };
      }),
    [state]
  );

  const xp = getTotalXp(state);
  const { level, levelProgress } = getLevel(xp);
  const monthAverage = percentage(
    monthDays.reduce((sum, date) => sum + getDayCompletion(state, formatKey(date)), 0),
    monthDays.length * 100
  );
  const bestHabit = [...state.habits]
    .map((habit) => ({ ...habit, ...getHabitStats(habit) }))
    .sort((a, b) => b.completion - a.completion)[0];
  const bestDay = trendData.reduce((best, item) => (item.progress > best.progress ? item : best), trendData[0]);

  const sendOutstandingNotification = (force = false) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const outstanding = getOutstandingItems(state, todayKey);
    const hasOutstanding = outstanding.tasks.length > 0 || outstanding.habits.length > 0;
    if (!force && !hasOutstanding) return;

    new Notification(hasOutstanding ? "Unfinished items for today" : "Habit Quest is clear", {
      body: formatReminderBody(outstanding),
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png"
    });
    localStorage.setItem(LAST_REMINDER_KEY, todayKey);
  };

  useEffect(() => {
    if (!("Notification" in window)) return undefined;
    if (Notification.permission !== "granted") return undefined;
    if (localStorage.getItem(REMINDERS_KEY) !== "true") return undefined;
    if (localStorage.getItem(LAST_REMINDER_KEY) !== todayKey) {
      const timer = window.setTimeout(() => sendOutstandingNotification(false), 1200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state, todayKey]);

  const exportCsv = () => {
    const rows = [["date", "completion", "completed_tasks", "total_tasks", "completed_habits", "total_habits"]];
    Array.from({ length: 30 }, (_, index) => formatKey(addDays(today, index - 29))).forEach((key) => {
      const tasks = state.tasks[key] ?? [];
      rows.push([
        key,
        getDayCompletion(state, key),
        tasks.filter((task) => task.done).length,
        tasks.length,
        state.habits.filter((habit) => habit.history?.[key]).length,
        state.habits.length
      ]);
    });

    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "habit-quest-progress.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem(REMINDERS_KEY, "true");
      sendOutstandingNotification(true);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faf7] text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex w-[100vw] max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-5 sm:py-4 lg:px-8">
        <AppHeader
          today={today}
          user={state.user}
          darkMode={state.darkMode}
          isAuthenticated={isAuthenticated}
          onAuthOpen={() => setAuthOpen(true)}
          onLogout={actions.logout}
          onToggleDarkMode={actions.setDarkMode}
          onExport={exportCsv}
          onReminders={requestNotifications}
        />

        {!isAuthenticated && (
          <div className="max-w-full break-words rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            You are viewing guest demo data. Log in or sign up to start with your own empty tracker and save to MongoDB.
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Loading your tracker...
          </div>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <DashboardSummary
                todayCompletion={getDayCompletion(state, todayKey)}
                xp={xp}
                level={level}
                levelProgress={levelProgress}
                monthAverage={monthAverage}
              />
              <WeeklyOverview weeklyData={weeklyData} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <HabitTracker
                habits={state.habits}
                selectedDateKey={selectedDateKey}
                onAddHabit={actions.addHabit}
                onToggleHabit={actions.toggleHabit}
                onUpdateHabitName={actions.updateHabitName}
                onDeleteHabit={actions.deleteHabit}
              />
              <UniversalTaskCard
                tasks={state.tasks}
                todayKey={todayKey}
                onAddTask={actions.addTask}
                onToggleTask={actions.toggleTask}
                onDeleteTask={actions.deleteTask}
                onSelectedDate={actions.setSelectedDate}
              />
            </section>

            <section className="grid gap-4">
              <TaskManager
                state={state}
                selectedDate={selectedDate}
                selectedDateKey={selectedDateKey}
                onSelectedDate={actions.setSelectedDate}
                onAddTask={actions.addTask}
                onToggleTask={actions.toggleTask}
                onDeleteTask={actions.deleteTask}
                onUpdateNote={actions.updateNote}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
              <ProgressChart trendData={trendData} />
              <CalendarHeatmap
                state={state}
                selectedDate={selectedDate}
                selectedDateKey={selectedDateKey}
                monthDays={monthDays}
                onSelectedDate={actions.setSelectedDate}
              />
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <BadgesPanel achievements={getAchievements(state)} />
              <AiSuggestions onSuggestion={actions.addHabit} />
              <InsightsPanel bestDay={bestDay} bestHabit={bestHabit} />
            </section>
          </>
        )}
      </div>

      {authOpen && (
        <AuthModal
          authError={authError}
          onClose={() => setAuthOpen(false)}
          onLogin={actions.login}
          onSignup={actions.signup}
        />
      )}
    </main>
  );
}
