import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GitCommit, ArrowDown, Sparkles, Clock, Award } from 'lucide-react';

interface VisualNode {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'current' | 'next' | 'locked' | 'recommended';
  weeks: string;
  summary: string;
  skills: string[];
  deliverable?: string;
}

const ROADMAP_STEPS: VisualNode[] = [
  {
    id: 'step-py',
    title: 'Python for High-Performance Systems',
    category: 'Stage 1: Core Engineering',
    status: 'completed',
    weeks: '2 weeks',
    summary: 'Memory optimization, vector math with NumPy/C extensions, and asyncio task loops.',
    skills: ['Python 3.12', 'NumPy', 'AsyncIO', 'Memory Profiling'],
    deliverable: 'Vectorized Mathematical Engine',
  },
  {
    id: 'step-ml',
    title: 'Applied Machine Learning & Evaluation',
    category: 'Stage 1: Statistical AI',
    status: 'completed',
    weeks: '3 weeks',
    summary: 'Loss functions, gradient descent mechanics, cross-validation, and tabular pipelines.',
    skills: ['Scikit-Learn', 'Feature Stores', 'Loss Optimization', 'XGBoost'],
    deliverable: 'Production Churn Predictor',
  },
  {
    id: 'step-dl',
    title: 'Deep Learning & Neural Architectures',
    category: 'Stage 2: Modern Neural Networks',
    status: 'current',
    weeks: '2 weeks',
    summary: 'PyTorch autograd graphs, GPU acceleration, backpropagation mechanics, and CNN/RNN topologies.',
    skills: ['PyTorch', 'Backpropagation', 'CUDA', 'TorchVision'],
    deliverable: 'Custom Variational Autoencoder',
  },
  {
    id: 'step-llm',
    title: 'LLM Fundamentals & Attention Layers',
    category: 'Stage 2: Transformer Architectures',
    status: 'next',
    weeks: '2 weeks',
    summary: 'Multi-head self-attention, positional encoding, KV caching, tokenization algorithms.',
    skills: ['Transformers', 'Self-Attention', 'Tokenizers', 'HuggingFace'],
    deliverable: 'Micro-GPT Built from Scratch',
  },
  {
    id: 'step-rag',
    title: 'Enterprise RAG & Hybrid Vector Retrieval',
    category: 'Stage 3: Information Retrieval',
    status: 'recommended',
    weeks: '3 weeks',
    summary: 'Dense vector embeddings, HNSW indexing, BM25 hybrid search, and cross-encoder re-ranking.',
    skills: ['Vector DBs', 'Hybrid Search', 'LangChain', 'Cross-Encoders'],
    deliverable: 'Multi-Tenant Document Search Engine',
  },
  {
    id: 'step-agents',
    title: 'Autonomous AI Agents & Tool Calling',
    category: 'Stage 3: Agentic Workflows',
    status: 'recommended',
    weeks: '3 weeks',
    summary: 'ReAct loops, function calling, stateful graphs, planning hierarchies, and guardrail validation.',
    skills: ['ReAct Framework', 'Function Calling', 'State Machines', 'Guardrails'],
    deliverable: 'Autonomous Code Refactoring Agent',
  },
  {
    id: 'step-portfolio',
    title: 'Production Capstone: Scalable AI Microservice',
    category: 'Stage 4: Deployment & Mastery',
    status: 'recommended',
    weeks: '2 weeks',
    summary: 'FastAPI streaming endpoints, Docker containerization, latency evaluation, and continuous benchmarking.',
    skills: ['FastAPI', 'Docker', 'RAG Triad Evaluation', 'vLLM/Ollama'],
    deliverable: 'Venture-Ready Full Stack AI App',
  },
];

export const RoadmapPreview: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<VisualNode>(ROADMAP_STEPS[2]);

  return (
    <section id="learning-paths" className="py-24 md:py-32 bg-[#F1EFE7]/50 dark:bg-[#151514] border-y border-[#E8E6DE] dark:border-[#2C2C29] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9F8F3] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
            DYNAMIC SEQUENCING
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            One goal. Hundreds of possible paths.{' '}
            <span className="block font-editorial italic font-normal text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
              AI finds yours.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4">
            Click any milestone node along the timeline to inspect why PathAI positioned it in this exact order.
          </p>
        </div>

        {/* 2-Column Interactive Roadmap View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-semibold text-[#7A8B7C]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7A8B7C]"></span> START: Verified Background
              </span>
              <span className="text-[#FF4D31] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Target: AI/ML Engineer
              </span>
            </div>

            <div className="relative space-y-4">
              {ROADMAP_STEPS.map((node, index) => {
                const isSelected = selectedNode.id === node.id;
                const isCompleted = node.status === 'completed';
                const isCurrent = node.status === 'current';

                return (
                  <div key={node.id} className="relative">
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.08 }}
                      onClick={() => setSelectedNode(node)}
                      className={`flex items-center justify-between p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#F9F8F3] dark:bg-[#252522] border-[#FF4D31] shadow-md shadow-[#FF4D31]/10 ring-1 ring-[#FF4D31]'
                          : 'bg-white dark:bg-[#1A1A18] border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted
                              ? 'bg-[#7A8B7C] text-white'
                              : isCurrent
                              ? 'bg-[#FF4D31] text-white shadow-md shadow-[#FF4D31]/30 animate-pulse'
                              : 'bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C] border border-[#E8E6DE] dark:border-[#2C2C29]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isCurrent ? (
                            <GitCommit className="w-4 h-4" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-white leading-snug">
                            {node.title}
                          </h4>
                          <span className="text-[11px] font-medium text-[#7A8B7C]">
                            {node.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-[#7A8B7C]/15 text-[#7A8B7C]'
                              : isCurrent
                              ? 'bg-[#FF4D31]/15 text-[#FF4D31]'
                              : 'bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]'
                          }`}
                        >
                          {node.status}
                        </span>
                        <span className="text-xs font-semibold text-[#7A8B7C] hidden sm:inline">
                          {node.weeks}
                        </span>
                      </div>
                    </motion.div>

                    {index < ROADMAP_STEPS.length - 1 && (
                      <div className="flex justify-center my-1.5">
                        <ArrowDown className="w-3.5 h-3.5 text-[#E8E6DE] dark:text-[#2C2C29]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Node Detailed Inspector Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#1A1A18] rounded-3xl p-7 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31]">
                    NODE INSPECTOR
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                    <Clock className="w-3 h-3 inline mr-1 text-[#FF4D31]" />
                    {selectedNode.weeks}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-[#1A1A1A] dark:text-white mb-2">
                  {selectedNode.title}
                </h3>
                <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-6">
                  {selectedNode.summary}
                </p>

                {/* Skills Gained */}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2.5">
                    Skills Gained & Verified
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white border border-[#E8E6DE] dark:border-[#2C2C29]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hands-on Deliverable */}
                {selectedNode.deliverable && (
                  <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] dark:text-white mb-1">
                      <Award className="w-4 h-4 text-[#FF4D31]" />
                      <span>Portfolio Deliverable:</span>
                    </div>
                    <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                      {selectedNode.deliverable}
                    </p>
                  </div>
                )}

                <Link
                  to="/register"
                  className="w-full text-center block py-3.5 rounded-full font-semibold text-sm bg-[#FF4D31] hover:bg-[#E8402A] text-white shadow-lg shadow-[#FF4D31]/20 transition-all"
                >
                  Generate My Custom Sequence →
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
