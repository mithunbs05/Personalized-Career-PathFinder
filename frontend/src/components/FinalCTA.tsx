import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

export const FinalCTA: React.FC = () => {
  const [goal, setGoal] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      localStorage.setItem('pathai_initial_goal', goal.trim());
    }
    navigate('/register');
  };

  return (
    <section className="py-24 md:py-36 bg-transparent relative overflow-hidden transition-colors duration-300">
      {/* 3D Warm Ambient Floating Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-radial from-[#FF4D31]/10 to-transparent blur-3xl pointer-events-none rounded-full animate-3d-float" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
            <span>START YOUR JOURNEY</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-8 text-[#1A1A1A] dark:text-white">
            Your goal is unique.{' '}
            <span className="font-editorial italic text-[#4A4A4A] dark:text-[#A0A09B] block mt-2">
              Your learning path should be too.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[#4A4A4A] dark:text-[#A0A09B] max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell PathAI where you want to go. We'll synthesize what you need to learn next.
          </p>

          {/* 3D Tilt Interactive Goal Form */}
          <div className="max-w-xl mx-auto mb-8">
            <TiltCard maxTilt={6} scale={1.01}>
              <form
                onSubmit={handleStartWithGoal}
                className="flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-3xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl"
              >
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Become a Generative AI Engineer..."
                  className="w-full px-4 py-3 text-sm text-[#1A1A1A] dark:text-white bg-transparent focus:outline-hidden"
                />
                <button
                  id="cta-build-path-submit"
                  type="submit"
                  className="w-full sm:w-auto shrink-0 px-7 py-3.5 rounded-2xl bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group shadow-lg shadow-[#FF4D31]/25"
                >
                  <span>Build My Path</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </TiltCard>
          </div>

          {/* Secondary Action */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="text-[#7A8B7C]">Already have an account?</span>
            <Link
              id="cta-secondary-signin"
              to="/login"
              className="font-bold text-[#1A1A1A] dark:text-white hover:text-[#FF4D31] dark:hover:text-[#FF4D31] underline underline-offset-4 decoration-[#E8E6DE] dark:decoration-[#2C2C29]"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
