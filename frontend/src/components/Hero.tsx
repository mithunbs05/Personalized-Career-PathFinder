import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, CheckCircle2, ArrowRight, Brain, Zap, Clock, Code2, Layers, ShieldCheck, Lock, Unlock } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AnimatedCounter: React.FC<{ target: number; suffix: string; label: string; delay: number }> = ({
  target,
  suffix,
  label,
  delay,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1400;
      const startTime = Date.now();
      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <div className="text-center">
      <span className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] dark:text-white">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mt-1">
        {label}
      </span>
    </div>
  );
};

const PRESETS = [
  { id: 'gen-ai', label: '🤖 Generative AI Engineer', baseHours: 120, match: 84 },
  { id: 'full-stack', label: '⚡ Full-Stack AI Architect', baseHours: 160, match: 92 },
  { id: 'agents', label: '🧠 Autonomous Agent Specialist', baseHours: 140, match: 76 }
];

const MILESTONES = [
  { id: 1, title: 'Python for High-Performance Systems', status: 'completed', capstone: 'Async Data Pipeline', skills: ['Asyncio', 'Multiprocessing', 'Type Hints'], lab: 'Build a distributed task queue' },
  { id: 2, title: 'Applied Machine Learning & Evaluation', status: 'completed', capstone: 'Model Evaluation Suite', skills: ['Scikit-Learn', 'Metrics', 'Cross-Validation'], lab: 'Train & evaluate a random forest regressor' },
  { id: 3, title: 'Deep Learning & Neural Architectures', status: 'active', capstone: 'PyTorch Autograd Engine', skills: ['PyTorch', 'Backprop', 'Tensors'], lab: 'Implement a custom autograd function' },
  { id: 4, title: 'LLM Fundamentals & Attention Layers', status: 'upcoming', capstone: 'Micro-GPT from scratch', skills: ['Transformers', 'Attention', 'Tokenization'], lab: 'Build a multi-head attention block' },
];

