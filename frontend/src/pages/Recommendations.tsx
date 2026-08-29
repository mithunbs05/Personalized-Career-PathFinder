import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  BookOpen,
  Code,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  RefreshCw,
  Star,
  Clock,
  BarChart3,
  ArrowLeft,
  Lightbulb,
  Zap,
  Target,
  Search,
  Check,
  Bookmark,
  Share2,
  Layers,
  Award,
  Filter,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsService } from '../services/recommendations.service';
import type { RecommendationsResponse, CourseRecommendation, ProjectRecommendation, ResourceRecommendation } from '../types/recommendations';
import { TiltCard } from '../components/3d/TiltCard';
import confetti from 'canvas-confetti';

type TabType = 'courses' | 'projects' | 'resources';

export const Recommendations: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = async () => {
    navigate('/', { replace: true });
    await logout();
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'TopMatch'>('All');
  const [sortBy, setSortBy] = useState<'match' | 'duration' | 'title'>('match');

  // Interactive Detail Modal State
  const [selectedItem, setSelectedItem] = useState<{
    item: CourseRecommendation | ProjectRecommendation | ResourceRecommendation;
    type: TabType;
  } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const result = await recommendationsService.getRecommendations();
      setData(result);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await recommendationsService.refreshRecommendations();
      setData(result);
      setDismissedIds(new Set());
      showToast('Recommendations refreshed with latest skill telemetry!');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Refresh failed:', err);
      showToast('Could not refresh recommendations.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismiss = async (id: string, type: 'course' | 'project' | 'resource') => {
    setDismissedIds((prev) => new Set(prev).add(id));
    showToast('Recommendation dismissed.');
    try {
      await recommendationsService.dismissRecommendation(id, type);
    } catch (err) {
      console.error('Dismiss failed:', err);
    }
  };

  const handleSaveItem = (id: string, title: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`Removed "${title}" from saved list.`);
      } else {
        next.add(id);
        showToast(`Saved "${title}" to your active path queue!`);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      }
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const MatchScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 44 }) => {
    const radius = (size - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (circumference * score) / 100;
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-[#E8E6DE] dark:text-[#2C2C29]"
            strokeWidth="3"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#FF4D31"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#1A1A1A] dark:text-white">
          {score}%
        </span>
      </div>
    );
  };

  const DifficultyBadge: React.FC<{ level: string }> = ({ level }) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      Intermediate: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      Advanced: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[level] || colors.Intermediate}`}>
        {level}
      </span>
    );
  };

  // Filter & Sort Courses
  const filteredCourses = (data?.courses || [])
    .filter((c) => !dismissedIds.has(c.id))
    .filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.provider.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (levelFilter === 'TopMatch') return c.matchScore >= 90;
      if (levelFilter !== 'All') return c.level === levelFilter;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'duration') return a.durationHours - b.durationHours;
      return a.title.localeCompare(b.title);
    });

  // Filter & Sort Projects
  const filteredProjects = (data?.projects || [])
    .filter((p) => !dismissedIds.has(p.id))
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;

      if (levelFilter === 'TopMatch') return p.matchScore >= 90;
      if (levelFilter !== 'All') return p.difficulty === levelFilter;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'duration') return a.estimatedHours - b.estimatedHours;
      return a.title.localeCompare(b.title);
    });

  // Filter & Sort Resources
  const filteredResources = (data?.resources || [])
    .filter((r) => !dismissedIds.has(r.id))
    .filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.provider.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (levelFilter === 'TopMatch') return r.matchScore >= 90;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      return a.title.localeCompare(b.title);
    });

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" />, count: filteredCourses.length },
    { id: 'projects', label: 'Projects', icon: <Code className="w-3.5 h-3.5" />, count: filteredProjects.length },
    { id: 'resources', label: 'Resources', icon: <FileText className="w-3.5 h-3.5" />, count: filteredResources.length },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] flex flex-col transition-colors duration-300 relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] text-xs font-semibold shadow-2xl border border-[#FF4D31]/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF4D31]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1A1A18]/90 backdrop-blur-md border-b border-[#E8E6DE] dark:border-[#2C2C29] px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Learner Cockpit</span>
          </button>
          <div className="w-px h-5 bg-[#E8E6DE] dark:bg-[#2C2C29]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF4D31] flex items-center justify-center text-white shadow-md shadow-[#FF4D31]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg">
              Path<span className="text-[#FF4D31]">AI</span>
              <span className="text-[#7A8B7C] text-sm font-normal ml-2">Personalized Recommendations</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-xs font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Recommendations</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Summary Banner */}
        {data?.profileSummary && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4D31]/10 rounded-full text-[10px] font-bold tracking-widest text-[#FF4D31] uppercase mb-2">
                  <Target className="w-3 h-3" /> AI-PERSONALIZED TELEMETRY
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">
                  Curated Learning Recommendations
                </h1>
                <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
                  Synthesized for your <strong className="text-[#1A1A1A] dark:text-white">{data.profileSummary.targetGoal}</strong> goal
                  {data.profileSummary.topSkillGaps.length > 0 && (
                    <>
                      {' '}• Bridging critical gaps in{' '}
                      <strong className="text-[#FF4D31]">{data.profileSummary.topSkillGaps.join(', ')}</strong>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {data.profileSummary.topSkillGaps.map((gap) => (
                  <div
                    key={gap}
                    className="flex items-center gap-2 bg-[#F9F8F3] dark:bg-[#121211] px-3 py-2 rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29]"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#FF4D31]" />
                    <span className="text-[11px] font-bold">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab & Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 bg-white dark:bg-[#1A1A18] p-1.5 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#FF4D31] text-white shadow-md shadow-[#FF4D31]/20 font-bold'
                    : 'text-[#4A4A4A] dark:text-[#A0A09B] hover:bg-[#F1EFE7] dark:hover:bg-[#252522]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-[#F1EFE7] dark:bg-[#252522]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Filter Pills & Sort Bar */}
          <div className="bg-white dark:bg-[#1A1A18] p-4 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8B7C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword, skill, or provider..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs focus:outline-hidden focus:border-[#FF4D31]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'Beginner', 'Intermediate', 'Advanced', 'TopMatch'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    levelFilter === lvl
                      ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                      : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#7A8B7C] hover:text-[#1A1A1A]'
                  }`}
                >
                  {lvl === 'TopMatch' ? '★ 90%+ Match' : lvl}
                </button>
              ))}

              <div className="w-px h-5 bg-[#E8E6DE] dark:bg-[#2C2C29] mx-1" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-semibold focus:outline-hidden"
              >
                <option value="match">Sort: Highest Match</option>
                <option value="duration">Sort: Duration</option>
                <option value="title">Sort: Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-12 border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4D31]/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#FF4D31] animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-[#7A8B7C]">Analyzing skill telemetry and scoring matches...</p>
          </div>
        )}

        {/* Courses Tab */}
        {!loading && activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => (
                <TiltCard key={course.id} maxTilt={6} scale={1.01}>
                  <div className="bg-white dark:bg-[#1A1A18] rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                    <div>
                      <div className="h-1.5" style={{ backgroundColor: course.thumbnailColor }} />
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <DifficultyBadge level={course.level} />
                              <span className="text-[10px] text-[#7A8B7C] font-semibold">{course.provider}</span>
                            </div>
                            <h3 className="text-sm font-bold leading-snug">{course.title}</h3>
                          </div>
                          <MatchScoreRing score={course.matchScore} />
                        </div>

                      <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">{course.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-[#A0A09B]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#7A8B7C]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold">{course.durationHours} hours</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3 h-3" />
                          <span className="font-semibold">{course.matchScore}% Match Score</span>
                        </div>
                      </div>

                      {/* Expandable AI Reasoning Section */}
                      <button
                        onClick={() => toggleExpand(course.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] text-xs font-semibold text-[#7A8B7C] hover:text-[#FF4D31] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-[#FF4D31]" />
                          <span>Why recommended for you?</span>
                        </div>
                        {expandedCards.has(course.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <AnimatePresence>
                        {expandedCards.has(course.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 py-2.5 rounded-xl bg-[#FF4D31]/5 border border-[#FF4D31]/15 text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                              <span className="font-bold text-[#FF4D31]">AI Reasoning: </span>
                              {course.reasoning}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedItem({ item: course, type: 'courses' })}
                        className="flex-1 py-2.5 rounded-xl bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#FF4D31]/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Start Learning</span>
                      </button>
                      <button
                        onClick={() => handleSaveItem(course.id, course.title)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          savedIds.has(course.id)
                            ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] border-transparent'
                            : 'border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:border-[#FF4D31]'
                        }`}
                        title="Save to Active Path"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDismiss(course.id, 'course')}
                        className="p-2.5 rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:text-[#FF4D31] hover:border-[#FF4D31] transition-colors cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Projects Tab */}
        {!loading && activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <TiltCard key={project.id} maxTilt={6} scale={1.01}>
                  <div className="bg-white dark:bg-[#1A1A18] rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <DifficultyBadge level={project.difficulty} />
                        <MatchScoreRing score={project.matchScore} size={38} />
                      </div>

                      <h3 className="text-sm font-bold leading-snug">{project.title}</h3>
                      <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">{project.description}</p>

                      <div className="p-3 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D31] block mb-1">
                          Deliverable
                        </span>
                        <p className="text-[11px] text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">{project.deliverable}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {project.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-[#A0A09B]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#7A8B7C]">
                        <Clock className="w-3 h-3" />
                        <span className="font-semibold">{project.estimatedHours} hours estimated</span>
                      </div>

                      <button
                        onClick={() => toggleExpand(project.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] text-xs font-semibold text-[#7A8B7C] hover:text-[#FF4D31] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-[#FF4D31]" />
                          <span>Why recommended?</span>
                        </div>
                        {expandedCards.has(project.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <AnimatePresence>
                        {expandedCards.has(project.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 py-2.5 rounded-xl bg-[#FF4D31]/5 border border-[#FF4D31]/15 text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                              <span className="font-bold text-[#FF4D31]">AI Reasoning: </span>
                              {project.reasoning}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="p-5 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedItem({ item: project, type: 'projects' })}
                        className="flex-1 py-2.5 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>Start Building</span>
                      </button>
                      <button
                        onClick={() => handleSaveItem(project.id, project.title)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          savedIds.has(project.id)
                            ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] border-transparent'
                            : 'border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:border-[#FF4D31]'
                        }`}
                        title="Save Project"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDismiss(project.id, 'project')}
                        className="p-2.5 rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:text-[#FF4D31] hover:border-[#FF4D31] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Resources Tab */}
        {!loading && activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource) => {
                const typeColors: Record<string, string> = {
                  documentation: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                  tutorial: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
                  tool: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                  book: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                  'video-series': 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                  community: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
                };

                return (
                  <TiltCard key={resource.id} maxTilt={6} scale={1.01}>
                    <div className="bg-white dark:bg-[#1A1A18] rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              typeColors[resource.type] || typeColors.documentation
                            }`}
                          >
                            <span className="uppercase tracking-wider">{resource.type}</span>
                          </div>
                          <MatchScoreRing score={resource.matchScore} size={38} />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold leading-snug mb-1">{resource.title}</h3>
                          <span className="text-[11px] text-[#7A8B7C] font-semibold">{resource.provider}</span>
                          <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mt-2">{resource.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-[#A0A09B]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => toggleExpand(resource.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] text-xs font-semibold text-[#7A8B7C] hover:text-[#FF4D31] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-[#FF4D31]" />
                            <span>Why recommended?</span>
                          </div>
                          {expandedCards.has(resource.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <AnimatePresence>
                          {expandedCards.has(resource.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 py-2.5 rounded-xl bg-[#FF4D31]/5 border border-[#FF4D31]/15 text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                                <span className="font-bold text-[#FF4D31]">AI Reasoning: </span>
                                {resource.reasoning}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="p-5 pt-0 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem({ item: resource, type: 'resources' })}
                          className="flex-1 py-2.5 rounded-xl bg-[#7A8B7C] hover:bg-[#6A7B6C] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Inspect Resource</span>
                        </button>
                        <button
                          onClick={() => handleSaveItem(resource.id, resource.title)}
                          className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            savedIds.has(resource.id)
                              ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] border-transparent'
                              : 'border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:border-[#FF4D31]'
                          }`}
                          title="Save Resource"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDismiss(resource.id, 'resource')}
                          className="p-2.5 rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:text-[#FF4D31] hover:border-[#FF4D31] transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Interactive Detail Modal for Course/Project/Resource */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FF4D31]/10 text-[#FF4D31]">
                    {selectedItem.type.slice(0, -1)}
                  </span>
                  <span className="text-xs font-bold text-[#7A8B7C]">{selectedItem.item.matchScore}% Personalized Match</span>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold mb-2">{selectedItem.item.title}</h3>
                <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">{selectedItem.item.description}</p>
              </div>

              {/* Match Factors Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D31] block">
                  AI Fit Dimension Telemetry
                </span>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <span className="font-bold text-[#1A1A1A] dark:text-white block">98%</span>
                    <span className="text-[10px] text-[#7A8B7C]">Goal Alignment</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <span className="font-bold text-[#FF4D31] block">95%</span>
                    <span className="text-[10px] text-[#7A8B7C]">Gap Coverage</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29]">
                    <span className="font-bold text-[#7A8B7C] block">92%</span>
                    <span className="text-[10px] text-[#7A8B7C]">Pace Fit</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FF4D31]/5 border border-[#FF4D31]/15 text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                  <strong className="text-[#FF4D31]">Why Selected: </strong>
                  {selectedItem.item.reasoning}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleSaveItem(selectedItem.item.id, selectedItem.item.title);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#FF4D31]/20"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Add to Active Learning Path</span>
                </button>
                <button
                  onClick={() => {
                    showToast('Sharing link copied to clipboard!');
                    setSelectedItem(null);
                  }}
                  className="p-3 rounded-full border border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] hover:border-[#FF4D31] transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
