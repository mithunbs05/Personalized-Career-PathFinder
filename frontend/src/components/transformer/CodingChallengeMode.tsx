import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { TransformerModule, LearnerProgress } from './transformerData';
import { AIFeedbackModal, AIFeedbackData } from './AIFeedbackModal';
import { useChallenge } from '../../hooks/useChallenge';
import { useCodeExecution } from '../../hooks/useCodeExecution';
import { useChallengeSubmission } from '../../hooks/useChallengeSubmission';

interface CodingChallengeModeProps {
  module: TransformerModule;
  progress: LearnerProgress;
  onProgressUpdate: (update: Partial<LearnerProgress>) => void;
  onSwitchToVideo: () => void;
}

export const CodingChallengeMode: React.FC<CodingChallengeModeProps> = ({
  module,
  progress,
  onProgressUpdate,
  onSwitchToVideo,
}) => {
  // Real backend challenge hook with debounced autosave
  const { challenge, code, setCode, isLoading: isChallengeLoading } = useChallenge(
    module.id,
    progress.writtenCode
  );

  // Real backend code execution hook for sandbox runs
  const { isRunning: isCodeRunning, runCode } = useCodeExecution();

  // Real backend submission hook for server-side test execution
  const { isSubmitting, submit } = useChallengeSubmission((result) => {
    onProgressUpdate({
      writtenCode: code,
      testsPassed: result.passed,
      totalTests: result.total,
      practiceScore: result.score,
      attempts: (progress.attempts || 0) + 1
    });
  });

  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    'Python 3.13 Sandbox Runtime Initialized.'
  ]);
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; output?: string; error?: string }>>({});
  const [unlockedHints, setUnlockedHints] = useState<number>(progress.hintsUsed || 1);
  const [showAiHelp, setShowAiHelp] = useState(false);
  const [aiHelpText, setAiHelpText] = useState('Hint: Check whether the current number is even before adding it to the total (`num % 2 == 0`).');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<AIFeedbackData | null>(null);

  useEffect(() => {
    if (challenge?.hints && challenge.hints.length > 0) {
      setAiHelpText(challenge.hints[0]);
    }
  }, [challenge]);

  // Handle single test / sandbox run
  const handleRunSandbox = async () => {
    setConsoleOutput(['Running Python code in sandbox...']);
    const targetInput = challenge?.testCases?.[activeTestCaseIdx]?.input;
    const res = await runCode(code, 'python', targetInput);

    const logs: string[] = [
      `Execution time: ${res.executionTime}ms`,
      res.output ? `Output: ${res.output}` : '',
      res.error ? `Error: ${res.error}` : '',
      res.status === 'timeout' ? '✕ Execution timed out (5s limit)' : res.success ? '✓ Code executed successfully' : '✕ Execution error'
    ].filter(Boolean);

    setConsoleOutput(logs);
  };

  // Handle server-side test suite submission
  const handleSubmitCode = async () => {
    if (!challenge) return;
    setConsoleOutput(['Executing test suite on server...']);

    const res = await submit(challenge.id, code);
    if (!res) return;

    const newTestResults: Record<string, { passed: boolean; output?: string; error?: string }> = {};
    res.tests.forEach((t) => {
      newTestResults[t.id] = {
        passed: !!t.passed,
        output: t.actualOutput,
        error: t.error
      };
    });
    setTestResults(newTestResults);

    const logs = [
      `Completed test validation in backend: ${res.passed}/${res.total} Passed (${res.score}%)`,
      res.passed === res.total
        ? '✓ All test cases passed!'
        : `✕ ${res.total - res.passed} test case(s) failed. AI Feedback generated.`
    ];
    setConsoleOutput(logs);

    if (res.feedback) {
      const fb: AIFeedbackData = {
        summary: res.feedback.summary,
        whatWentWrong: res.feedback.problem,
        whyItWentWrong: `In Python: ${res.feedback.concept}`,
        conceptReminder: res.feedback.concept,
        socraticHint: res.feedback.hint,
        suggestedNextStep: res.feedback.nextAction,
        revealedSolution: challenge.solutionCode
      };
      setFeedbackData(fb);
      setFeedbackModalOpen(true);
    }
  };

  const handleAskAnotherHint = () => {
    const hints = challenge?.hints || [];
    if (unlockedHints < hints.length) {
      const next = unlockedHints + 1;
      setUnlockedHints(next);
      setAiHelpText(hints[next - 1]);
      onProgressUpdate({ hintsUsed: next });
    } else {
      setAiHelpText('In Python, `total += num` should only execute when `num % 2 == 0`.');
    }
  };

  if (isChallengeLoading || !challenge) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF5A3D] border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Loading challenge from backend...
        </p>
      </div>
    );
  }

  const activeTestCase = challenge.testCases[activeTestCaseIdx] || challenge.testCases[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* Left Column (~45%): Problem Statement, Example & AI Help */}
      <div className="lg:col-span-5 space-y-3.5">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
          
          {/* Header Tag */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Interactive Coding Challenge
            </span>
            <span className="text-[10px] text-[#8B7CFF] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Generated & Validated</span>
            </span>
          </div>

          {/* Problem Statement */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {challenge.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {challenge.description}
            </p>
          </div>

          {/* Clean Example Box */}
          {challenge.examples && challenge.examples.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-500">
                <strong className="text-slate-800 dark:text-slate-200 font-sans font-semibold">Input:</strong> {challenge.examples[0].input}
              </div>
              <div className="text-slate-500">
                <strong className="text-slate-800 dark:text-slate-200 font-sans font-semibold">Output:</strong> {challenge.examples[0].output}
              </div>
              {challenge.examples[0].explanation && (
                <div className="text-[11px] text-slate-400 font-sans mt-1">
                  {challenge.examples[0].explanation}
                </div>
              )}
            </div>
          )}

          {/* Contextual AI Help Dropdown / Trigger */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAiHelp(!showAiHelp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-[#8B7CFF] border border-purple-200/60 dark:border-purple-900/40 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✦ Ask AI</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAiHelp ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={onSwitchToVideo}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Review Video Lesson →
              </button>
            </div>

            {/* Subtle Inline AI Help Box */}
            {showAiHelp && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl space-y-2 text-xs animate-in fade-in duration-150">
                <div className="text-slate-700 dark:text-slate-200 font-normal leading-relaxed">
                  {aiHelpText}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleAskAnotherHint}
                    className="text-[10px] font-semibold text-[#FF5A3D] hover:underline cursor-pointer"
                  >
                    Another Hint ({unlockedHints}/{challenge.hints?.length || 3})
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => setAiHelpText('Concept: Python for-loops step through iterables item by item. Use `% 2 == 0` to check even parity.')}
                    className="text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Explain Concept
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Test Cases Results */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Test Cases</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {progress.testsPassed}/{challenge.testCases.length} Passed
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {challenge.testCases.map((tc, idx) => {
                const res = testResults[tc.id];
                const isPassed = res?.passed;
                const isTested = res !== undefined;
                const isSelected = idx === activeTestCaseIdx;

                return (
                  <button
                    key={tc.id}
                    onClick={() => setActiveTestCaseIdx(idx)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isTested ? (
                      isPassed ? (
                        <span className="text-[#16B981] font-bold">✓</span>
                      ) : (
                        <span className="text-rose-500 font-bold">✕</span>
                      )
                    ) : (
                      <span className="text-slate-400">●</span>
                    )}
                    <span>Case {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Test Case Minimal Detail */}
            {activeTestCase && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl font-mono text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                <div>Input: <code className="text-slate-900 dark:text-slate-100">{activeTestCase.input}</code></div>
                <div>Expected: <code className="text-emerald-600 dark:text-emerald-400 font-bold">{activeTestCase.expectedOutput}</code></div>
                {testResults[activeTestCase.id]?.output && (
                  <div>Actual: <code className="text-slate-700 dark:text-slate-200">{testResults[activeTestCase.id].output}</code></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (~55%): Minimal Dark Code Editor & Console */}
      <div className="lg:col-span-7 space-y-3.5">
        
        {/* Editor Box */}
        <div className="bg-[#0B0D0F] rounded-2xl overflow-hidden border border-slate-800 shadow-sm flex flex-col">
          
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-[#0F1318] border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 text-[11px]">solution.py</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">Python 3.13 (Autosave active)</span>
              <button
                onClick={() => setCode(challenge.starterCode)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Line Numbers + Editor Textarea */}
          <div className="flex font-mono text-xs sm:text-sm min-h-[280px] max-h-[340px] overflow-y-auto bg-[#0B0D0F]">
            <div className="select-none py-3.5 px-3 text-right bg-slate-950/60 text-slate-600 border-r border-slate-800/60 min-w-[36px] leading-6 text-xs">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-3.5 bg-transparent text-emerald-300 font-mono leading-6 resize-none outline-none overflow-x-auto whitespace-pre"
              spellCheck={false}
            />
          </div>

          {/* Minimal Action Bar */}
          <div className="p-3 bg-[#0F1318] border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunSandbox}
                disabled={isCodeRunning || isSubmitting}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCodeRunning ? 'Running...' : 'Run'}
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isCodeRunning || isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-[#FF5A3D] hover:opacity-90 text-white text-xs font-semibold transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Checking Tests...' : 'Submit'}
              </button>
            </div>

            {feedbackData && (
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                View Diagnostic →
              </button>
            )}
          </div>
        </div>

        {/* Compact Terminal Console */}
        <div className="bg-[#0B0D0F] rounded-xl border border-slate-800/80 p-3 space-y-1 text-[11px] font-mono">
          <div className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider pb-1 border-b border-slate-800/60">
            Console
          </div>
          <div className="space-y-0.5 max-h-20 overflow-y-auto text-slate-300">
            {consoleOutput.map((line, idx) => (
              <div key={idx} className={line.includes('✓') ? 'text-[#16B981]' : line.includes('✕') ? 'text-rose-400' : 'text-slate-400'}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Socratic AI Diagnostic Feedback Modal */}
      <AIFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        feedback={feedbackData}
        testsPassed={progress.testsPassed}
        totalTests={challenge.testCases.length}
        onSwitchToVideo={onSwitchToVideo}
        onRetry={() => setFeedbackModalOpen(false)}
      />
    </div>
  );
};
