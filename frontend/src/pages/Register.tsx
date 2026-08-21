import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      setSuccessMessage('Account created successfully! Preparing your learning path...');
      setTimeout(() => {
        navigate('/onboarding');
      }, 800);
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] transition-colors duration-300">
      {/* LEFT SIDE: Brand & Value Prop (5 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#F1EFE7]/80 dark:bg-[#1A1A18] p-12 flex-col justify-between border-r border-[#E8E6DE] dark:border-[#2C2C29] relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#7A8B7C]/10 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-full bg-[#FF4D31] flex items-center justify-center text-white shadow-md shadow-[#FF4D31]/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-[#1A1A1A] dark:text-white">
            Path<span className="text-[#FF4D31]">AI</span>
          </span>
        </Link>

        <div className="z-10 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF4D31] block mb-2">
              ZERO TO MASTERY
            </span>
            <h1 className="text-3xl font-display font-extrabold text-[#1A1A1A] dark:text-white leading-tight mb-3">
              Your Goal. Your Path. Your Future.
            </h1>
            <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-6">
              Create an account to unlock your diagnostic profile and let PathAI generate your customized sequence of projects, courses, and milestones.
            </p>

            <div className="space-y-3 text-xs font-medium text-[#1A1A1A] dark:text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" />
                <span>No cookie-cutter 100-hour syllabi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" />
                <span>Real-time prerequisite gap detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" />
                <span>24/7 Context-aware AI learning mentor</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-xs text-[#7A8B7C] z-10 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
          <span>Venture-backed autonomous learning engine</span>
        </div>
      </div>

      {/* RIGHT SIDE: Register Card (7 cols) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white dark:bg-[#1A1A18] rounded-3xl p-8 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl"
        >
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] dark:text-white">
                Create your PathAI account
              </h2>
              <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
                Start your personalized learning roadmap in seconds.
              </p>
            </div>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A8B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Jordan Lee"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    fieldErrors.name ? 'border-rose-500 bg-rose-500/5' : 'border-[#E8E6DE] dark:border-[#2C2C29]'
                  } bg-[#F9F8F3] dark:bg-[#252522] text-sm text-[#1A1A1A] dark:text-white focus:outline-hidden focus:border-[#FF4D31]`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A8B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="jordan@example.com"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    fieldErrors.email ? 'border-rose-500 bg-rose-500/5' : 'border-[#E8E6DE] dark:border-[#2C2C29]'
                  } bg-[#F9F8F3] dark:bg-[#252522] text-sm text-[#1A1A1A] dark:text-white focus:outline-hidden focus:border-[#FF4D31]`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A8B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    fieldErrors.password ? 'border-rose-500 bg-rose-500/5' : 'border-[#E8E6DE] dark:border-[#2C2C29]'
                  } bg-[#F9F8F3] dark:bg-[#252522] text-sm text-[#1A1A1A] dark:text-white focus:outline-hidden focus:border-[#FF4D31]`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A8B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    fieldErrors.confirmPassword ? 'border-rose-500 bg-rose-500/5' : 'border-[#E8E6DE] dark:border-[#2C2C29]'
                  } bg-[#F9F8F3] dark:bg-[#252522] text-sm text-[#1A1A1A] dark:text-white focus:outline-hidden focus:border-[#FF4D31]`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF4D31]/20 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create My Account →'}</span>
            </button>
          </form>

          {/* Footer link to Login */}
          <div className="mt-8 text-center text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
            Already have an account?{' '}
            <Link
              id="register-signin-link"
              to="/login"
              className="font-bold text-[#FF4D36] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

