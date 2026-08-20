import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-[#F1EFE7]/50 dark:bg-[#151514] border-y border-[#E8E6DE] dark:border-[#2C2C29] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9F8F3] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
            THE LEARNER COCKPIT
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Designed for daily focus and deep flow.
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4">
            A high-contrast, distraction-free environment that always surfaces your immediate next step.
          </p>
        </div>

        {/* Dashboard Mockup Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl overflow-hidden"
        >
          {/* Mockup Top Window Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F1EFE7]/80 dark:bg-[#1A1A18]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF4D31]"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-[#7A8B7C]"></div>
              <span className="ml-3 text-xs font-medium text-[#7A8B7C]">app.pathai.dev/dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-0.5 rounded-full bg-[#7A8B7C]/15 text-[#7A8B7C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B7C] animate-pulse"></span>
                AI Agent Active
              </span>
            </div>
          </div>

          {/* Dashboard Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Greeting Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
              <div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
                  Curriculum Preview ✦ Generative AI Engineer
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
                  Target Horizon: <strong className="text-[#1A1A1A] dark:text-white">12 Weeks</strong> • Autonomous AI Sequencing Active
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 bg-[#F9F8F3] dark:bg-[#252522] px-4 py-2 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29]">
                  <Flame className="w-4 h-4 text-[#FF4D31]" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1A1A1A] dark:text-white">14 Days</span>
                    <span className="text-[#7A8B7C] block text-[10px] font-bold">Active Streak</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-[#F9F8F3] dark:bg-[#252522] px-4 py-2 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29]">
                  <Clock className="w-4 h-4 text-[#7A8B7C]" />
                  <div className="text-xs">
                    <span className="font-bold text-[#1A1A1A] dark:text-white">28.5 hrs</span>
                    <span className="text-[#7A8B7C] block text-[10px] font-bold">Total Learned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Stats & Next Action Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Highlight (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Progress Metric Card */}
                <div className="p-6 rounded-3xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C]">
                      Overall Roadmap Progress
                    </span>
                    <span className="text-2xl font-display font-black text-[#FF4D31]">
                      68%
                    </span>
                  </div>

                  <div className="w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-3 rounded-full overflow-hidden mb-3">
                    <div className="bg-gradient-to-r from-[#FF4D31] to-[#7A8B7C] h-full rounded-full w-[68%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7A8B7C]">
                    <span>Stage 2 of 4 In Progress</span>
                    <span>14 of 21 Lessons Completed</span>
                  </div>
                </div>

                {/* Next Recommended Action Banner */}
                <div className="p-7 rounded-3xl bg-[#1A1A1A] text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-[#FF4D31]/15 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D31] mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>NEXT RECOMMENDED ACTION</span>
                  </div>

                  <h4 className="text-lg font-bold mb-1 group-hover:text-[#FF4D31] transition-colors">
                    Learn Vector Database Optimization & Hybrid Search
                  </h4>
                  <p className="text-xs text-stone-300 mb-6 leading-relaxed">
                    Current Milestone: <strong className="text-white">Build RAG Application</strong>. Master HNSW cosine topologies to complete your enterprise search pipeline.
                  </p>

                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#FF4D31] hover:bg-[#E8402A] text-white transition-all shadow-lg shadow-[#FF4D31]/20"
                  >
                    <span>Start 45-Min Coding Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right: Skill Competency Breakdown (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                      Skill Competency Radar
                    </span>
                    <span className="text-[11px] font-bold text-[#7A8B7C]">
                      +12% this week
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { skill: 'Python', score: 90, color: '#FF4D31' },
                      { skill: 'Machine Learning', score: 78, color: '#7A8B7C' },
                      { skill: 'Generative AI', score: 62, color: '#FF4D31' },
                      { skill: 'System Design', score: 41, color: '#7A8B7C' },
                    ].map((item) => (
                      <div key={item.skill}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-[#1A1A1A] dark:text-white">{item.skill}</span>
                          <span className="font-bold text-[#1A1A1A] dark:text-white">{item.score}%</span>
                        </div>
                        <div className="w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.score}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between text-xs font-semibold text-[#7A8B7C]">
                  <span>Target Benchmark: 85%</span>
                  <Link to="/register" className="text-[#FF4D31] hover:underline flex items-center gap-1">
                    <span>Full Diagnostic</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
