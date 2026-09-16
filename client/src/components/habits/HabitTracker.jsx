import React, { useState } from "react";
import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { EmptyState } from "../common/EmptyState.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { getHabitStats } from "../../utils/stats.js";
import { formatKey } from "../../utils/date.js";

export function HabitTracker({ habits, selectedDateKey, onAddHabit, onToggleHabit, onUpdateHabitName, onDeleteHabit, canEdit }) {
  const [habitDraft, setHabitDraft] = useState("");
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState("");
  const todayKey = formatKey(new Date());
  const canToggleToday = canEdit && selectedDateKey === todayKey;

  const addHabit = async () => {
    await onAddHabit(habitDraft);
    setHabitDraft("");
  };

  const startEditing = (habit) => {
    setEditingHabitId(habit.id);
    setEditingHabitName(habit.name);
  };

  const saveHabitName = async () => {
    const trimmedName = editingHabitName.trim();
    const habit = habits.find((item) => item.id === editingHabitId);
    if (!habit) return;
    if (!trimmedName || trimmedName === habit.name) {
      setEditingHabitId(null);
      return;
    }

    await onUpdateHabitName(habit.id, trimmedName);
    setEditingHabitId(null);
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
      {canEdit && <div className="mb-4 flex gap-2">
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
      </div>}
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
                  disabled={!canToggleToday}
                  aria-label={`Toggle ${habit.name}`}
                  onClick={() => onToggleHabit(habit.id, selectedDateKey)}
                  title={canToggleToday ? "Mark habit for today" : "Habits can only be marked today"}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition sm:h-10 sm:w-10 ${
                    checked
                      ? "animate-pop border-transparent bg-emerald-600 text-white"
                      : "border-stone-200 text-slate-400 dark:border-slate-700"
                  }`}
                >
                  {checked && <Check size={20} />}
                </button>
                <div className="min-w-0 flex-1">
                  {editingHabitId === habit.id && canEdit ? (
                    <input
                      autoFocus
                      value={editingHabitName}
                      onChange={(event) => setEditingHabitName(event.target.value)}
                      onBlur={saveHabitName}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                        if (event.key === "Escape") setEditingHabitId(null);
                      }}
                      className="w-full rounded-md border border-emerald-300 bg-white px-2 py-1 text-sm font-semibold outline-none dark:bg-slate-950"
                    />
                  ) : (
                    <h3 className="truncate text-sm font-bold">{habit.name}</h3>
                  )}
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold">{stats.currentStreak} day{stats.currentStreak === 1 ? "" : "s"}</p>
                  {/* <p className="text-xs text-slate-500 dark:text-slate-400">current streak</p> */}
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{stats.maxStreak} day max</p>
                </div>
                {canEdit && <>
                  <IconButton label="Edit habit" onClick={() => startEditing(habit)} className="h-8 w-8 sm:h-9 sm:w-9">
                    <Edit3 size={16} />
                  </IconButton>
                  <IconButton label="Delete habit" onClick={() => onDeleteHabit(habit.id)} className="h-8 w-8 sm:h-9 sm:w-9">
                    <Trash2 size={16} />
                  </IconButton>
                </>}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 sm:hidden">
                <span>Current: {stats.currentStreak} day{stats.currentStreak === 1 ? "" : "s"}</span>
                <span>Max: {stats.maxStreak} day{stats.maxStreak === 1 ? "" : "s"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
