import { Request, Response } from "express";
import { youtubeService } from "../services/youtube/youtube.service";

export const getBestYouTubeVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const result = await youtubeService.getOrFetchBestVideo(moduleId, false);
    if (!result.success || !result.video) {
      res.status(404).json({ success: false, error: result.error || "No suitable video found" });
      return;
    }
    res.json({
      success: true,
      video: result.video,
      fromCache: result.fromCache
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const refreshYouTubeVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const result = await youtubeService.getOrFetchBestVideo(moduleId, true);
    if (!result.success || !result.video) {
      res.status(404).json({ success: false, error: result.error || "Failed to find a better video" });
      return;
    }
    res.json({
      success: true,
      video: result.video,
      message: "Video updated with best educational match"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveYouTubeWatchProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { videoId, currentTime, duration, percentage, completed } = req.body;
    const userId = (req as any).user?.id || "default_user";

    const saved = youtubeService.saveWatchProgress(
      userId,
      moduleId,
      videoId || "",
      currentTime || 0,
      duration || 720,
      percentage || 0,
      completed || false
    );

    res.json({
      success: true,
      progress: saved
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
