const DEFAULT_COUNTS = {
  knowledge: 10,
  quiz: 10,
  retentionDays: 5
};

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export const getKnowledgeDailyCount = () =>
  toPositiveInteger(process.env.KNOWLEDGE_DAILY_COUNT, DEFAULT_COUNTS.knowledge);

export const getQuizDailyCount = () =>
  toPositiveInteger(process.env.QUIZ_DAILY_COUNT, DEFAULT_COUNTS.quiz);

export const getContentRetentionDays = () =>
  toPositiveInteger(process.env.CONTENT_RETENTION_DAYS, DEFAULT_COUNTS.retentionDays);
