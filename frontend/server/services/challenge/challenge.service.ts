import { db, DbChallenge, DbTestCase, DbChallengeAttempt } from "../../data/database";
import { codeExecutionService } from "../code-execution/codeExecution.service";
import { feedbackService } from "../ai/feedback.service";

export interface TestResultItem {
  id: string;
  order: number;
  description: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  isHidden: boolean;
  error?: string;
}

export interface SubmissionResponse {
  success: boolean;
  passed: number;
  total: number;
  score: number;
  status: 'developing' | 'proficient' | 'mastered' | 'beginner';
  tests: TestResultItem[];
  feedback?: any;
}

export class ChallengeService {
  async submitChallenge(userId: string, challengeId: string, code: string): Promise<SubmissionResponse> {
    const challenge = db.getChallengeById(challengeId);
    if (!challenge) {
      throw new Error(`Challenge ${challengeId} not found`);
    }

    const testResults: TestResultItem[] = [];
    let passedCount = 0;
    const totalCount = challenge.testCases.length;
    let totalExecTime = 0;

    for (const testCase of challenge.testCases) {
      const execResult = await codeExecutionService.executePython({
        code,
        testInput: testCase.input
      });

      totalExecTime += execResult.executionTimeMs;

      // Normalize outputs for comparison
      const actual = execResult.output.trim();
      const expected = testCase.expectedOutput.trim();
      const passed = execResult.success && actual === expected;

      if (passed) {
        passedCount++;
      }

      testResults.push({
        id: testCase.id,
        order: testCase.order,
        description: testCase.description,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: actual,
        passed,
        isHidden: testCase.isHidden,
        error: execResult.error || undefined
      });
    }

    const score = Math.round((passedCount / totalCount) * 100);
    let status: 'developing' | 'proficient' | 'mastered' | 'beginner' = 'beginner';
    if (score === 100) status = 'mastered';
    else if (score >= 60) status = 'proficient';
    else if (score >= 40) status = 'developing';

    // Generate AI feedback for the attempt
    const moduleItem = db.getModule(challenge.moduleId);
    const failedTests = testResults
      .filter(t => !t.passed)
      .map(t => ({ input: t.input, expectedOutput: t.expectedOutput, actualOutput: t.actualOutput, error: t.error }));

    const feedback = await feedbackService.generateFeedback({
      challengeTitle: challenge.title,
      challengeDescription: challenge.description,
      concepts: moduleItem?.concepts || ["Loops and iteration"],
      submittedCode: code,
      passedCount,
      totalCount,
      failedTests
    });

    // Record attempt in database
    const attempt: DbChallengeAttempt = {
      id: `att_${Date.now()}`,
      userId,
      challengeId,
      code,
      language: challenge.language,
      passedCount,
      totalCount,
      score,
      status: passedCount === totalCount ? 'PASSED' : passedCount > 0 ? 'PARTIAL' : 'FAILED',
      executionTimeMs: totalExecTime,
      feedbackSummary: feedback.summary,
      feedbackDetails: feedback,
      createdAt: new Date()
    };
    db.recordAttempt(attempt);

    // Update user learning progress in database
    const currentProgress = db.getProgress(userId, challenge.moduleId);
    const newAttemptCount = (currentProgress.attemptCount || 0) + 1;
    db.updateProgress(userId, challenge.moduleId, {
      practiceScore: score,
      testsPassed: passedCount,
      totalTests: totalCount,
      attemptCount: newAttemptCount,
      savedDraftCode: code
    });

    // Update AI Insight in database
    const newInsightText = score === 100
      ? `Outstanding! You achieved 100% test pass rate on ${challenge.title}.`
      : `Your concept understanding is solid (${currentProgress.conceptScore}%), with ${passedCount}/${totalCount} tests passing.`;
    
    const newRecommendedAction = score === 100
      ? 'Advance to the next milestone on your roadmap timeline.'
      : feedback.nextAction || 'Review the modulo conditional check and retry the challenge.';

    db.saveInsight({
      id: `ins_${Date.now()}`,
      userId,
      moduleId: challenge.moduleId,
      insightText: newInsightText,
      recommendedAction: newRecommendedAction,
      createdAt: new Date()
    });

    return {
      success: true,
      passed: passedCount,
      total: totalCount,
      score,
      status,
      tests: testResults,
      feedback
    };
  }
}

export const challengeService = new ChallengeService();
