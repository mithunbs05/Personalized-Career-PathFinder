import React from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 bg-[#F1EFE7] dark:bg-[#161615] border-t border-[#E8E6DE] dark:border-[#2C2C29] py-12 transition-colors duration-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Stats Bar from Design */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 mb-12 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
          <div className="flex items-center gap-4 md:border-r border-[#E8E6DE] dark:border-[#2C2C29] pr-4">
            <div className="text-4xl font-bold text-[#1A1A1A] dark:text-white">68%</div>
            <div className="text-[10px] font-bold uppercase leading-tight text-[#7A8B7C]">
              Average Course<br />Completion
            </div>
          </div>

  return (
    <footer className="relative bg-[#1A1A18] text-white pt-20 pb-10 overflow-hidden z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cohort Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-[#252522] border border-[#2C2C29] mb-16 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2C2C29] flex items-center justify-center overflow-hidden`}>
                    <div className="w-full h-full bg-gradient-to-br from-[#A0A09B] to-[#7A8B7C] opacity-80" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-[#F9F8F3]"><Users className="w-4 h-4 inline mr-1 text-[#9BB09E]" /> +12k Learners</span>
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-[#2C2C29]" />
            
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF4D31]" />
              <span className="text-sm font-bold text-[#F9F8F3]">68% Average Course Completion</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#121211] border border-[#2C2C29]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A0A09B]">All Learning Engines Operational</span>
          </div>
        </div>

        {/* 4 Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6 focus:outline-hidden">
              <div className="w-8 h-8 bg-[#FF4D31] rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-white">
                Path<span className="text-[#FF4D31]">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[#A0A09B] leading-relaxed mb-6">
              The AI-architected curriculum engine that maps exactly what you need to learn to reach the production hiring bar.
            </p>
          </div>

          {/* Platform Anchors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#curriculum" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Curriculum</a></li>
              <li><a href="#personalization" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Personalization</a></li>
              <li><a href="#features" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Features</a></li>
            </ul>
          </div>

          {/* Popular Tracks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Popular Tracks</h4>
            <ul className="space-y-3">
              <li><Link to="/register" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Generative AI Engineer</Link></li>
              <li><Link to="/register" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Full-Stack AI Architect</Link></li>
              <li><Link to="/register" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Autonomous Agent Specialist</Link></li>
              <li><Link to="/register" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Enterprise ML Engineer</Link></li>
            </ul>
          </div>

          {/* Account Routes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Account</h4>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="text-sm font-medium text-[#A0A09B] hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

        </div>

        {/* Copyright & Legal */}
        <div className="border-t border-[#2C2C29] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-[#7A8B7C]">
            © {currentYear} PathAI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-medium text-[#7A8B7C] hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs font-medium text-[#7A8B7C] hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-xs font-medium text-[#7A8B7C] hover:text-white transition-colors">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
