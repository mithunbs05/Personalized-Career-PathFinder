import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

export const PersonalizationDemo: React.FC = () => {
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [labCompleted, setLabCompleted] = useState(false);

  // States:
  // 1. Initial (null score)
  // 2. High Score (94%) -> Skips lab, unlocks outcome
  // 3. Low Score (62%) -> Detects gap, shows lab
  // 4. Low Score + Lab Completed -> Unlocks outcome

  const isGapDetected = assessmentScore === 62;
  const isOutcomeUnlocked = assessmentScore === 94 || labCompleted;

  const handleScoreSelect = (score: number) => {
    setAssessmentScore(score);
    setLabCompleted(false); // Reset lab on new score
  };

  return (
    <section id="learning-paths" className="py-24 md:py-32 bg-transparent border-y border-[#E8E6DE]/60 dark:border-[#2C2C29]/60 transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9F8F3] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4 shadow-2xs">
            CLOSED-LOOP ADAPTATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            See how PathAI adapts in real-time.
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4">
            Interactive demonstration: toggle assessment scores or complete micro-labs to watch the roadmap dynamically re-route.
          </p>
        </div>

        {/* Dynamic Workflow Simulation Bar */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative">
            {/* Step 1: Assessment Result */}
            <TiltCard maxTilt={8} scale={1.02}>
              <div className="p-6 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-center flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#7A8B7C] uppercase block mb-1">
                    1. Assessment Result
                  </span>
                  <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-3">
                    Python APIs & Concurrency
                  </h4>
                  <div className="text-4xl font-display font-black text-[#FF4D31] mb-2">
                    {assessmentScore}%
                  </div>
                  <div className="w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-[#FF4D31] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${assessmentScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setAssessmentScore(62);
                      setCompletedFastAPI(false);
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      assessmentScore === 62
                        ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                        : 'bg-[#E8E6DE] dark:bg-[#1A1A18] text-[#4A4A4A] dark:text-[#A0A09B]'
                    }`}
                  >
                    Simulate 62%
                  </button>
                  <button
                    onClick={() => {
                      setAssessmentScore(94);
                      setCompletedFastAPI(true);
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      assessmentScore === 94
                        ? 'bg-[#7A8B7C] text-white'
                        : 'bg-[#E8E6DE] dark:bg-[#1A1A18] text-[#4A4A4A] dark:text-[#A0A09B]'
                    }`}
                  >
                    Simulate 94%
                  </button>
                </div>
              </div>
            </TiltCard>

            {/* Step 2: AI Diagnostic Detection */}
            <TiltCard maxTilt={8} scale={1.02}>
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-amber-700 dark:text-amber-300 uppercase block mb-1">
                    2. Gap Detection
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-1">
                    Async I/O Bottleneck
                  </h4>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                    {assessmentScore < 80
                      ? 'AI detected missing knowledge in FastAPI request pipelines & streaming response handling.'
                      : 'Prerequisite fully verified! No remedial modules needed.'}
                  </p>
                </div>

                <div className="mt-3 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  {assessmentScore < 80 ? 'Adaptive Path Triggered' : 'Direct Advancement'}
                </div>
              </div>
            </TiltCard>

            {/* Step 3: Surgical Recommendation */}
            <TiltCard maxTilt={8} scale={1.02}>
              <div
                className={`p-6 rounded-2xl border text-center flex flex-col justify-between h-full transition-colors ${
                  completedFastAPI
                    ? 'bg-[#7A8B7C]/15 border-[#7A8B7C]/40'
                    : 'bg-[#FF4D31]/10 border-[#FF4D31]/30'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#7A8B7C] uppercase block mb-1">
                    3. Injected Micro-Lab
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                      completedFastAPI
                        ? 'bg-[#7A8B7C]/30 text-[#7A8B7C]'
                        : 'bg-[#FF4D31]/20 text-[#FF4D31]'
                    }`}
                  >
                    {completedFastAPI ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  </div>
                  <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-1">
                    FastAPI Fundamentals & SSE
                  </h4>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                    Targeted 45-minute lab to master streaming tokens and lifespan handlers.
                  </p>
                </div>

                <button
                  onClick={() => setCompletedFastAPI(!completedFastAPI)}
                  className={`mt-3 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    completedFastAPI
                      ? 'bg-[#7A8B7C] text-white shadow-sm'
                      : 'bg-[#FF4D31] text-white hover:bg-[#E8402A] shadow-md shadow-[#FF4D31]/20'
                  }`}
                >
                  {completedFastAPI ? '✓ Completed (Re-lock)' : 'Mark Lab Completed'}
                </button>
              </div>
            </TiltCard>

            {/* Step 4: Unlocked Advanced Module */}
            <TiltCard maxTilt={8} scale={1.02}>
              <div
                className={`p-6 rounded-2xl border text-center flex flex-col justify-between h-full transition-all ${
                  completedFastAPI || assessmentScore >= 80
                    ? 'bg-[#7A8B7C]/10 border-[#7A8B7C]/40 ring-2 ring-[#7A8B7C]/20'
                    : 'bg-[#F9F8F3] dark:bg-[#252522] border-[#E8E6DE] dark:border-[#2C2C29] opacity-60'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#7A8B7C] uppercase block mb-1">
                    4. Unlocked Outcome
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                      completedFastAPI || assessmentScore >= 80
                        ? 'bg-[#7A8B7C] text-white shadow-sm'
                        : 'bg-[#E8E6DE] dark:bg-[#1A1A18] text-[#7A8B7C]'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-1">
                    Production Backend AI Systems
                  </h4>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                    Deploying multi-tenant LLM agents with load-balanced token pooling.
                  </p>
                </div>

                <div
                  className={`mt-3 text-[11px] font-bold uppercase tracking-wider ${
                    completedFastAPI || assessmentScore >= 80
                      ? 'text-[#7A8B7C]'
                      : 'text-[#4A4A4A] dark:text-[#A0A09B]'
                  }`}
                >
                  {completedFastAPI || assessmentScore >= 80 ? '✦ UNLOCKED & READY' : '🔒 Locked (Prerequisite)'}
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
};
