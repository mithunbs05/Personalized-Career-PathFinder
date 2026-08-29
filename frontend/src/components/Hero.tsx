import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Brain,
  Zap,
  Layers,
  Star,
  Target,
  Clock,
  Code,
  Sliders,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

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

interface TrackPreset {
  id: string;
  name: string;
  matchScore: number;
  weeksToHired: number;
  activeDeliverable: string;
  milestones: {
    id: string;
    title: string;
    stage: string;
    status: 'completed' | 'active' | 'upcoming';
    deliverable: string;
    skills: string[];
  }[];
}

const TRACK_PRESETS: TrackPreset[] = [
  {
    id: 'gen-ai',
    name: '🤖 Generative AI Engineer',
    matchScore: 96,
    weeksToHired: 12,
    activeDeliverable: 'Multi-Agent Autonomous Code Reviewer with LangGraph',
    milestones: [
      {
        id: 'm1',
        title: 'Neural Nets & PyTorch',
        stage: 'Stage 01',
        status: 'completed',
        deliverable: 'Custom Transformer Attention Layer',
        skills: ['PyTorch', 'TensorBoard', 'Backprop'],
      },
      {
        id: 'm2',
        title: 'Production RAG & Vectors',
        stage: 'Stage 02',
        status: 'completed',
        deliverable: 'Hybrid Vector Search with Pinecone',
        skills: ['Pinecone', 'Embeddings', 'Chunking'],
      },
      {
        id: 'm3',
        title: 'Multi-Agent Systems',
        stage: 'Stage 03',
        status: 'active',
        deliverable: 'Autonomous LangGraph Swarm',
        skills: ['LangGraph', 'Tool Use', 'Structured Output'],
      },
      {
        id: 'm4',
        title: 'LLM Ops & Deployment',
        stage: 'Stage 04',
        status: 'upcoming',
        deliverable: 'vLLM Low-Latency Serving Pipeline',
        skills: ['vLLM', 'Docker', 'Quantization'],
      },
    ],
  },
  {
    id: 'fullstack-ai',
    name: '⚡ Full-Stack AI Architect',
    matchScore: 92,
    weeksToHired: 14,
    activeDeliverable: 'Real-Time Voice AI Workspace with Next.js & WebSockets',
    milestones: [
      {
        id: 'f1',
        title: 'Modern TypeScript & APIs',
        stage: 'Stage 01',
        status: 'completed',
        deliverable: 'High-Throughput Streaming Backend',
        skills: ['TypeScript', 'FastAPI', 'Redis'],
      },
      {
        id: 'f2',
        title: 'LLM Streaming Interfaces',
        stage: 'Stage 02',
        status: 'completed',
        deliverable: 'Server-Sent Events UI Dashboard',
        skills: ['Vercel AI SDK', 'SSE', 'React 19'],
      },
      {
        id: 'f3',
        title: 'Voice & Multimodal AI',
        stage: 'Stage 03',
        status: 'active',
        deliverable: 'Live WebRTC Audio Assistant',
        skills: ['WebRTC', 'Whisper', 'WebSockets'],
      },
      {
        id: 'f4',
        title: 'Distributed Inference',
        stage: 'Stage 04',
        status: 'upcoming',
        deliverable: 'Multi-Region Edge Model Gateway',
        skills: ['Cloudflare Workers', 'Edge Caching'],
      },
    ],
  },
  {
    id: 'agent-dev',
    name: '🧠 Autonomous Agent Specialist',
    matchScore: 94,
    weeksToHired: 10,
    activeDeliverable: 'Self-Healing CI/CD Autonomous Debugger Agent',
    milestones: [
      {
        id: 'a1',
        title: 'State Machines & Graphs',
        stage: 'Stage 01',
        status: 'completed',
        deliverable: 'Cyclic Graph Decision Engine',
        skills: ['State Machines', 'DAGs', 'Graph Theory'],
      },
      {
        id: 'a2',
        title: 'Memory & Long-Horizon Plans',
        stage: 'Stage 02',
        status: 'completed',
        deliverable: 'Episodic Context Memory Store',
        skills: ['Zep Memory', 'Vector Retrieval'],
      },
      {
        id: 'a3',
        title: 'Tool Execution Sandboxes',
        stage: 'Stage 03',
        status: 'active',
        deliverable: 'Isolated Docker Code Execution Engine',
        skills: ['Docker API', 'E2B Sandboxes', 'Safety Guardrails'],
      },
      {
        id: 'a4',
        title: 'Multi-Agent Consensus',
        stage: 'Stage 04',
        status: 'upcoming',
        deliverable: 'Debate & Consensus Swarm System',
        skills: ['Consensus Protocols', 'Agent Evaluation'],
      },
    ],
  },
];

