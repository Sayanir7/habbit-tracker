import { askGemini } from "./gemini.service.js";

const SUPPORTED_MODES = new Set(["chat"]);

export const askAssistant = async ({ message, history, mode }) => {
  const assistantMode = SUPPORTED_MODES.has(mode) ? mode : "chat";

  if (assistantMode === "chat") {
    return askGemini(message, history);
  }

  throw Object.assign(new Error("Assistant mode is not available yet"), { status: 400 });
};
