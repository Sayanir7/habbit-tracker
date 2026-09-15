import { askAssistant } from "../services/assistant/assistant.service.js";

export const chat = async (req, res, next) => {
  try {
    const { message, history = [], mode = "chat" } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const reply = await askAssistant({
      message: message.trim(),
      history,
      mode
    });

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