export const Hero: React.FC = () => {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [intensity, setIntensity] = useState(15);
  const [activeNode, setActiveNode] = useState(MILESTONES[2]);

  const estimatedWeeks = Math.ceil(activePreset.baseHours / intensity);

  return (
    <section id="hero-section" className="relative pt-36 pb-24 md:pt-48 md:pb-36 z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Spatial Pill Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-[#1A1A18]/60 border border-[#E8E6DE] dark:border-[#2C2C29] backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF4D31] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F8F3]">
            Dynamic Spatial Curriculum Engine
          </span>
          <span className="text-xs font-bold text-[#7A8B7C]">✦ AI-Architected</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6 text-[#1A1A1A] dark:text-white">
            Stop Guessing <span className="font-editorial italic text-stone-400 dark:text-stone-400 font-normal block sm:inline">What to Learn Next.</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-lg sm:text-xl text-[#4A4A4A] dark:text-[#A0A09B] max-w-2xl leading-relaxed mb-10">
            PathAI turns your goals, skills and history into an adaptive 3D roadmap. Let AI <span className="text-[#FF4D31] font-semibold border-b-2 border-[#FF4D31]/30">build the path</span> that gets you hired.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <Link
              id="hero-cta-build-path"
              to="/register"
              className="bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-9 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group inline-flex items-center gap-2 text-base"
            >
              <span>Build My Learning Path</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>

            <a
              id="hero-cta-explore"
              href="#how-it-works"
              className="px-8 py-4 rounded-full font-semibold border border-[#E8E6DE] dark:border-[#2C2C29] bg-white/80 dark:bg-[#1A1A18]/80 hover:bg-white dark:hover:bg-[#252522] backdrop-blur-sm text-[#1A1A1A] dark:text-white transition-colors inline-flex items-center gap-2 text-base shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#7A8B7C]" />
              <span>Explore 3D Demo</span>
            </a>
          </div>

          {/* Animated Stats Counter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mb-20 w-full max-w-3xl bg-white/90 dark:bg-[#1A1A18]/90 backdrop-blur-md rounded-[2rem] border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl shadow-black/5 py-6 px-8"
          >
            <AnimatedCounter target={14} suffix="K+" label="Active Learners" delay={200} />
            <div className="w-px h-12 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
            <AnimatedCounter target={96} suffix="%" label="Goal Match Rate" delay={400} />
            <div className="w-px h-12 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
            <AnimatedCounter target={3} suffix="X" label="Faster Mastery" delay={600} />
          </motion.div>
        </motion.div>

        {/* INTERACTIVE CAREER TELEMETRY WORKBENCH */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-6xl mx-auto"
        >
          {/* Preset Toggles */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border backdrop-blur-md shadow-sm",
                  activePreset.id === preset.id
                    ? "bg-[#FF4D31] text-white border-[#FF4D31] shadow-[#FF4D31]/20 scale-105"
                    : "bg-white/60 dark:bg-[#1A1A18]/60 text-[#4A4A4A] dark:text-[#A0A09B] border-[#E8E6DE] dark:border-[#2C2C29] hover:bg-white dark:hover:bg-[#252522]"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <TiltCard className="w-full text-left">
            <div className="flex flex-col lg:flex-row min-h-[450px]">
              
              {/* Left Panel: Telemetry & Controls */}
              <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[#E8E6DE] dark:border-[#2C2C29] p-8 flex flex-col bg-white/40 dark:bg-[#1A1A18]/40">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-[#FF4D31]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white">Match Score</h3>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-display font-bold text-[#1A1A1A] dark:text-white">{activePreset.match}%</span>
                    <span className="text-xs font-semibold text-[#7A8B7C] pb-1">Hiring Bar</span>
                  </div>
                  <div className="h-2 w-full bg-[#E8E6DE] dark:bg-[#2C2C29] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#FF4D31] to-[#FF7A59]"
                      initial={{ width: 0 }}
                      animate={{ width: `${activePreset.match}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="mb-8 flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-4">Prerequisites</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#4A4A4A] dark:text-[#A0A09B] flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#9BB09E]" /> Linear Algebra</span>
                      <span className="text-[#9BB09E] font-semibold">Verified</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#4A4A4A] dark:text-[#A0A09B] flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#9BB09E]" /> Python OOP</span>
                      <span className="text-[#9BB09E] font-semibold">Verified</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#4A4A4A] dark:text-[#A0A09B] flex items-center gap-2"><Lock className="w-4 h-4 text-[#FF4D31]" /> PyTorch Basics</span>
                      <span className="text-[#FF4D31] font-semibold">Gap Detected</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Weekly Intensity
                    </h3>
                    <span className="text-sm font-bold text-[#FF4D31]">{intensity} hrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="25" 
                    step="1"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#E8E6DE] dark:bg-[#2C2C29] rounded-lg appearance-none cursor-pointer accent-[#FF4D31]"
                  />
                  <p className="text-xs text-[#7A8B7C] font-semibold mt-3 text-right">
                    Estimated time to mastery: <span className="text-[#1A1A1A] dark:text-white font-bold">{estimatedWeeks} weeks</span>
                  </p>
                </div>
              </div>

              {/* Right Panel: Pipeline & Inspector */}
              <div className="w-full lg:w-2/3 p-8 flex flex-col md:flex-row gap-8 bg-[#F9F8F3]/50 dark:bg-[#121211]/50 relative overflow-hidden">
                {/* Pipeline */}
                <div className="w-full md:w-1/2 flex flex-col relative z-10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-6">Generated Pipeline</h3>
                  <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-[#E8E6DE] dark:before:bg-[#2C2C29]">
                    {MILESTONES.map((milestone) => (
                      <button
                        key={milestone.id}
                        onClick={() => setActiveNode(milestone)}
                        className={cn(
                          "relative flex items-center gap-4 w-full text-left p-3 rounded-xl transition-all",
                          activeNode.id === milestone.id ? "bg-white dark:bg-[#1A1A18] shadow-md border border-[#E8E6DE] dark:border-[#2C2C29]" : "hover:bg-white/50 dark:hover:bg-[#1A1A18]/50"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10",
                          milestone.status === 'completed' ? "bg-[#9BB09E] text-white" :
                          milestone.status === 'active' ? "bg-[#FF4D31] text-white shadow-[0_0_15px_rgba(255,77,49,0.4)] ring-4 ring-[#FF4D31]/10" :
                          "bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C] border border-[#E8E6DE] dark:border-[#2C2C29]"
                        )}>
                          {milestone.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : 
                           milestone.status === 'active' ? <Zap className="w-4 h-4" /> : 
                           <Lock className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm font-semibold",
                            activeNode.id === milestone.id ? "text-[#1A1A1A] dark:text-white" : "text-[#4A4A4A] dark:text-[#A0A09B]"
                          )}>{milestone.title}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] mt-0.5">{milestone.status}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspector Drawer */}
                <div className="w-full md:w-1/2 bg-white dark:bg-[#1A1A18] rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] p-6 shadow-lg z-10 flex flex-col h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeNode.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="mb-6 pb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-2">Selected Milestone</h4>
                        <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white leading-tight">{activeNode.title}</h2>
                      </div>

                      <div className="space-y-6 flex-1">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#FF4D31]" /> Capstone Deliverable
                          </h4>
                          <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] bg-[#F9F8F3] dark:bg-[#252522] p-3 rounded-lg border border-[#E8E6DE] dark:border-[#2C2C29]">
                            {activeNode.capstone}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3 flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-[#FF4D31]" /> Lab Exercise
                          </h4>
                          <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B]">
                            {activeNode.lab}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3">Skills Acquired</h4>
                          <div className="flex flex-wrap gap-2">
                            {activeNode.skills.map((skill, idx) => (
                              <span key={idx} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E8E6DE]/50 dark:bg-[#2C2C29]/50 text-[#4A4A4A] dark:text-[#A0A09B]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {activeNode.status === 'active' && (
                        <button className="mt-6 w-full py-3 bg-[#FF4D31] hover:bg-[#E8402A] text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-[#FF4D31]/20">
                          Start Milestone
                        </button>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
};
