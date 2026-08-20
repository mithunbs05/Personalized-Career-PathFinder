import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Shuffle, Split, Check } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: Split,
      tag: 'PARALYSIS',
      title: 'TOO MANY CHOICES',
      description: 'Thousands of courses, tutorials, and bootcamps. No clear starting point or vetted curriculum.',
      impact: 'Learners spend 40% of their time researching what to study rather than learning.',
    },
    {
      icon: Shuffle,
      tag: 'INEFFICIENCY',
      title: 'WRONG SEQUENCE',
      description: 'Attempting advanced architectures before solidifying linear algebra and async foundations.',
      impact: 'High drop-off rates due to hidden conceptual prerequisites.',
    },
    {
      icon: HelpCircle,
      tag: 'ONE-SIZE-FITS-NONE',
      title: 'GENERIC PATHS',
      description: 'Static 100-hour syllabi that force you to re-learn skills you already know from past projects.',
      impact: 'Boredom and stalled career momentum.',
    },
  ];

  return (
    <section id="problem-section" className="py-20 md:py-28 bg-[#F1EFE7]/60 dark:bg-[#151514] border-y border-[#E8E6DE] dark:border-[#2C2C29] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9F8F3] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
              THE STRUCTURAL FLAW IN ONLINE LEARNING
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
              The problem isn't finding courses.{' '}
              <span className="block font-editorial italic font-normal text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
                It's knowing which one comes next.
              </span>
            </h2>
          </motion.div>
        </div>

        {/* 3 Animated Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <motion.div
                key={prob.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-[#1A1A18] rounded-3xl p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] text-[#FF4D31] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                      {prob.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-[#1A1A1A] dark:text-white mb-2">
                    {prob.title}
                  </h3>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-4">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-medium text-[#7A8B7C] italic">
                  "{prob.impact}"
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Transition Bridge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white dark:bg-[#1A1A18] rounded-3xl p-8 max-w-2xl mx-auto border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs"
        >
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#7A8B7C]/15 text-[#7A8B7C] mb-3">
            <Check className="w-5 h-5" />
          </div>
          <h4 className="text-xl sm:text-2xl font-display font-bold text-[#1A1A1A] dark:text-white">
            PathAI understands the difference.
          </h4>
          <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-2">
            By modeling the true prerequisite graph of modern tech competencies, PathAI continuously synthesizes the optimal path between your current skills and your target goal.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
