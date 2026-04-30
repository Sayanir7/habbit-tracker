import React, { useState } from "react";
import { X } from "lucide-react";
import { IconButton } from "../common/IconButton.jsx";

export function AuthModal({ authError, onClose, onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", password: "" });
  const isSignup = mode === "signup";

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isSignup) await onSignup(draft);
      else await onLogin({ email: draft.email, password: draft.password });
      onClose();
    } catch {
      // The hook exposes the message through authError.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {isSignup ? "Create account" : "Welcome back"}
            </p>
            <h2 className="text-2xl font-bold">Account</h2>
          </div>
          <IconButton label="Close" type="button" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        <div className="space-y-3">
          {isSignup && (
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Name"
              required
            />
          )}
          <input
            type="email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={draft.password}
            onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Password"
            required
          />
        </div>

        {authError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{authError}</p>}

        <button
          disabled={submitting}
          className="mt-4 h-11 w-full rounded-lg bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
        <button
          type="button"
          onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
          className="mt-3 w-full text-sm font-semibold text-emerald-700 dark:text-emerald-300"
        >
          {isSignup ? "Already have an account?" : "Need an account?"}
        </button>
      </form>
    </div>
  );
}
