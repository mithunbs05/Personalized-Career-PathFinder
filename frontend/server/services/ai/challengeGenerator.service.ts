import { aiService } from "./ai.service";
import { DbChallenge, DbTestCase } from "../../data/database";

export interface GenerateChallengeParams {
  moduleId: string;
  moduleTitle: string;
  category: string;
  difficulty: string;
  learningObjectives: string[];
  concepts: string[];
  transcriptExcerpt?: string;
}

export class ChallengeGeneratorService {
  async generateFromLesson(params: GenerateChallengeParams): Promise<DbChallenge> {
    const prompt = `You are a Senior Curriculum Specialist and AI Engineer for PathAI.
Analyze this video lesson and transform it into an equivalent, highly targeted hands-on coding challenge.

LESSON CONTEXT:
Module Title: ${params.moduleTitle}
Category: ${params.category}
Difficulty: ${params.difficulty}
Objectives: ${JSON.stringify(params.learningObjectives)}
Concepts Taught: ${JSON.stringify(params.concepts)}
Transcript Excerpt: ${params.transcriptExcerpt || "Focus on for-loops, modulo operators, and accumulator patterns in Python."}

CRITICAL RULES:
1. The challenge MUST directly test the specific concepts taught in this lesson (e.g. if the lesson is on Python loops with even-number filtering, the challenge MUST test that exact pattern).
2. Do NOT generate unrelated projects.
3. Write clean, idiomatic Python starter code with clear docstrings.
4. Provide 5 test cases (3 visible, 2 hidden edge cases).
5. Provide 3-4 progressive hints that guide without spoiling the answer.

Output ONLY valid JSON matching this schema:
{
  "title": "Concise Challenge Title",
  "description": "Clear 1-2 sentence problem description.",
  "language": "python",
  "difficulty": "${params.difficulty}",
  "starterCode": "Python function definition with docstring and pass or initial starter lines",
  "solutionCode": "Complete clean Python solution",
  "instructions": [
    "Instruction step 1",
    "Instruction step 2"
  ],
  "constraints": [
    "Constraint 1",
    "Constraint 2"
  ],
  "examples": [
    { "input": "[1, 2, 3, 4, 5, 6]", "output": "12", "explanation": "2 + 4 + 6 = 12" }
  ],
  "hints": [
    "Gentle conceptual hint 1",
    "Algorithmic hint 2",
    "Implementation tip 3"
  ],
  "testCases": [
    { "input": "[1, 2, 3, 4, 5, 6]", "expectedOutput": "12", "description": "Standard mixed list", "isHidden": false },
    { "input": "[2, 4, 6, 8, 10]", "expectedOutput": "30", "description": "All evens list", "isHidden": false },
    { "input": "[1, 3, 5, 7, 9]", "expectedOutput": "0", "description": "All odds list", "isHidden": false },
    { "input": "[]", "expectedOutput": "0", "description": "Empty list edge case", "isHidden": true },
    { "input": "[-4, -2, 0, 3, 5, 8]", "expectedOutput": "2", "description": "Negative evens and zero", "isHidden": true }
  ]
}`;

    const fallback: any = {
      title: "Sum of Even Numbers in a List",
      description: "Write a Python function called sum_even_numbers(numbers) that calculates the sum of all even numbers in a list.",
      language: "python",
      difficulty: params.difficulty || "Standard",
      starterCode: `def sum_even_numbers(numbers):\n    """\n    Calculates the sum of all even numbers in the list.\n    """\n    total = 0\n    for num in numbers:\n        # TODO: Check if num is even and add to total\n        total += num\n    return total\n`,
      solutionCode: `def sum_even_numbers(numbers):\n    return sum(n for n in numbers if n % 2 == 0)`,
      instructions: [
        "Iterate through the `numbers` list",
        "Check if each number is even using `num % 2 == 0`",
        "Accumulate all even numbers into a running sum",
        "Return the total sum (return 0 if empty or no evens)"
      ],
      constraints: [
        "Input can be an empty list: `[]` -> return `0`",
        "Can contain negative even numbers (e.g. `-2`, `-4`)",
        "Zero is an even number (`0 % 2 == 0` is True)"
      ],
      examples: [
        { input: "[1, 2, 3, 4, 5, 6]", output: "12", explanation: "2 + 4 + 6 = 12" },
        { input: "[1, 3, 5]", output: "0", explanation: "No evens present" }
      ],
      hints: [
        "Recall the modulo operator `%`: `num % 2 == 0` is True for even numbers.",
        "Check `if num % 2 == 0:` before adding to your accumulator `total`.",
        "Alternative Pythonic one-liner: `return sum(n for n in numbers if n % 2 == 0)`"
      ],
      testCases: [
        { input: "[1, 2, 3, 4, 5, 6]", expectedOutput: "12", description: "Standard mixed list", isHidden: false },
        { input: "[2, 4, 6, 8, 10]", expectedOutput: "30", description: "All even numbers", isHidden: false },
        { input: "[1, 3, 5, 7, 9]", expectedOutput: "0", description: "All odd numbers", isHidden: false },
        { input: "[]", expectedOutput: "0", description: "Empty list edge case", isHidden: true },
        { input: "[-4, -2, 0, 3, 5, 8]", expectedOutput: "2", description: "Negative evens and zero", isHidden: true }
      ]
    };

    const rawGenerated = await aiService.generateJSON<any>(prompt, fallback);

    const challengeId = `chal_${Date.now()}`;
    const testCases: DbTestCase[] = (rawGenerated.testCases || fallback.testCases).map((tc: any, index: number) => ({
      id: `tc_${challengeId}_${index + 1}`,
      challengeId,
      input: String(tc.input),
      expectedOutput: String(tc.expectedOutput),
      description: tc.description || `Test case ${index + 1}`,
      isHidden: !!tc.isHidden,
      order: index + 1
    }));

    return {
      id: challengeId,
      moduleId: params.moduleId,
      title: rawGenerated.title || fallback.title,
      description: rawGenerated.description || fallback.description,
      language: rawGenerated.language || "python",
      difficulty: (rawGenerated.difficulty as any) || "Standard",
      starterCode: rawGenerated.starterCode || fallback.starterCode,
      solutionCode: rawGenerated.solutionCode || fallback.solutionCode,
      instructions: rawGenerated.instructions || fallback.instructions,
      constraints: rawGenerated.constraints || fallback.constraints,
      examples: rawGenerated.examples || fallback.examples,
      hints: rawGenerated.hints || fallback.hints,
      testCases,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export const challengeGenerator = new ChallengeGeneratorService();
