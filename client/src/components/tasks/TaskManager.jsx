import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { addDays, formatDateTime, formatKey, shortDate } from "../../utils/date.js";
import { getDayCompletion } from "../../utils/stats.js";

export function TaskManager({ state, selectedDate, selectedDateKey, onSelectedDate, onAddTask, onToggleTask, onDeleteTask, onUpdateNote, onSearchLocations, isAuthenticated, canEdit }) {
  const [taskDraft, setTaskDraft] = useState("");
  const [diaryDraft, setDiaryDraft] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const selectedLocation = useRef("");
  const selectedTasks = state.tasks[selectedDateKey] ?? [];
  const completedTasks = selectedTasks.filter((task) => task.done).length;
  const dayNotes = Array.isArray(state.notes[selectedDateKey]) ? state.notes[selectedDateKey] : [];

  const addTask = async () => {
    await onAddTask(selectedDateKey, taskDraft);
    setTaskDraft("");
  };

  const addDiaryEntry = async () => {
    const entry = diaryDraft.trim();
    if (!entry) return;

    await onUpdateNote(selectedDateKey, { text: entry }, location.trim());
    setDiaryDraft("");
    setLocation("");
    selectedLocation.current = "";
  };

  useEffect(() => {
    if (!isAuthenticated || !location.trim() || location.trim() === selectedLocation.current) {
      setLocationSuggestions([]);
      return undefined;
    }
    const timer = window.setTimeout(async () => setLocationSuggestions(await onSearchLocations(location)), 250);
    return () => window.clearTimeout(timer);
  }, [location, isAuthenticated, onSearchLocations]);

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
      {canEdit && <div className="mt-4 flex gap-2">
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
      </div>}
      <div className="mt-4 space-y-2">
        {selectedTasks.length === 0 && <EmptyState>No tasks for this day.</EmptyState>}
        {selectedTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 rounded-lg border border-stone-200 p-2.5 dark:border-slate-800 sm:gap-3 sm:p-3">
            <button
              aria-label={`Toggle ${task.title}`}
              onClick={() => onToggleTask(selectedDateKey, task.id)}
              disabled={!canEdit}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
                task.done ? "animate-pop border-transparent bg-emerald-600 text-white" : "border-stone-200 text-slate-400 dark:border-slate-700"
              }`}
            >
              {task.done && <Check size={17} />}
            </button>
            <span className={`min-w-0 flex-1 break-words text-sm font-medium ${task.done ? "text-slate-400 line-through" : ""}`}>
              {task.title}
            </span>
            {canEdit && <IconButton label="Delete task" onClick={() => onDeleteTask(selectedDateKey, task.id)} className="h-8 w-8">
              <Trash2 size={15} />
            </IconButton>}
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
        {canEdit && <textarea
          value={diaryDraft}
          onChange={(event) => setDiaryDraft(event.target.value)}
          className="mt-3 min-h-20 w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Write something about your day"
        />}
        {canEdit && <div className="relative mt-2">
          <input value={location} onChange={(event) => { selectedLocation.current = ""; setLocation(event.target.value); }} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950" placeholder="Location or address (optional)" />
          {locationSuggestions.length > 0 && <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">{locationSuggestions.slice(0, 5).map((item) => <button key={item.id} type="button" onClick={() => { selectedLocation.current = item.name; setLocation(item.name); setLocationSuggestions([]); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40">{item.name}</button>)}</div>}
        </div>}
        {canEdit && <div className="mt-2 flex justify-end">
          <button onClick={addDiaryEntry} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
            Add diary entry
          </button>
        </div>}
        {dayNotes.length > 0 && (
          <div className="mt-3 max-h-40 overflow-auto space-y-2 rounded-lg bg-stone-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {dayNotes.map((note) => (
              <article key={note.id} className="rounded-lg border border-stone-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="whitespace-pre-wrap text-sm leading-6">{note.fields?.text || ""}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {note.createdAt && <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>}
                  {note.location && <span className="text-emerald-700 dark:text-emerald-300">{note.location}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
