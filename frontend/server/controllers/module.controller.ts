import { Request, Response } from "express";
import { db } from "../data/database";
import { moduleService } from "../services/module/module.service";
import { challengeGenerator } from "../services/ai/challengeGenerator.service";

export const getModuleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const moduleData = db.getModule(moduleId);
    if (!moduleData) {
      res.status(404).json({ success: false, error: "Module not found" });
      return;
    }
    res.json({ success: true, module: moduleData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getModuleTranscript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const transcripts = moduleService.getTranscript(moduleId);
    res.json({ success: true, transcripts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getModuleChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    let challenge = db.getChallengeByModule(moduleId);

    // If challenge does not exist yet, generate it
    if (!challenge) {
      const mod = db.getModule(moduleId);
      if (!mod) {
        res.status(404).json({ success: false, error: "Module not found" });
        return;
      }
      challenge = await challengeGenerator.generateFromLesson({
        moduleId: mod.id,
        moduleTitle: mod.title,
        category: mod.category,
        difficulty: mod.difficulty,
        learningObjectives: mod.learningObjectives,
        concepts: mod.concepts
      });
      db.saveChallenge(challenge);
    }

    res.json({ success: true, challenge });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const transformModuleToChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { forceRegenerate } = req.body;

    if (!forceRegenerate) {
      const existing = db.getChallengeByModule(moduleId);
      if (existing) {
        res.json({ success: true, mode: "coding", challenge: existing });
        return;
      }
    }

    const mod = db.getModule(moduleId);
    if (!mod) {
      res.status(404).json({ success: false, error: "Module not found" });
      return;
    }

    const generated = await challengeGenerator.generateFromLesson({
      moduleId: mod.id,
      moduleTitle: mod.title,
      category: mod.category,
      difficulty: mod.difficulty,
      learningObjectives: mod.learningObjectives,
      concepts: mod.concepts
    });

    db.saveChallenge(generated);
    res.json({ success: true, mode: "coding", challenge: generated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getModuleAIContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const content = moduleService.getAIContent(moduleId);
    res.json({ success: true, content });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getModuleInsight = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const userId = (req as any).user?.id || "default_user";
    const insight = moduleService.getInsight(userId, moduleId);
    res.json({ success: true, insight });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
