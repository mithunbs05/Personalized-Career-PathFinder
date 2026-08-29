import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Shuffle, Split, Check } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

const PROBLEMS = [
  {
    icon: <Search className="w-6 h-6 text-[#FF4D31]" />,
    title: 'PARALYSIS',
    subtitle: 'TOO MANY CHOICES',
    description: 'Learners spend up to 40% of their time just researching what to learn next instead of actually learning.',
  },
  {
    icon: <MoveDown className="w-6 h-6 text-[#FF4D31]" />,
    title: 'INEFFICIENCY',
    subtitle: 'WRONG SEQUENCE',
    description: 'High drop-off rates occur when learners hit hidden math or architecture prerequisites they weren\'t warned about.',
  },
  {
    icon: <Users className="w-6 h-6 text-[#FF4D31]" />,
    title: 'ONE-SIZE-FITS-NONE',
    subtitle: 'GENERIC PATHS',
    description: 'Static syllabi force experienced learners into duplicate review while leaving beginners behind.',
  }
];

export const ProblemSection: React.FC = () => {
  return (
    <section id="problem-section" className="py-20 md:py-28 bg-transparent border-y border-[#E8E6DE]/60 dark:border-[#2C2C29]/60 transition-colors duration-300 relative overflow-hidden">
      {/* 3D Ambient Background Accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#FF4D31]/5 rounded-full blur-3xl pointer-events-none animate-3d-float" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#7A8B7C]/5 rounded-full blur-3xl pointer-events-none animate-3d-float-delayed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F9F8F3] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4 shadow-2xs">
              THE STRUCTURAL FLAW IN ONLINE LEARNING
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold leading-tight text-[#1A1A1A] dark:text-white"
          >
            The problem isn't finding courses.{' '}
            <span className="font-editorial italic text-[#4A4A4A]/80 dark:text-[#A0A09B]/80 block">
              It's knowing which one comes next.
            </span>
          </motion.h2>
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
