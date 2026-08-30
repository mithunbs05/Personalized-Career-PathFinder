import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Lock, Check, Terminal, BrainCircuit, Play, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export type CustomStageStatus = 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'NOT_STARTED' | 'LOCKED';

type CustomNodeData = Node<{
  title: string;
  stageId: number;
  status: CustomStageStatus;
  difficulty: string;
  duration: string;
  isFinalCapstone?: boolean;
}, 'custom'>;

const CustomNode = ({ data, selected }: NodeProps<CustomNodeData>) => {
  const isCompleted = data.status === 'COMPLETED';
  const isInProgress = data.status === 'IN_PROGRESS';
  const isAvailable = data.status === 'AVAILABLE' || data.status === 'NOT_STARTED';
  const isLocked = data.status === 'LOCKED';

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white dark:bg-slate-900 border rounded-2xl p-5 min-w-[290px] transition-all cursor-pointer",
        selected
          ? "border-[#ea580c] shadow-lg shadow-[#ea580c]/15 ring-2 ring-[#ea580c]/30 scale-[1.03]"
          : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm",
        isInProgress && "border-orange-300 dark:border-orange-800 bg-orange-50/20 dark:bg-orange-950/10 shadow-md",
        isAvailable && "border-blue-200 dark:border-blue-900/60 bg-blue-50/10",
        isLocked && "opacity-70 bg-slate-50 dark:bg-slate-950"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "w-3 h-3 border-2 border-white dark:border-slate-900",
          isCompleted ? "bg-emerald-500" :
          isInProgress ? "bg-[#ea580c]" :
          isAvailable ? "bg-blue-500" :
          "bg-slate-300 dark:bg-slate-700"
        )}
      />

      {/* "YOU ARE HERE" active banner */}
      {isInProgress && (
        <div className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white text-[9px] font-black tracking-widest uppercase shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          YOU ARE HERE
        </div>
      )}

      {/* Top Badges */}
      <div className="flex items-center justify-between mb-2.5 mt-0.5">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full",
            data.isFinalCapstone ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300" :
            isInProgress ? "bg-orange-100 text-[#ea580c] dark:bg-orange-950/50" :
            isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
            isAvailable ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" :
            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          )}>
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
          isAvailable ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 border-blue-200 dark:border-blue-800" :
          "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700"
        )}>
          {isCompleted ? <Check className="w-3.5 h-3.5" /> :
           isInProgress ? <div className="w-2 h-2 bg-[#ea580c] rounded-full animate-pulse" /> :
           isAvailable ? <Play className="w-3 h-3 fill-current ml-0.5" /> :
           <Lock className="w-3 h-3" />}
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        "text-base font-bold mb-2 flex items-center gap-2",
        isLocked ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"
      )}>
        {data.isFinalCapstone ? <BrainCircuit className="w-4 h-4 text-[#ea580c]" /> : null}
        {data.title}
      </h3>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {data.duration}
        </span>
        <span className={cn(
          "text-[10px] font-bold",
          isCompleted ? "text-emerald-600 dark:text-emerald-400" :
          isInProgress ? "text-[#ea580c]" :
          isAvailable ? "text-blue-600 dark:text-blue-400" :
          "text-slate-400"
        )}>
          {isCompleted ? "Completed" : isInProgress ? "In Progress" : isAvailable ? "Ready to Start" : "Locked"}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "w-3 h-3 border-2 border-white dark:border-slate-900",
          isCompleted ? "bg-emerald-500" :
          isInProgress ? "bg-[#ea580c]" :
          isAvailable ? "bg-blue-500" :
          "bg-slate-300 dark:bg-slate-700"
        )}
      />
    </div>
  );
};

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default memo(CustomNode);

