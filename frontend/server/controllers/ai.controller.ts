import { Request, Response } from "express";
import { db } from "../data/database";
import { lessonChatService } from "../services/ai/lessonChat.service";

export const handleLessonChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId, message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, error: "Missing message query" });
      return;
    }

    const mod = db.getModule(moduleId || "module_py_loops");
    if (!mod) {
      res.status(404).json({ success: false, error: "Module not found" });
      return;
    }

    const transcripts = db.getTranscripts(mod.id);
    const result = await lessonChatService.respondToQuestion({
      module: mod,
      transcripts,
      userMessage: message
    });

    res.json({
      success: true,
      answer: result.answer,
      relatedConcept: result.relatedConcept
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
