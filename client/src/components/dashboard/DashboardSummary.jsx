import React, { useEffect, useState } from "react";
import { Card } from "../common/Card.jsx";
import { ProgressRing } from "../common/ProgressRing.jsx";
import { DailyKnowledgeFeed } from "./DailyKnowledgeFeed.jsx";

export function DashboardSummary({ todayCompletion, todayKey, onUpdateNote, onSearchLocations, isAuthenticated, canEdit }) {
  const [diaryDraft, setDiaryDraft] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const addDiaryEntry = async () => {
    const entry = diaryDraft.trim();
    if (!entry) return;

    await onUpdateNote(todayKey, { text: entry }, location.trim());
    setDiaryDraft("");
    setLocation("");
  };

  useEffect(() => {
    if (!isAuthenticated || !location.trim()) {
      setLocationSuggestions([]);
      return undefined;
    }
    const timer = window.setTimeout(async () => setLocationSuggestions(await onSearchLocations(location)), 250);
    return () => window.clearTimeout(timer);
  }, [location, isAuthenticated, onSearchLocations]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Today</p>
        </div> */}
        {/* <div className="self-center sm:self-auto">
          <ProgressRing value={todayCompletion} size={118} stroke={11} label={`${todayCompletion}%`} sublabel="done" />
        </div> */}
      </div>
      <div className="mt-1 flex flex-col gap-3">
        <DailyKnowledgeFeed />
      </div>
      {canEdit && <div className="mt-5 rounded-lg border border-stone-200 p-3 dark:border-slate-800">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Diary</p>
        <textarea
          value={diaryDraft}
          onChange={(event) => setDiaryDraft(event.target.value)}
          className="mt-3 min-h-20 w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Write something about your day"
        />
        <div className="relative mt-2">
          <input value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950" placeholder="Location or address (optional)" />
          {locationSuggestions.length > 0 && <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">{locationSuggestions.map((item) => <button key={item.id} type="button" onClick={() => { setLocation(item.name); setLocationSuggestions([]); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/40">{item.name}</button>)}</div>}
        </div>
        <div className="mt-2 flex justify-end">
          <button onClick={addDiaryEntry} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
            Add diary entry
          </button>
        </div>
      </div>}
    </Card>
  );
}
