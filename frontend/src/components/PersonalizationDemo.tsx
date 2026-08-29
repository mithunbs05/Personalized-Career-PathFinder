import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BrainCircuit, Activity, Lock, Unlock, Zap, CheckCircle2 } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <section id="personalization" className="relative py-24 bg-transparent z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <BrainCircuit className="w-4 h-4 text-[#FF4D31]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#7A8B7C]">
              CLOSED-LOOP PERSONALIZATION
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold leading-tight text-[#1A1A1A] dark:text-white"
          >
            Real-Time Path Re-Routing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-6"
          >
            Watch how PathAI dynamically injects micro-labs when gaps are detected, and bypasses redundant content when you prove mastery.
          </motion.p>
        </div>

        {/* Demo Widget */}
        <div className="max-w-4xl mx-auto">
          <TiltCard className="p-8 md:p-12 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl relative">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4D31] to-transparent opacity-50" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Left Column: Stage 1 Toggle & Alert */}
              <div className="flex flex-col gap-10 border-r-0 md:border-r border-[#E8E6DE] dark:border-[#2C2C29] md:pr-12">
                
                {/* Stage 1: Assessment */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E8E6DE] dark:bg-[#2C2C29] flex items-center justify-center text-[#1A1A1A] dark:text-white">1</span> 
                    Baseline Assessment
                  </h3>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleScoreSelect(62)}
                      className={cn(
                        "flex-1 py-4 px-2 rounded-xl text-center border-2 transition-all",
                        assessmentScore === 62
                          ? "border-[#FF4D31] bg-[#FF4D31]/5 shadow-sm"
                          : "border-[#E8E6DE] dark:border-[#2C2C29] hover:bg-white dark:hover:bg-[#252522]"
                      )}
                    >
                      <span className="block text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">62%</span>
                      <span className="text-xs font-bold text-[#7A8B7C]">Gap Detected</span>
                    </button>
                    <button
                      onClick={() => handleScoreSelect(94)}
                      className={cn(
                        "flex-1 py-4 px-2 rounded-xl text-center border-2 transition-all",
                        assessmentScore === 94
                          ? "border-[#9BB09E] bg-[#9BB09E]/10 shadow-sm"
                          : "border-[#E8E6DE] dark:border-[#2C2C29] hover:bg-white dark:hover:bg-[#252522]"
                      )}
                    >
                      <span className="block text-2xl font-bold text-[#1A1A1A] dark:text-white mb-1">94%</span>
                      <span className="text-xs font-bold text-[#7A8B7C]">Mastery Proven</span>
                    </button>
                  </div>
                </div>

                {/* Stage 2: AI Diagnostic Alert */}
                <div className="flex-1 relative">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E8E6DE] dark:bg-[#2C2C29] flex items-center justify-center text-[#1A1A1A] dark:text-white">2</span> 
                    AI Telemetry
                  </h3>
                  
                  <AnimatePresence mode="wait">
                    {!assessmentScore && (
                      <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex items-center justify-center text-sm font-semibold text-[#A0A09B] border-2 border-dashed border-[#E8E6DE] dark:border-[#2C2C29] rounded-xl py-8"
                      >
                        Awaiting assessment result...
                      </motion.div>
                    )}
                    
                    {assessmentScore === 62 && (
                      <motion.div
                        key="gap"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <Activity className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-red-900 dark:text-red-400 mb-1">Async I/O Bottleneck Detected</h4>
                            <p className="text-xs text-red-700 dark:text-red-300/80 leading-relaxed">
                              Struggled with asynchronous concurrency concepts. Injecting remedial micro-lab before proceeding to full production backend module.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {assessmentScore === 94 && (
                      <motion.div
                        key="mastery"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-green-50 dark:bg-[#9BB09E]/10 border border-green-200 dark:border-[#9BB09E]/30 rounded-xl p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-[#9BB09E] mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-green-900 dark:text-[#9BB09E] mb-1">Concurrency Mastery Verified</h4>
                            <p className="text-xs text-green-700 dark:text-green-300/80 leading-relaxed">
                              Bypassing foundational async modules. You're ready to jump straight into production system architecture.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Stage 3 Lab & Stage 4 Outcome */}
              <div className="flex flex-col gap-10">
                
                {/* Stage 3: Injected Lab */}
                <div className="relative">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E8E6DE] dark:bg-[#2C2C29] flex items-center justify-center text-[#1A1A1A] dark:text-white">3</span> 
                    Surgical Micro-Lab
                  </h3>

                  <AnimatePresence mode="wait">
                    {!isGapDetected ? (
                      <motion.div
                        key="hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-28 border-2 border-dashed border-[#E8E6DE] dark:border-[#2C2C29] rounded-xl flex items-center justify-center text-sm font-semibold text-[#A0A09B]"
                      >
                        {assessmentScore === 94 ? "Lab bypassed (Mastery Proven)" : "Waiting for telemetry..."}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="lab"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] rounded-xl p-5 shadow-sm overflow-hidden relative"
                      >
                        {labCompleted && (
                          <div className="absolute inset-0 bg-white/60 dark:bg-[#1A1A18]/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <motion.div 
                              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                              className="w-12 h-12 rounded-full bg-[#9BB09E] text-white flex items-center justify-center shadow-lg"
                            >
                              <CheckCircle2 className="w-6 h-6" />
                            </motion.div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-[#FF4D31]" />
                          <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">FastAPI Fundamentals & SSE</h4>
                        </div>
                        <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] mb-5">
                          Build a simple Server-Sent Events endpoint to stream data asynchronously.
                        </p>
                        
                        <button
                          onClick={() => setLabCompleted(true)}
                          disabled={labCompleted}
                          className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] hover:bg-[#FF4D31] dark:hover:bg-[#FF4D31] dark:hover:text-white transition-colors"
                        >
                          Mark Lab Completed
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Stage 4: Unlocked Outcome */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-6 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#E8E6DE] dark:bg-[#2C2C29] flex items-center justify-center text-[#1A1A1A] dark:text-white">4</span> 
                    Next Milestone
                  </h3>

                  <div className={cn(
                    "p-6 rounded-xl border transition-all duration-500",
                    isOutcomeUnlocked 
                      ? "bg-gradient-to-br from-white to-[#F1EFE7] dark:from-[#252522] dark:to-[#1A1A18] border-[#FF4D31]/30 shadow-lg"
                      : "bg-[#F9F8F3] dark:bg-[#1A1A18] border-[#E8E6DE] dark:border-[#2C2C29] opacity-60 grayscale"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isOutcomeUnlocked ? "bg-[#FF4D31] text-white shadow-md shadow-[#FF4D31]/30" : "bg-[#E8E6DE] dark:bg-[#2C2C29] text-[#7A8B7C]"
                      )}>
                        {isOutcomeUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      
                      {isOutcomeUnlocked && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31] animate-pulse">
                          ✦ Unlocked
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2">Production Backend AI Systems</h4>
                    <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B]">
                      Design highly concurrent, scalable backend architecture for deploying your AI agents.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};
