import { Router } from "express";
import { submitChallenge, getChallengeFeedback, saveChallengeDraft } from "../controllers/challenge.controller";

const router = Router();

router.post("/:challengeId/submit", submitChallenge);
router.post("/:challengeId/feedback", getChallengeFeedback);
router.put("/:challengeId/draft", saveChallengeDraft);

export default router;
