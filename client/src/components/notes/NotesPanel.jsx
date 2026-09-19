import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { formatDateTime } from "../../utils/date.js";

const PAGE_SIZE = 5;

export function NotesPanel({ notesByDate }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const notes = useMemo(
    () => Object.entries(notesByDate).flatMap(([date, entries]) => {
      const list = Array.isArray(entries) ? entries : entries ? [{ fields: { text: entries }, date }] : [];
      return list.map((note) => ({ ...note, date: note.date || date }));
    }).sort((a, b) => `${b.date}${b.createdAt || ""}`.localeCompare(`${a.date}${a.createdAt || ""}`)),
    [notesByDate]
  );
  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return notes;
    return notes.filter((note) => [note.date, note.fields?.title, note.fields?.text, note.location].some((value) => String(value || "").toLowerCase().includes(normalizedQuery)));
  }, [notes, query]);
  const pageCount = Math.max(Math.ceil(filteredNotes.length / PAGE_SIZE), 1);
  const visibleNotes = filteredNotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [notes.length, query]);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Notes history</p>
          <h2 className="text-xl font-bold">All diary entries</h2>
        </div>
        <MapPin className="shrink-0 text-emerald-600" size={20} />
      </div>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950" placeholder="Search notes, dates, or locations" />
      </div>

      <div className="mt-6 border-t border-stone-200 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold">All notes</h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{filteredNotes.length} matching</span>
        </div>
        <div className="mt-3 space-y-2">
          {visibleNotes.length === 0 && <p className="rounded-lg bg-stone-50 p-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">No notes yet.</p>}
          {visibleNotes.map((note) => (
            <article key={note.id} className="rounded-lg border border-stone-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* <p className="text-sm font-bold">{note.fields?.title || ""}</p> */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <time dateTime={note.createdAt || note.date}>{note.date}</time>
                  {note.createdAt && <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>}
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{note.fields?.text}</p>
              {note.location && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><MapPin size={13} /> {note.location}</p>}
            </article>
          ))}
        </div>
        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button aria-label="Previous notes page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-stone-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronLeft size={17} /></button>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Page {page} of {pageCount}</span>
            <button aria-label="Next notes page" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-stone-200 p-2 disabled:opacity-40 dark:border-slate-700"><ChevronRight size={17} /></button>
          </div>
        )}
      </div>
    </Card>
  );
}
