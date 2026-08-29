import { Router } from "express";
import { executeCode } from "../controllers/code.controller";

const router = Router();

router.post("/execute", executeCode);

export default router;
