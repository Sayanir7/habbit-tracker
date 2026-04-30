import React from "react";

export function ProgressRing({ value, size = 88, stroke = 9, color = "#16a34a", label, sublabel }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-stone-200 dark:text-slate-700"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-bold text-slate-950 dark:text-white">{label ?? `${value}%`}</div>
        {sublabel && <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{sublabel}</div>}
      </div>
    </div>
  );
}
