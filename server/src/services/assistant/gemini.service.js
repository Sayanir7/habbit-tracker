import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-3.6-flash";
const SYSTEM_INSTRUCTION = "You are a concise, helpful AI assistant. Answer clearly and practically.";

const toGeminiHistory = (history = []) =>
  history
    .filter((message) => message?.content)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

export const askGemini = async (message, history = [], options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("GEMINI_API_KEY is not configured on the server"), { status: 503 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: options.model || MODEL,
    systemInstruction: SYSTEM_INSTRUCTION
  });

  const contents = [
    ...toGeminiHistory(history),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const generationConfig = {
    temperature: options.json ? 0.35 : 0.7,
    topP: options.json ? 0.8 : 0.9,
    topK: 32,
    maxOutputTokens: options.json ? 8192 : 2048,
    ...(options.json ? { responseMimeType: "application/json" } : {}),
    ...(options.responseSchema ? { responseSchema: options.responseSchema } : {})
  };

  const result = await model.generateContent({
    contents,
    generationConfig
  });

  return result.response.text();
};
