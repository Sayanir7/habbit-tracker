import React from "react";
import { Flame } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { ProgressRing } from "../common/ProgressRing.jsx";

export function WeeklyOverview({ weeklyData }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Consistency</p>
          <h2 className="mt-1 text-xl font-bold">Weekly overview</h2>
        </div>
        <Flame className="text-emerald-600" size={24} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 min-[380px]:grid-cols-4 sm:grid-cols-7 sm:gap-2">
        {weeklyData.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <ProgressRing value={item.value} size={52} stroke={6} label={`${item.value}`} />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
