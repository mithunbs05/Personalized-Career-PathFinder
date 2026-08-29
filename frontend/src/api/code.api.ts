// Code Execution API Client

export interface CodeExecutionResponse {
  success: boolean;
  status: 'completed' | 'timeout' | 'error';
  executionTime: number;
  output: string;
  error: string | null;
}

export async function executeCodeDirect(
  code: string,
  language = "python",
  testInput?: string
): Promise<CodeExecutionResponse> {
  const res = await fetch(`/api/code/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, testInput })
  });
  if (!res.ok) throw new Error("Failed to execute code in sandbox");
  return await res.json();
}
