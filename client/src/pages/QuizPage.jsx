import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Clock3, Loader2, Trophy } from "lucide-react";
import { api } from "../services/api.js";
import { Card } from "../components/common/Card.jsx";

const QUIZ_SECONDS = 15 * 60;
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const topicName = (topic) => topic.replaceAll(/[_-]/g, " ");

const getRelativeDateLabel = (dateKey) => {
  if (!dateKey) return "Today";
  const today = new Date();
  const current = new Date(`${dateKey}T12:00:00`);
  const diffDays = Math.round((today.setHours(0, 0, 0, 0) - current.setHours(0, 0, 0, 0)) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === 2) return "2 days ago";
  if (diffDays === 3) return "3 days ago";
  if (diffDays === 4) return "4 days ago";
  return dateKey;
};

export function QuizPage({ isAuthenticated, onLogin }) {
  const [quiz, setQuiz] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_SECONDS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.dailyQuiz(), api.quizHistory()])
      .then(([dailyQuizData, historyData]) => {
        if (!active) return;
        setQuiz(dailyQuizData);
        setSelectedDate(dailyQuizData.date);
        setHistory(Array.isArray(historyData?.entries) ? historyData.entries : []);
      })
      .catch((err) => active && setError(err.message || "Today's quiz is unavailable."));
    return () => {
      active = false;
    };
  }, []);

  const selectedQuiz = history.find((entry) => entry.date === selectedDate) || quiz;
  const totalQuestions = selectedQuiz?.questions?.length || 0;

  useEffect(() => {
    if (!selectedQuiz) return;
    setCurrent(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(QUIZ_SECONDS);
  }, [selectedDate, selectedQuiz?.date]);

  const submit = async () => {
    if (!selectedQuiz || submitting.current || result) return;
    if (!isAuthenticated) {
      onLogin();
      return;
    }

    submitting.current = true;
    setError("");

    try {
      const data = await api.submitQuiz({
        quizDate: selectedQuiz.date,
        answers: selectedQuiz.questions.map((_, questionIndex) => ({
          questionIndex,
          selectedAnswer: answers[questionIndex] || null,
        })),
        timeTakenSeconds: QUIZ_SECONDS - secondsLeft,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Your quiz could not be submitted.");
    } finally {
      submitting.current = false;
    }
  };

  useEffect(() => {
    if (!selectedQuiz || result || secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [selectedQuiz, result, secondsLeft]);

  useEffect(() => {
    if (selectedQuiz && secondsLeft === 0 && !result) {
      submit();
    }
  }, [secondsLeft, selectedQuiz, result]);

  const answeredCount = Object.keys(answers).length;

  const performance = useMemo(() => {
    if (!result) return null;

    const byTopic = result.questions.reduce((map, question, index) => {
      const entry = map[question.topic] || { total: 0, correct: 0 };
      entry.total += 1;
      if (result.answers[index].isCorrect) entry.correct += 1;
      map[question.topic] = entry;
      return map;
    }, {});

    return Object.entries(byTopic).map(([topic, values]) => ({
      topic,
      ...values,
      accuracy: Math.round((values.correct / values.total) * 100),
    }));
  }, [result]);

  if (error && !quiz) {
    return (
      <Card>
        <p className="text-sm font-semibold text-red-600">{error}</p>
      </Card>
    );
  }

  if (!selectedQuiz) {
    return (
      <Card className="grid min-h-[24rem] place-items-center">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </Card>
    );
  }

  if (result) {
    const percentage = Math.round((result.score / result.total) * 100);
    const strong = performance.filter((item) => item.accuracy >= 70).map((item) => topicName(item.topic));
    const weak = performance.filter((item) => item.accuracy < 70).map((item) => topicName(item.topic));

    return (
      <div className="space-y-4">
        <Card className="overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-violet-100">
                <Trophy size={18} /> Daily quiz complete
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {result.score} / {result.total} <span className="text-lg font-semibold text-violet-100">({percentage}%)</span>
              </h2>
              <p className="mt-2 text-sm text-violet-100">
                {formatTime(result.timeTakenSeconds)} taken · {result.score} correct · {result.total - result.score} incorrect
              </p>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-white/40 text-2xl font-black">
              {percentage}%
            </div>
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-bold">Topic performance</h3>
            <div className="mt-4 space-y-3">
              {performance.map((item) => (
                <div key={item.topic}>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="capitalize">{topicName(item.topic)}</span>
                    <span>{item.correct}/{item.total}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${item.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold">Your focus</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {weak.length
                ? `Revisit ${weak.join(", ")}. Work through the explanations below, then practise a few similar questions.`
                : "Excellent consistency across today’s topics—try increasing speed while keeping your accuracy."}
            </p>
            {strong.length > 0 && (
              <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Strong: {strong.join(", ")}
              </p>
            )}
          </Card>
        </section>

        <section className="space-y-3">
          {result.questions.map((question, index) => {
            const answer = result.answers[index];
            return (
              <Card key={index} className="border-l-4 border-l-violet-400">
                <div className="flex gap-3">
                  <span className="font-bold text-violet-600">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{question.question}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize dark:bg-slate-800">
                        {topicName(question.topic)} · {question.difficulty}
                      </span>
                    </div>
                    <p className={`mt-3 text-sm font-semibold ${answer.isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                      {answer.isCorrect ? "Correct" : `Your answer: ${answer.selectedAnswer || "Not answered"}`}
                    </p>
                    {!answer.isCorrect && (
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        Correct answer: {question.correctAnswer}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    );
  }

  const question = selectedQuiz.questions[current];

  return (
    <div className="space-y-4">
      <Card className="sticky top-2 z-10 border-violet-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-bold text-violet-700 dark:text-violet-300">
              <BrainCircuit size={18} /> Daily Aptitude Quiz
            </p>
            {selectedQuiz && (
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {selectedQuiz.date} · {getRelativeDateLabel(selectedQuiz.date)}
              </p>
            )}
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono font-bold ${
              secondsLeft < 60 ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
            }`}
          >
            <Clock3 size={17} />
            {formatTime(secondsLeft)}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {history.slice(0, 5).map((entry) => (
              <button
                key={entry.date}
                type="button"
                onClick={() => setSelectedDate(entry.date)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  selectedDate === entry.date
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-stone-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {getRelativeDateLabel(entry.date)}
              </button>
            ))}
          </div>
        )}

        <div
          className="mt-4 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${Math.min(totalQuestions, 10)}, minmax(0, 1fr))` }}
        >
          {selectedQuiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Question ${index + 1}`}
              className={`h-2 rounded-full transition ${
                index === current ? "bg-violet-600" : answers[index] ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card className="min-h-[25rem]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
            Question {current + 1} of {totalQuestions}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize dark:bg-slate-800">
            {topicName(question.topic)} · {question.difficulty}
          </span>
        </div>

        <h2 className="mt-6 text-xl font-bold leading-8 sm:text-2xl">{question.question}</h2>

        <div className="mt-6 grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={option}
              onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [current]: option }))}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${
                answers[current] === option
                  ? "border-violet-600 bg-violet-50 text-violet-950 ring-1 ring-violet-600 dark:bg-violet-950/40 dark:text-white"
                  : "border-stone-200 hover:border-violet-300 dark:border-slate-700"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
                  answers[current] === option
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-slate-300 text-slate-500"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <button
            disabled={current === 0}
            onClick={() => setCurrent((value) => value - 1)}
            className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-700"
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          {current < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrent((value) => value + 1)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white"
            >
              Next
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              onClick={submit}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
            >
              <CheckCircle2 size={17} />
              Submit quiz ({answeredCount}/{totalQuestions})
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      </Card>
    </div>
  );
}
