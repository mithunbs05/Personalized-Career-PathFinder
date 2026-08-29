import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Shuffle, Split, Check } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

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
    <section id="problem-section" className="py-20 md:py-28 bg-transparent border-y border-[#E8E6DE]/60 dark:border-[#2C2C29]/60 transition-colors duration-300 relative overflow-hidden">
      {/* 3D Ambient Background Accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#FF4D31]/5 rounded-full blur-3xl pointer-events-none animate-3d-float" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#7A8B7C]/5 rounded-full blur-3xl pointer-events-none animate-3d-float-delayed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F9F8F3] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4 shadow-2xs">
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

        {/* 3 3D Tilt Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {problems.map((prob) => {
            const Icon = prob.icon;
            return (
              <TiltCard key={prob.title} maxTilt={9} scale={1.02}>
                <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] text-[#FF4D31] flex items-center justify-center shadow-xs transition-transform group-hover:scale-110">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                        {prob.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-[#1A1A1A] dark:text-white mb-2 group-hover:text-[#FF4D31] transition-colors">
                      {prob.title}
                    </h3>
                    <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-4">
                      {prob.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-medium text-[#7A8B7C] italic">
                    "{prob.impact}"
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>

        {/* 3D Transition Bridge Card */}
        <div className="max-w-2xl mx-auto">
          <TiltCard maxTilt={5} scale={1.01}>
            <div className="text-center bg-white dark:bg-[#1A1A18] rounded-3xl p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#7A8B7C]/15 text-[#7A8B7C] mb-3 animate-subtle-float">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-xl sm:text-2xl font-display font-bold text-[#1A1A1A] dark:text-white">
                PathAI understands the difference.
              </h4>
              <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-2 leading-relaxed">
                By modeling the true prerequisite graph of modern tech competencies, PathAI continuously synthesizes the optimal path between your current skills and your target goal.
              </p>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};
