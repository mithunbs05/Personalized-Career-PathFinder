import React, { useState } from 'react';
import {
  RoadmapStageDetail,
  RoadmapOverviewResponse,
  RoadmapTopicItem,
  LearningResourceItem,
} from '../../services/roadmap.service';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  BrainCircuit,
  Bot,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Target,
  Clock,
  GraduationCap,
  FileText,
  Video,
  Code2,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface StageDetailsPanelProps {
  stage: RoadmapStageDetail | null;
  overview: RoadmapOverviewResponse | null;
  isLoading: boolean;
  onSelectStage: (stageId: number) => void;
  onStartStage: (stageId: number) => void;
  onNavigateToMentor?: (context: { stageTitle: string; skillName: string; topicTitle?: string; mastery: number }) => void;
  onNavigateToSkills?: (skillName?: string) => void;
  onCloseSelection: () => void;
}

export const StageDetailsPanel: React.FC<StageDetailsPanelProps> = ({
  stage,
  overview,
  isLoading,
  onSelectStage,
  onStartStage,
  onNavigateToMentor,
  onNavigateToSkills,
  onCloseSelection,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopicItem | null>(null);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'COURSE':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'DOCUMENTATION':
        return <FileText className="w-3.5 h-3.5" />;
      case 'VIDEO':
        return <Video className="w-3.5 h-3.5" />;
      case 'PRACTICE':
        return <Code2 className="w-3.5 h-3.5" />;
      case 'ASSESSMENT':
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'COURSE':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'DOCUMENTATION':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'VIDEO':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'PRACTICE':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4 animate-pulse h-[800px]">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 1: ROADMAP OVERVIEW (When no stage is selected)
  // ---------------------------------------------------------------------------
  if (!stage) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[800px] overflow-hidden lg:sticky lg:top-24">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#ea580c] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Adaptive Curriculum
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Roadmap Overview</h2>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {overview?.target_role || 'AI/ML Engineer'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Progress Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Curriculum Completion</span>
              <span className="text-2xl font-black text-[#ea580c]">{overview?.overall_progress || 20}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${overview?.overall_progress || 20}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <span>{overview?.completed_stages || 2} of {overview?.total_stages || 10} Stages Completed</span>
              <span>~{overview?.estimated_remaining_weeks || 18} Weeks Remaining</span>
            </div>
          </div>

          {/* YOU ARE HERE Card */}
          {overview?.current_stage && (
            <div className="p-4 rounded-xl border-2 border-[#ea580c]/40 bg-orange-50/50 dark:bg-orange-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] animate-ping" />
                  <span className="text-[11px] font-black tracking-wider text-[#ea580c] uppercase">
                    YOU ARE HERE • Stage {overview.current_stage.id}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {overview.current_stage.progress}% Complete
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {overview.current_stage.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Difficulty: <strong>{overview.current_stage.difficulty}</strong> • Est: {overview.current_stage.estimated_duration}
              </p>
              <button
                onClick={() => onSelectStage(overview.current_stage!.id)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#ea580c] hover:bg-[#d84d08] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Continue Active Stage
              </button>
            </div>
          )}

          {/* Next Recommended Action */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Target className="w-4 h-4 text-[#ea580c]" /> Next Best Action
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {overview?.next_recommended_action || "Complete the core syllabus and practice problems to advance your stage mastery."}
            </p>
          </div>

          {/* Blocker Alert if present */}
          {overview?.current_blocker && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Active Blocker: </strong>
                {overview.current_blocker}
              </div>
            </div>
          )}

          {/* Stage Switcher List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">All Stages</h4>
            <div className="space-y-1.5">
              {overview?.stages.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStage(s.id)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]",
                    s.status === 'COMPLETED' ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40" :
                    s.status === 'IN_PROGRESS' ? "bg-orange-50/40 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/40" :
                    s.status === 'AVAILABLE' ? "bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40" :
                    "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                      s.status === 'COMPLETED' ? "bg-emerald-500 text-white" :
                      s.status === 'IN_PROGRESS' ? "bg-[#ea580c] text-white" :
                      s.status === 'AVAILABLE' ? "bg-blue-500 text-white" :
                      "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    )}>
                      {s.status === 'COMPLETED' ? '✓' : s.id}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{s.title}</h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{s.difficulty} • {s.estimated_duration}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW 2: SELECTED STAGE DETAILS
  // ---------------------------------------------------------------------------
  const isCompleted = stage.status === 'COMPLETED';
  const isInProgress = stage.status === 'IN_PROGRESS';
  const isAvailable = stage.status === 'AVAILABLE' || stage.status === 'NOT_STARTED';
  const isLocked = stage.status === 'LOCKED';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[800px] overflow-hidden lg:sticky lg:top-24">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-[#ea580c] tracking-wider uppercase bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full">
              {stage.is_final_capstone ? 'FINAL CAPSTONE' : `STAGE ${stage.id}`}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
              {stage.difficulty}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
              {stage.estimated_duration}
            </span>
          </div>

          <button
            onClick={onCloseSelection}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            ✕ Overview
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {stage.title}
          </h2>
          <span className={cn(
            "text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0",
            isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" :
            isInProgress ? "bg-orange-50 text-[#ea580c] border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800" :
            isAvailable ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800" :
            "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          )}>
            {stage.status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Stage Progress: {stage.progress}%</span>
            <span>{stage.completed_topics} / {stage.total_topics} Topics Mastered</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCompleted ? "bg-emerald-500" :
                isInProgress ? "bg-[#ea580c]" :
                "bg-blue-500"
              )}
              style={{ width: `${stage.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Why learn this */}
        <div className="p-4 rounded-xl bg-[#fff7ed] dark:bg-orange-950/20 border border-[#ffedd5] dark:border-orange-900/30 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c]">
            <HelpCircle className="w-4 h-4" /> Why do I need to learn this?
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {stage.why_learn}
          </p>
          {stage.career_relevance && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-orange-200/40 dark:border-orange-900/30">
              🎯 <strong>Career Link:</strong> {stage.career_relevance}
            </p>
          )}
        </div>

        {/* Prerequisites Section */}
        {stage.prerequisites.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Prerequisite Requirements
            </h3>
            <div className="space-y-1.5">
              {stage.prerequisite_checks.map((p, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-2.5 rounded-lg border text-xs flex items-center justify-between",
                    p.satisfied
                      ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {p.satisfied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-semibold">{p.stage_title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border">
                    {p.satisfied ? 'Satisfied' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Best Action Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
          <Target className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase">Next Best Action</div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{stage.next_best_action}</p>
          </div>
        </div>

        {/* Curriculum Topic List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Curriculum Topics & Mastery
            </h3>
            <span className="text-[10px] text-slate-500">{stage.topics.length} topics</span>
          </div>

          <div className="space-y-2">
            {stage.topics.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTopic(t)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer",
                  selectedTopic?.id === t.id
                    ? "border-[#ea580c] bg-orange-50/20 dark:bg-orange-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    t.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    t.status === 'IN_PROGRESS' ? "bg-orange-50 text-[#ea580c] border-orange-200" :
                    "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {t.mastery}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      t.mastery >= 70 ? "bg-emerald-500" : t.mastery > 0 ? "bg-[#ea580c]" : "bg-slate-300"
                    )}
                    style={{ width: `${t.mastery}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.estimated_time}
                  </span>
                  {onNavigateToMentor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToMentor({
                          stageTitle: stage.title,
                          skillName: t.skill_name,
                          topicTitle: t.title,
                          mastery: t.mastery,
                        });
                      }}
                      className="text-[#ea580c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Bot className="w-3 h-3" /> Practice with Mentor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Resources */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Curated Learning Materials
          </h3>
          <div className="space-y-2">
            {stage.resources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col gap-1.5 group bg-white dark:bg-slate-900 block"
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", getResourceColor(res.type))}>
                    {getResourceIcon(res.type)} {res.type}
                  </span>
                  <span className="text-[10px] text-slate-400">{res.duration}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-[#ea580c] transition-colors">
                  {res.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{res.provider}</span>
                  <span className="text-slate-400 group-hover:text-[#ea580c] flex items-center gap-1 font-semibold">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Project Section */}
        {stage.project && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#ea580c] font-bold text-xs">
              <BrainCircuit className="w-4 h-4" /> Practical Portfolio Project
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{stage.project}</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        {/* Primary CTA */}
        {isAvailable && (
          <button
            onClick={() => onStartStage(stage.id)}
            className="w-full py-3 rounded-xl bg-[#ea580c] hover:bg-[#d84d08] text-white font-bold text-sm shadow-md shadow-[#ea580c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Start Stage
          </button>
        )}

        {isInProgress && (
          <button
            onClick={() => {
              if (onNavigateToMentor) {
                onNavigateToMentor({
                  stageTitle: stage.title,
                  skillName: stage.skills[0] || 'Optimization',
                  mastery: stage.progress,
                });
              }
            }}
            className="w-full py-3 rounded-xl bg-[#ea580c] hover:bg-[#d84d08] text-white font-bold text-sm shadow-md shadow-[#ea580c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Resume Stage Learning
          </button>
        )}

        {isCompleted && (
          <button
            onClick={() => {
              if (onNavigateToMentor) {
                onNavigateToMentor({
                  stageTitle: stage.title,
                  skillName: stage.skills[0] || 'Python',
                  mastery: 100,
                });
              }
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Review Stage Materials
          </button>
        )}

        {isLocked && (
          <button
            disabled
            className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" /> Prerequisites Required
          </button>
        )}

        {/* Cross-Platform Action Triggers */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onNavigateToMentor && (
            <button
              onClick={() =>
                onNavigateToMentor({
                  stageTitle: stage.title,
                  skillName: selectedTopic?.skill_name || stage.skills[0] || 'General',
                  topicTitle: selectedTopic?.title,
                  mastery: selectedTopic?.mastery || stage.progress,
                })
              }
              className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#ea580c] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#ea580c] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-[#ea580c]" /> Ask AI Mentor
            </button>
          )}

          {onNavigateToSkills && (
            <button
              onClick={() => onNavigateToSkills(stage.skills[0])}
              className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#ea580c] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#ea580c] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" /> Skill Matrix
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
