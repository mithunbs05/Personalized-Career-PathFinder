import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Lock, Mail, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TiltCard } from '../components/3d/TiltCard';

interface FormErrors {
  email?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (loggedInUser && !loggedInUser.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.warn('Login failure:', err);
      const msg = (err?.message || '').toLowerCase();
      const isNotFound =
        err?.code === 'USER_NOT_FOUND' ||
        msg.includes('not found') ||
        msg.includes('no user') ||
        msg.includes('create an account');

      if (isNotFound) {
        setErrorMessage('No active account found. Redirecting to Create Account...');
        setTimeout(() => {
          navigate('/register', {
            replace: true,
            state: {
              email: email.trim(),
              notice: 'No account found with this email. Please register to get started.',
            },
          });
        }, 1000);
      } else {
        setErrorMessage(err?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] transition-colors duration-300 relative">
      {/* LEFT SIDE: Brand & Editorial Journey (5 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#F1EFE7]/80 dark:bg-[#1A1A18] p-12 flex-col justify-between border-r border-[#E8E6DE] dark:border-[#2C2C29] relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#FF4D31]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
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

        {/* Left Editorial Text */}
        <div className="z-10 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF4D31] block mb-2">
              RESUME LEARNING
            </span>
            <h1 className="text-3xl font-display font-extrabold text-[#1A1A1A] dark:text-white leading-tight mb-3">
              Welcome back.
            </h1>
            <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-8">
              Your personalized learning journey is waiting. Check your next milestone, continue active labs, and ask your AI mentor.
            </p>
          </motion.div>
        </div>

        {/* Bottom Tag */}
        <div className="text-xs text-[#7A8B7C] z-10 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
          <span>Real-time adaptive knowledge graphs</span>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Card Form (7 cols) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <TiltCard maxTilt={5} scale={1.01}>
            <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-8 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] dark:text-white">
                  Sign in to PathAI
                </h2>
                <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
                  Enter your credentials to continue your learning journey.
                </p>
              </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A8B7C] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A8B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="alex@pathai.dev"
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A8B7C]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#FF4D31] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A8B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
                    fieldErrors.password ? 'border-rose-500 bg-rose-500/5' : 'border-[#E8E6DE] dark:border-[#2C2C29]'
                  } bg-[#F9F8F3] dark:bg-[#252522] text-sm text-[#1A1A1A] dark:text-white focus:outline-hidden focus:border-[#FF4D31]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A8B7C] hover:text-[#1A1A1A] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] cursor-pointer select-none">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8E6DE] text-[#FF4D31] accent-[#FF4D31] focus:ring-[#FF4D31] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link to Register */}
          <div className="mt-8 text-center text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
            Don't have an account?{' '}
            <Link
              id="login-create-account-link"
              to="/register"
              className="font-bold text-[#FF4D31] hover:underline"
            >
              Create Account
            </Link>
          </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};
