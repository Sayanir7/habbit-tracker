import React, { useRef } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { formatKey } from "../../utils/date.js";
import { getDayCompletion } from "../../utils/stats.js";

export function CalendarHeatmap({ state, selectedDate, selectedDateKey, monthDays, onSelectedDate }) {
  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current?.focus();
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Calendar</p>
          <h2 className="text-xl font-bold">
            {selectedDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="relative">
          <IconButton label="Search day" onClick={openDatePicker}>
            <CalendarDays className="text-emerald-600" size={20} />
          </IconButton>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDateKey}
            onChange={(event) => event.target.value && onSelectedDate(event.target.value)}
            className="pointer-events-none absolute inset-0 h-10 w-10 opacity-0"
            aria-label="Search day"
            tabIndex={-1}
          />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400 sm:gap-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: monthDays[0]?.getDay() ?? 0 }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {monthDays.map((date) => {
          const key = formatKey(date);
          const value = getDayCompletion(state, key);
          const active = selectedDateKey === key;
          const checked = value === 100;
          return (
            <button
              key={key}
              onClick={() => onSelectedDate(key)}
              className={`calendar-cell grid aspect-square min-h-9 place-items-center rounded-md text-xs font-bold sm:min-h-10 sm:rounded-lg sm:text-sm ${
                active
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : value > 0
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                    : "bg-stone-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
              title={`${value}% complete`}
            >
              {checked ? <Check size={18} /> : date.getDate()}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
