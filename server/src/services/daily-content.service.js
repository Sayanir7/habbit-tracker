const generationLocks = new Map();

export const getDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const dateBefore = (dateKey, days) => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - days);
  return getDateKey(date);
};

export const cleanupDailyContent = (model, date = getDateKey(), retentionDays = 5) =>
  model.deleteMany({ date: { $lt: dateBefore(date, retentionDays - 1) } });

export const listRecentDailyContent = async (model, date = getDateKey(), retentionDays = 5) => {
  await cleanupDailyContent(model, date, retentionDays);
  return model.find({ date: { $lte: date } }).sort({ date: -1 }).limit(retentionDays).lean();
};

export const getOrGenerateDailyContent = async ({ model, date = getDateKey(), generate, retentionDays = 5 }) => {
  const existing = await model.findOne({ date }).lean();
  await cleanupDailyContent(model, date, retentionDays);
  if (existing) return existing;
  const lockKey = `${model.modelName}:${date}`;
  let generation = generationLocks.get(lockKey);
  if (!generation) {
    generation = generate(date).finally(() => generationLocks.delete(lockKey));
    generationLocks.set(lockKey, generation);
  }
  return generation;
};

export const startDailyContentScheduler = (getContent, label) => {
  const run = () => getContent().catch((error) => console.error(`Daily ${label} generation failed:`, error.message));
  run();

  const scheduleNext = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 5, 0, 0);
    setTimeout(() => {
      run();
      scheduleNext();
    }, next - now);
  };

  scheduleNext();
};
