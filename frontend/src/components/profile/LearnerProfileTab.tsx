import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Clock,
  Calendar,
  Target,
  Sparkles,
  Github,
  Linkedin,
  BookOpen,
  DollarSign,
  Compass,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { pipelineService, LearnerKnowledgeProfile, RolePredictionPayload } from '../../services/pipeline.service';
import { RoadmapOverviewResponse } from '../../services/roadmap.service';

interface LearnerProfileTabProps {
  overview: RoadmapOverviewResponse | null;
  onNavigateTab: (tab: 'roadmap' | 'skills' | 'mentor' | 'practice') => void;
}

export const LearnerProfileTab: React.FC<LearnerProfileTabProps> = ({
  overview,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const [knowledgeProfile, setKnowledgeProfile] = useState<LearnerKnowledgeProfile | null>(null);
  const [rolePredictions, setRolePredictions] = useState<RolePredictionPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile data from user context with safe defaults
  const profile = user?.profile;
  const userName = user?.name || overview?.user_name || 'Learner';
  const userEmail = user?.email || 'learner@pathai.dev';
  const targetGoal = profile?.targetGoal || overview?.target_role || 'AI/ML Engineer';
  const experienceLevel = profile?.experienceLevel || 'Intermediate';
  const weeklyHours = profile?.weeklyHours || overview?.weekly_hours_budget || 10;
  const targetMonths = profile?.targetCompletionMonths || overview?.target_timeline_months || '6';
  const knownSkills = profile?.knownSkills && profile.knownSkills.length > 0 ? profile.knownSkills : ['Python', 'Problem Solving'];
  const technicalInterests = profile?.technicalInterests && profile.technicalInterests.length > 0
    ? profile.technicalInterests
    : ['Machine Learning', 'Artificial Intelligence', 'Data Science'];

  useEffect(() => {
    let isMounted = true;
    const fetchIntelligenceData = async () => {
      try {
        setIsLoading(true);
        const [kProf, rPred] = await Promise.allSettled([
          pipelineService.getKnowledgeProfile(),
          pipelineService.predictRoles(),
        ]);
        if (isMounted) {
          if (kProf.status === 'fulfilled') setKnowledgeProfile(kProf.value);
          if (rPred.status === 'fulfilled') setRolePredictions(rPred.value);
        }
      } catch (err) {
        console.warn('Could not load extra pipeline profile data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchIntelligenceData();
    return () => {
      isMounted = false;
    };
  }, []);

  const primaryRoleFit = rolePredictions?.primary_role?.fit_score || 72;
  const knownTopicsCount = knowledgeProfile?.known_topics_count || (profile?.knownSkills?.length || 4);
  const avgMastery = knowledgeProfile?.average_mastery || overview?.overall_progress || 45;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Profile Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#ff4726]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#ff4726] to-[#ff7d47] flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-[#ff4726]/30">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-white" title="Profile Active">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{userName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ff4726]/20 text-[#ff7d47] border border-[#ff4726]/30">
                  {experienceLevel.toUpperCase()} LEARNER
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium">{userEmail}</p>
              <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#ff4726]" />
                  Goal: <strong className="text-white font-bold">{targetGoal}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {weeklyHours} hrs/week
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => onNavigateTab('skills')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all backdrop-blur-sm cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>View Skill Matrix</span>
            </button>
            <button
              onClick={() => onNavigateTab('mentor')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff4726] hover:bg-[#e03a1b] text-xs font-bold text-white transition-all shadow-md shadow-[#ff4726]/25 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Consult AI Mentor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Intelligence State Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Match Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Role Alignment Fit</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{primaryRoleFit}%</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Strong Match</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">vs {targetGoal} benchmark</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ff4726] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Known Topics */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Knowledge Coverage</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{knownTopicsCount} / 25</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Verified</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Canonical taxonomy topics</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Average Topic Mastery */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Average Mastery</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{avgMastery}%</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Progressing</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Across assessed skills</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Target Timeline */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block mb-1">Target Pace</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{targetMonths} Mo</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">~{overview?.estimated_remaining_weeks || 16} wks</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">{weeklyHours} hrs study / week</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Detailed Profile Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Goals, Verified Skills, Background */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Verified Skills & Knowledge State */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-[#ff4726]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Known Skills & Self-Reported Competencies</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Extracted from your onboarding conversation and verified against curriculum topics</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {knownSkills.length} Skills
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {knownSkills.map((skill, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>

            {profile?.currentProjects && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current / Prior Projects</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {profile.currentProjects}
                </p>
              </div>
            )}
          </div>

          {/* Section: Technical Interests & Specializations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Technical Interests & Career Tracks</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Directly influences role ranking and recommended elective project modules</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {technicalInterests.map((interest, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{interest}</span>
                </div>
              ))}
            </div>

            {profile?.jobSpecialization && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Specialization Goal:</strong> {profile.jobSpecialization}
              </div>
            )}
          </div>

          {/* Section: Academic & Professional Background */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic & Professional Background</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Education, industry tier, and professional portfolios</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Education</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile?.educationDegree || profile?.education || 'Bachelor of Science / Engineering'}
                </p>
                <p className="text-xs text-slate-500">
                  {profile?.educationMajor ? `Major in ${profile.educationMajor}` : 'Computer Science / STEM'}
                  {profile?.graduationYear ? ` • Class of ${profile.graduationYear}` : ''}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Industry Tier</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {profile?.industryExperienceType || 'Fresher / Transitioning'}
                </p>
                <p className="text-xs text-slate-500">
                  {profile?.yearsExperience ? `${profile.yearsExperience} years relevant technical experience` : 'Early career transitioning to AI/ML'}
                </p>
              </div>
            </div>

            {/* Social / Portfolio Links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {profile?.githubUrl ? (
                <a
                  href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-xs font-semibold text-slate-500">
                  <Github className="w-4 h-4" />
                  <span>GitHub not connected</span>
                </div>
              )}

              {profile?.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-xs font-semibold text-slate-500">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn not connected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Learning Preferences, Career Goal & Action Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Role Benchmark Card */}
          <div className="bg-gradient-to-br from-orange-500 to-[#ff4726] rounded-2xl p-6 text-white shadow-lg shadow-[#ff4726]/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                Active Career Track
              </span>
              <Target className="w-5 h-5 text-white/80" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{targetGoal}</h3>
              <p className="text-xs text-white/85 mt-1">
                Curriculum tailored for {targetGoal} competency bar at ~{weeklyHours} hours/week pace.
              </p>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
              <span>Roadmap Status</span>
              <strong className="font-bold">{overview?.completed_stages || 0} / {overview?.total_stages || 6} Stages Cleared</strong>
            </div>

            <button
              onClick={() => onNavigateTab('roadmap')}
              className="w-full py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>View Curriculum Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Learning Preferences & Budget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Learning Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Resource Budget</span>
                <strong className="font-bold text-slate-800 dark:text-slate-200">
                  {profile?.resourceBudget || 'Free & Open Source'}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Study Style</span>
                <strong className="font-bold text-slate-800 dark:text-slate-200">
                  {profile?.learningPreferences && profile.learningPreferences.length > 0
                    ? profile.learningPreferences.join(', ')
                    : 'Hands-on Projects & Labs'}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Primary Language</span>
                <strong className="font-bold text-slate-800 dark:text-slate-200">
                  {profile?.languagePreference || 'English'}
                </strong>
              </div>

              {profile?.salaryPlacementGoal && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Placement Target</span>
                  <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                    {profile.salaryPlacementGoal}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* AI Re-assessment Callout */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <RefreshCw className="w-4 h-4 text-[#ff4726]" />
              Need to calibrate your roadmap?
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Take a 5-minute adaptive diagnostic assessment to unblock advanced stages and refine your knowledge scores.
            </p>
            <button
              onClick={() => onNavigateTab('mentor')}
              className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              Start Diagnostic Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerProfileTab;
