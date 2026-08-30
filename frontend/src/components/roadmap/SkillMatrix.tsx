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
  ChevronRight,
  Download,
  BrainCircuit,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { SkillCluster, SkillItem, RadarMetric } from '../../types/roadmap';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  pipelineService,
  LearnerKnowledgeProfile,
  RoleGapAnalysisPayload,
  TopicKnowledgeItem,
} from '../../services/pipeline.service';

const DEFAULT_RADAR_DATA: RadarMetric[] = [
  { subject: 'Programming & DSA', currentLevel: 0, industryBenchmark: 85, fullMark: 100 },
  { subject: 'Data Wrangling', currentLevel: 0, industryBenchmark: 80, fullMark: 100 },
  { subject: 'Applied Math', currentLevel: 0, industryBenchmark: 75, fullMark: 100 },
  { subject: 'Classical ML', currentLevel: 0, industryBenchmark: 80, fullMark: 100 },
  { subject: 'Deep Learning', currentLevel: 0, industryBenchmark: 80, fullMark: 100 },
  { subject: 'NLP & Transformers', currentLevel: 0, industryBenchmark: 75, fullMark: 100 },
  { subject: 'GenAI & LLMs', currentLevel: 0, industryBenchmark: 80, fullMark: 100 },
  { subject: 'MLOps & APIs', currentLevel: 0, industryBenchmark: 75, fullMark: 100 },
];

