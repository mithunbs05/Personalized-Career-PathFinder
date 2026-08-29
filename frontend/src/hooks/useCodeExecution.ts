import { useState } from "react";
import { executeCodeDirect, CodeExecutionResponse } from "../api/code.api";

export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CodeExecutionResponse | null>(null);

  const runCode = async (code: string, language = "python", testInput?: string) => {
    setIsRunning(true);
    try {
      const res = await executeCodeDirect(code, language, testInput);
      setResult(res);
      return res;
    } catch (err: any) {
      const errorResult: CodeExecutionResponse = {
        success: false,
        status: 'error',
        executionTime: 0,
        output: '',
        error: err.message || "Failed to execute code"
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => setResult(null);

  return { isRunning, result, runCode, clearOutput };
}
