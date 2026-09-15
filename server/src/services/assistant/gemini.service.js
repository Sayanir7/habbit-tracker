import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.5-flash";
const SYSTEM_INSTRUCTION = "You are a concise, helpful AI assistant. Answer clearly and practically.";

const toGeminiHistory = (history = []) =>
  history
    .filter((message) => message?.content)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

export const askGemini = async (message, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("GEMINI_API_KEY is not configured on the server"), { status: 503 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_INSTRUCTION
  });

  const contents = [
    ...toGeminiHistory(history),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 2048
    }
  });

  return result.response.text();
};
