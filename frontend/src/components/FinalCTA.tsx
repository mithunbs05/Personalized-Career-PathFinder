import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const [goalInput, setGoalInput] = useState('');
  const navigate = useNavigate();

  const handleStartWithGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim()) {
      localStorage.setItem('pathai_initial_goal', goalInput.trim());
    }
    navigate('/register');
  };

  return (
    <section className="py-24 md:py-36 bg-[#F9F8F3] dark:bg-[#121211] relative overflow-hidden transition-colors duration-300">
      {/* Warm Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-radial from-[#FF4D31]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
            START YOUR JOURNEY
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#1A1A1A] dark:text-white tracking-tight leading-[1.1] mb-6">
            Your goal is unique.{' '}
            <span className="block font-editorial italic font-normal text-[#4A4A4A] dark:text-[#A0A09B] mt-2">
              Your learning path should be too.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[#4A4A4A] dark:text-[#A0A09B] max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell PathAI where you want to go. We'll figure out what you need to learn next.
          </p>

          {/* Interactive Goal Form */}
          <form
            onSubmit={handleStartWithGoal}
            className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl mb-8"
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
              className="w-full sm:w-auto shrink-0 px-7 py-3.5 rounded-xl bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group shadow-lg shadow-[#FF4D31]/20"
            >
              <span>Build My Path</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

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
          </div>
        </motion.div>
      </div>
    </section>
  );
};
