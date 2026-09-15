import React, { useMemo, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { Card } from "../common/Card.jsx";
import { IconButton } from "../common/IconButton.jsx";
import { api } from "../../services/api.js";

const initialMessages = [
  {
    role: "assistant",
    content: "Ask me anything. I can help with planning, habits, code, study, or quick explanations.",
    local: true
  }
];

export function QuickHelperGPT({ mode = "chat" }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const history = useMemo(
    () =>
      messages
        .filter((message) => !message.local && (message.role === "user" || message.role === "assistant"))
        .map(({ role, content }) => ({ role, content })),
    [messages]
  );

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message || loading) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setDraft("");
    setLoading(true);
    setError("");

    try {
      const { reply } = await api.assistantChat({
        message,
        history,
        mode
      });
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch (requestError) {
      setError(requestError.message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not reach the assistant service. Check the server API key and try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex min-h-[24rem] flex-col">
      <div className="flex items-center gap-2">
        <Sparkles className="text-emerald-600" size={22} />
        <h2 className="text-xl font-bold">Quick Helper GPT</h2>
      </div>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-lg bg-stone-50 p-3 dark:bg-slate-950">
        {messages.map((message, index) => (
          <ChatBubble key={`${message.role}-${index}`} message={message} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Loader2 className="animate-spin" size={16} />
            Thinking...
          </div>
        )}
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-emerald-950"
          placeholder="Ask a question"
        />
        <IconButton label="Send message" onClick={sendMessage} className="bg-emerald-600 text-white hover:text-white">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </IconButton>
      </div>
    </Card>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const Icon = isUser ? User : Bot;

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          <Icon size={15} />
        </div>
      )}
      <p
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-sm leading-6 ${
          isUser
            ? "bg-emerald-600 text-white"
            : "border border-stone-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        }`}
      >
        {message.content}
      </p>
      {isUser && (
        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-stone-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon size={15} />
        </div>
      )}
    </div>
  );
}
