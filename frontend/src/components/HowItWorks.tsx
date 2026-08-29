import React from 'react';
import { motion } from 'motion/react';
import { Target, ScanEye, Route, RefreshCw, CheckCircle2 } from 'lucide-react';
import { TiltCard } from './3d/TiltCard';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Tell PathAI your goal',
      icon: Target,
      tag: 'OBJECTIVE',
      headline: '"I want to become an AI Engineer."',
      description: 'Define your desired job title, promotion target, exam prep, or startup vision. PathAI reverse-engineers the exact production competencies required.',
      highlight: 'Target Goal Modeling & Skill Ontologies',
      color: '#FF4D31',
    },
    {
      number: '02',
      title: 'Understand your starting point',
      icon: ScanEye,
      tag: 'DIAGNOSTICS',
      headline: 'Deep multi-factor baseline assessment',
      description: 'PathAI inspects what you already know across languages, math, tools, frameworks, and past repositories to bypass redundant introductory content.',
      highlight: 'Knowledge Gap vs. Mastered Competencies',
      color: '#7A8B7C',
    },
    {
      number: '03',
      title: 'Generate your path',
      icon: Route,
      tag: 'SYNTHESIS',
      headline: 'Courses → Skills → Projects → Milestones',
      description: 'The engine creates a connected graph with estimated completion timelines, curated interactive lessons, and real-world capstone deliverables.',
      highlight: 'Zero Bloat, High-Relevance Sequencing',
      color: '#FF4D31',
    },
    {
      number: '04',
      title: 'Adapt as you grow',
      icon: RefreshCw,
      tag: 'DYNAMIC RE-ROUTING',
      headline: 'Continuous reinforcement & pacing',
      description: 'If you ace a quiz early, subsequent nodes accelerate. If you encounter a gap during a project, PathAI injects surgical micro-modules on the fly.',
      highlight: 'Real-time Closed-Loop Intelligence',
      color: '#7A8B7C',
    },
  ];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-transparent transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4 shadow-2xs">
            METHODOLOGY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            How PathAI builds your future.
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4 leading-relaxed">
            From initial aspirations to production-grade mastery in four intelligent, structured steps.
          </p>
        </div>

        {/* 4 3D Tilt Step Cards */}
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E6DE] dark:bg-[#2C2C29] -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = activeStep === idx;

              return (
                <TiltCard key={step.number} maxTilt={8} scale={1.02}>
                  <div
                    onMouseEnter={() => setActiveStep(idx)}
                    className={`bg-white dark:bg-[#1A1A18] rounded-3xl p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
                      isCurrent
                        ? 'border-[#FF4D31] shadow-xl shadow-[#FF4D31]/10 ring-2 ring-[#FF4D31]/20'
                        : 'border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C] shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Step Number & Icon */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-display font-black text-2xl text-[#7A8B7C]/40">
                          {step.number}
                        </span>
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: step.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C] mb-3 inline-block">
                        {step.tag}
                      </span>

                      <h3 className="text-lg font-display font-bold text-[#1A1A1A] dark:text-white mb-2">
                        {step.title}
                      </h3>

                      <div className="p-3 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] mb-3 text-xs font-semibold text-[#1A1A1A] dark:text-white">
                        {step.headline}
                      </div>

                      <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center gap-2 text-[11px] font-semibold text-[#7A8B7C]">
                      <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" />
                      <span>{step.highlight}</span>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
        
      </div>
    </section>
  );
};
