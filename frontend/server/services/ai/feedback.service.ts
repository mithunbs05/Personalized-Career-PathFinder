import { aiService } from "./ai.service";

export interface FeedbackInput {
  challengeTitle: string;
  challengeDescription: string;
  concepts: string[];
  submittedCode: string;
  passedCount: number;
  totalCount: number;
  failedTests: Array<{ input: string; expectedOutput: string; actualOutput?: string; error?: string }>;
  runtimeError?: string | null;
}

export interface FeedbackResult {
  summary: string;
  problem: string;
  concept: string;
  hint: string;
  nextAction: string;
}

export class FeedbackService {
  async generateFeedback(input: FeedbackInput): Promise<FeedbackResult> {
    const isAllPassed = input.passedCount === input.totalCount;

    if (isAllPassed) {
      return {
        summary: "Excellent work! All test cases passed cleanly.",
        problem: "None detected.",
        concept: input.concepts[0] || "Sequence iteration",
        hint: "Consider analyzing the time and space complexity or exploring generator expressions.",
        nextAction: "Advance to the next curriculum stage or explore the advanced variation."
      };
    }

    const prompt = `You are an expert AI Programming Instructor for PathAI.
A student submitted Python code that did NOT pass all test cases.
Generate supportive, insightful, and Socratic feedback to help them discover the issue without directly pasting the answer.

CHALLENGE: ${input.challengeTitle}
DESCRIPTION: ${input.challengeDescription}
KEY CONCEPTS: ${JSON.stringify(input.concepts)}

STUDENT'S SUBMITTED CODE:
\`\`\`python
${input.submittedCode}
\`\`\`

RESULTS:
Passed: ${input.passedCount} / ${input.totalCount}
Failed Tests: ${JSON.stringify(input.failedTests, null, 2)}
Runtime Error: ${input.runtimeError || "None"}

Generate a JSON object matching this schema:
{
  "summary": "1 encouraging sentence summarizing the outcome.",
  "problem": "Clear explanation of what went wrong in the execution logic.",
  "concept": "Specific programming concept to review (e.g. Modulo arithmetic, Accumulator pattern).",
  "hint": "Actionable Socratic hint guiding them to fix the flaw.",
  "nextAction": "1 concise recommendation (e.g. Test with negative numbers, Check your if condition)."
}`;

    const fallback: FeedbackResult = {
      summary: `You passed ${input.passedCount} of ${input.totalCount} tests. Almost there!`,
      problem: input.runtimeError
        ? `Runtime error encountered: ${input.runtimeError}`
        : "Your loop processes elements but does not filter for even numbers (`num % 2 == 0`) before adding to the sum.",
      concept: "Conditional Accumulation & Modulo Arithmetic",
      hint: "Remember to use `if num % 2 == 0:` inside your loop before adding `num` to `total`.",
      nextAction: "Update the conditional check and run the tests again."
    };

    return await aiService.generateJSON<FeedbackResult>(prompt, fallback);
  }
}

export const feedbackService = new FeedbackService();