const RadarChart = ({ data, simulatedBoost }: { data: RadarMetric[], simulatedBoost: number }) => {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 45;
  const numAxes = data.length;
  const angleStep = (Math.PI * 2) / numAxes;

  const getCoordinates = (value: number, index: number) => {
    // Start from top (Math.PI / 2) and go clockwise
    const angle = (Math.PI / 2) - (index * angleStep);
    return {
      x: center + radius * value * Math.cos(angle),
      y: center - radius * value * Math.sin(angle)
    };
  };

  const getPolygonPoints = (getValue: (d: RadarMetric) => number) => {
    return data.map((d, i) => {
      const val = getValue(d) / d.fullMark;
      const { x, y } = getCoordinates(val, i);
      return `${x},${y}`;
    }).join(' ');
  };

  const currentPoints = getPolygonPoints(d => d.currentLevel);
  const simulatedPoints = getPolygonPoints(d => Math.min(d.currentLevel + (simulatedBoost > 0 && d.currentLevel < 60 ? simulatedBoost * 1.5 : 0), d.fullMark));
  const benchmarkPoints = getPolygonPoints(d => d.industryBenchmark);

  return (
    <div className="relative flex justify-center items-center w-full aspect-square max-w-[350px] mx-auto group">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Radar Web Background Levels */}
        {[0.25, 0.5, 0.75, 1].map((level, idx) => (
          <polygon
            key={`web-${idx}`}
            points={data.map((_, i) => {
              const { x, y } = getCoordinates(level, i);
              return `${x},${y}`;
            }).join(' ')}
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
              x1={center} y1={center} x2={x} y2={y}
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
          strokeWidth={2}
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
          fill="#f97316"
          fillOpacity={0.25}
          stroke="#ea580c"
          strokeWidth={2.5}
          className="transition-all duration-700 ease-out"
        />

        {/* Outer Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(1.22, i);
          return (
            <g key={`label-${i}`} transform={`translate(${x}, ${y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-bold fill-slate-700 dark:fill-slate-300"
              >
                {d.subject}
              </text>
            </g>
          );
        })}

        {/* Hover Points Tooltips */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(d.currentLevel / d.fullMark, i);
          return (
            <circle
              key={`point-${i}`}
              cx={x} cy={y} r={4}
              className="fill-[#ea580c] cursor-pointer hover:r-[6px] transition-all duration-200"
            >
              <title>{`${d.subject}: ${d.currentLevel}% (Required: ${d.industryBenchmark}%)`}</title>
            </circle>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-4 text-[9px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400"></span> Benchmark</span>
        <span className="flex items-center gap-1.5 text-[#ea580c]"><span className="w-2 h-2 rounded-full bg-[#ea580c]/50 border border-[#ea580c]"></span> Current</span>
        {simulatedBoost > 0 && <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500/50 border border-emerald-500"></span> Projected</span>}
      </div>
    </div>
  );
};

interface SkillMatrixProps {
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

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ onNavigateToMentor, onNavigateToRoadmap }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [filterTab, setFilterTab] = useState<'All' | 'Verified' | 'In Progress' | 'Critical Gaps'>('All');
  const [simulatedLabs, setSimulatedLabs] = useState(0);

  const [knowledgeProfile, setKnowledgeProfile] = useState<LearnerKnowledgeProfile | null>(null);
  const [roleGaps, setRoleGaps] = useState<RoleGapAnalysisPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live knowledge state from pipeline
  useEffect(() => {
    let isMounted = true;
    const fetchMatrixData = async () => {
      try {
        setIsLoading(true);
        const [kProf, gaps] = await Promise.allSettled([
          pipelineService.getKnowledgeProfile(),
          pipelineService.getSkillGaps(),
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
  }, []);

  // Dynamic Skill Overrides from live assessments / mentor
  const skillOverrides: Record<string, number> = useMemo(() => {
    try {
      const saved = localStorage.getItem('pathai_skill_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // Domain definitions for canonical clustering
  const DOMAIN_GROUPS = useMemo(() => [
    { id: 'c1', name: 'Programming & Data Structures', desc: 'Python syntax, control flow, functions, OOP, and data structures.' },
    { id: 'c2', name: 'Applied Mathematics & Statistics', desc: 'Linear algebra matrices, calculus gradients, and Bayesian probability.' },
    { id: 'c3', name: 'Data Wrangling & Feature Engineering', desc: 'NumPy broadcasting, Pandas dataframes, and feature prep.' },
    { id: 'c4', name: 'Machine Learning Foundations', desc: 'Regression, Decision Trees, XGBoost, and model evaluation.' },
    { id: 'c5', name: 'Deep Learning & Neural Networks', desc: 'PyTorch tensors, neural net architectures, and autograd.' },
    { id: 'c6', name: 'NLP, Attention & Transformers', desc: 'Tokenizers, vector embeddings, and self-attention.' },
    { id: 'c7', name: 'Generative AI, RAG & LLMs', desc: 'PEFT/LoRA fine-tuning, RAG retrieval, and vector databases.' },
    { id: 'c8', name: 'MLOps, APIs & Cloud Deployment', desc: 'FastAPI microservices, Docker containerization, and deployment.' },
  ], []);

  // Compute live updated clusters from knowledge state
  const liveClusters: SkillCluster[] = useMemo(() => {
    if (!knowledgeProfile || !knowledgeProfile.topics) {
      return DOMAIN_GROUPS.map(g => ({
        id: g.id,
        categoryName: g.name,
        description: g.desc,
        skills: [],
      }));
    }

    const topicsList: TopicKnowledgeItem[] = Object.values(knowledgeProfile.topics);

    return DOMAIN_GROUPS.map((g) => {
      const domainTopics = topicsList.filter(t => t.domain.toLowerCase().includes(g.name.split('&')[0].trim().toLowerCase()) || g.name.toLowerCase().includes(t.domain.toLowerCase()));

      const skills: SkillItem[] = domainTopics.map(t => {
        const override = skillOverrides[t.topic_id] ?? skillOverrides[t.skill_id] ?? skillOverrides[t.topic_title];
        const progress = override !== undefined ? override : (t.status !== 'UNKNOWN' ? t.mastery : 0);

        let level: SkillItem['level'] = 'Novice';
        if (progress >= 85) level = 'Advanced';
        else if (progress >= 70) level = 'Proficient';
        else if (progress >= 40) level = 'Developing';
        else if (progress > 0) level = 'Novice';
        else level = 'Locked';

        const isVerified = (t.evidence_count > 0 && progress >= 75) || progress >= 80;

        return {
          id: t.topic_id,
          name: t.topic_title,
          level,
          progress,
          isVerified,
          verificationDetails: isVerified ? {
            courseName: `${t.domain} Mastery`,
            assessmentScore: Math.max(progress, 75),
            verifiedAt: 'Active Evidence',
          } : undefined,
        };
      });

      return {
        id: g.id,
        categoryName: g.name,
        description: g.desc,
        skills,
      };
    }).filter(c => c.skills.length > 0);
  }, [knowledgeProfile, skillOverrides, DOMAIN_GROUPS]);

  // Compute dynamic radar metrics directly from domain masteries
  const dynamicRadarData: RadarMetric[] = useMemo(() => {
    const domainMasteries = knowledgeProfile?.domain_masteries || {};

    const getDomainScore = (domainKey: string, fallback: number = 0) => {
      for (const [dName, val] of Object.entries(domainMasteries)) {
        if (dName.toLowerCase().includes(domainKey.toLowerCase())) {
          return val;
        }
      }
      return fallback;
    };

    return [
      { subject: 'Programming & DSA', currentLevel: getDomainScore('Programming', 0), industryBenchmark: 85, fullMark: 100 },
      { subject: 'Data Wrangling', currentLevel: getDomainScore('Data Wrangling', 0), industryBenchmark: 80, fullMark: 100 },
      { subject: 'Applied Math', currentLevel: getDomainScore('Mathematics', 0), industryBenchmark: 75, fullMark: 100 },
      { subject: 'Classical ML', currentLevel: getDomainScore('Machine Learning', 0), industryBenchmark: 80, fullMark: 100 },
      { subject: 'Deep Learning', currentLevel: getDomainScore('Deep Learning', 0), industryBenchmark: 80, fullMark: 100 },
      { subject: 'NLP & Attention', currentLevel: getDomainScore('NLP', 0), industryBenchmark: 75, fullMark: 100 },
      { subject: 'GenAI & LLMs', currentLevel: getDomainScore('Generative AI', 0), industryBenchmark: 80, fullMark: 100 },
      { subject: 'MLOps & APIs', currentLevel: getDomainScore('MLOps', 0), industryBenchmark: 75, fullMark: 100 },
    ];
  }, [knowledgeProfile]);

  // Total Verified Skills count
  const verifiedCount = useMemo(() => {
    let count = 0;
    for (const c of liveClusters) {
      count += c.skills.filter(s => s.isVerified).length;
    }
    return count;
  }, [liveClusters]);

  const totalSkillsCount = useMemo(() => {
    let count = 0;
    for (const c of liveClusters) {
      count += c.skills.length;
    }
    return count;
  }, [liveClusters]);

  // Mean Role Readiness
  const baseReadiness = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const c of liveClusters) {
      for (const s of c.skills) {
        total += s.progress;
        count += 1;
      }
    }
    return count > 0 ? Math.round(total / count) : 0;
  }, [liveClusters]);

  const simulatedReadiness = Math.min(100, baseReadiness + (simulatedLabs * 3));

  const getLevelColor = (level: SkillItem['level']) => {
    switch (level) {
      case 'Advanced': return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'Proficient': return 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50';
      case 'Intermediate': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'Developing': return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Novice': return 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
      case 'Locked': return 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getProgressBarColor = (level: SkillItem['level']) => {
    switch (level) {
      case 'Advanced': return 'bg-emerald-500';
      case 'Proficient': return 'bg-teal-500';
      case 'Intermediate': return 'bg-blue-500';
      case 'Developing': return 'bg-amber-500';
      case 'Novice': return 'bg-rose-500';
      case 'Locked': return 'bg-slate-300 dark:bg-slate-700';
      default: return 'bg-slate-300';
    }
  };

  const filteredClusters = useMemo(() => {
    return liveClusters.map(cluster => {
      const filteredSkills = cluster.skills.filter(skill => {
        if (filterTab === 'All') return true;
        if (filterTab === 'Verified') return skill.isVerified;
        if (filterTab === 'In Progress') return skill.progress > 0 && !skill.isVerified;
        if (filterTab === 'Critical Gaps') return skill.progress < 50 && skill.level !== 'Locked';
        return true;
      });
      return { ...cluster, skills: filteredSkills };
    }).filter(cluster => cluster.skills.length > 0);
  }, [liveClusters, filterTab]);

  return (
    <div className="w-full space-y-6">
      
      {/* Top Header: Readiness & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Skill Competency Matrix
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Benchmarked against industry standards for AI/ML Engineer</p>
        </div>
        <button 
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(liveClusters, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute("href", dataStr);
            dl.setAttribute("download", "pathai_verified_skills.json");
            dl.click();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-[#ea580c] hover:text-[#ea580c] transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Verified Profile</span>
        </button>
      </div>

      {/* Main Telemetry Dashboard (Radar + Simulation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Radar Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <BrainCircuit className="w-3.5 h-3.5" />
              AI Analysis
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Competency Radar</h3>
          
          <RadarChart data={dynamicRadarData} simulatedBoost={simulatedLabs * 10} />
        </div>

        {/* Right: Job Role Readiness & What-If Simulator */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Readiness Meter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ea580c]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Role Readiness</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900 dark:text-white transition-all duration-500">
                  {simulatedReadiness}%
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 block -mt-1">Market Ready</span>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 relative">
              {/* Simulated Bar */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${simulatedReadiness}%`, opacity: simulatedLabs > 0 ? 1 : 0 }} 
              />
              {/* Base Bar */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#ea580c] to-[#f97316] rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${baseReadiness}%` }} 
              />
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {verifiedCount}/{totalSkillsCount} Verified Core Skills</span>
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Critical Gap: Optimization</span>
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
                <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Prerequisite Blocker</h4>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed mb-4">
                <strong>Optimization & Calculus</strong> — target benchmark is 80% mastery to unblock downstream Machine Learning stages.
              </p>
              <button 
                onClick={() => onNavigateToMentor?.({ stageTitle: 'Mathematics & Statistics', stageId: 3, skillFocus: 'Optimization', mode: 'assess' })}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Resolve in AI Mentor →
              </button>
            </div>

            {/* What-If Simulator */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">"What-If" Simulator</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">See how upcoming labs impact your market readiness & radar.</p>
              
              <div className="mb-2 flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Simulate next {simulatedLabs} labs</span>
                <span className="text-emerald-600 dark:text-emerald-400">+{simulatedLabs * 3}%</span>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="8" 
                step="1"
                value={simulatedLabs}
                onChange={(e) => setSimulatedLabs(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>Current</span>
                <span>+8 Labs</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Domain Skill Clusters Grid */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Competency Domains</h3>
          
          <div className="flex flex-wrap gap-2">
            {(['All', 'Verified', 'In Progress', 'Critical Gaps'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                  filterTab === tab
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClusters.map(cluster => (
            <div key={cluster.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{cluster.categoryName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{cluster.description}</p>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {cluster.skills.map(skill => (
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
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", getLevelColor(skill.level))}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", getProgressBarColor(skill.level))}
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
                    {selectedSkill.isVerified && <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />}
                  </div>
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border inline-block mt-2", getLevelColor(selectedSkill.level))}>
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
                            <span className="text-slate-900 dark:text-slate-200 font-bold">{selectedSkill.verificationDetails.courseName}</span>
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
                          <span className="font-black text-lg text-slate-900 dark:text-white">{selectedSkill.verificationDetails.labScore}%</span>
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
                          <span className="font-black text-lg text-slate-900 dark:text-white">{selectedSkill.verificationDetails.assessmentScore}%</span>
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
                        You need to pass the associated capstone lab or diagnostic assessment to unlock verification for this skill.
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
                       reason: `Evaluating knowledge state in ${sName}.`,
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
