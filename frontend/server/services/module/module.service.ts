import { db, DbModule, DbTranscript, DbAIInsight } from "../../data/database";

export interface AIContentBundle {
  narration: Array<{ timestamp: string; title: string; body: string }>;
  codeDemo: Array<{ title: string; language: string; code: string; explanation: string }>;
  visualFlow: Array<{ step: number; title: string; detail: string; status?: string }>;
  takeaways: Array<{ point: string; highlight: string }>;
}

export class ModuleService {
  getModule(id: string): DbModule | undefined {
    return db.getModule(id);
  }

  getTranscript(moduleId: string): DbTranscript[] {
    return db.getTranscripts(moduleId);
  }

  getAIContent(moduleId: string): AIContentBundle {
    const mod = db.getModule(moduleId);
    const transcripts = db.getTranscripts(moduleId);

    // Build structured narration from real transcripts
    const narration = transcripts.map((t) => ({
      timestamp: t.timestamp,
      title: t.concept,
      body: t.content
    }));

    // Code demo corresponding to module concepts
    const codeDemo = [
      {
        title: "Filtering & Accumulation Loop",
        language: "python",
        code: `def sum_even_numbers(numbers):\n    total = 0\n    for num in numbers:\n        if num % 2 == 0:\n            total += num\n    return total`,
        explanation: "Iterates through each element, applies the modulo filter condition, and accumulates matching values into `total`."
      },
      {
        title: "Pythonic List Comprehension",
        language: "python",
        code: `def sum_even_numbers(numbers):\n    return sum(num for num in numbers if num % 2 == 0)`,
        explanation: "Compact generator comprehension that filters and sums in a single expressive pass with O(n) runtime."
      }
    ];

    // Visual flow representation
    const visualFlow = [
      { step: 1, title: "Initialize Accumulator", detail: "Set total = 0 before entering loop", status: "completed" },
      { step: 2, title: "Traverse Sequence", detail: "Fetch next integer from numbers iterable", status: "completed" },
      { step: 3, title: "Modulo Evaluation", detail: "Evaluate num % 2 == 0 predicate", status: "active" },
      { step: 4, title: "Accumulate or Skip", detail: "If True: total += num; Else: continue", status: "pending" },
      { step: 5, title: "Return Result", detail: "Yield final integer sum after traversal", status: "pending" }
    ];

    // Key Takeaways
    const takeaways = (mod?.learningObjectives || [
      "for-loops traverse iterables sequentially",
      "num % 2 == 0 evaluates cleanly to True for all evens",
      "Accumulator variables must be initialized before loop entry"
    ]).map((obj) => ({
      point: obj,
      highlight: "Essential Practice Rule"
    }));

    return {
      narration,
      codeDemo,
      visualFlow,
      takeaways
    };
  }

  getInsight(userId: string, moduleId: string): DbAIInsight {
    const existing = db.getInsight(userId, moduleId);
    if (existing) return existing;

    const prog = db.getProgress(userId, moduleId);
    return {
      id: `ins_${Date.now()}`,
      userId,
      moduleId,
      insightText: `Your concept understanding is at ${prog.conceptScore}%, with ${prog.testsPassed}/${prog.totalTests} tests passing.`,
      recommendedAction: "Try one guided challenge before advancing.",
      createdAt: new Date()
    };
  }
}

export const moduleService = new ModuleService();