export const Hero: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<TrackPreset>(TRACK_PRESETS[0]);
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>('m3');

  // Recalculate target duration based on intensity
  const calculatedWeeks = Math.max(
    6,
    Math.round((selectedTrack.weeksToHired * 10) / weeklyHours)
  );

  const activeMilestone =
    selectedTrack.milestones.find((m) => m.id === activeMilestoneId) ||
    selectedTrack.milestones[2];

  return (
    <section
      id="hero-section"
      className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden transition-colors duration-300"
    >
      {/* Subtle radial backdrop accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial from-[#FF4D31]/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Top 3D Spatial Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/80 dark:bg-[#1A1A18]/80 backdrop-blur-md rounded-full border border-[#E8E6DE] dark:border-[#2C2C29] mb-8 shadow-xs hover:border-[#FF4D31]/50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#FF4D31] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F8F3]">
              Dynamic Spatial Curriculum Engine
            </span>
            <span className="text-xs text-[#7A8B7C]">✦ AI-Architected</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-8 text-[#1A1A1A] dark:text-white">
            Stop Guessing{' '}
            <span className="text-[#4A4A4A]/40 dark:text-[#A0A09B]/40 block sm:inline">
              What to Learn Next.
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-[#4A4A4A] dark:text-[#A0A09B] max-w-2xl leading-relaxed mb-10">
            PathAI turns your goals, skills and history into an adaptive 3D roadmap. Let AI{' '}
            <span className="text-[#FF4D31] font-semibold border-b-2 border-[#FF4D31]/30">
              build the path
            </span>{' '}
            that gets you hired.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-12">
            <Link
              id="hero-cta-build-path"
              to="/register"
              className="bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-9 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:opacity-95 transition-all duration-200 cursor-pointer group inline-flex items-center gap-2 text-base"
            >
              <span>Build My Learning Path</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>

            <a
              id="hero-cta-explore"
              href="#how-it-works"
              className="px-8 py-4 rounded-full font-semibold bg-white/60 dark:bg-[#1A1A18]/60 backdrop-blur-md border border-[#1A1A1A]/15 dark:border-white/15 hover:bg-[#F1EFE7] dark:hover:bg-[#1A1A18] text-[#1A1A1A] dark:text-white transition-colors inline-flex items-center gap-2 text-base"
            >
              <Compass className="w-4 h-4 text-[#7A8B7C]" />
              <span>Explore 3D Demo</span>
            </a>
          </div>

          {/* 3D Glass Stats Counter Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-6 sm:gap-14 mb-12 w-full max-w-2xl p-4 rounded-3xl bg-white/70 dark:bg-[#1A1A18]/70 backdrop-blur-md border border-[#E8E6DE] dark:border-[#2C2C29] shadow-sm"
          >
            <AnimatedCounter target={14} suffix="K+" label="Active Learners" delay={200} />
            <div className="w-px h-12 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
            <AnimatedCounter target={96} suffix="%" label="Goal Match Rate" delay={400} />
            <div className="w-px h-12 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
            <AnimatedCounter target={3} suffix="X" label="Faster Mastery" delay={600} />
          </motion.div>
        </motion.div>

          {/* REDESIGNED: Interactive AI Career Telemetry Cockpit */}
          <div className="w-full max-w-4xl">
            <TiltCard maxTilt={6} scale={1.01}>
              <div className="w-full bg-white/95 dark:bg-[#1A1A18]/95 backdrop-blur-xl rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl overflow-hidden text-left">
                {/* Cockpit Top Bar */}
                <div className="px-6 py-4 bg-[#F1EFE7]/80 dark:bg-[#252522]/80 border-b border-[#E8E6DE] dark:border-[#2C2C29] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#FF4D31] text-white flex items-center justify-center shadow-md shadow-[#FF4D31]/20">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white block">
                        Adaptive Career Telemetry Cockpit
                      </span>
                      <span className="text-[10px] text-[#7A8B7C] font-semibold">
                        Real-time prerequisite graph & milestone deliverables
                      </span>
                    </div>
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

                  {/* Live Simulation Indicator */}
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#FF4D31]/10 text-[#FF4D31] border border-[#FF4D31]/20 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D31] animate-ping" />
                    INTERACTIVE SIMULATOR
                  </span>
                </div>

                {/* Track Selector Tabs */}
                <div className="px-6 pt-4 pb-2 border-b border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F9F8F3]/50 dark:bg-[#1C1C1A]/50 flex items-center gap-2 overflow-x-auto">
                  {TRACK_PRESETS.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setSelectedTrack(track);
                        setActiveMilestoneId(track.milestones[2].id);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTrack.id === track.id
                          ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] shadow-sm'
                          : 'bg-white dark:bg-[#252522] text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white border border-[#E8E6DE] dark:border-[#2C2C29]'
                      }`}
                    >
                      <span>{track.name}</span>
                    </button>
                  ))}
                </div>

                {/* Main Cockpit Content Grid */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Readiness Radar & Time to Market (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-5 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-1">
                        Career Readiness Fit
                      </span>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-display font-extrabold text-[#FF4D31]">
                          {selectedTrack.matchScore}%
                        </span>
                        <span className="text-xs font-bold text-[#7A8B7C]">Hiring Bar</span>
                      </div>

                      <div className="w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-2 rounded-full overflow-hidden mb-4">
                        <motion.div
                          key={selectedTrack.id}
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedTrack.matchScore}%` }}
                          transition={{ duration: 0.6 }}
                          className="bg-[#FF4D31] h-full rounded-full"
                        />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[#4A4A4A] dark:text-[#A0A09B]">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Prerequisites
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Cleared</span>
                        </div>
                        <div className="flex items-center justify-between text-[#4A4A4A] dark:text-[#A0A09B]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#7A8B7C]" />
                            Target Duration
                          </span>
                          <span className="font-bold text-[#1A1A1A] dark:text-white">
                            {calculatedWeeks} Weeks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Pace Slider */}
                    <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C]">
                          Weekly Intensity
                        </span>
                        <span className="text-xs font-extrabold text-[#FF4D31]">
                          {weeklyHours} hrs/week
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={weeklyHours}
                        onChange={(e) => setWeeklyHours(Number(e.target.value))}
                        className="w-full accent-[#FF4D31] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-[#7A8B7C] mt-1 font-semibold">
                        <span>Casual (5h)</span>
                        <span>Full-Time (25h)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Connected Milestone Pipeline (8 cols) */}
                  <div className="lg:col-span-8 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] block">
                      Sequence Pipeline (Click any milestone to inspect lab)
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedTrack.milestones.map((m, idx) => {
                        const isSelected = activeMilestone.id === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setActiveMilestoneId(m.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#FF4D31]/10 border-[#FF4D31] shadow-xs'
                                : m.status === 'completed'
                                ? 'bg-white dark:bg-[#252522] border-[#E8E6DE] dark:border-[#2C2C29]'
                                : 'bg-[#F9F8F3] dark:bg-[#1E1E1C] border-[#E8E6DE] dark:border-[#2C2C29] opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] font-mono font-bold text-[#7A8B7C]">
                                {m.stage}
                              </span>
                              {m.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : m.status === 'active' ? (
                                <Zap className="w-3.5 h-3.5 text-[#FF4D31] animate-pulse" />
                              ) : (
                                <span className="text-[9px] font-bold text-[#7A8B7C]">●</span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-[#1A1A1A] dark:text-white leading-snug line-clamp-2">
                              {m.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Milestone Deep-Dive Drawer */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeMilestone.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#FF4D31] uppercase tracking-wider block">
                              Active Capstone Deliverable
                            </span>
                            <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                              {activeMilestone.deliverable}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1EFE7] dark:bg-[#2C2C29] text-[#7A8B7C]">
                            Verified Signal
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-[#7A8B7C]">Evaluated Skills:</span>
                          {activeMilestone.skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-white"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Cockpit Footer */}
                <div className="px-6 py-3.5 border-t border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F1EFE7]/50 dark:bg-[#252522]/50 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-[#7A8B7C] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
                    Skill-Aware · Prerequisite-Ordered · Real-Time Adaptive
                  </span>
                  <Link
                    to="/register"
                    className="text-xs font-bold text-[#FF4D31] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Launch Your Custom Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold tracking-wider text-[#7A8B7C] mt-12"
          >
            <span>✓ CLOSED-LOOP ADAPTIVE</span>
            <span>✓ REAL-TIME TELEMETRY</span>
            <span>✓ 3D SPATIAL PATHING</span>
            <span>✓ CONTEXT-AWARE MENTOR</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
