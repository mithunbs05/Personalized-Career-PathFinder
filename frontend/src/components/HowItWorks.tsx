import React from 'react';
import { motion } from 'motion/react';
import { Target, Activity, GitCommitHorizontal, RefreshCw } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';

const STEPS = [
  {
    number: '01',
    title: 'Tell PathAI your goal',
    subtitle: 'Objective modeling',
    icon: <Target className="w-5 h-5 text-[#FF4D31]" />,
    description: "Input your dream role or specific skills you want to acquire. We parse it to understand the precise technical requirements.",
  },
  {
    number: '02',
    title: 'Understand your starting point',
    subtitle: 'Multi-factor baseline assessment',
    icon: <Activity className="w-5 h-5 text-[#FF4D31]" />,
    description: "Take a short diagnostic or sync your GitHub to let PathAI measure your current proficiency and identify exact skill gaps.",
  },
  {
    number: '03',
    title: 'Generate your path',
    subtitle: 'Courses → Skills → Projects → Milestones',
    icon: <GitCommitHorizontal className="w-5 h-5 text-[#FF4D31]" />,
    description: "We compile a structured dependency graph of the exact modules, capstones, and labs required to bridge your gaps.",
  },
  {
    number: '04',
    title: 'Adapt as you grow',
    subtitle: 'Dynamic closed-loop re-routing',
    icon: <RefreshCw className="w-5 h-5 text-[#FF4D31]" />,
    description: "As you complete labs, PathAI recalibrates in real-time, removing redundant topics or inserting remedial micro-labs.",
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-24 bg-transparent z-10">
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
            <span className="text-xs font-bold uppercase tracking-widest text-[#7A8B7C]">
              METHODOLOGY
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold leading-tight text-[#1A1A1A] dark:text-white"
          >
            How PathAI Works
          </motion.h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative h-full"
            >
              {/* Connector line for desktop (hidden on last item) */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-[2px] bg-gradient-to-r from-[#E8E6DE] to-transparent dark:from-[#2C2C29] dark:to-transparent z-0" />
              )}
              
              <TiltCard className="h-full p-6 group">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="text-4xl font-display font-bold text-[#E8E6DE] dark:text-[#2C2C29] group-hover:text-[#FF4D31]/20 transition-colors duration-300">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-center group-hover:border-[#FF4D31]/30 transition-colors">
                    {step.icon}
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-1 group-hover:text-[#FF4D31] transition-colors">{step.title}</h3>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-4">{step.subtitle}</h4>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};
