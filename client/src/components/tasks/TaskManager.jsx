import React, { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { addDays, formatKey, shortDate } from "../../utils/date.js";
import { getDayCompletion } from "../../utils/stats.js";

export function TaskManager({ state, selectedDate, selectedDateKey, onSelectedDate, onAddTask, onToggleTask, onDeleteTask, onUpdateNote }) {
  const [taskDraft, setTaskDraft] = useState("");
  const [diaryDraft, setDiaryDraft] = useState("");
  const selectedTasks = state.tasks[selectedDateKey] ?? [];
  const completedTasks = selectedTasks.filter((task) => task.done).length;
  const dayNote = state.notes[selectedDateKey] ?? "";

  const addTask = async () => {
    await onAddTask(selectedDateKey, taskDraft);
    setTaskDraft("");
  };

  const addDiaryEntry = async () => {
    const entry = diaryDraft.trim();
    if (!entry) return;

    const timestamp = new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
    await onUpdateNote(selectedDateKey, `${dayNote ? `${dayNote}\n\n` : ""}[${timestamp}] ${entry}`);
    setDiaryDraft("");
  };

  return (
    <Card>
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Tasks</p>
          <h2 className="text-xl font-bold">{shortDate(selectedDate)}</h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <IconButton label="Previous day" onClick={() => onSelectedDate(formatKey(addDays(selectedDate, -1)))}>
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton label="Next day" onClick={() => onSelectedDate(formatKey(addDays(selectedDate, 1)))}>
            <ChevronRight size={18} />
          </IconButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-stone-50 p-3 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Completed</p>
          <p className="mt-1 text-2xl font-bold">
            {completedTasks}/{selectedTasks.length}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Day score</p>
          <p className="mt-1 text-2xl font-bold">{getDayCompletion(state, selectedDateKey)}%</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={taskDraft}
          onChange={(event) => setTaskDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addTask()}
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Add a task"
        />
        <IconButton label="Add task" onClick={addTask} className="bg-emerald-600 text-white hover:text-white">
          <Plus size={18} />
        </IconButton>
      </div>
      <div className="mt-4 space-y-2">
        {selectedTasks.length === 0 && <EmptyState>No tasks for this day.</EmptyState>}
        {selectedTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2.5 dark:border-slate-800 sm:gap-3 sm:p-3">
            <button
              aria-label={`Toggle ${task.title}`}
              onClick={() => onToggleTask(selectedDateKey, task.id)}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
                task.done ? "animate-pop border-transparent bg-emerald-600 text-white" : "border-stone-200 text-slate-400 dark:border-slate-700"
              }`}
            >
              {task.done && <Check size={17} />}
            </button>
            <span className={`min-w-0 flex-1 break-words text-sm font-medium ${task.done ? "text-slate-400 line-through" : ""}`}>
              {task.title}
            </span>
            <IconButton label="Delete task" onClick={() => onDeleteTask(selectedDateKey, task.id)} className="h-8 w-8">
              <Trash2 size={15} />
            </IconButton>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-stone-200 p-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Diary</p>
            <h3 className="text-base font-bold">Day notes with timestamps</h3>
          </div>
          <Clock className="shrink-0 text-emerald-600" size={20} />
        </div>
        <textarea
          value={diaryDraft}
          onChange={(event) => setDiaryDraft(event.target.value)}
          className="mt-3 min-h-20 w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Write something about your day"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={addDiaryEntry}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Add diary entry
          </button>
        </div>
        {dayNote && (
          <div className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {dayNote}
          </div>
        )}
      </div>
    </Card>
  );
}
