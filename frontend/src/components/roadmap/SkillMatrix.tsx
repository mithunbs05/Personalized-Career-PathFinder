import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, X, Activity, GraduationCap } from 'lucide-react';
import { SkillCluster, SkillItem } from '../../types/roadmap';
import { cn } from '../../lib/utils';

const MOCK_SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'c1',
    categoryName: 'Foundations & Core Python',
    description: 'Fundamental programming paradigms and data structures.',
    skills: [
      {
        id: 's1',
        name: 'Python OOP',
        level: 'Advanced',
        progress: 95,
        isVerified: true,
        verificationDetails: { courseName: 'Python Deep Dive', labScore: 98, assessmentScore: 95 }
      },
      {
        id: 's2',
        name: 'NumPy & Pandas',
        level: 'Advanced',
        progress: 88,
        isVerified: true,
        verificationDetails: { courseName: 'Data Science Fundamentals', labScore: 90, assessmentScore: 85 }
      },
      {
        id: 's3',
        name: 'Algorithmic Complexity',
        level: 'Developing',
        progress: 45,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c2',
    categoryName: 'Math & Statistics',
    description: 'Theoretical groundwork for machine learning algorithms.',
    skills: [
      {
        id: 's4',
        name: 'Linear Algebra',
        level: 'Developing',
        progress: 45,
        isVerified: false,
      },
      {
        id: 's5',
        name: 'Calculus',
        level: 'Developing',
        progress: 30,
        isVerified: false,
      },
      {
        id: 's6',
        name: 'Probability',
        level: 'Intermediate',
        progress: 60,
        isVerified: true,
        verificationDetails: { courseName: 'Stats for ML', assessmentScore: 80 }
      },
      {
        id: 's7',
        name: 'Optimization',
        level: 'Novice',
        progress: 10,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c3',
    categoryName: 'Machine Learning',
    description: 'Classic predictive modeling and evaluation.',
    skills: [
      {
        id: 's8',
        name: 'Regression Models',
        level: 'Intermediate',
        progress: 75,
        isVerified: true,
        verificationDetails: { labScore: 85, assessmentScore: 78 }
      },
      {
        id: 's9',
        name: 'Random Forests',
        level: 'Intermediate',
        progress: 65,
        isVerified: false,
      },
      {
        id: 's10',
        name: 'XGBoost',
        level: 'Novice',
        progress: 20,
        isVerified: false,
      },
      {
        id: 's11',
        name: 'Evaluation Metrics',
        level: 'Intermediate',
        progress: 70,
        isVerified: true,
        verificationDetails: { assessmentScore: 88 }
      }
    ]
  },
  {
    id: 'c4',
    categoryName: 'Deep Learning & NLP',
    description: 'Neural networks, architectures, and text processing.',
    skills: [
      {
        id: 's12',
        name: 'PyTorch',
        level: 'Novice',
        progress: 25,
        isVerified: false,
      },
      {
        id: 's13',
        name: 'Neural Nets',
        level: 'Developing',
        progress: 40,
        isVerified: false,
      },
      {
        id: 's14',
        name: 'Transformers',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's15',
        name: 'Tokenization',
        level: 'Novice',
        progress: 15,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c5',
    categoryName: 'Generative AI & MLOps',
    description: 'Modern LLMs, deployment, and infrastructure.',
    skills: [
      {
        id: 's16',
        name: 'Fine-Tuning (LoRA)',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's17',
        name: 'RAG',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's18',
        name: 'Vector DBs',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's19',
        name: 'FastAPI & Docker',
        level: 'Novice',
        progress: 10,
        isVerified: false,
      }
    ]
  }
];

export const SkillMatrix: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const getLevelColor = (level: SkillItem['level']) => {
    switch (level) {
      case 'Advanced': return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Intermediate': return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Developing': return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Novice': return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Locked': return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getProgressBarColor = (level: SkillItem['level']) => {
    switch (level) {
      case 'Advanced': return 'bg-emerald-500';
      case 'Intermediate': return 'bg-blue-500';
      case 'Developing': return 'bg-amber-500';
      case 'Novice': return 'bg-rose-500';
      case 'Locked': return 'bg-slate-300 dark:bg-slate-600';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Role Readiness Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#ea580c]" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Role Readiness Benchmark</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Target Role: AI/ML Engineer</p>
          </div>
          
          <div className="flex-1 max-w-xl w-full">
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">54% <span className="text-base font-bold text-slate-500 dark:text-slate-400 tracking-tight">Market Ready</span></span>
              <div className="flex gap-4 text-xs font-bold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> 5/19 Verified</span>
                <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400"><AlertTriangle className="w-3.5 h-3.5" /> 8 Critical Gaps</span>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ea580c] to-[#f97316] rounded-full transition-all duration-1000 ease-out" style={{ width: '54%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Skill Gap Diagnostics Card */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-500 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-400 text-sm sm:text-base">Critical Bottleneck Detected</h3>
            <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-500 mt-1">
              <strong>Linear Algebra & Optimization</strong> is at 45% (Developing) — this is a prerequisite for Deep Learning architectures.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer shadow-sm">
            Launch Remedial Lab
          </button>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-amber-600/20">
            Take Assessment
          </button>
        </div>
      </div>

      {/* Domain Skill Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SKILL_CLUSTERS.map(cluster => (
          <div key={cluster.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{cluster.categoryName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cluster.description}</p>
            </div>
            <div className="p-5 flex-1 space-y-4">
              {cluster.skills.map(skill => (
                <div 
                  key={skill.id} 
                  onClick={() => setSelectedSkill(skill)}
                  className="group flex flex-col gap-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#ea580c] transition-colors">{skill.name}</span>
                      {skill.isVerified && <span title="Verified"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /></span>}
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getLevelColor(skill.level))}>
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
      </div>

      {/* Skill Verification Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSkill(null)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSkill.name}</h2>
                  {selectedSkill.isVerified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                </div>
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border inline-block mt-2", getLevelColor(selectedSkill.level))}>
                  {selectedSkill.level} • {selectedSkill.progress}% Mastery
                </span>
              </div>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Verification Details */}
              {selectedSkill.isVerified && selectedSkill.verificationDetails ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verification Evidence</h3>
                  
                  {selectedSkill.verificationDetails.courseName && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedSkill.verificationDetails.courseName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">Completed</span>
                    </div>
                  )}

                  {selectedSkill.verificationDetails.labScore !== undefined && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-sm">
                        <FileCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Practical Lab Score</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedSkill.verificationDetails.labScore}%</span>
                    </div>
                  )}

                  {selectedSkill.verificationDetails.assessmentScore !== undefined && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-sm">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Diagnostic Assessment</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedSkill.verificationDetails.assessmentScore}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                    <ShieldCheck className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Not Yet Verified</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[250px] mx-auto">
                      Complete associated courses, labs, or pass the diagnostic assessment to verify this skill.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
               <button className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  Practice Lab
               </button>
               <button className="flex-1 py-2.5 bg-[#ea580c] hover:bg-[#d84d08] text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-[#ea580c]/20">
                  {selectedSkill.isVerified ? 'Re-test Skill' : 'Verify Now'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SkillMatrix;
