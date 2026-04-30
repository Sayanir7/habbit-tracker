import React from "react";
import { Bell, Download, LogIn, LogOut, Moon, Sun, Target } from "lucide-react";
import { IconButton } from "../common/IconButton.jsx";
import { fullDate } from "../../utils/date.js";

export function AppHeader({ today, user, darkMode, isAuthenticated, onAuthOpen, onLogout, onToggleDarkMode, onExport, onReminders }) {
  return (
    <header className="min-w-0 rounded-lg border border-stone-200 bg-white/90 p-3 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:flex sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 sm:h-12 sm:w-12">
          <Target size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-emerald-700 dark:text-emerald-300 sm:text-sm">{fullDate(today)}</p>
          <h1 className="truncate text-xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-2xl">Habit Quest</h1>
        </div>
      </div>
      <div className="mt-3 flex w-full min-w-0 items-center gap-2 sm:mt-0 sm:w-auto">
        <button
          onClick={isAuthenticated ? onLogout : onAuthOpen}
          className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:flex-none sm:px-3"
        >
          {isAuthenticated ? <LogOut size={17} /> : <LogIn size={17} />}
          <span className="truncate">{isAuthenticated ? user?.name : "Log in"}</span>
        </button>
        <IconButton label="Enable reminders" onClick={onReminders}>
          <Bell size={18} />
        </IconButton>
        <IconButton label="Export CSV" onClick={onExport}>
          <Download size={18} />
        </IconButton>
        <IconButton label="Toggle dark mode" onClick={onToggleDarkMode}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </div>
    </header>
  );
}
