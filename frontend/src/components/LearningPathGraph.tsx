import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, GitCommit, Layers, Sparkles, Target } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  category: string;
  duration: string;
  prerequisites: string;
  status: 'completed' | 'current' | 'next' | 'target';
  progress: number;
  description: string;
  x: number; // percentage in SVG coordinate
  y: number; // percentage in SVG coordinate
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: 'start',
    label: 'Python Core',
    category: 'Foundations',
    duration: '2 weeks',
    prerequisites: 'None (Starting Point)',
    status: 'completed',
    progress: 100,
    description: 'Data structures, OOP, vectorized math, and asynchronous execution.',
    x: 50,
    y: 86,
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    category: 'Core AI',
    duration: '3 weeks',
    prerequisites: 'Python Core',
    status: 'completed',
    progress: 100,
    description: 'Supervised & unsupervised learning, model tuning, evaluation.',
    x: 24,
    y: 66,
  },
  {
    id: 'dl',
    label: 'Deep Learning',
    category: 'Core AI',
    duration: '3 weeks',
    prerequisites: 'Machine Learning',
    status: 'current',
    progress: 65,
    description: 'PyTorch tensors, backprop mathematics, and GPU architectures.',
    x: 76,
    y: 66,
  },
  {
    id: 'rag',
    label: 'RAG Systems',
    category: 'Generative AI',
    duration: '3 weeks',
    prerequisites: 'Python + Deep Learning',
    status: 'next',
    progress: 0,
    description: 'Vector databases, hybrid search, embedding pipelines & re-ranking.',
    x: 28,
    y: 40,
  },
  {
    id: 'agents',
    label: 'AI Agents & Tools',
    category: 'Autonomous Systems',
    duration: '3 weeks',
    prerequisites: 'RAG Systems',
    status: 'next',
    progress: 0,
    description: 'ReAct pattern, function calling, stateful orchestration & guardrails.',
    x: 72,
    y: 40,
  },
  {
    id: 'genai',
    label: 'Generative AI',
    category: 'LLM Systems',
    duration: '2 weeks',
    prerequisites: 'Deep Learning',
    status: 'next',
    progress: 0,
    description: 'Attention mechanisms, tokenization, KV cache & fine-tuning.',
    x: 50,
    y: 24,
  },
  {
    id: 'target',
    label: 'AI Engineer',
    category: 'Career Milestone',
    duration: 'Target Goal',
    prerequisites: 'Full Roadmap',
    status: 'target',
    progress: 0,
    description: 'Deploying robust, evaluation-backed production AI systems at scale.',
    x: 50,
    y: 8,
  },
];

const CONNECTIONS = [
  { from: 'start', to: 'ml' },
  { from: 'start', to: 'dl' },
  { from: 'ml', to: 'rag' },
  { from: 'dl', to: 'agents' },
  { from: 'rag', to: 'genai' },
  { from: 'agents', to: 'genai' },
  { from: 'genai', to: 'target' },
];

