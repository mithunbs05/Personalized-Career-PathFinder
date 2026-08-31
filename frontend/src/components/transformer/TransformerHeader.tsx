import React, { useState } from 'react';
import {
  Video,
  Code2,
  ChevronDown,
  Check
} from 'lucide-react';
import {
  TransformerModule,
  LearnerProgress,
  LearningMode,
  TRANSFORMER_MODULES
} from './transformerData';

interface TransformerHeaderProps {
  currentModule: TransformerModule;
  onSelectModule: (module: TransformerModule) => void;
  availableModules?: TransformerModule[];
  currentMode: LearningMode;
  onToggleMode: (newMode: LearningMode) => void;
  progress: LearnerProgress;
  isTransforming: boolean;
}

export const TransformerHeader: React.FC<TransformerHeaderProps> = ({
  currentModule,
  onSelectModule,
  availableModules,
  currentMode,
  onToggleMode,
  progress,
  isTransforming
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Overall unified progress percentage
  const unifiedPercent = Math.round((progress.conceptScore * 0.4) + (progress.practiceScore * 0.6));
  const modulesList = availableModules && availableModules.length > 0 ? availableModules : TRANSFORMER_MODULES;

  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 sm:px-6 sm:py-5 shadow-xs transition-colors">
      {/* Top Row: Meta tag & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Meta line */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          <span className="text-[#FF5A3D] font-bold">{currentModule.stageTitle ? currentModule.stageTitle.toUpperCase() : 'CURRICULUM'}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{currentModule.duration || '25 min'}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">{unifiedPercent}% Complete</span>
        </div>

        {/* Right: SaaS Segmented Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => !isTransforming && onToggleMode('video')}
            disabled={isTransforming}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentMode === 'video'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className={`w-3.5 h-3.5 ${currentMode === 'video' ? 'text-[#FF5A3D]' : 'text-slate-400'}`} />
            <span>Video Course</span>
          </button>

          <button
            onClick={() => !isTransforming && onToggleMode('coding')}
            disabled={isTransforming}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentMode === 'coding'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className={`w-3.5 h-3.5 ${currentMode === 'coding' ? 'text-[#FF5A3D]' : 'text-slate-400'}`} />
            <span>Coding Challenge</span>
          </button>
        </div>
      </div>

      {/* Center Row: Title & Subtitle */}
      <div className="mt-2.5 space-y-1">
        <div className="relative inline-block max-w-full">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#FF5A3D] transition-colors">
              {currentModule.title.replace(/\(Core Python\)/gi, '').trim()}
            </h1>
            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-[#FF5A3D] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Module Switcher Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 z-40 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Curriculum Module
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                {modulesList.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onSelectModule(mod);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      mod.id === currentModule.id
                        ? 'bg-orange-50/70 dark:bg-orange-950/40 text-[#FF5A3D] font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate">{mod.title.replace(/\(Core Python\)/gi, '').trim()}</p>
                      <span className="text-[10px] text-slate-400">{mod.stageTitle}</span>
                    </div>
                    {mod.id === currentModule.id && (
                      <Check className="w-3.5 h-3.5 text-[#FF5A3D] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
          {currentModule.subtitle}
        </p>
      </div>

      {/* Bottom Progress Row: Minimal, Linear & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16B981]"></span>
            <span>Concept <strong className="text-slate-800 dark:text-slate-200 font-semibold">{progress.conceptScore}%</strong></span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A3D]"></span>
            <span>Practice <strong className="text-slate-800 dark:text-slate-200 font-semibold">{progress.testsPassed}/{progress.totalTests} Tests Passed</strong></span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Mastery <strong className="text-slate-800 dark:text-slate-200 font-semibold">{progress.masteryLevel}</strong></span>
          </span>
        </div>

        {/* Minimal Thin Progress Bar */}
        <div className="flex items-center gap-2.5 min-w-[140px] self-end sm:self-auto">
          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
            {unifiedPercent}%
          </span>
          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5A3D] rounded-full transition-all duration-500"
              style={{ width: `${unifiedPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
