const DEFAULT_KNOWLEDGE_ITEM_COUNT = 15;

export const getKnowledgeItemCount = () => {
  const configuredCount = Number.parseInt(process.env.KNOWLEDGE_ITEM_COUNT, 10);
  if (!Number.isInteger(configuredCount) || configuredCount < 1 || configuredCount > 50) {
    return DEFAULT_KNOWLEDGE_ITEM_COUNT;
  }
  return configuredCount;
};
