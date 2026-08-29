import { Request, Response } from "express";
import { db } from "../data/database";
import { challengeService } from "../services/challenge/challenge.service";
import { feedbackService } from "../services/ai/feedback.service";

export const submitChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    const { code } = req.body;
    const userId = (req as any).user?.id || "default_user";

    if (!code || typeof code !== "string") {
      res.status(400).json({ success: false, error: "Missing code submission payload" });
      return;
    }

    const result = await challengeService.submitChallenge(userId, challengeId, code);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getChallengeFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    const { code, failedTests, passedCount, totalCount, runtimeError } = req.body;

    const challenge = db.getChallengeById(challengeId);
    if (!challenge) {
      res.status(404).json({ success: false, error: "Challenge not found" });
      return;
    }

    const mod = db.getModule(challenge.moduleId);
    const feedback = await feedbackService.generateFeedback({
      challengeTitle: challenge.title,
      challengeDescription: challenge.description,
      concepts: mod?.concepts || ["Iteration", "Filtering"],
      submittedCode: code || "",
      passedCount: passedCount || 0,
      totalCount: totalCount || challenge.testCases.length,
      failedTests: failedTests || [],
      runtimeError
    });

    res.json({ success: true, feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveChallengeDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    const { code } = req.body;
    const userId = (req as any).user?.id || "default_user";

    const challenge = db.getChallengeById(challengeId);
    if (!challenge) {
      res.status(404).json({ success: false, error: "Challenge not found" });
      return;
    }

    db.updateProgress(userId, challenge.moduleId, {
      savedDraftCode: code
    });

    res.json({ success: true, message: "Draft autosaved successfully", savedAt: new Date() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
