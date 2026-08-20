import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F1EFE7]/50 dark:bg-[#151514] border-t border-[#E8E6DE] dark:border-[#2C2C29] py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Stats Bar from Design */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 mb-12 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
          <div className="flex items-center gap-4 md:border-r border-[#E8E6DE] dark:border-[#2C2C29] pr-4">
            <div className="text-4xl font-bold text-[#1A1A1A] dark:text-white">68%</div>
            <div className="text-[10px] font-bold uppercase leading-tight text-[#7A8B7C]">
              Average Course<br />Completion
            </div>
          </div>

          <div className="md:col-span-2 px-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                Live Cohort Focus
              </span>
              <span className="text-[10px] font-medium text-[#7A8B7C]">Build RAG Application &rarr;</span>
            </div>
            <div className="h-2 w-full bg-[#E8E6DE] dark:bg-[#1A1A18] rounded-full overflow-hidden">
              <div className="h-full w-[68%] bg-[#1A1A1A] dark:bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center md:justify-end">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#F9F8F3] dark:border-[#121211] bg-[#7A8B7C]"></div>
              <div className="w-8 h-8 rounded-full border-2 border-[#F9F8F3] dark:border-[#121211] bg-[#FF4D31]"></div>
              <div className="w-8 h-8 rounded-full border-2 border-[#F9F8F3] dark:border-[#121211] bg-[#1A1A1A] flex items-center justify-center text-[8px] text-white font-bold">
                +12k
              </div>
            </div>
            <span className="ml-4 text-[10px] font-bold text-[#4A4A4A] dark:text-[#A0A09B]">
              JOIN 12,400+ LEARNERS
            </span>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#FF4D31] flex items-center justify-center text-white shadow-md shadow-[#FF4D31]/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-[#1A1A1A] dark:text-white">
                Path<span className="text-[#FF4D31]">AI</span>
              </span>
            </Link>
            <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-4">
              Your Goal. Your Path. Your Future. Autonomous learning paths for technical mastery.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7A8B7C] bg-[#F1EFE7] dark:bg-[#252522] px-3 py-1 rounded-full border border-[#E8E6DE] dark:border-[#2C2C29]">
              <span className="w-2 h-2 rounded-full bg-[#7A8B7C] animate-pulse"></span>
              All Learning Engines Operational
            </div>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3">
              Platform
            </h5>
            <ul className="space-y-2 text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
              <li><a href="#how-it-works" className="hover:text-[#FF4D31]">How It Works</a></li>
              <li><a href="#features" className="hover:text-[#FF4D31]">Feature Matrix</a></li>
              <li><a href="#learning-paths" className="hover:text-[#FF4D31]">Adaptive Roadmaps</a></li>
              <li><a href="#ai-mentor" className="hover:text-[#FF4D31]">AI Learning Mentor</a></li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3">
              Popular Tracks
            </h5>
            <ul className="space-y-2 text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
              <li><Link to="/register" className="hover:text-[#FF4D31]">Generative AI Engineer</Link></li>
              <li><Link to="/register" className="hover:text-[#FF4D31]">Full Stack AI Architect</Link></li>
              <li><Link to="/register" className="hover:text-[#FF4D31]">MLOps & LLM Deployment</Link></li>
              <li><Link to="/register" className="hover:text-[#FF4D31]">Autonomous Agent Developer</Link></li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white mb-3">
              Account
            </h5>
            <ul className="space-y-2 text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
              <li><Link to="/login" className="hover:text-[#FF4D31]">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#FF4D31]">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#FF4D31]">Learner Dashboard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A8B7C] gap-4">
          <div>
            © {new Date().getFullYear()} PathAI Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#FF4D31] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#FF4D31] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#FF4D31] cursor-pointer">Security Ontologies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
