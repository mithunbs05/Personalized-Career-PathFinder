import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GitCommit, ArrowDown, Sparkles, Clock, Award, ChevronRight, Star } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

interface VisualNode {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'current' | 'next' | 'locked' | 'recommended';
  weeks: string;
  summary: string;
  skills: string[];
  deliverable?: string;
  isMilestone?: boolean;
}

const ROADMAP_NODES = [
  {
    id: 1,
    title: 'Python for High-Performance Systems',
    description: 'Master advanced Python constructs required for AI infrastructure.',
    capstone: 'Async Distributed Task Queue',
    skills: ['Asyncio', 'Multiprocessing', 'Type Annotations', 'Memory Profiling'],
    status: 'completed',
    icon: <Code2 className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'Applied Machine Learning & Evaluation',
    description: 'Build intuition for classical ML pipelines and robust evaluation.',
    capstone: 'End-to-End Evaluation Suite',
    skills: ['Scikit-Learn', 'Cross-Validation', 'Metrics', 'Feature Engineering'],
    status: 'completed',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'Deep Learning & Neural Architectures',
    category: 'Stage 2: Modern Neural Networks',
    status: 'current',
    weeks: '2 weeks',
    summary: 'PyTorch autograd graphs, GPU acceleration, backpropagation mechanics, and CNN/RNN topologies.',
    skills: ['PyTorch', 'Backpropagation', 'CUDA', 'TorchVision'],
    deliverable: 'Custom Variational Autoencoder',
    isMilestone: true,
  },
  {
    id: 4,
    title: 'LLM Fundamentals & Attention Layers',
    description: 'Deconstruct transformer architecture from the ground up.',
    capstone: 'Micro-GPT from Scratch',
    skills: ['Transformers', 'Self-Attention', 'Tokenization', 'Positional Encoding'],
    status: 'locked',
    icon: <Map className="w-5 h-5" />
  },
  {
    id: 5,
    title: 'Enterprise RAG & Hybrid Vector Retrieval',
    category: 'Stage 3: Information Retrieval',
    status: 'recommended',
    weeks: '3 weeks',
    summary: 'Dense vector embeddings, HNSW indexing, BM25 hybrid search, and cross-encoder re-ranking.',
    skills: ['Vector DBs', 'Hybrid Search', 'LangChain', 'Cross-Encoders'],
    deliverable: 'Multi-Tenant Document Search Engine',
    isMilestone: true,
  },
  {
    id: 6,
    title: 'Autonomous AI Agents & Tool Calling',
    category: 'Stage 3: Agentic Workflows',
    status: 'recommended',
    weeks: '3 weeks',
    summary: 'ReAct loops, function calling, stateful graphs, planning hierarchies, and guardrail validation.',
    skills: ['ReAct Framework', 'Function Calling', 'State Machines', 'Guardrails'],
    deliverable: 'Autonomous Code Refactoring Agent',
    isMilestone: true,
  },
];

export const RoadmapPreview: React.FC = () => {
  const [activeNode, setActiveNode] = useState(ROADMAP_NODES[2]);

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-transparent transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
            ADAPTIVE CURRICULUM ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Explore your dynamic learning trajectory.
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4">
            Every step is sequenced based on verified prerequisites, industry benchmarks, and maximum hiring signal.
          </p>
        </div>

        {/* Architectural Timeline with 3D Tilt Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Steps Column (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {ROADMAP_STEPS.map((step, idx) => {
              const isSelected = selectedNode.id === step.id;
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <TiltCard key={step.id} maxTilt={6} scale={1.01}>
                  <div
                    onClick={() => setSelectedNode(step)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#1A1A18] border-[#FF4D31] shadow-lg ring-1 ring-[#FF4D31]'
                        : 'bg-white/80 dark:bg-[#1A1A18]/80 border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? 'bg-[#7A8B7C] text-white'
                              : isCurrent
                              ? 'bg-[#FF4D31] text-white shadow-md shadow-[#FF4D31]/30 animate-pulse'
                              : 'bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] block">
                            {step.category}
                          </span>
                          <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                            {step.title}
                            {step.isMilestone && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                        {step.weeks}
                      </span>
                    </div>

                    <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed pl-10">
                      {step.summary}
                    </p>
                  </div>
                </TiltCard>
              );
            })}
          </div>

          {/* Inspector Drawer (5 cols) */}
          <div className="md:col-span-5 sticky top-24">
            <TiltCard maxTilt={8} scale={1.01}>
              <div className="p-7 rounded-3xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31] block mb-1">
                    MILESTONE TELEMETRY
                  </span>
                  <h3 className="text-xl font-display font-bold text-[#1A1A1A] dark:text-white">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] mt-2 leading-relaxed">
                    {selectedNode.summary}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                    Verified Skills Acquired
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedNode.deliverable && (
                  <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D31] mb-1">
                      <Award className="w-4 h-4" />
                      <span>Capstone Deliverable:</span>
                    </div>
                    <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] font-semibold">
                      {selectedNode.deliverable}
                    </p>
                  </div>
                )}

                <Link
                  to="/register"
                  className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs shadow-md shadow-[#FF4D31]/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Generate Full Learning Path</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </TiltCard>
          </div>
          
        </div>
      </div>
    </section>
  );
};
