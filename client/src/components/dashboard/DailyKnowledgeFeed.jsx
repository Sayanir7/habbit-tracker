import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, Lightbulb, Loader2, Sparkles, Volume2 } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { api } from "../../services/api.js";

const categoryLabels = {
  vocabulary: "Vocabulary",
  science: "Science",
  history: "History",
  geography: "Geography",
  arts_culture: "Arts & culture",
  technology: "Technology",
  general_knowledge: "General knowledge"
};

export function DailyKnowledgeFeed() {
  const [feed, setFeed] = useState(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const startX = useRef(null);

  useEffect(() => {
    let active = true;
    api.dailyKnowledge()
      .then((data) => active && setFeed(data))
      .catch((requestError) => active && setError(requestError.message || "Knowledge feed is unavailable."));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setRevealed(false);
    setAudioError("");
  }, [index]);

  const pronounceWord = () => {
    if (!item || item.type !== "word" || audioLoading) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setAudioError("Speech synthesis is unavailable in this browser");
      return;
    }

    setAudioLoading(true);
    setAudioError("");
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(item.title.trim());
    utterance.lang = "en-US";
    utterance.onend = () => setAudioLoading(false);
    utterance.onerror = () => {
      setAudioLoading(false);
      setAudioError("Pronunciation could not be played");
    };
    window.speechSynthesis.speak(utterance);
  };

  const move = (amount) => {
    if (!feed?.items?.length) return;
    setIndex((current) => (current + amount + feed.items.length) % feed.items.length);
  };

  const handlePointerDown = (event) => {
    startX.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1);
  };

  if (error && !feed) {
    return <Card><p className="text-sm font-semibold text-red-600 dark:text-red-300">{error}</p></Card>;
  }

  if (!feed) {
    return <Card className="grid min-h-[18rem] place-items-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></Card>;
  }

  const item = feed.items[index];
  const isQuestion = item.type === "question";
  const isVocabulary = item.type === "word";

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"><Sparkles size={16} /> Daily discovery</p>
          {/* <h2 className="mt-1 text-2xl font-bold">What will you learn today?</h2> */}
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{feed.fallback ? `Showing ${feed.date}'s saved feed` : feed.date}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-300"><BookOpen size={18} /> {index + 1} / {feed.items.length}</div>
      </div>

      <div className="relative mt-5">
        <button type="button" aria-label="Previous knowledge item" onClick={() => move(-1)} className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-lg border border-stone-200 bg-white/90 text-slate-600 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700 sm:grid dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300"><ArrowLeft size={18} /></button>
        <div
          role="group"
          aria-label="Daily knowledge item"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="min-h-[17rem] w-full select-none touch-pan-y rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 shadow-sm dark:border-emerald-950 dark:from-emerald-950/50 dark:via-slate-900 dark:to-amber-950/30 sm:mx-14 sm:w-auto sm:p-7"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {isQuestion ? <HelpCircle size={16} /> : <Lightbulb size={16} />}
            {categoryLabels[item.category] || item.category}
            <span className="rounded-full bg-white/80 px-2 py-1 dark:bg-slate-950/70">{item.type}</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <h3 className="text-2xl font-bold leading-tight sm:text-3xl">{item.title}</h3>
            {isVocabulary && <button type="button" onClick={pronounceWord} disabled={audioLoading} aria-label={`Pronounce ${item.title}`} title={audioError || `Pronounce ${item.title}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/60"><Volume2 className={audioLoading ? "animate-pulse" : ""} size={18} /></button>}
          </div>
          {isQuestion && item.question && <p className="mt-4 text-base font-medium leading-7 text-slate-700 dark:text-slate-200">{item.question}</p>}
          {!isQuestion && <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200">{item.content}</p>}
          {isVocabulary && item.example && <p className="mt-4 border-l-2 border-emerald-400 pl-3 text-sm italic leading-6 text-slate-600 dark:text-slate-300">{item.example}</p>}
          {isQuestion && <div className="mt-6"><button type="button" onClick={() => setRevealed((current) => !current)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">{revealed ? "Hide answer" : "Reveal answer"}</button>{revealed && <p className="mt-4 rounded-lg bg-white/80 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-950/70 dark:text-slate-200">{item.answer || item.content}</p>}</div>}
          {item.sourceNote && <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.sourceNote}</p>}
          {audioError && isVocabulary && <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">{audioError}</p>}
        </div>
        <button type="button" aria-label="Next knowledge item" onClick={() => move(1)} className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-lg border border-stone-200 bg-white/90 text-slate-600 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700 sm:grid dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300"><ArrowRight size={18} /></button>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((index + 1) / feed.items.length) * 100}%` }} /></div>
    </Card>
  );
}
