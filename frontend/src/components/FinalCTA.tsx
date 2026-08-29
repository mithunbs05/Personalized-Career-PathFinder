import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

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
    <section className="relative py-32 overflow-hidden bg-transparent z-10">
      {/* Warm radial ambient glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF4D31]/15 via-transparent to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-[#1A1A18] shadow-xl border border-[#E8E6DE] dark:border-[#2C2C29] mb-8 relative">
            <div className="absolute inset-0 rounded-full border border-[#FF4D31]/30 animate-ping opacity-20" />
            <Sparkles className="w-8 h-8 text-[#FF4D31]" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-8 text-[#1A1A1A] dark:text-white">
            Your goal is unique.{' '}
            <span className="font-editorial italic text-[#4A4A4A] dark:text-[#A0A09B] block mt-2">
              Your learning path should be too.
            </span>
          </h2>
          
          {/* Interactive Goal Input Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8 relative">
            <div className="relative group">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Become a Generative AI Engineer..."
                className="w-full pl-6 pr-40 py-5 rounded-full text-lg bg-white dark:bg-[#1A1A18] border-2 border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-white placeholder:text-[#A0A09B] focus:outline-none focus:border-[#FF4D31] focus:ring-4 focus:ring-[#FF4D31]/10 transition-all shadow-lg group-hover:shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold transition-colors flex items-center gap-2 shadow-md"
              >
                Start <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
          
          <p className="text-sm font-semibold text-[#4A4A4A] dark:text-[#A0A09B]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1A1A1A] dark:text-white hover:text-[#FF4D31] dark:hover:text-[#FF4D31] border-b border-[#1A1A1A] dark:border-white hover:border-[#FF4D31] pb-0.5 transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
