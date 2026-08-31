import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  X,
  BookOpen,
  Code2
} from 'lucide-react';

export interface AIFeedbackData {
  summary: string;
  whatWentWrong: string;
  whyItWentWrong: string;
  conceptReminder: string;
  socraticHint: string;
  suggestedNextStep: string;
  revealedSolution?: string;
}

interface AIFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: AIFeedbackData | null;
  testsPassed: number;
  totalTests: number;
  onSwitchToVideo: () => void;
  onRetry: () => void;
}

export const AIFeedbackModal: React.FC<AIFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  testsPassed,
  totalTests,
  onSwitchToVideo,
  onRetry,
}) => {
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  if (!isOpen || !feedback) return null;

  const isSuccess = testsPassed === totalTests;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 pb-4 border-b flex items-start justify-between ${
          isSuccess
            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
            : 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isSuccess ? 'bg-emerald-500 text-white' : 'bg-[#ff4726] text-white shadow-md shadow-[#ff4726]/20'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  AI Diagnostic Feedback
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSuccess
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                }`}>
                  {testsPassed}/{totalTests} Tests Passed
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {feedback.summary}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          
          {/* What went wrong & Why */}
          {!isSuccess && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* What went wrong */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <XCircle className="w-4 h-4" />
                  <span>What went wrong</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {feedback.whatWentWrong}
                </p>
              </div>

              {/* Why it went wrong */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Why it happened</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {feedback.whyItWentWrong}
                </p>
              </div>
            </div>
          )}

          {/* Relevant concept reminder */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
              <span>Relevant Concept Reminder</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {feedback.conceptReminder}
            </p>
          </div>

          {/* Socratic Hint */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>Socratic Guidance Hint</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {feedback.socraticHint}
            </p>
          </div>

          {/* Suggested Next Step */}
          <div className="p-4 rounded-2xl bg-[#fff8f5] dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-[#ea580c] uppercase tracking-wider block mb-0.5">
                Suggested Next Step
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {feedback.suggestedNextStep}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="px-3.5 py-2 bg-[#ff4726] hover:bg-[#ea3c1d] text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Apply Fix →
            </button>
          </div>

          {/* Solution Reveal Option */}
          {!isSuccess && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {!solutionRevealed ? (
                !showSolutionConfirm ? (
                  <button
                    onClick={() => setShowSolutionConfirm(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
                  >
                    Stuck? Click here to reveal the reference solution
                  </button>
                ) : (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      Try solving it with hints first for better retention. Still want the full solution?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSolutionConfirm(false)}
                        className="px-2.5 py-1 text-xs text-slate-500 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                      >
                        Keep Trying
                      </button>
                      <button
                        onClick={() => setSolutionRevealed(true)}
                        className="px-2.5 py-1 text-xs bg-slate-900 text-white font-bold rounded-lg"
                      >
                        Reveal
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Reference Solution
                  </span>
                  <pre className="text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre">
                    {feedback.revealedSolution || `def sum_even_numbers(numbers):\n    total = 0\n    for num in numbers:\n        if num % 2 == 0:\n            total += num\n    return total`}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onSwitchToVideo();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#ea580c] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Review Video Lesson
          </button>

          <button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Continue Coding
          </button>
        </div>
      </div>
    </div>
  );
};
