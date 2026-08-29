// Challenges API Client

export interface TestCaseItem {
  id: string;
  order: number;
  description: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  isHidden?: boolean;
  error?: string;
}

export interface ChallengeData {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'Beginner' | 'Guided' | 'Standard' | 'Advanced';
  starterCode: string;
  solutionCode?: string;
  instructions: string[];
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  hints: string[];
  testCases: TestCaseItem[];
}

export interface SubmissionResult {
  success: boolean;
  passed: number;
  total: number;
  score: number;
  status: 'developing' | 'proficient' | 'mastered' | 'beginner';
  tests: TestCaseItem[];
  feedback?: {
    summary: string;
    problem: string;
    concept: string;
    hint: string;
    nextAction: string;
  };
}

export async function fetchChallenge(moduleId: string): Promise<ChallengeData> {
  const res = await fetch(`/api/modules/${moduleId}/challenge`);
  if (!res.ok) throw new Error(`Failed to load challenge for module ${moduleId}`);
  const data = await res.json();
  return data.challenge;
}

export async function submitChallengeCode(challengeId: string, code: string): Promise<SubmissionResult> {
  const res = await fetch(`/api/challenges/${challengeId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
  if (!res.ok) throw new Error(`Submission failed for challenge ${challengeId}`);
  return await res.json();
}

export async function saveChallengeDraft(challengeId: string, code: string): Promise<void> {
  await fetch(`/api/challenges/${challengeId}/draft`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
}
