import React from 'react';
import { motion } from 'motion/react';
import { Bot, Route, GitCompare, Sparkles, FolderGit2, BarChart3, ArrowUpRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Learning Assistant',
    description: 'Ask deep technical questions, debug architecture decisions, and receive context-aware guidance tailored to your exact roadmap position.',
    tag: 'INTELLIGENCE',
    color: '#FF4D31',
  },
  {
    icon: Route,
    title: 'Personalized Roadmaps',
    description: 'Get the mathematically optimal sequence of skills, interactive labs, and industry projects without filler or duplicate introductory modules.',
    tag: 'CURATION',
    color: '#7A8B7C',
  },
  {
    icon: GitCompare,
    title: 'Skill Gap Analysis',
    description: 'Understand precisely what competencies and sub-skills you are missing relative to real-world job specifications and hiring bars.',
    tag: 'DIAGNOSTICS',
    color: '#FF4D31',
  },
  {
    icon: Sparkles,
    title: 'Adaptive Recommendations',
    description: 'Your roadmap is alive. It re-calibrates weekly based on quiz scores, completed GitHub repositories, and speed of mastery.',
    tag: 'RE-ROUTING',
    color: '#7A8B7C',
  },
  {
    icon: FolderGit2,
    title: 'Project-Based Learning',
    description: 'Build real production microservices, autonomous agents, and RAG pipelines that demonstrate proven hiring capability.',
    tag: 'PORTFOLIO',
    color: '#FF4D31',
  },
  {
    icon: BarChart3,
    title: 'Progress Intelligence',
    description: 'Track granular skill proficiencies, time invested, streak consistency, and milestone benchmarks with high-fidelity telemetry.',
    tag: 'ANALYTICS',
    color: '#7A8B7C',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-[#F9F8F3] dark:bg-[#121211] transition-colors duration-300">
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
            Every feature in PathAI is purposefully designed to accelerate comprehension and eliminate guesswork.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-[#1A1A18] rounded-3xl p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
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
                  <span>Explore Feature</span>
                  <ArrowUpRight className="w-4 h-4 text-[#7A8B7C] group-hover:text-[#FF4D31] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
