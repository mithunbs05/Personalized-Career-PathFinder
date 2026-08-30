import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Flame, Clock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoadmapCanvas } from '../components/roadmap/RoadmapCanvas';
import { StageDetailsPanel } from '../components/roadmap/StageDetailsPanel';
import SkillMatrix from '../components/roadmap/SkillMatrix';
import { AIMentorPage } from '../components/mentor/AIMentorPage';
import { MultiModalTransformer } from '../components/transformer/MultiModalTransformer';
import {
  roadmapService,
  RoadmapOverviewResponse,
  RoadmapStageDetail,
  RoadmapStageSummary,
} from '../services/roadmap.service';

// Fallback baseline stages if initial load is pending
const DEFAULT_STAGES: RoadmapStageSummary[] = [
  { id: 1, title: 'Programming Foundations', status: 'COMPLETED', difficulty: 'Beginner', estimated_duration: '2 Weeks', progress: 100, is_final_capstone: false, skills: ['Python OOP', 'Data Types'] },
  { id: 2, title: 'Python for AI', status: 'COMPLETED', difficulty: 'Beginner', estimated_duration: '3 Weeks', progress: 100, is_final_capstone: false, skills: ['NumPy & Pandas', 'Data Wrangling'] },
  { id: 3, title: 'Mathematics & Statistics', status: 'IN_PROGRESS', difficulty: 'Intermediate', estimated_duration: '4 Weeks', progress: 45, is_final_capstone: false, skills: ['Linear Algebra', 'Calculus', 'Probability', 'Optimization'] },
  { id: 4, title: 'Machine Learning', status: 'AVAILABLE', difficulty: 'Intermediate', estimated_duration: '4 Weeks', progress: 0, is_final_capstone: false, skills: ['Scikit-Learn', 'Regression', 'Random Forests'] },
  { id: 5, title: 'Deep Learning', status: 'LOCKED', difficulty: 'Advanced', estimated_duration: '5 Weeks', progress: 0, is_final_capstone: false, skills: ['PyTorch', 'Neural Nets'] },
  { id: 6, title: 'Natural Language Processing', status: 'LOCKED', difficulty: 'Advanced', estimated_duration: '3 Weeks', progress: 0, is_final_capstone: false, skills: ['Transformers', 'Tokenization'] },
  { id: 7, title: 'Generative AI & LLMs', status: 'LOCKED', difficulty: 'Advanced', estimated_duration: '4 Weeks', progress: 0, is_final_capstone: false, skills: ['Fine-Tuning (LoRA)', 'Prompt Engineering'] },
  { id: 8, title: 'RAG & AI Applications', status: 'LOCKED', difficulty: 'Advanced', estimated_duration: '4 Weeks', progress: 0, is_final_capstone: false, skills: ['RAG', 'Vector DBs'] },
  { id: 9, title: 'Deployment & MLOps', status: 'LOCKED', difficulty: 'Advanced', estimated_duration: '4 Weeks', progress: 0, is_final_capstone: false, skills: ['FastAPI & Docker', 'CI/CD'] },
  { id: 10, title: 'Final AI Engineering Capstone', status: 'LOCKED', difficulty: 'Advanced', estimated_duration: '4 Weeks', progress: 0, is_final_capstone: true, skills: ['End-to-End System Design'] },
];

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState<RoadmapOverviewResponse | null>(null);

  // Persist selected tab across page reloads
  const [activeTab, setActiveTab] = useState<'roadmap' | 'skills' | 'mentor' | 'practice'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (['roadmap', 'skills', 'mentor', 'practice'].includes(hash)) {
      return hash as any;
    }
    const saved = localStorage.getItem('pathai_active_tab');
    if (saved && ['roadmap', 'skills', 'mentor', 'practice'].includes(saved)) {
      return saved as any;
    }
    return 'roadmap';
  });

  // Persist selected stage across page reloads
  const [selectedStageId, setSelectedStageId] = useState<number | null>(() => {
    const saved = localStorage.getItem('pathai_selected_stage_id');
    return saved ? Number(saved) : null;
  });

  // Persist dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('pathai_dark_mode') === 'true';
  });

  const [stageDetail, setStageDetail] = useState<RoadmapStageDetail | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingStage, setIsLoadingStage] = useState(false);

  // Sync activeTab to localStorage and URL hash
  useEffect(() => {
    localStorage.setItem('pathai_active_tab', activeTab);
    window.location.hash = activeTab;
  }, [activeTab]);

  // Sync selectedStageId to localStorage
  useEffect(() => {
    if (selectedStageId !== null) {
      localStorage.setItem('pathai_selected_stage_id', String(selectedStageId));
    } else {
      localStorage.removeItem('pathai_selected_stage_id');
    }
  }, [selectedStageId]);

  // Sync isDarkMode to localStorage
  useEffect(() => {
    localStorage.setItem('pathai_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Load Roadmap Overview from Backend
  const loadRoadmap = useCallback(async () => {
    try {
      setIsLoadingOverview(true);
      const data = await roadmapService.getRoadmap();
      setOverview(data);
    } catch (err) {
      console.warn('Failed to load roadmap from backend, using fallback:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // Load Selected Stage Details from Backend
  useEffect(() => {
    if (!selectedStageId) {
      setStageDetail(null);
      return;
    }

    let isMounted = true;
    const fetchStage = async () => {
      try {
        setIsLoadingStage(true);
        const detail = await roadmapService.getStageDetails(selectedStageId);
        if (isMounted) {
          setStageDetail(detail);
        }
      } catch (err) {
        console.error('Failed to load stage detail:', err);
      } finally {
        if (isMounted) setIsLoadingStage(false);
      }
    };

    fetchStage();
    return () => {
      isMounted = false;
    };
  }, [selectedStageId]);

  // Handler for starting a stage
  const handleStartStage = async (stageId: number) => {
    try {
      await roadmapService.startStage(stageId);
      // Reload roadmap and active stage details to update statuses
      await loadRoadmap();
      const updated = await roadmapService.getStageDetails(stageId);
      setStageDetail(updated);
    } catch (err) {
      console.error('Failed to start stage:', err);
    }
  };

  // Cross-system navigation to AI Mentor with contextual state
  const handleNavigateToMentor = (context: {
    stageTitle: string;
    skillName: string;
    topicTitle?: string;
    mastery: number;
  }) => {
    setActiveTab('mentor');
  };

  // Cross-system navigation to Skill Matrix
  const handleNavigateToSkills = (_skillName?: string) => {
    setActiveTab('skills');
  };

  const stagesList = overview?.stages || DEFAULT_STAGES;
  const progressPercentage = overview?.overall_progress || 20;

  return (
    <div className={isDarkMode ? 'dark-mode-active' : ''}>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ff4726] flex items-center justify-center text-white shadow-md shadow-[#ff4726]/20">
                <span className="font-black text-sm leading-none">›</span>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Path<span className="text-[#ff4726]">AI</span>
              </span>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full text-[10px] font-extrabold tracking-wider text-slate-600 dark:text-slate-300 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {overview?.target_role || 'AI/ML ENGINEER'}
              </div>
            </div>

            {/* Tab Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-semibold">
              {[
                { id: 'roadmap', label: 'Roadmap Timeline' },
                { id: 'skills', label: 'Skill Matrix' },
                { id: 'mentor', label: 'AI Mentor' },
                { id: 'practice', label: 'Content Transformer' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {activeTab === 'roadmap' ? (
            <div className="space-y-6">
              {/* Learner Cockpit Metrics */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span> Learner Cockpit
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back, {user?.name || overview?.user_name || 'Learner'}!
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Target Role: <strong className="text-slate-900 dark:text-white">{overview?.target_role || 'AI/ML Engineer'}</strong> • Target Pace: <strong className="text-slate-900 dark:text-white">15 hrs/week</strong> • Remaining: <strong className="text-slate-900 dark:text-white">~{overview?.estimated_remaining_weeks || 18} weeks</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {/* Streak */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[140px]">
                    <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg text-[#ea580c]">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-lg leading-none">14 Days</span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Streak</span>
                    </div>
                  </div>

                  {/* Logged Time */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[140px]">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-lg leading-none">28.5 hrs</span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Logged Time</span>
                    </div>
                  </div>

                  {/* Mastery Progress */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[160px]">
                    <div className="relative w-11 h-11 flex-shrink-0">
                      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" />
                        <circle
                          cx="18" cy="18" r="14" fill="none" stroke="#ea580c" strokeWidth="3.5"
                          strokeDasharray="88" strokeDashoffset={88 - (88 * progressPercentage) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-900 dark:text-white">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-lg leading-none">Mastery</span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Overall</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Canvas Column */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adaptive Curriculum Timeline</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Interactive node graph of your prerequisite dependencies</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse"></span> In Progress
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Ready to Start
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></span> Locked
                      </span>
                    </div>
                  </div>

                  {/* React Flow Canvas Component */}
                  <RoadmapCanvas
                    stages={stagesList}
                    selectedStageId={selectedStageId}
                    onSelectStage={(id) => setSelectedStageId(id)}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Right Sticky Column — Enhanced Stage Details & Overview */}
                <div className="lg:col-span-4 relative">
                  <StageDetailsPanel
                    stage={stageDetail}
                    overview={overview}
                    isLoading={isLoadingStage}
                    onSelectStage={(id) => setSelectedStageId(id)}
                    onStartStage={handleStartStage}
                    onNavigateToMentor={handleNavigateToMentor}
                    onNavigateToSkills={handleNavigateToSkills}
                    onCloseSelection={() => setSelectedStageId(null)}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'skills' ? (
            <SkillMatrix />
          ) : activeTab === 'mentor' ? (
            <AIMentorPage stages={stagesList as any} user={user} onNavigate={setActiveTab} />
          ) : activeTab === 'practice' ? (
            <MultiModalTransformer />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
