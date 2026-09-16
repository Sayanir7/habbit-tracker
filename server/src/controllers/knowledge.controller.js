import { getDailyKnowledge } from "../services/knowledge.service.js";

export const dailyKnowledge = async (_req, res, next) => {
  try {
    res.json(await getDailyKnowledge());
  } catch (error) {
    next(error);
  }
};
