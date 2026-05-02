import React, { useState } from "react";
import { Flame } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { ProgressRing } from "../common/ProgressRing.jsx";

export function DashboardSummary({ todayCompletion, weeklyData, state, selectedDateKey, onUpdateNote}) {
  const [diaryDraft, setDiaryDraft] = useState(""); 
  const dayNote = state.notes[selectedDateKey] ?? "";
  const weeklyAverage = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, item) => sum + item.value, 0) / weeklyData.length)
    : 0;

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
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Today</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal sm:text-3xl">Overall completion</h2>
          <p className="mt-2 max-w-xl break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
            Complete today&apos;s habits and tasks, then use the weekly view below to spot the days that need attention.
          </p>
        </div>
        <div className="self-center sm:self-auto">
          <ProgressRing value={todayCompletion} size={118} stroke={11} label={`${todayCompletion}%`} sublabel="done" />
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              <Flame size={17} />
              Weekly progress
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Last 7 days average</p>
          </div>
          <p className="text-2xl font-bold sm:text-3xl">{weeklyAverage}%</p>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {weeklyData.map((item) => (
            <div key={item.day} className="flex min-w-0 flex-col items-center gap-2 rounded-lg bg-white/70 p-2 dark:bg-slate-950/60">
              <ProgressRing value={item.value} size={46} stroke={6} label={`${item.value}`} />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* // add diary */}
      <div className="mt-5 rounded-lg border border-stone-200 p-3 dark:border-slate-800">

        <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Diary</p>

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

      </div>
    </Card>
  );
}
