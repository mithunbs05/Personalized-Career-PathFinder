import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Sparkles, CheckCircle2, ArrowRight, Brain, Zap } from 'lucide-react';

const AnimatedCounter: React.FC<{ target: number; suffix: string; label: string; delay: number }> = ({
  target,
  suffix,
  label,
  delay,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1400;
      const startTime = Date.now();
      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <div className="text-center">
      <span className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] dark:text-white">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mt-1">
        {label}
      </span>
    </div>
  );
};

export const Hero: React.FC = () => {
  return (
    <section id="hero-section" className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden bg-[#F9F8F3] dark:bg-[#121211] transition-colors duration-300">
      {/* Subtle radial backdrop element */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial from-[#FF4D31]/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-8 text-[#1A1A1A] dark:text-white">
            Stop Guessing{' '}
            <span className="text-[#4A4A4A]/40 dark:text-[#A0A09B]/40 block sm:inline">What to Learn Next.</span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-[#4A4A4A] dark:text-[#A0A09B] max-w-2xl leading-relaxed mb-12">
            PathAI turns your goals, skills and history into an adaptive roadmap. Let AI{' '}
            <span className="text-[#FF4D31] font-semibold border-b-2 border-[#FF4D31]/30">
              build the path
            </span>{' '}
            that gets you there.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <Link
              id="hero-cta-build-path"
              to="/register"
              className="bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] px-9 py-4 rounded-full font-semibold shadow-lg hover:opacity-90 transition-all duration-200 cursor-pointer group inline-flex items-center gap-2 text-base"
            >
              <span>Build My Learning Path</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>

            <a
              id="hero-cta-explore"
              href="#how-it-works"
              className="px-8 py-4 rounded-full font-semibold border border-[#1A1A1A]/15 dark:border-white/15 hover:bg-[#F1EFE7] dark:hover:bg-[#1A1A18] text-[#1A1A1A] dark:text-white transition-colors inline-flex items-center gap-2 text-base"
            >
              <Compass className="w-4 h-4 text-[#7A8B7C]" />
              <span>Explore Demo</span>
            </a>
          </div>

          {/* Animated Stats Counter Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mb-14 w-full"
          >
            <AnimatedCounter target={14} suffix="K+" label="Active Learners" delay={200} />
            <div className="w-px h-10 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
            <AnimatedCounter target={96} suffix="%" label="Goal Match Rate" delay={400} />
            <div className="w-px h-10 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
            <AnimatedCounter target={3} suffix="x" label="Faster Mastery" delay={600} />
          </motion.div>

          {/* Live Curriculum Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="w-full max-w-2xl bg-white dark:bg-[#1A1A18] rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-5 py-3 bg-[#F1EFE7] dark:bg-[#252522] border-b border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#FF4D31]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C]">
                  AI-Generated Curriculum Preview
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4D31]/10 text-[#FF4D31]">
                LIVE
              </span>
            </div>

            {/* Curriculum Steps */}
            <div className="p-5 space-y-3">
              {[
                { step: 1, title: 'Advanced Python & Data Structures', status: 'completed', weeks: '2w' },
                { step: 2, title: 'Machine Learning & Statistical Inference', status: 'completed', weeks: '3w' },
                { step: 3, title: 'Deep Learning & PyTorch Foundations', status: 'current', weeks: '2w' },
                { step: 4, title: 'LLM Fundamentals & Attention Mechanisms', status: 'next', weeks: '2w' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.status === 'current'
                      ? 'bg-[#F9F8F3] dark:bg-[#252522] border border-[#FF4D31]/30 shadow-sm'
                      : 'hover:bg-[#F9F8F3]/50 dark:hover:bg-[#252522]/50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      item.status === 'completed'
                        ? 'bg-[#7A8B7C] text-white'
                        : item.status === 'current'
                        ? 'bg-[#FF4D31] text-white animate-glow-pulse'
                        : 'bg-[#F1EFE7] dark:bg-[#2C2C29] text-[#7A8B7C]'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : item.status === 'current' ? (
                      <Zap className="w-3.5 h-3.5" />
                    ) : (
                      item.step
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${
                      item.status === 'current' ? 'text-[#1A1A1A] dark:text-white' : 'text-[#4A4A4A] dark:text-[#A0A09B]'
                    }`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] font-bold text-[#7A8B7C] px-2 py-0.5 rounded-full bg-[#F1EFE7] dark:bg-[#2C2C29]">
                      {item.weeks}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Card Footer */}
            <div className="px-5 py-3 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between">
              <span className="text-[11px] text-[#7A8B7C] font-medium">
                Adaptive · Skill-Aware · Prerequisite-Ordered
              </span>
              <Link
                to="/register"
                className="text-xs font-bold text-[#FF4D31] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Get My Path</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Trust Checklist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold tracking-wider text-[#7A8B7C] mt-12"
          >
            <span>✓ GOAL-BASED</span>
            <span>✓ SKILL-AWARE</span>
            <span>✓ ADAPTIVE</span>
            <span>✓ AI-GUIDED</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
