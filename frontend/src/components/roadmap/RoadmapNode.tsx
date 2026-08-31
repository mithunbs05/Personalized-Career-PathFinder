import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, Lock, GitCommit } from 'lucide-react';
import { RoadmapStage } from '../../types/roadmap';

interface RoadmapNodeProps {
  data: {
    stage: RoadmapStage;
    index: number;
    isSelected: boolean;
    onClick: (stage: RoadmapStage) => void;
  };
}

export const RoadmapNode = ({ data }: RoadmapNodeProps) => {
  const { stage, index, isSelected, onClick } = data;
  const isCompleted = stage.status === 'COMPLETED';
  const isCurrent = stage.status === 'IN_PROGRESS';
  const isLocked = stage.status === 'LOCKED';

  return (
    <div
      onClick={() => onClick(stage)}
      className={`relative p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#1A1A18] flex flex-col gap-4 w-[350px] ${
        isSelected
          ? 'border-[#FF4D31] shadow-[0_0_15px_rgba(255,77,49,0.3)] ring-1 ring-[#FF4D31]'
          : isCompleted 
          ? 'border-[#7A8B7C]/50 hover:border-[#7A8B7C]' 
          : 'border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#E8E6DE] dark:bg-[#4A4A4A] border-none" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 z-10 ${
              isCompleted
                ? 'bg-[#7A8B7C]/20 text-[#7A8B7C] border border-[#7A8B7C]/30'
                : isCurrent
                ? 'bg-[#FF4D31]/10 text-[#FF4D31] shadow-md shadow-[#FF4D31]/20 animate-pulse border border-[#FF4D31]/30'
                : isLocked
                ? 'bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] border border-[#2C2C29]'
                : 'bg-[#F1EFE7] dark:bg-[#252522] text-white border border-[#2C2C29]'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isCurrent ? (
              <GitCommit className="w-5 h-5" />
            ) : isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[15px] font-bold text-[#1A1A1A] dark:text-[#E8E6DE]">{stage.title}</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 mt-1 inline-block rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
              {stage.estimatedDuration}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
        {stage.skills.slice(0, 3).join(' • ')}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#E8E6DE] dark:bg-[#4A4A4A] border-none" />
    </div>
  );
};
