import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Code2, Network, Shield, ChevronRight, Target, CheckCircle2, Workflow } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    description: 'Understand tensors, backpropagation, and core PyTorch mechanics.',
    capstone: 'Custom PyTorch Autograd Engine',
    skills: ['PyTorch', 'Backpropagation', 'Tensors', 'Gradient Descent'],
    status: 'active',
    icon: <Network className="w-5 h-5" />
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
    description: 'Design production-ready retrieval augmented generation pipelines.',
    capstone: 'Multi-Tenant Search Engine',
    skills: ['Vector DBs', 'Semantic Search', 'Chunking Strategies', 'Hybrid Retrieval'],
    status: 'locked',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 6,
    title: 'Autonomous AI Agents & Tool Calling',
    description: 'Orchestrate multi-agent swarms with complex tool usage.',
    capstone: 'LangGraph Autonomous Swarms',
    skills: ['Agentic Workflows', 'Function Calling', 'State Management', 'LangChain'],
    status: 'locked',
    icon: <Workflow className="w-5 h-5" />
  }
];

export const RoadmapPreview: React.FC = () => {
  const [activeNode, setActiveNode] = useState(ROADMAP_NODES[2]);

  return (
    <section id="curriculum" className="relative py-24 bg-transparent z-10">
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
            <Map className="w-4 h-4 text-[#FF4D31]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#7A8B7C]">
              CURRICULUM ARCHITECTURE
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold leading-tight text-[#1A1A1A] dark:text-white mb-6"
          >
            A path built for <span className="text-[#FF4D31]">production</span>, not just tutorials.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#4A4A4A] dark:text-[#A0A09B]"
          >
            Every node in your roadmap is a verified milestone culminating in a production-grade capstone project.
          </motion.p>
        </div>

        {/* Interactive Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left: Sequential Milestones */}
          <div className="w-full lg:w-3/5">
            <div className="relative pl-6 lg:pl-10">
              {/* Connector line */}
              <div className="absolute top-0 bottom-0 left-[27px] lg:left-[43px] w-1 bg-gradient-to-b from-[#E8E6DE] via-[#E8E6DE] to-transparent dark:from-[#2C2C29] dark:via-[#2C2C29] dark:to-transparent rounded-full z-0" />
              
              <div className="space-y-8 relative z-10">
                {ROADMAP_NODES.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => setActiveNode(node)}
                      className={cn(
                        "w-full text-left relative flex items-start gap-6 p-5 rounded-2xl transition-all duration-300 group",
                        activeNode.id === node.id 
                          ? "bg-white dark:bg-[#1A1A18] shadow-xl border border-[#FF4D31]/30 scale-[1.02]" 
                          : "bg-white/40 dark:bg-[#1A1A18]/40 border border-[#E8E6DE] dark:border-[#2C2C29] hover:bg-white dark:hover:bg-[#252522]"
                      )}
                    >
                      {/* Status Icon */}
                      <div className={cn(
                        "w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-colors shadow-sm",
                        node.status === 'completed' ? "bg-[#9BB09E] text-white" :
                        node.status === 'active' ? "bg-[#FF4D31] text-white ring-4 ring-[#FF4D31]/20 animate-pulse" :
                        "bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]"
                      )}>
                        {node.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#7A8B7C]">Stage {node.id}</span>
                          {node.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#9BB09E]" />}
                        </div>
                        <h3 className={cn(
                          "text-lg font-bold mb-2 transition-colors",
                          activeNode.id === node.id ? "text-[#FF4D31]" : "text-[#1A1A1A] dark:text-white group-hover:text-[#FF4D31]"
                        )}>
                          {node.title}
                        </h3>
                        <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                          {node.description}
                        </p>
                      </div>
                      
                      <div className={cn(
                        "opacity-0 transition-opacity",
                        activeNode.id === node.id && "opacity-100 hidden sm:block"
                      )}>
                        <ChevronRight className="w-5 h-5 text-[#FF4D31]" />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky Inspector Card */}
          <div className="w-full lg:w-2/5 relative">
            <div className="sticky top-28">
              <TiltCard className="p-8 h-[600px] flex flex-col shadow-2xl border border-[#FF4D31]/10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                  <div className="w-10 h-10 rounded-xl bg-[#F1EFE7] dark:bg-[#252522] flex items-center justify-center text-[#1A1A1A] dark:text-white">
                    {activeNode.icon}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#7A8B7C]">Node Inspector</h4>
                    <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">Stage {activeNode.id}</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeNode.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-8 leading-tight">
                      {activeNode.title}
                    </h2>

                    <div className="space-y-8 flex-1">
                      {/* Capstone Deliverable */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3">
                          Capstone Deliverable
                        </h4>
                        <div className="bg-[#F9F8F3] dark:bg-[#121211] p-4 rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] flex items-start gap-3">
                          <Target className="w-5 h-5 text-[#FF4D31] shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-[#4A4A4A] dark:text-[#A0A09B]">
                            {activeNode.capstone}
                          </p>
                        </div>
                      </div>

                      {/* Skills Acquired */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-4">
                          Verified Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeNode.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white border border-[#E8E6DE] dark:border-[#2C2C29]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[#E8E6DE] dark:border-[#2C2C29]">
                       <button className={cn(
                         "w-full py-4 rounded-xl text-sm font-bold transition-all shadow-md",
                         activeNode.status === 'completed' ? "bg-[#9BB09E]/20 text-[#9BB09E] cursor-default" :
                         activeNode.status === 'active' ? "bg-[#FF4D31] text-white hover:bg-[#E8402A] shadow-[#FF4D31]/20" :
                         "bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C] cursor-not-allowed"
                       )}>
                         {activeNode.status === 'completed' ? 'Module Completed' :
                          activeNode.status === 'active' ? 'Resume Module' : 'Locked'}
                       </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TiltCard>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
