import React from "react";
import { Flame } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { ProgressRing } from "../common/ProgressRing.jsx";

export function DashboardSummary({ todayCompletion, weeklyData }) {
  const weeklyAverage = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, item) => sum + item.value, 0) / weeklyData.length)
    : 0;

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
    </Card>
  );
}
