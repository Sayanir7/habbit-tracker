import React, { useMemo, useState } from "react";
import { CalendarDays, Check, ListTodo, Plus, Trash2 } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { shortDate } from "../../utils/date.js";

export function UniversalTaskCard({ tasks, todayKey, onAddTask, onToggleTask, onDeleteTask, onSelectedDate }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayKey);

  const upcomingTasks = useMemo(
    () =>
      Object.entries(tasks)
        .flatMap(([date, dayTasks]) => dayTasks.map((task) => ({ ...task, date })))
        .filter((task) => !task.done)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [tasks]
  );
  const pastDueCount = upcomingTasks.filter((task) => task.date < todayKey).length;
  const futureCount = upcomingTasks.filter((task) => task.date > todayKey).length;

  const addTask = async () => {
    await onAddTask(dueDate, title);
    setTitle("");
  };

  const getTaskTone = (date) => {
    if (date < todayKey) {
      return {
        row: "border-rose-200 bg-rose-50/70 dark:border-rose-900/70 dark:bg-rose-950/20",
        badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
        label: "Past due"
      };
    }
    if (date === todayKey) {
      return {
        row: "border-amber-200 bg-amber-50/70 dark:border-amber-900/70 dark:bg-amber-950/20",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        label: "Due today"
      };
    }
    return {
      row: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/70 dark:bg-emerald-950/20",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      label: "Upcoming"
    };
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <ListTodo size={17} />
            All upcoming tasks
          </p>
          <h2 className="mt-1 text-xl font-bold">Universal task list</h2>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {upcomingTasks.length} open
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs font-bold min-[420px]:grid-cols-2">
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          {pastDueCount} past due
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          {futureCount} upcoming
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addTask()}
          className="min-w-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Add an upcoming task"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value || todayKey)}
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
        />
        <IconButton label="Add upcoming task" onClick={addTask} className="bg-emerald-600 text-white hover:text-white">
          <Plus size={18} />
        </IconButton>
      </div>

      <div className="mt-4 max-h-96 space-y-2 overflow-auto pr-1">
        {upcomingTasks.length === 0 && <EmptyState>No unfinished upcoming tasks.</EmptyState>}
        {upcomingTasks.map((task) => {
          const taskDate = new Date(`${task.date}T12:00:00`);
          const tone = getTaskTone(task.date);
          return (
            <div key={task.id} className={`flex items-center gap-2 rounded-lg border p-2.5 sm:gap-3 sm:p-3 ${tone.row}`}>
              <button
                aria-label={`Complete ${task.title}`}
                onClick={() => onToggleTask(task.date, task.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-stone-200 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700"
              >
                <Check size={17} />
              </button>
              <button onClick={() => onSelectedDate(task.date)} className="min-w-0 flex-1 text-left">
                <span className="block break-words text-sm font-semibold">{task.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    {shortDate(taskDate)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tone.badge}`}>{tone.label}</span>
                </span>
              </button>
              <IconButton label="Delete task" onClick={() => onDeleteTask(task.date, task.id)} className="h-8 w-8">
                <Trash2 size={15} />
              </IconButton>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
