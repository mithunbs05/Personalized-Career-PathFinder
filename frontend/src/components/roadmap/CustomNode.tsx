import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Lock, Check, BookOpen, Code, Terminal, BrainCircuit, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StageStatus } from '../../types/roadmap';

type CustomNodeData = Node<{
  title: string;
  stageId: number;
  status: StageStatus;
  difficulty: string;
  duration: string;
  isFinalCapstone?: boolean;
}, 'custom'>;

const CustomNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const isCompleted = data.status === 'COMPLETED';
  const isInProgress = data.status === 'IN_PROGRESS';
  const isLocked = data.status === 'LOCKED';
  
  return (
    <div
      className={cn(
        "relative flex flex-col bg-white dark:bg-slate-900 border shadow-sm rounded-2xl p-5 min-w-[280px] transition-all",
        selected ? "border-[#ea580c] shadow-md shadow-[#ea580c]/10 scale-[1.02]" : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600",
        isLocked && "opacity-75 bg-slate-50 dark:bg-slate-950"
      )}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={cn("w-3 h-3 border-2 border-white dark:border-slate-900", isCompleted ? "bg-emerald-500" : isInProgress ? "bg-[#ea580c]" : "bg-slate-300 dark:bg-slate-700")} 
      />
      
      {/* Top Badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-[#ea580c] tracking-wider uppercase bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full">
            {data.isFinalCapstone ? 'CAPSTONE' : `STAGE ${data.stageId}`}
          </span>
          {!data.isFinalCapstone && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
              {data.difficulty}
            </span>
          )}
        </div>
        
        {/* Status Icon */}
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center border",
          isCompleted ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-200 dark:border-emerald-800" :
          isInProgress ? "bg-orange-50 dark:bg-orange-950/50 text-[#ea580c] border-orange-200 dark:border-orange-800" :
          isLocked ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700" :
          "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700"
        )}>
          {isCompleted ? <Check className="w-3.5 h-3.5" /> : 
           isInProgress ? <div className="w-2 h-2 bg-[#ea580c] rounded-full animate-pulse" /> : 
           isLocked ? <Lock className="w-3 h-3" /> : 
           <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />}
        </div>
      </div>
      
      {/* Title */}
      <h3 className={cn("text-base font-bold mb-2 flex items-center gap-2", isLocked ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white")}>
        {data.isFinalCapstone ? <BrainCircuit className="w-4 h-4 text-[#ea580c]" /> : null}
        {data.title}
      </h3>
      
      {/* Footer info */}
      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          {data.duration}
        </span>
        {data.isFinalCapstone && (
          <span className="flex items-center gap-1">
             <Terminal className="w-3 h-3 text-slate-400 dark:text-slate-500" />
             Project
          </span>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={cn("w-3 h-3 border-2 border-white dark:border-slate-900", isCompleted ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")} 
      />
    </div>
  );
};

// Extracted Clock icon since it was missing from lucide imports
const Clock = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default memo(CustomNode);
