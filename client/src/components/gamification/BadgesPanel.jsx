import React from "react";
import { Award, Check, Flame, Trophy } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { percentage } from "../../utils/stats.js";

export function BadgesPanel({ achievements }) {
  const badges = [
    {
      title: "7-day streak",
      active: achievements.bestStreak >= 7,
      progress: Math.min(100, percentage(achievements.bestStreak, 7)),
      icon: Flame
    },
    {
      title: "100 tasks completed",
      active: achievements.totalTasks >= 100,
      progress: Math.min(100, percentage(achievements.totalTasks, 100)),
      icon: Check
    },
    {
      title: "10 perfect days",
      active: achievements.perfectDays >= 10,
      progress: Math.min(100, percentage(achievements.perfectDays, 10)),
      icon: Trophy
    }
  ];

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Trophy className="text-emerald-600" size={22} />
        <h2 className="text-xl font-bold">Badges</h2>
      </div>
      <div className="mt-4 space-y-3">
        {badges.map((badge) => {
          const BadgeIcon = badge.icon;
          return (
            <div key={badge.title} className="rounded-lg border border-stone-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-lg ${
                    badge.active ? "bg-emerald-600 text-white" : "bg-stone-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  <BadgeIcon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{badge.title}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${badge.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function InsightsPanel({ bestDay, bestHabit }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Award className="text-emerald-600" size={22} />
        <h2 className="text-xl font-bold">Insights</h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <p>
          Best recent day: <span className="font-bold text-slate-950 dark:text-white">{bestDay?.date ?? "Start tracking"}</span>{" "}
          at <span className="font-bold text-slate-950 dark:text-white">{bestDay?.progress ?? 0}%</span>.
        </p>
        <p>
          Strongest habit: <span className="font-bold text-slate-950 dark:text-white">{bestHabit?.name ?? "Add one habit"}</span>.
        </p>
        <p>Momentum improves fastest when today has three or fewer high-value tasks.</p>
      </div>
    </Card>
  );
}
