import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export interface ExecutionRequest {
  code: string;
  language?: string;
  testInput?: string;
  timeoutMs?: number;
}

export interface ExecutionResult {
  success: boolean;
  status: 'completed' | 'timeout' | 'error';
  executionTimeMs: number;
  output: string;
  error: string | null;
}

export class CodeExecutionService {
  private timeoutMs: number;
  private maxBufferBytes: number;
  private pythonPath: string;

  constructor() {
    this.timeoutMs = parseInt(process.env.CODE_EXECUTION_TIMEOUT_MS || "5000", 10);
    this.maxBufferBytes = parseInt(process.env.CODE_EXECUTION_MAX_BUFFER_BYTES || "524288", 10);
    this.pythonPath = process.env.PYTHON_PATH || "python3";
  }

  async executePython(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = request.timeoutMs || this.timeoutMs;

    // Create a temporary isolated script file in the OS temp directory
    const tempDir = path.join(os.tmpdir(), "pathai_sandbox");
    if (!fs.existsSync(tempDir)) {
      try {
        fs.mkdirSync(tempDir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }

    const tempFile = path.join(tempDir, `exec_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);

    // Prepare code for execution. If testInput is provided, wrap in test harness.
    let fullScript = request.code;
    if (request.testInput) {
      fullScript = `${request.code}\n\n# PathAI Test Runner Execution Harness\nimport sys\nimport ast\n\ntry:\n    arg = ast.literal_eval("""${request.testInput}""")\n    # Find first defined function\n    funcs = [v for k, v in list(locals().items()) if callable(v) and not k.startswith('_') and k != 'sum_even_numbers' and k not in ('sys', 'ast')]\n    target_fn = locals().get('sum_even_numbers', funcs[0] if funcs else None)\n    if target_fn:\n        res = target_fn(arg)\n        print(repr(res))\n    else:\n        print("No callable function found.")\nexcept Exception as e:\n    print(f"ERROR: {type(e).__name__}: {str(e)}", file=sys.stderr)\n    sys.exit(1)\n`;
    }

    try {
      fs.writeFileSync(tempFile, fullScript, "utf-8");
    } catch (err: any) {
      return {
        success: false,
        status: 'error',
        executionTimeMs: 0,
        output: '',
        error: `Sandbox preparation failed: ${err.message}`
      };
    }

    return new Promise<ExecutionResult>((resolve) => {
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;

      // Sanitized environment variables - strips all backend secrets and credentials
      const cleanEnv = {
        PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
        PYTHONUNBUFFERED: "1",
        PYTHONDONTWRITEBYTECODE: "1"
      };

      const proc = spawn(this.pythonPath, [tempFile], {
        env: cleanEnv,
        stdio: ["pipe", "pipe", "pipe"],
        cwd: tempDir
      });

      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          proc.kill("SIGKILL");
        } catch (e) {
          // ignore
        }
      }, timeout);

      proc.stdout.on("data", (data) => {
        if (stdout.length + data.length <= this.maxBufferBytes) {
          stdout += data.toString();
        } else {
          stdout += "\n[Output truncated: maximum limit reached]";
        }
      });

      proc.stderr.on("data", (data) => {
        if (stderr.length + data.length <= this.maxBufferBytes) {
          stderr += data.toString();
        }
      });

      proc.on("close", (code) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;

        // Cleanup temporary file
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (e) {
          // ignore
        }

        if (isTimedOut) {
          return resolve({
            success: false,
            status: 'timeout',
            executionTimeMs,
            output: stdout.trim(),
            error: "Execution timed out (5000ms limit). Check for infinite loops or heavy computations."
          });
        }

        const isSuccess = code === 0 && !stderr;
        return resolve({
          success: isSuccess,
          status: isSuccess ? 'completed' : 'error',
          executionTimeMs,
          output: stdout.trim(),
          error: stderr.trim() || (code !== 0 ? `Process exited with code ${code}` : null)
        });
      });

      proc.on("error", (err) => {
        clearTimeout(timer);
        try {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        } catch (e) {}

        resolve({
          success: false,
          status: 'error',
          executionTimeMs: Date.now() - startTime,
          output: '',
          error: `Execution runtime error: ${err.message}`
        });
      });
    });
  }
}

export const codeExecutionService = new CodeExecutionService();
