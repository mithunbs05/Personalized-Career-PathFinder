import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  X,
  Activity,
  GraduationCap,
  Download,
  BrainCircuit,
  ExternalLink,
  Lock,
  Cpu,
  Layers,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SkillCluster, SkillItem, RadarMetric } from '../../types/roadmap';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  pipelineService,
  LearnerKnowledgeProfile,
  RoleGapAnalysisPayload,
  TopicKnowledgeItem,
  CompetencyGapItem,
} from '../../services/pipeline.service';

const RadarChart = ({ data, simulatedBoost }: { data: RadarMetric[]; simulatedBoost: number }) => {
  const size = 360;
  const center = size / 2;
  const radius = 100;
  const numAxes = Math.max(3, data.length);
  const angleStep = (Math.PI * 2) / numAxes;

  const getCoordinates = (value: number, index: number) => {
    const angle = Math.PI / 2 - index * angleStep;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center - radius * value * Math.sin(angle),
    };
  };

  const getPolygonPoints = (getValue: (d: RadarMetric) => number, isCurrent = false) => {
    return data
      .map((d, i) => {
        const raw = getValue(d) / d.fullMark;
        // Apply a subtle 10% baseline floor for current level so the shape does not collapse into a 1D spike
        const val = isCurrent ? Math.max(0.1, raw) : raw;
        const { x, y } = getCoordinates(val, i);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const currentPoints = getPolygonPoints((d) => d.currentLevel, true);
  const simulatedPoints = getPolygonPoints((d) =>
    Math.min(
      d.currentLevel + (simulatedBoost > 0 && d.currentLevel < 60 ? simulatedBoost * 1.5 : 0),
      d.fullMark
    ),
    true
  );
  const benchmarkPoints = getPolygonPoints((d) => d.industryBenchmark, false);

  return (
    <div className="relative flex justify-center items-center w-full aspect-square max-w-[360px] mx-auto group">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Radar Web Background Levels */}
        {[0.25, 0.5, 0.75, 1].map((level, idx) => (
          <polygon
            key={`web-${idx}`}
            points={data
              .map((_, i) => {
                const { x, y } = getCoordinates(level, i);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={1}
          />
        ))}

        {/* Axes lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(1, i);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={1}
            />
          );
        })}

        {/* Benchmark Polygon */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="currentColor"
          className="text-slate-400 dark:text-slate-500"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Simulated Polygon */}
        {simulatedBoost > 0 && (
          <polygon
            points={simulatedPoints}
            fill="#34d399"
            fillOpacity={0.15}
            stroke="#10b981"
            strokeWidth={2}
            className="transition-all duration-700 ease-out animate-pulse"
          />
        )}

        {/* Current Level Polygon */}
        <polygon
          points={currentPoints}
          fill="#ea580c"
          fillOpacity={0.25}
          stroke="#ea580c"
          strokeWidth={2.5}
          className="transition-all duration-700 ease-out"
        />

        {/* Outer Dimension Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(1.24, i);
          const angle = Math.PI / 2 - i * angleStep;
          // Align text based on quadrant to prevent clipping
          let textAnchor = "middle";
          if (Math.cos(angle) > 0.3) textAnchor = "start";
          else if (Math.cos(angle) < -0.3) textAnchor = "end";

          return (
            <g key={`label-${i}`} transform={`translate(${x}, ${y})`}>
              <text
                textAnchor={textAnchor}
                dominantBaseline="central"
                className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 select-none"
              >
                {d.subject}
              </text>
            </g>
          );
        })}

        {/* Hover Points Tooltips */}
        {data.map((d, i) => {
          const val = Math.max(0.1, d.currentLevel / d.fullMark);
          const { x, y } = getCoordinates(val, i);
          return (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r={4.5}
              className="fill-[#ea580c] stroke-white dark:stroke-slate-900 stroke-2 cursor-pointer hover:r-[6.5px] transition-all duration-200"
            >
              <title>{`${d.subject}: ${d.currentLevel}% (Required Benchmark: ${d.industryBenchmark}%)`}</title>
            </circle>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-4 text-[9px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span> Benchmark
        </span>
        <span className="flex items-center gap-1.5 text-[#ea580c]">
          <span className="w-2 h-2 rounded-full bg-[#ea580c]/50 border border-[#ea580c]"></span> Current
        </span>
        {simulatedBoost > 0 && (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500/50 border border-emerald-500"></span> Projected
          </span>
        )}
      </div>
    </div>
  );
};

interface SkillMatrixProps {
  targetRole?: string;
  overview?: any;
  onNavigateToMentor?: (context?: {
    stageTitle?: string;
    stageId?: number;
    skillName?: string;
    skillFocus?: string;
    topicTitle?: string;
    mastery?: number;
    mode?: 'learn' | 'practice' | 'assess';
    reason?: string;
  }) => void;
  onNavigateToRoadmap?: () => void;
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  targetRole,
  overview,
  onNavigateToMentor,
  onNavigateToRoadmap,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [filterTab, setFilterTab] = useState<'All' | 'Verified' | 'In Progress' | 'Critical Gaps'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [practiceProblems, setPracticeProblems] = useState<any[]>([]);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const handleGeneratePractice = async () => {
    try {
      setIsGeneratingPractice(true);
      setPracticeError(null);
      const res = await fetch('http://localhost:8000/practice/generate-stage-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_name: designatedRole,
          stage_id: roleClusters[0]?.id || "stage-1",
          stage_name: roleClusters[0]?.categoryName || "Core Requirements",
        }),
      });
      if (!res.ok) throw new Error("Failed to generate practice problems");
      const data = await res.json();
      setPracticeProblems(data.challenges || []);
    } catch (err: any) {
      setPracticeError(err.message);
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  const [knowledgeProfile, setKnowledgeProfile] = useState<LearnerKnowledgeProfile | null>(null);
  const [roleGaps, setRoleGaps] = useState<RoleGapAnalysisPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const designatedRole = useMemo(() => {
    return targetRole || overview?.target_role || roleGaps?.target_role || 'Target Engineering Role';
  }, [targetRole, overview, roleGaps]);

  // Fetch live knowledge state and role gaps specifically for the designated role
  useEffect(() => {
    let isMounted = true;
    const fetchMatrixData = async () => {
      try {
        setIsLoading(true);
        const [kProf, gaps] = await Promise.allSettled([
          pipelineService.getKnowledgeProfile(),
          pipelineService.getSkillGaps(designatedRole),
        ]);
        if (isMounted) {
          if (kProf.status === 'fulfilled') setKnowledgeProfile(kProf.value);
          if (gaps.status === 'fulfilled') setRoleGaps(gaps.value);
        }
      } catch (err) {
        console.warn('Could not load pipeline data for SkillMatrix:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMatrixData();
    return () => {
      isMounted = false;
    };
  }, [designatedRole]);

  // Dynamic Skill Overrides from live assessments / mentor
  const skillOverrides: Record<string, number> = useMemo(() => {
    try {
      const saved = localStorage.getItem('pathai_skill_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // Build role-specific skill clusters directly from the user's roadmap stages & designated role gaps
  const roleClusters: SkillCluster[] = useMemo(() => {
    const topicsMap = knowledgeProfile?.topics || {};

    // 1. If roadmap stages are present for this designated role, use them as canonical clusters
    if (overview?.stages && overview.stages.length > 0) {
      return overview.stages.map((stage: any, sIdx: number) => {
        const skills: SkillItem[] = (stage.topics && stage.topics.length > 0
          ? stage.topics
          : stage.skills || []
        ).map((item: any, tIdx: number) => {
          const tTitle = typeof item === 'string' ? item : item.title || item.name;
          const tId = typeof item === 'string' ? `t-${sIdx}-${tIdx}` : item.id || item.topic_id || `t-${sIdx}-${tIdx}`;

          // Find live knowledge state if available
          let liveKnowledge = topicsMap[tId];
          if (!liveKnowledge) {
            for (const tk of Object.values(topicsMap)) {
              if (tk.topic_title.toLowerCase() === tTitle.toLowerCase()) {
                liveKnowledge = tk;
                break;
              }
            }
          }

          const override = skillOverrides[tId] ?? skillOverrides[tTitle];
          let progress = override !== undefined ? override : liveKnowledge && liveKnowledge.status !== 'UNKNOWN' ? liveKnowledge.mastery : 0;
          if (stage.status === 'COMPLETED' && progress === 0) progress = 85;

          let level: SkillItem['level'] = 'Novice';
          if (progress >= 85) level = 'Advanced';
          else if (progress >= 70) level = 'Proficient';
          else if (progress >= 40) level = 'Developing';
          else if (progress > 0) level = 'Novice';
          else level = 'Locked';

          const isVerified = (liveKnowledge && liveKnowledge.evidence_count > 0 && progress >= 75) || progress >= 80;

          return {
            id: tId,
            name: tTitle,
            level,
            progress,
            isVerified,
            verificationDetails: isVerified
              ? {
                  courseName: `${stage.title} Mastery`,
                  assessmentScore: Math.max(progress, 75),
                  verifiedAt: 'Active Evidence',
                }
              : undefined,
          };
        });

        return {
          id: `stage-cluster-${stage.id || sIdx + 1}`,
          categoryName: stage.title,
          description: stage.description || `${stage.estimated_duration || '3 Weeks'} • ${stage.why_in_roadmap || 'Core role milestone'}`,
          skills,
        };
      });
    }

    // 2. Fallback: Group by priority gaps and strong competencies for this role
    if (roleGaps && (roleGaps.priority_gaps?.length > 0 || roleGaps.strong_competencies?.length > 0)) {
      const domainGroups: Record<string, SkillItem[]> = {};

      // Add priority gaps
      for (const gap of roleGaps.priority_gaps || []) {
        const dom = gap.domain || 'Core Discipline';
        if (!domainGroups[dom]) domainGroups[dom] = [];

        const override = skillOverrides[gap.topic_id] ?? skillOverrides[gap.topic_title];
        const progress = override !== undefined ? override : gap.current_mastery || 0;

        let level: SkillItem['level'] = 'Developing';
        if (progress >= 85) level = 'Advanced';
        else if (progress >= 70) level = 'Proficient';
        else if (progress >= 40) level = 'Developing';
        else if (progress > 0) level = 'Novice';
        else level = 'Locked';

        domainGroups[dom].push({
          id: gap.topic_id,
          name: gap.topic_title,
          level,
          progress,
          isVerified: progress >= 80,
        });
      }

      // Add strong competencies
      for (const comp of roleGaps.strong_competencies || []) {
        const dom = 'Verified Strengths';
        if (!domainGroups[dom]) domainGroups[dom] = [];
        domainGroups[dom].push({
          id: `strong-${comp.replace(/[^a-z0-9]/gi, '-')}`,
          name: comp,
          level: 'Advanced',
          progress: 88,
          isVerified: true,
          verificationDetails: {
            courseName: `${designatedRole} Core`,
            assessmentScore: 88,
          },
        });
      }

      return Object.entries(domainGroups).map(([dName, skills], idx) => ({
        id: `gap-group-${idx + 1}`,
        categoryName: dName,
        description: `Required competencies for ${designatedRole}`,
        skills,
      }));
    }

    // 3. Fallback: Default role cluster
    return [
      {
        id: 'c1',
        categoryName: `${designatedRole} Core Requirements`,
        description: `Required foundational and advanced technical competencies for ${designatedRole}.`,
        skills: [
          { id: 's1', name: 'Core Architecture & Systems', level: 'Proficient', progress: 75, isVerified: true },
          { id: 's2', name: 'Domain Protocols & Standards', level: 'Developing', progress: 50, isVerified: false },
          { id: 's3', name: 'Capstone Implementation', level: 'Novice', progress: 20, isVerified: false },
        ],
      },
    ];
  }, [overview, roleGaps, knowledgeProfile, designatedRole, skillOverrides]);

  // Dynamic radar metrics specifically tailored to the designated role's clusters
  const dynamicRadarData: RadarMetric[] = useMemo(() => {
    if (roleClusters.length === 0) return [];

    return roleClusters.slice(0, 8).map((cluster) => {
      const avgProgress =
        cluster.skills.length > 0
          ? Math.round(cluster.skills.reduce((acc, s) => acc + s.progress, 0) / cluster.skills.length)
          : 0;

      // Clean and compact dimension labels
      let cleanSubject = cluster.categoryName
        .replace(/Architecture/gi, 'Arch')
        .replace(/Operating Systems/gi, 'RTOS')
        .replace(/Microcontrollers/gi, 'MCU Systems')
        .replace(/Programming/gi, 'Dev')
        .trim();

      return {
        subject: cleanSubject,
        currentLevel: avgProgress,
        industryBenchmark: 80,
        fullMark: 100,
      };
    });
  }, [roleClusters]);

  // Total Verified Skills count for designated role
  const verifiedCount = useMemo(() => {
    let count = 0;
    for (const c of roleClusters) {
      count += c.skills.filter((s) => s.isVerified).length;
    }
    return count;
  }, [roleClusters]);

  const totalSkillsCount = useMemo(() => {
    let count = 0;
    for (const c of roleClusters) {
      count += c.skills.length;
    }
    return count;
  }, [roleClusters]);

  // Mean Role Readiness for designated role
  const baseReadiness = useMemo(() => {
    if (roleGaps?.overall_readiness_percentage !== undefined) {
      return roleGaps.overall_readiness_percentage;
    }
    if (overview?.overall_progress !== undefined) {
      return overview.overall_progress;
    }
    let total = 0;
    let count = 0;
    for (const c of roleClusters) {
      for (const s of c.skills) {
        total += s.progress;
        count += 1;
      }
    }
    return count > 0 ? Math.round(total / count) : 0;
  }, [roleClusters, roleGaps, overview]);

  const simulatedReadiness = baseReadiness;

  const getLevelColor = (level: SkillItem['level']) => {
    switch (level) {
      case 'Advanced':
        return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'Proficient':
        return 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50';
      case 'Intermediate':
        return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'Developing':
        return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Novice':
        return 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      case 'Locked':
        return 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getProgressBarColor = (level: SkillItem['level']) => {
    switch (level) {
      case 'Advanced':
        return 'bg-emerald-500';
      case 'Proficient':
        return 'bg-teal-500';
      case 'Intermediate':
        return 'bg-blue-500';
      case 'Developing':
        return 'bg-amber-500';
      case 'Novice':
        return 'bg-rose-500';
      case 'Locked':
        return 'bg-slate-300 dark:bg-slate-700';
      default:
        return 'bg-slate-300';
    }
  };

  const filteredClusters = useMemo(() => {
    return roleClusters
      .map((cluster) => {
        const filteredSkills = cluster.skills.filter((skill) => {
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const skillMatch = skill.name.toLowerCase().includes(q);
            const clusterMatch = cluster.categoryName.toLowerCase().includes(q);
            if (!skillMatch && !clusterMatch) return false;
          }
          if (filterTab === 'All') return true;
          if (filterTab === 'Verified') return skill.isVerified;
          if (filterTab === 'In Progress') return skill.progress > 0 && !skill.isVerified;
          if (filterTab === 'Critical Gaps') return skill.progress < 50 && skill.level !== 'Locked';
          return true;
        });
        return { ...cluster, skills: filteredSkills };
      })
      .filter((cluster) => cluster.skills.length > 0);
  }, [roleClusters, searchQuery, filterTab]);

  return (
    <div className="w-full space-y-6">
      {/* Top Header: Designated Role Focus & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#ea580c]/10 text-[#ea580c] border border-[#ea580c]/30 flex items-center gap-1">
              <Target className="w-3 h-3" /> Designated Target Role
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {totalSkillsCount} Required Competencies
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {designatedRole}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Showing only competencies, benchmark masteries, and gap targets strictly required for your selected role.
          </p>
        </div>
        <button
          onClick={() => {
            const dataStr =
              'data:text/json;charset=utf-8,' +
              encodeURIComponent(JSON.stringify(roleClusters, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute('href', dataStr);
            dl.setAttribute('download', `${designatedRole.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_skills.json`);
            dl.click();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-[#ea580c] hover:text-[#ea580c] transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Role Matrix</span>
        </button>
      </div>

      {/* Main Telemetry Dashboard (Radar + Simulation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Radar Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <BrainCircuit className="w-3.5 h-3.5 text-[#ea580c]" />
              Role Benchmark
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Role Competency Radar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Benchmark requirements across {roleClusters.length} core domains for {designatedRole}
            </p>
          </div>

          <RadarChart data={dynamicRadarData} simulatedBoost={0} />
        </div>

        {/* Right: Job Role Readiness & What-If Simulator */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Readiness Meter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ea580c]" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Target Role Readiness</h3>
                  <span className="text-xs text-slate-400">Alignment towards {designatedRole}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 dark:text-white transition-all duration-500">
                  {simulatedReadiness}%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block -mt-1">
                  {simulatedReadiness >= 75 ? 'Qualified' : 'In Preparation'}
                </span>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 relative">
              {/* Simulated Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${simulatedReadiness}%`, opacity: 0 }}
              />
              {/* Base Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#ea580c] to-[#f97316] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${baseReadiness}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {verifiedCount}/{totalSkillsCount} Verified Role Skills
              </span>
              {roleGaps?.critical_blocker ? (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" /> Blocker: {roleGaps.critical_blocker}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-4 h-4 text-[#ea580c]" /> {roleClusters.length} Stages Mapped
                </span>
              )}
            </div>
          </div>

          {/* AI Simulator & Critical Blocker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blocker Alert */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-500">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Role Gap Priority</h4>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed mb-4">
                {roleGaps?.priority_gaps && roleGaps.priority_gaps.length > 0
                  ? `Focus on '${roleGaps.priority_gaps[0].topic_title}' — ${roleGaps.priority_gaps[0].deficit}% gap deficit to clear.`
                  : `All required foundation stages for ${designatedRole} are on track.`}
              </p>
              <button
                onClick={() =>
                  onNavigateToMentor?.({
                    stageTitle: designatedRole,
                    mode: 'assess',
                    topicTitle: roleGaps?.priority_gaps?.[0]?.topic_title,
                  })
                }
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Clear Gaps in AI Mentor →
              </button>
            </div>

            {/* AI Practice Generator */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-[#ea580c]" /> AI Practice Generator
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Generate adaptive practice challenges (LeetCode, Kaggle, etc.) specifically tailored for {designatedRole}.
                </p>
              </div>

              <div className="space-y-3">
                {practiceError && (
                  <div className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-100 dark:border-red-900/50">
                    {practiceError}
                  </div>
                )}
                <button
                  onClick={handleGeneratePractice}
                  disabled={isGeneratingPractice}
                  className="w-full py-2.5 bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#d84d08] hover:to-[#ea580c] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingPractice ? (
                    <span className="animate-pulse">Generating Challenges...</span>
                  ) : (
                    <>Generate Challenges <Sparkles className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Practice Problems Section */}
          <AnimatePresence>
            {practiceProblems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-500" /> Curated External Practice
                  </h4>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full font-bold">
                    {practiceProblems.length} Items
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {practiceProblems.map((prob, idx) => (
                    <a
                      key={idx}
                      href={prob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#ea580c] transition-colors group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {prob.platform}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          prob.difficulty.toLowerCase() === 'hard' ? 'text-rose-500' :
                          prob.difficulty.toLowerCase() === 'medium' ? 'text-amber-500' :
                          'text-emerald-500'
                        )}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#ea580c]">
                        {prob.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {prob.why_it_matters}
                      </p>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Role-Required Competency Clusters Grid */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#ea580c]" /> Required Curriculum Stages & Competencies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredClusters.length} required domain clusters specifically designated for {designatedRole}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search required skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#ea580c]"
              />
            </div>

            <div className="flex gap-1.5">
              {(['All', 'Verified', 'In Progress', 'Critical Gaps'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer',
                    filterTab === tab
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold text-[#ea580c] uppercase tracking-wider">
                    {designatedRole}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {cluster.skills.length} skills
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{cluster.categoryName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{cluster.description}</p>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {cluster.skills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="flex flex-col gap-2 cursor-pointer group/skill hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/skill:text-[#ea580c] transition-colors">
                          {skill.name}
                        </span>
                        {skill.isVerified && (
                          <span title="Verified">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]" />
                          </span>
                        )}
                        {skill.level === 'Locked' && <Lock className="w-3 h-3 text-slate-400" />}
                      </div>
                      <span
                        className={cn(
                          'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                          getLevelColor(skill.level)
                        )}
                      >
                        {skill.level}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          getProgressBarColor(skill.level)
                        )}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredClusters.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No skills match the current filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-Over Skill Verification Drawer */}
      <AnimatePresence>
        {selectedSkill && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSkill(null)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSkill.name}</h2>
                    {selectedSkill.isVerified && (
                      <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-full border inline-block mt-2',
                      getLevelColor(selectedSkill.level)
                    )}
                  >
                    {selectedSkill.level} Tier • {selectedSkill.progress}% Mastery
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors cursor-pointer shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* Verification Evidence */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Proof of Work & Verification
                  </h3>

                  {selectedSkill.isVerified && selectedSkill.verificationDetails ? (
                    <div className="space-y-3">
                      {selectedSkill.verificationDetails.courseName && (
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="text-slate-900 dark:text-slate-200 font-bold">
                              {selectedSkill.verificationDetails.courseName}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-full uppercase tracking-widest">
                            Completed
                          </span>
                        </div>
                      )}

                      {selectedSkill.verificationDetails.labScore !== undefined && (
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-[#ea580c]/10 rounded-lg text-[#ea580c]">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <span className="text-slate-900 dark:text-slate-200 font-bold">Practical Lab Exam</span>
                          </div>
                          <span className="font-black text-lg text-slate-900 dark:text-white">
                            {selectedSkill.verificationDetails.labScore}%
                          </span>
                        </div>
                      )}

                      {selectedSkill.verificationDetails.assessmentScore !== undefined && (
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                              <Target className="w-4 h-4" />
                            </div>
                            <span className="text-slate-900 dark:text-slate-200 font-bold">Diagnostic Benchmark</span>
                          </div>
                          <span className="font-black text-lg text-slate-900 dark:text-white">
                            {selectedSkill.verificationDetails.assessmentScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700 shadow-sm mb-3">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Verifiable Evidence</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        You need to pass the associated capstone lab or diagnostic assessment in AI Mentor to unlock verification for this skill.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <button
                  onClick={() => {
                    const sName = selectedSkill.name;
                    const sProg = selectedSkill.progress;
                    setSelectedSkill(null);
                    onNavigateToMentor?.({
                      topicTitle: sName,
                      skillName: sName,
                      mastery: sProg,
                      mode: 'assess',
                      reason: `Evaluating knowledge state in ${sName} for ${designatedRole}.`,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#ea580c] hover:bg-[#d84d08] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#ea580c]/20 hover:-translate-y-0.5 cursor-pointer"
                >
                  {selectedSkill.isVerified ? 'Retake Diagnostic Assessment in Mentor' : 'Launch Assessment Sandbox'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedSkill(null);
                      onNavigateToRoadmap?.();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" /> View Map
                  </button>
                  <button
                    onClick={() => {
                      const sName = selectedSkill.name;
                      const sProg = selectedSkill.progress;
                      setSelectedSkill(null);
                      onNavigateToMentor?.({
                        topicTitle: sName,
                        skillName: sName,
                        mastery: sProg,
                        mode: 'practice',
                        reason: `Practicing targeted questions for ${sName}.`,
                      });
                    }}
                    className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Practice in Mentor
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillMatrix;
