import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { DailyKnowledge } from "../models/DailyKnowledge.js";
import { askGemini } from "./assistant/gemini.service.js";
import { getKnowledgeItemCount } from "../config/knowledge.js";

const promptPath = fileURLToPath(new URL("../utils/facts-system-prompt.md", import.meta.url));
const generationLocks = new Map();
const categories = new Set(["vocabulary", "science", "history", "geography", "arts_culture", "technology", "general_knowledge"]);
const types = new Set(["word", "question", "fact", "concept"]);

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const getPreviousDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const parseJson = (raw) => {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw Object.assign(new Error("Gemini did not return a JSON object"), { status: 502 });
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw Object.assign(new Error("Gemini returned malformed daily knowledge JSON"), { status: 502 });
  }
};

const validatePayload = (payload, date) => {
  const itemCount = getKnowledgeItemCount();
  if (!payload || payload.date !== date || !Array.isArray(payload.items) || payload.items.length !== itemCount) {
    throw Object.assign(new Error("Gemini returned an invalid daily knowledge payload"), { status: 502 });
  }

  const ids = new Set();
  payload.items.forEach((item, index) => {
    if (!item || item.id !== index + 1 || ids.has(item.id) || !categories.has(item.category) || !types.has(item.type)) {
      throw Object.assign(new Error("Gemini returned an invalid knowledge item"), { status: 502 });
    }
    ids.add(item.id);
    for (const field of ["title", "content"]) {
      if (typeof item[field] !== "string" || !item[field].trim()) {
        throw Object.assign(new Error("Gemini returned an incomplete knowledge item"), { status: 502 });
      }
    }
    for (const field of ["question", "answer", "example", "source_note", "sourceNote"]) {
      if (item[field] !== undefined && item[field] !== null && typeof item[field] !== "string") {
        throw Object.assign(new Error("Gemini returned an invalid knowledge field"), { status: 502 });
      }
    }
  });

  return {
    date,
    items: payload.items.map(({ source_note: sourceNote, ...item }) => ({
      ...item,
      sourceNote: item.sourceNote ?? sourceNote ?? null
    }))
  };
};

const generateAndStore = async (date) => {
  const prompt = (await readFile(promptPath, "utf8")).replaceAll("{{KNOWLEDGE_ITEM_COUNT}}", String(getKnowledgeItemCount()));
  const raw = await askGemini(`${prompt}\n\nGenerate today's feed for date ${date}. Return only the required JSON.`, [], { json: true });
  const payload = validatePayload(parseJson(raw), date);

  try {
    return await DailyKnowledge.create(payload);
  } catch (error) {
    if (error?.code === 11000) return DailyKnowledge.findOne({ date });
    throw error;
  }
};

const fallback = async (date) => DailyKnowledge.findOne({ date: { $gte: getPreviousDateKey(date, 4), $lte: date } }).sort({ date: -1 });

export const getDailyKnowledge = async () => {
  const date = getTodayKey();
  const existing = await DailyKnowledge.findOne({ date }).lean();
  await DailyKnowledge.deleteMany({ date: { $lt: getPreviousDateKey(date, 4) } });
  if (existing) return { date: existing.date, items: existing.items, fallback: false };

  let generation = generationLocks.get(date);
  if (!generation) {
    generation = generateAndStore(date).finally(() => generationLocks.delete(date));
    generationLocks.set(date, generation);
  }

  try {
    const generated = await generation;
    return { date: generated.date, items: generated.items, fallback: false };
  } catch (error) {
    const previous = await fallback(date);
    if (previous) return { date: previous.date, items: previous.items, fallback: true };
    throw error;
  }
};