export const LearningPathGraph: React.FC = () => {
  const [activeNode, setActiveNode] = useState<GraphNode>(GRAPH_NODES[3]); // default preview RAG Systems

  return (
    <div
      id="hero-learning-path-graph"
      className="relative w-full max-w-lg mx-auto bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] p-7 shadow-xl overflow-visible transition-all duration-300"
    >
      {/* Top Header Label */}
      <div className="flex items-center justify-between border-b border-[#E8E6DE] dark:border-[#2C2C29] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D31] animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8B7C]">
            Interactive Dynamic Path
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A] dark:text-white bg-[#F1EFE7] dark:bg-[#252522] px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
          <span>Live AI Adaptation</span>
        </div>
      </div>

      {/* SVG Canvas for Connectors & Graph */}
      <div className="relative h-[340px] w-full select-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="artisticGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF4D31" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7A8B7C" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Render Connections */}
          {CONNECTIONS.map((conn, idx) => {
            const source = GRAPH_NODES.find((n) => n.id === conn.from)!;
            const target = GRAPH_NODES.find((n) => n.id === conn.to)!;
            const isCompleted = source.status === 'completed' && (target.status === 'completed' || target.status === 'current');

            return (
              <motion.line
                key={`line-${idx}`}
                x1={`${source.x}%`}
                y1={`${source.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke={isCompleted ? '#FF4D31' : '#E8E6DE'}
                strokeWidth={isCompleted ? '2' : '1.2'}
                strokeDasharray={isCompleted ? 'none' : '3, 3'}
                strokeOpacity={isCompleted ? 1 : 0.6}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Node Elements */}
        {GRAPH_NODES.map((node, index) => {
          const isSelected = activeNode?.id === node.id;
          const isCompleted = node.status === 'completed';
          const isCurrent = node.status === 'current';
          const isTarget = node.status === 'target';

          return (
            <div
              key={node.id}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 cursor-pointer"
              onMouseEnter={() => setActiveNode(node)}
              onClick={() => setActiveNode(node)}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 15 }}
                whileHover={{ scale: 1.15 }}
                className={`relative flex items-center justify-center transition-all ${
                  isTarget
                    ? 'w-12 h-12 rounded-2xl bg-white dark:bg-[#1A1A18] border-2 border-[#FF4D31] text-[#FF4D31] shadow-xl'
                    : isCompleted
                    ? 'w-9 h-9 rounded-xl bg-[#7A8B7C] text-white shadow-sm'
                    : isCurrent
                    ? 'w-10 h-10 rounded-xl bg-[#FF4D31] text-white shadow-lg shadow-[#FF4D31]/30 ring-4 ring-[#FF4D31]/20 animate-pulse'
                    : 'w-8 h-8 rounded-xl bg-white dark:bg-[#252522] text-[#7A8B7C] border border-[#E8E6DE] dark:border-[#2C2C29]'
                } ${isSelected ? 'ring-2 ring-[#FF4D31] ring-offset-2' : ''}`}
              >
                {isTarget ? (
                  <span className="text-xl">🎯</span>
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <GitCommit className="w-5 h-5" />
                ) : (
                  <Circle className="w-3 h-3 text-[#7A8B7C]" />
                )}
              </motion.div>

              {/* Node Title Label */}
              <div
                className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  isSelected || isCurrent
                    ? 'text-[#FF4D31]'
                    : isCompleted
                    ? 'text-[#7A8B7C]'
                    : 'text-[#4A4A4A] dark:text-[#A0A09B]'
                }`}
              >
                {node.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Hover Tooltip / Detail Card */}
      <AnimatePresence mode="wait">
        {activeNode && (
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-6 p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">
                    {activeNode.label}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      activeNode.status === 'completed'
                        ? 'bg-[#7A8B7C]/20 text-[#7A8B7C]'
                        : activeNode.status === 'current'
                        ? 'bg-[#FF4D31]/15 text-[#FF4D31]'
                        : 'bg-[#E8E6DE] text-[#4A4A4A] dark:bg-[#1A1A18] dark:text-[#A0A09B]'
                    }`}
                  >
                    {activeNode.status}
                  </span>
                </div>
                <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
                  {activeNode.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A1A] dark:text-white bg-white dark:bg-[#1A1A18] px-2.5 py-1 rounded-full border border-[#E8E6DE] dark:border-[#2C2C29]">
                  <Clock className="w-3 h-3 text-[#FF4D31]" />
                  {activeNode.duration}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#E8E6DE] dark:border-[#2C2C29] text-[11px] text-[#7A8B7C]">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-[#1A1A1A] dark:text-white">Prerequisite:</span>{' '}
                {activeNode.prerequisites}
              </span>
              <span className="font-semibold text-[#1A1A1A] dark:text-white">
                Progress: {activeNode.progress}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
