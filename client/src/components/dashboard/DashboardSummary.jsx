import React from "react";
import { Award, CalendarDays, Sparkles } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { ProgressRing } from "../common/ProgressRing.jsx";

export function DashboardSummary({ todayCompletion, xp, level, levelProgress, monthAverage }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Today</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal sm:text-3xl">Overall completion</h2>
          <p className="mt-2 max-w-xl break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
            Complete habits and tasks to earn XP, preserve streaks, and unlock badges.
          </p>
        </div>
        <div className="self-center sm:self-auto">
          <ProgressRing value={todayCompletion} size={118} stroke={11} label={`${todayCompletion}%`} sublabel="done" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Sparkles size={17} />} label="XP" value={xp} tone="emerald" />
        <div className="rounded-lg bg-lime-50 p-4 dark:bg-lime-950/30">
          <div className="flex items-center gap-2 text-sm font-semibold text-lime-800 dark:text-lime-200">
            <Award size={17} />
            Level {level}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-lime-100 dark:bg-lime-900">
            <div className="h-full rounded-full bg-lime-500 transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{levelProgress}% to next level</p>
        </div>
        <StatCard icon={<CalendarDays size={17} />} label="Monthly" value={`${monthAverage}%`} tone="teal" />
      </div>
    </Card>
  );
}

function StatCard({ icon, label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    teal: "bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-200"
  };

  return (
    <div className={`rounded-lg p-3 sm:p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">{value}</p>
    </div>
  );
}
