import React from "react";

export function EmptyState({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {children}
    </div>
  );
}
