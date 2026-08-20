import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#111113] p-6 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl p-8 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-lg"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-stone-900 dark:text-white mb-2">
              Password Reset Link Sent
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
              We've dispatched password recovery instructions to <strong className="text-stone-900 dark:text-white">{email}</strong>. Please check your inbox and spam folders.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-white mb-2">
              Reset your password
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Enter the email address associated with your PathAI profile and we'll send a secure reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@pathai.dev"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#FF4D36]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#FF4D36] hover:bg-[#E8402A] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
