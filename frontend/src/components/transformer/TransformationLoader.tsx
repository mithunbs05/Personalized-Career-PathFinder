import React from 'react';
import { Sparkles, Code2, Video, Check } from 'lucide-react';

interface TransformationLoaderProps {
  fromMode: 'video' | 'coding';
  toMode: 'video' | 'coding';
  topicTitle: string;
}

export const TransformationLoader: React.FC<TransformationLoaderProps> = ({
  fromMode,
  toMode,
  topicTitle,
}) => {
  const isToCode = toMode === 'coding';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md mx-4">
        {/* Clean Minimal Modal */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl text-center space-y-4">
          
          {/* Mode Switch Icons */}
          <div className="flex items-center justify-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
              {fromMode === 'video' ? <Video className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
            </div>

            <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600">
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="w-1 h-1 rounded-full bg-[#FF5A3D]"></span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            </div>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[#FF5A3D]">
              {toMode === 'coding' ? <Code2 className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {isToCode
                ? 'AI is transforming this lesson into a coding challenge…'
                : 'Restoring video lesson & synchronized transcript…'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              {isToCode
                ? `Synthesizing problem statement, starter code, and test cases directly from "${topicTitle}".`
                : `Restoring full chapter navigation while preserving your written code.`}
            </p>
          </div>

          {/* Minimal steps */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-left text-xs text-slate-600 dark:text-slate-400">
            {(isToCode
              ? [
                  'Preserving core learning objectives & difficulty',
                  'Synthesizing interactive test suites',
                  'Generating starter code and progressive hints'
                ]
              : [
                  'Saving written code and current test attempts',
                  'Restoring video player timestamp',
                  'Synchronizing interactive instructor transcript'
                ]
            ).map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-3 h-3 text-[#16B981]" />
                <span className="text-[11px]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
