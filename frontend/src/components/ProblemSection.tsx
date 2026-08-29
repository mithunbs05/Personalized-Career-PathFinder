import React from 'react';
import { motion } from 'motion/react';
import { Search, MoveDown, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';

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
    <section id="problem-section" className="relative py-24 bg-transparent z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-[#FF4D31]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#7A8B7C]">
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

        {/* 3D Tilt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PROBLEMS.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <TiltCard className="h-full p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-full bg-[#FF4D31]/10 flex items-center justify-center mb-6">
                  {problem.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-2">{problem.title}</h3>
                  <h4 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">{problem.subtitle}</h4>
                  <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Transition Bridge Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-2xl p-8 sm:p-12 text-center shadow-xl relative overflow-hidden"
        >
          {/* Decorative faint glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF4D31]/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <p className="text-xl sm:text-2xl font-medium leading-relaxed relative z-10">
            PathAI understands the difference — modeling true prerequisite dependency graphs to craft a path tailored to you.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
