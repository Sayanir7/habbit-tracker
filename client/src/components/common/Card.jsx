import React from "react";

export function Card({ children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-lg border border-stone-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-4 ${className}`}>
      {children}
    </section>
  );
}
