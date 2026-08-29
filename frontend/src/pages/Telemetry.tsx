import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Flame,
  Clock,
  Award,
  BarChart3,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  Activity,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roadmapService } from '../services/roadmap.service';
import { LearningRoadmap } from '../types/roadmap';
import { ThreeOrb } from '../components/3d/ThreeOrb';
import { TiltCard } from '../components/3d/TiltCard';

export const Telemetry: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  // Timeframe selector
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');

  const handleSignOut = async () => {
    navigate('/', { replace: true });
    await logout();
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const data = await roadmapService.getRoadmap();
        setRoadmap(data);
      } catch (err) {
        console.error('Failed to load roadmap telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const weeklyData = [3.5, 4.2, 2.8, 5.1, 4.0, 6.2, 4.4];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxWeekly = Math.max(...weeklyData);
  const totalHoursThisWeek = weeklyData.reduce((a, b) => a + b, 0);

  const allNodes = roadmap?.stages ? roadmap.stages.flatMap((s) => s.nodes) : [];
  const completedNodesCount = allNodes.filter((n) => n.status === 'completed').length || 3;
  const totalNodesCount = allNodes.length || 8;
  const progressPercent = roadmap?.overallProgress || 68;

  return (
    <div className="min-h-screen bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] flex flex-col transition-colors duration-300 relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1A1A18]/90 backdrop-blur-md border-b border-[#E8E6DE] dark:border-[#2C2C29] px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl hover:bg-[#F1EFE7] dark:hover:bg-[#252522] text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="w-px h-5 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF4D31] text-white flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-base">
              3D Learner <span className="text-[#FF4D31]">Cockpit</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recommendations"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-[#F1EFE7] dark:hover:bg-[#252522] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
            <span>Picks</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Top Hero Overview Banner */}
        <TiltCard maxTilt={4} scale={1.005}>
          <div className="bg-white/95 dark:bg-[#1A1A18]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Side: 3D Holographic Core + Learner Info */}
              <div className="flex items-center gap-6 sm:gap-8">
                <div className="shrink-0">
                  <ThreeOrb progress={progressPercent} size={110} />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-2 shadow-2xs">
                    ✦ 3D LEARNER TELEMETRY COCKPIT · LEVEL 3
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-[#1A1A1A] dark:text-white">
                    {user?.name || 'Alex Rivera'}'s Analytics
                  </h1>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-1.5 leading-relaxed">
                    Target Track: <strong className="text-[#1A1A1A] dark:text-white">{roadmap?.targetGoal || 'Generative AI Engineer'}</strong> • Target Velocity:{' '}
                    {roadmap?.estimatedCompletionWeeks || 14} weeks at {user?.profile?.weeklyHours || 12} hrs/week
                  </p>
                </div>
              </div>

              {/* Right Side: Key Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Streak */}
                <div className="bg-[#F9F8F3] dark:bg-[#121211] p-4 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="w-5 h-5 text-[#FF4D31]" />
                    <span className="text-[10px] font-bold text-emerald-500">+1 today</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold block">14 Days</span>
                    <span className="text-[#7A8B7C] text-[10px] uppercase font-bold tracking-wider">Streak</span>
                  </div>
                </div>

                {/* Total Logged Hours */}
                <div className="bg-[#F9F8F3] dark:bg-[#121211] p-4 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-[#7A8B7C]" />
                    <span className="text-[10px] font-bold text-[#7A8B7C]">Total</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold block">28.5 hrs</span>
                    <span className="text-[#7A8B7C] text-[10px] uppercase font-bold tracking-wider">Invested</span>
                  </div>
                </div>

                {/* Overall Mastery Score */}
                <div className="bg-[#F9F8F3] dark:bg-[#121211] p-4 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#FF4D31]/15 text-[#FF4D31] flex items-center justify-center font-black text-[10px]">
                      %
                    </div>
                    <span className="text-[10px] font-bold text-[#FF4D31]">Top 8%</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold block text-[#FF4D31]">{progressPercent}%</span>
                    <span className="text-[#7A8B7C] text-[10px] uppercase font-bold tracking-wider">Mastery</span>
                  </div>
                </div>

                {/* Milestones Cleared */}
                <div className="bg-[#F9F8F3] dark:bg-[#121211] p-4 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500">Verified</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold block">
                      {completedNodesCount}/{totalNodesCount}
                    </span>
                    <span className="text-[#7A8B7C] text-[10px] uppercase font-bold tracking-wider">Milestones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* Detailed Velocity & Skill Radar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Weekly Velocity & Day-by-Day Heatmap (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <TiltCard maxTilt={5} scale={1.01}>
              <div className="bg-white/95 dark:bg-[#1A1A18]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-1">
                      Time Investment Analytics
                    </span>
                    <h3 className="text-xl font-bold">Weekly Learning Velocity</h3>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F1EFE7] dark:bg-[#252522] p-1 rounded-xl text-xs font-semibold">
                    {(['7d', '30d', 'all'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer uppercase ${
                          timeframe === t
                            ? 'bg-white dark:bg-[#1A1A18] text-[#1A1A1A] dark:text-white font-bold shadow-2xs'
                            : 'text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Velocity Bar Graph */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-end justify-between gap-3 h-44 pt-8 pb-2 px-2 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                    {weeklyData.map((val, i) => {
                      const isToday = i === weeklyData.length - 1;
                      const heightPercent = (val / maxWeekly) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <span className="text-[10px] font-bold text-[#7A8B7C] opacity-0 group-hover:opacity-100 transition-opacity">
                            {val}h
                          </span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="w-full max-w-[40px] rounded-t-lg transition-all"
                            style={{
                              backgroundColor: isToday ? '#FF4D31' : '#7A8B7C',
                              opacity: isToday ? 1 : 0.65,
                            }}
                          />
                          <span
                            className={`text-xs font-bold ${
                              isToday ? 'text-[#FF4D31]' : 'text-[#7A8B7C]'
                            }`}
                          >
                            {daysOfWeek[i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <span className="text-[10px] text-[#7A8B7C] font-bold uppercase block">This Week</span>
                    <span className="text-lg font-bold text-[#1A1A1A] dark:text-white">{totalHoursThisWeek.toFixed(1)} hrs</span>
                    <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">+18% vs last week</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <span className="text-[10px] text-[#7A8B7C] font-bold uppercase block">Daily Average</span>
                    <span className="text-lg font-bold text-[#1A1A1A] dark:text-white">{(totalHoursThisWeek / 7).toFixed(1)} hrs/day</span>
                    <span className="text-[10px] text-[#7A8B7C] font-semibold block mt-0.5">Consistent pacing</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <span className="text-[10px] text-[#7A8B7C] font-bold uppercase block">Placement Target</span>
                    <span className="text-lg font-bold text-[#FF4D31]">Week 14</span>
                    <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">On-Track</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Right Column: Placement Readiness & Skill Radar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <TiltCard maxTilt={5} scale={1.01}>
              <div className="bg-white/95 dark:bg-[#1A1A18]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-md space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-1">
                    Market Readiness
                  </span>
                  <h3 className="text-lg font-bold">Hiring Bar Alignment</h3>
                </div>

                {/* Skill Bars */}
                <div className="space-y-3.5">
                  {[
                    { name: 'PyTorch & Neural Networks', level: 92, status: 'Mastered' },
                    { name: 'RAG & Vector Embeddings', level: 85, status: 'Advanced' },
                    { name: 'Autonomous Multi-Agent Swarms', level: 64, status: 'In Progress' },
                    { name: 'vLLM Serving & Quantization', level: 40, status: 'Upcoming' },
                  ].map((skill, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#1A1A1A] dark:text-white">{skill.name}</span>
                        <span className="text-[#7A8B7C] text-[11px]">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-[#E8E6DE] dark:bg-[#252522] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#FF4D31] h-full rounded-full transition-all duration-700"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29]">
                  <Link
                    to="/dashboard"
                    className="w-full py-3 rounded-2xl bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#FF4D31]/20 cursor-pointer"
                  >
                    <span>Resume Next Lesson in Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </main>
    </div>
  );
};
