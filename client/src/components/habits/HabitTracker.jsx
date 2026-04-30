import React, { useState } from "react";
import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { getHabitStats } from "../../utils/stats.js";

export function HabitTracker({ habits, selectedDateKey, onAddHabit, onToggleHabit, onUpdateHabitName, onDeleteHabit }) {
  const [habitDraft, setHabitDraft] = useState("");
  const [editingHabitId, setEditingHabitId] = useState(null);

  const addHabit = async () => {
    await onAddHabit(habitDraft);
    setHabitDraft("");
  };

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3 sm:items-center">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Habits</p>
          <h2 className="text-xl font-bold">Daily tracker</h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {habits.length} active
        </span>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          value={habitDraft}
          onChange={(event) => setHabitDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addHabit()}
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Add a habit"
        />
        <IconButton label="Add habit" onClick={addHabit} className="bg-emerald-600 text-white hover:text-white">
          <Plus size={18} />
        </IconButton>
      </div>
      <div className="space-y-3">
        {habits.length === 0 && <EmptyState>Add your first habit to begin tracking.</EmptyState>}
        {habits.map((habit) => {
          const stats = getHabitStats(habit);
          const checked = Boolean(habit.history?.[selectedDateKey]);
          return (
            <div
              key={habit.id}
              className="rounded-lg border border-stone-200 p-3 transition hover:border-emerald-200 dark:border-slate-800 dark:hover:border-emerald-700"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  aria-label={`Toggle ${habit.name}`}
                  onClick={() => onToggleHabit(habit.id, selectedDateKey)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition sm:h-10 sm:w-10 ${
                    checked
                      ? "animate-pop border-transparent bg-emerald-600 text-white"
                      : "border-stone-200 text-slate-400 dark:border-slate-700"
                  }`}
                >
                  {checked && <Check size={20} />}
                </button>
                <div className="min-w-0 flex-1">
                  {editingHabitId === habit.id ? (
                    <input
                      autoFocus
                      value={habit.name}
                      onChange={(event) => onUpdateHabitName(habit.id, event.target.value)}
                      onBlur={() => setEditingHabitId(null)}
                      onKeyDown={(event) => event.key === "Enter" && setEditingHabitId(null)}
                      className="w-full rounded-md border border-emerald-300 bg-white px-2 py-1 text-sm font-semibold outline-none dark:bg-slate-950"
                    />
                  ) : (
                    <h3 className="truncate text-sm font-bold">{habit.name}</h3>
                  )}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stats.completion}%`, backgroundColor: habit.color }}
                    />
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold">{stats.completion}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stats.streak} day streak</p>
                </div>
                <IconButton label="Edit habit" onClick={() => setEditingHabitId(habit.id)} className="h-8 w-8 sm:h-9 sm:w-9">
                  <Edit3 size={16} />
                </IconButton>
                <IconButton label="Delete habit" onClick={() => onDeleteHabit(habit.id)} className="h-8 w-8 sm:h-9 sm:w-9">
                  <Trash2 size={16} />
                </IconButton>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 sm:hidden">
                <span>{stats.completion}% complete</span>
                <span>{stats.streak} day streak</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
