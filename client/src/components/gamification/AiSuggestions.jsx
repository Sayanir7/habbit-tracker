import React, { useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { IconButton } from "../common/IconButton.jsx";

export function AiSuggestions({ onSuggestion }) {
  const [goalDraft, setGoalDraft] = useState("");

  const suggestHabit = () => {
    const goal = goalDraft.toLowerCase();
    const suggestions = [
      ["fitness", "10-minute mobility"],
      ["health", "Drink 8 glasses of water"],
      ["study", "One focused study sprint"],
      ["learn", "Read 10 pages"],
      ["sleep", "Screen-free wind down"],
      ["work", "Plan top 3 priorities"]
    ];
    const match = suggestions.find(([key]) => goal.includes(key));
    onSuggestion(match?.[1] ?? "Reflect for 5 minutes");
  };

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Lightbulb className="text-emerald-600" size={22} />
        <h2 className="text-xl font-bold">AI habit ideas</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Type a goal and get a habit suggestion you can add instantly.
      </p>
      <div className="mt-4 flex gap-2">
        <input
          value={goalDraft}
          onChange={(event) => setGoalDraft(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Improve fitness"
        />
        <IconButton label="Suggest habit" onClick={suggestHabit} className="bg-emerald-600 text-white hover:text-white">
          <Sparkles size={18} />
        </IconButton>
      </div>
    </Card>
  );
}
