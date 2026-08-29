import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Map, Activity, RefreshCcw, Briefcase, BarChart2 } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';

const FEATURES = [
  {
    icon: <MessageSquare className="w-6 h-6 text-[#FF4D31]" />,
    title: 'AI Learning Assistant',
    description: 'Context-aware technical mentoring that unsticks you immediately when you hit a wall, referencing your exact codebase and progress state.',
  },
  {
    icon: <Map className="w-6 h-6 text-[#7A8B7C]" />,
    title: 'Personalized 3D Roadmaps',
    description: 'Prerequisite-optimized skill trees generated exclusively for your target role and current baseline proficiency.',
  },
  {
    icon: <Activity className="w-6 h-6 text-[#FF4D31]" />,
    title: 'Skill Gap Analysis',
    description: 'Hiring bar discrepancy detection mapping your current knowledge against production-grade enterprise requirements.',
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-[#7A8B7C]" />,
    title: 'Adaptive Recommendations',
    description: 'Continuous weekly recalibration of your syllabus based on your learning velocity and diagnostic results.',
  },
  {
    icon: <Briefcase className="w-6 h-6 text-[#FF4D31]" />,
    title: 'Project-Based Learning',
    description: 'Every milestone culminates in production-grade portfolio artifacts, ditching isolated tutorials for real-world engineering.',
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-[#7A8B7C]" />,
    title: 'Progress Intelligence',
    description: 'A comprehensive telemetry cockpit tracking your mastery levels, estimated completion time, and weekly intensity metrics.',
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-24 bg-transparent z-10">
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
              CORE PLATFORM
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold leading-tight text-[#1A1A1A] dark:text-white"
          >
            Everything you need to reach <span className="font-editorial italic text-[#4A4A4A]/80 dark:text-[#A0A09B]/80 block sm:inline">the hiring bar.</span>
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <TiltCard className="h-full p-8 flex flex-col group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-center mb-6 group-hover:border-[#FF4D31]/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-3 group-hover:text-[#FF4D31] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                  {feature.description}
                </p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};
