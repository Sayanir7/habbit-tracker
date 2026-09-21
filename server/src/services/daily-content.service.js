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

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

export const getRandomPreviousItems = async (model, date, field, count) => {
  const previous = await model.find({ date: { $lt: date } }).sort({ date: -1 }).limit(4).lean();
  return shuffle(previous.flatMap((entry) => entry[field] || [])).slice(0, count);
};

export const getOrGenerateDailyContent = async ({ model, date = getDateKey(), generate, retentionDays = 5 }) => {
  console.log(`[daily-content] ${model.modelName} request date=${date} now=${new Date().toISOString()} retentionDays=${retentionDays}`);
  const existing = await model.findOne({ date }).lean();
  const cleanupResult = await cleanupDailyContent(model, date, retentionDays);
  console.log(`[daily-content] ${model.modelName} existing=${Boolean(existing)} removed=${cleanupResult.deletedCount}`);
  if (existing) {
    console.log(`[daily-content] ${model.modelName} using stored date=${existing.date}`);
    return existing;
  }
  const lockKey = `${model.modelName}:${date}`;
  let generation = generationLocks.get(lockKey);
  if (!generation) {
    console.log(`[daily-content] ${model.modelName} starting generation date=${date}`);
    generation = generate(date).finally(() => generationLocks.delete(lockKey));
    generationLocks.set(lockKey, generation);
  }
  return generation;
};

export const startDailyContentScheduler = (getContent, label) => {
  const run = () => {
    console.log(`[daily-content] scheduler running label=${label} date=${getDateKey()} now=${new Date().toISOString()}`);
    return getContent().then((content) => {
      console.log(`[daily-content] scheduler completed label=${label} storedDate=${content?.date || "missing"}`);
      return content;
    }).catch((error) => console.error(`[daily-content] scheduler failed label=${label}:`, error));
  };
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
