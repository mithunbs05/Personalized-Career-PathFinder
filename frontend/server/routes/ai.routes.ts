import { Router } from "express";
import { handleLessonChat } from "../controllers/ai.controller";

const router = Router();

router.post("/lesson-chat", handleLessonChat);

export default router;
