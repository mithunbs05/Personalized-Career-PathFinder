import React from 'react';
import { motion } from 'motion/react';
import { Bot, Route, GitCompare, Sparkles, FolderGit2, BarChart3, ArrowUpRight } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

const FEATURES = [
  {
    icon: <MessageSquare className="w-6 h-6 text-[#FF4D31]" />,
    title: 'AI Learning Assistant',
    description: 'Context-aware technical mentoring that unsticks you immediately when you hit a wall, referencing your exact codebase and progress state.',
  },
  {
    icon: Route,
    title: 'Personalized 3D Roadmaps',
    description: 'Get the mathematically optimal sequence of skills, interactive labs, and industry projects without filler or duplicate introductory modules.',
    tag: 'CURATION',
    color: '#7A8B7C',
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
    description: 'Track granular skill proficiencies, time invested, streak consistency, and milestone benchmarks with high-fidelity 3D telemetry.',
    tag: 'ANALYTICS',
    color: '#7A8B7C',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-transparent transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
            CORE CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Engineered for genuine skill acquisition.
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4 leading-relaxed">
            Every capability in PathAI is purposefully architected to eliminate guesswork and accelerate career mastery.
          </p>
        </div>

        {/* 6 3D Tilt Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <TiltCard key={feat.title} maxTilt={9} scale={1.02}>
                <div className="bg-white/90 dark:bg-[#1A1A18]/90 backdrop-blur-md rounded-3xl p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                        style={{ backgroundColor: feat.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-[#1A1A1A] dark:text-white mb-2 group-hover:text-[#FF4D31] transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between text-xs font-semibold text-[#7A8B7C] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors">
                    <span>Explore Telemetry</span>
                    <ArrowUpRight className="w-4 h-4 text-[#7A8B7C] group-hover:text-[#FF4D31] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
        
      </div>
    </section>
  );
};
