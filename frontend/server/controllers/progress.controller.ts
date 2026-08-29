import { Request, Response } from "express";
import { db } from "../data/database";

export const getModuleProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const userId = (req as any).user?.id || "default_user";

    const prog = db.getProgress(userId, moduleId);
    res.json({
      success: true,
      concept: prog.conceptScore,
      practice: {
        passed: prog.testsPassed,
        total: prog.totalTests
      },
      mastery: prog.masteryLevel,
      overall: prog.overallProgress,
      videoCurrentTime: prog.videoCurrentTime,
      videoDuration: prog.videoDuration,
      videoCompleted: prog.videoCompleted,
      savedDraftCode: prog.savedDraftCode,
      activeMode: prog.activeMode
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { currentTime, duration, completed } = req.body;
    const userId = (req as any).user?.id || "default_user";

    const prog = db.updateProgress(userId, moduleId, {
      videoCurrentTime: Math.round(currentTime || 0),
      videoDuration: Math.round(duration || 720),
      videoCompleted: !!completed,
      conceptScore: completed ? 100 : Math.min(100, Math.round(((currentTime || 0) / (duration || 720)) * 100))
    });

    res.json({
      success: true,
      progress: {
        concept: prog.conceptScore,
        practice: {
          passed: prog.testsPassed,
          total: prog.totalTests
        },
        mastery: prog.masteryLevel,
        overall: prog.overallProgress
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
