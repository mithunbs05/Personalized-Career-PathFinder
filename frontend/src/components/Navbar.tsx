import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
      navigate('/');
    }
  };

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F9F8F3]/90 dark:bg-[#121211]/90 backdrop-blur-md border-b border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link
          id="nav-brand-logo"
          to="/"
          className="flex items-center gap-3 group cursor-pointer focus:outline-hidden"
        >
          <div className="w-8 h-8 bg-[#FF4D31] rounded-full flex items-center justify-center shadow-md shadow-[#FF4D31]/20 transition-transform duration-300 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-[#1A1A1A] dark:text-[#F9F8F3]">
            Path<span className="text-[#FF4D31]">AI</span>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-[#4A4A4A] dark:text-[#A0A09B]">
          <a
            href="#curriculum"
            className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            Curriculum
          </a>
          <a
            href="#features"
            className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#personalization"
            className="hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
          >
            Personalization Demo
          </a>
        </nav>

        {/* Right: Auth & Theme Toggle */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                id="nav-dashboard-link"
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#FF4D31]" />
                <span>Dashboard</span>
              </button>
              <button
                id="nav-signout-link"
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-white hover:bg-[#F1EFE7] dark:hover:bg-[#252522] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <button
                id="nav-signin-link"
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F9F8F3] hover:text-[#FF4D31] transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                id="nav-get-started-cta"
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 bg-[#FF4D31] hover:bg-[#E8402A] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-[#FF4D31]/20 transition-all duration-200 cursor-pointer group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-[#1A1A1A] dark:text-[#F9F8F3] hover:bg-[#F1EFE7] dark:hover:bg-[#1A1A18]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#F9F8F3] dark:bg-[#121211] border-b border-[#E8E6DE] dark:border-[#2C2C29] px-6 py-5"
          >
            <div className="flex flex-col gap-4 text-base font-medium text-[#4A4A4A] dark:text-[#A0A09B]">
              <a
                href="#curriculum"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#FF4D31]"
              >
                Curriculum
              </a>
              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#FF4D31]"
              >
                Features
              </a>
              <a
                href="#personalization"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#FF4D31]"
              >
                Personalization Demo
              </a>
              <div className="pt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col gap-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full text-center py-2.5 rounded-full font-semibold bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-center py-2.5 rounded-full font-semibold border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-white cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-center py-2.5 rounded-full font-semibold border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-[#F9F8F3] cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate('/register');
                      }}
                      className="w-full text-center py-2.5 rounded-full font-semibold bg-[#FF4D31] text-white shadow-lg shadow-[#FF4D31]/20 cursor-pointer"
                    >
                      Get Started →
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
