import { Router } from "express";
import {
  getModuleById,
  getModuleTranscript,
  getModuleChallenge,
  transformModuleToChallenge,
  getModuleAIContent,
  getModuleInsight
} from "../controllers/module.controller";
import {
  getBestYouTubeVideo,
  refreshYouTubeVideo,
  saveYouTubeWatchProgress
} from "../controllers/youtube.controller";
import { getModuleProgress, updateVideoProgress } from "../controllers/progress.controller";

const router = Router();

router.get("/:moduleId", getModuleById);
router.get("/:moduleId/transcript", getModuleTranscript);
router.get("/:moduleId/progress", getModuleProgress);
router.post("/:moduleId/video-progress", updateVideoProgress);
router.post("/:moduleId/transform", transformModuleToChallenge);
router.get("/:moduleId/challenge", getModuleChallenge);
router.get("/:moduleId/ai-content", getModuleAIContent);
router.get("/:moduleId/insight", getModuleInsight);

// YouTube Educational Video Endpoints
router.get("/:moduleId/youtube-video", getBestYouTubeVideo);
router.post("/:moduleId/youtube-video/refresh", refreshYouTubeVideo);
router.post("/:moduleId/youtube-progress", saveYouTubeWatchProgress);

export default router;

