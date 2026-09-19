import { getDailyKnowledge, getKnowledgeHistory } from "../services/knowledge.service.js";

export const dailyKnowledge = async (_req, res, next) => {
  try {
    res.json(await getDailyKnowledge());
  } catch (error) {
    next(error);
  }
};

export const knowledgeHistory = async (_req, res, next) => {
  try {
    res.json({ entries: await getKnowledgeHistory() });
  } catch (error) {
    next(error);
  }
};
