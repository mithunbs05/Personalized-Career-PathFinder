import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Terminal,
  Send,
  Zap,
  Clock,
  ArrowRight,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { TransformerModule, LearnerProgress, ChallengeDifficulty, computeMasteryLevel } from './transformerData';
import { AIFeedbackModal, AIFeedbackData } from './AIFeedbackModal';

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
  const challenge = module.challenge;
  const [code, setCode] = useState(progress.writtenCode || challenge.starterCode);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    'Python 3.11 Runtime Initialized.'
  ]);
  const [testResults, setTestResults] = useState<Record<string, { status: 'pass' | 'fail'; output: string; time: number }>>({
    tc1: { status: 'pass', output: '12', time: 12 },
    tc2: { status: 'pass', output: '30', time: 10 },
    tc3: { status: 'pass', output: '0', time: 9 },
    tc4: { status: 'fail', output: 'TypeError: unsupported operand', time: 14 },
    tc5: { status: 'fail', output: 'Expected 2, got 10', time: 16 },
  });
  const [unlockedHints, setUnlockedHints] = useState<number>(progress.hintsUsed || 1);
  const [showAiHelp, setShowAiHelp] = useState(false);
  const [aiHelpText, setAiHelpText] = useState('Hint: Check whether the current number is even before adding it to the total (`num % 2 == 0`).');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<AIFeedbackData | null>(null);

  // Run code simulation & test validation
  const runCodeSimulation = (isSubmission = false) => {
    setIsExecuting(true);
    setConsoleOutput(['Running test suites...']);

    const codeClean = code.trim();
    const hasModuloEven = codeClean.includes('% 2 == 0') || codeClean.includes('% 2==0');
    const hasComprehension = (codeClean.includes('for ') && codeClean.includes('if ') && codeClean.includes('% 2'));
    const isSolved = hasModuloEven || hasComprehension;

    setTimeout(() => {
      const results: Record<string, { status: 'pass' | 'fail'; output: string; time: number }> = {};
      let passedCount = 0;

      challenge.testCases.forEach((tc) => {
        if (isSolved) {
          results[tc.id] = {
            status: 'pass',
            output: tc.expectedOutput,
            time: Math.floor(Math.random() * 10) + 8
          };
          passedCount++;
        } else {
          if (tc.id === 'tc1' && codeClean.includes('total += num')) {
            results[tc.id] = {
              status: 'fail',
              output: '21 (Summed all numbers instead of evens)',
              time: 12
            };
          } else if (tc.id === 'tc4') {
            results[tc.id] = { status: 'pass', output: '0', time: 9 };
            passedCount++;
          } else {
            results[tc.id] = {
              status: 'fail',
              output: `Actual: None | Expected: ${tc.expectedOutput}`,
              time: 14
            };
          }
        }
      });

      setTestResults(results);
      const total = challenge.testCases.length;
      const practiceScore = Math.round((passedCount / total) * 100);
      const mastery = computeMasteryLevel(progress.conceptScore, practiceScore);

      const logs = [
        `Executed ${total} test cases in 36ms`,
        `Results: ${passedCount}/${total} Passed (${practiceScore}%)`,
        isSolved ? '✓ All test cases passed.' : '✕ 2 test cases failed. View AI feedback.'
      ];
      setConsoleOutput(logs);
      setIsExecuting(false);

      onProgressUpdate({
        writtenCode: code,
        testsPassed: passedCount,
        totalTests: total,
        practiceScore: practiceScore,
        masteryLevel: mastery,
        attempts: progress.attempts + 1
      });

      const feedback: AIFeedbackData = {
        summary: isSolved
          ? 'All test cases passed cleanly.'
          : 'Almost there! Your loop processes the list, but it currently includes odd numbers in the total.',
        whatWentWrong: isSolved
          ? 'None. All edge cases handled.'
          : 'The accumulator adds odd numbers because the parity condition is missing.',
        whyItWentWrong: isSolved
          ? 'Correct application of modulo arithmetic.'
          : 'In Python, `num % 2 == 0` evaluates to True only for even numbers.',
        conceptReminder: 'Conditional filtering inside loops restricts updates to elements meeting specific boolean criteria.',
        socraticHint: 'Before doing `total += num`, what `if` statement checks if `num` is divisible by 2?',
        suggestedNextStep: isSolved
          ? 'Explore list comprehension one-liners: `sum(n for n in numbers if n % 2 == 0)`'
          : 'Wrap your accumulation statement with `if num % 2 == 0:` inside the for-loop.',
        revealedSolution: challenge.solutionCode
      };

      setFeedbackData(feedback);
      if (isSubmission || !isSolved) {
        setFeedbackModalOpen(true);
      }
    }, 900);
  };

  const handleAskAnotherHint = () => {
    if (unlockedHints < challenge.hints.length) {
      const next = unlockedHints + 1;
      setUnlockedHints(next);
      setAiHelpText(challenge.hints[next - 1]);
      onProgressUpdate({ hintsUsed: next });
    } else {
      setAiHelpText('Recall the video: In Python, `total += num` should only execute when `num % 2 == 0`.');
    }
  };

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
              <span>AI Generated</span>
            </span>
          </div>

          {/* Problem Statement */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {challenge.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {challenge.problemStatement}
            </p>
          </div>

          {/* Clean Example Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-500">
              <strong className="text-slate-800 dark:text-slate-200 font-sans font-semibold">Input:</strong> [1, 2, 3, 4, 5, 6]
            </div>
            <div className="text-slate-500">
              <strong className="text-slate-800 dark:text-slate-200 font-sans font-semibold">Output:</strong> 12
            </div>
          </div>

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
                    Another Hint ({unlockedHints}/{challenge.hints.length})
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
              <span className="text-slate-500 font-mono text-[11px]">{progress.testsPassed}/{challenge.testCases.length} Passed</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {challenge.testCases.map((tc, idx) => {
                const res = testResults[tc.id];
                const isPassed = res?.status === 'pass';
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
                    {isPassed ? (
                      <span className="text-[#16B981] font-bold">✓</span>
                    ) : (
                      <span className="text-rose-500 font-bold">✕</span>
                    )}
                    <span>Case {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Test Case Minimal Detail */}
            {challenge.testCases[activeTestCaseIdx] && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl font-mono text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                <div>Input: <code className="text-slate-900 dark:text-slate-100">{challenge.testCases[activeTestCaseIdx].input}</code></div>
                <div>Expected: <code className="text-emerald-600 dark:text-emerald-400 font-bold">{challenge.testCases[activeTestCaseIdx].expectedOutput}</code></div>
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
              <span className="text-[10px] font-mono text-slate-500">Python 3.11</span>
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
              onChange={(e) => {
                setCode(e.target.value);
                onProgressUpdate({ writtenCode: e.target.value });
              }}
              className="flex-1 p-3.5 bg-transparent text-emerald-300 font-mono leading-6 resize-none outline-none overflow-x-auto whitespace-pre"
              spellCheck={false}
            />
          </div>

          {/* Minimal Action Bar */}
          <div className="p-3 bg-[#0F1318] border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => runCodeSimulation(false)}
                disabled={isExecuting}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? 'Running...' : 'Run'}
              </button>

              <button
                onClick={() => runCodeSimulation(true)}
                disabled={isExecuting}
                className="px-4 py-1.5 rounded-lg bg-[#FF5A3D] hover:opacity-90 text-white text-xs font-semibold transition-opacity cursor-pointer disabled:opacity-50"
              >
                Submit
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
