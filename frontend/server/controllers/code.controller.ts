import { Request, Response } from "express";
import { codeExecutionService } from "../services/code-execution/codeExecution.service";

export const executeCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language, testInput, timeoutMs } = req.body;

    if (!code || typeof code !== "string") {
      res.status(400).json({ success: false, error: "Missing code in request body" });
      return;
    }

    const result = await codeExecutionService.executePython({
      code,
      language: language || "python",
      testInput,
      timeoutMs: timeoutMs || 5000
    });

    res.json({
      success: result.success,
      status: result.status,
      executionTime: result.executionTimeMs,
      output: result.output,
      error: result.error
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'error',
      executionTime: 0,
      output: '',
      error: error.message
    });
  }
};
