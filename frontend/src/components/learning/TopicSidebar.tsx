import React from 'react';
import { CheckCircle2, Lock, PlayCircle, Circle } from 'lucide-react';
import { Topic, RoadmapStage } from '../../types/roadmap';

interface TopicSidebarProps {
  stage: RoadmapStage;
  activeTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
}

export const TopicSidebar: React.FC<TopicSidebarProps> = ({ stage, activeTopic, onSelectTopic }) => {
  if (!stage.topics) return null;

  return (
    <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] p-6 flex flex-col gap-6 h-[calc(100vh-140px)] overflow-y-auto sticky top-24">
      <div>
        <h2 className="font-display font-bold text-lg mb-1">{stage.title}</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8B7C]">
          Module Navigation
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {stage.topics.map((topic, index) => {
          const isActive = activeTopic.id === topic.id;
          const isCompleted = topic.status === 'COMPLETED';
          const isLocked = topic.status === 'LOCKED';
          const inProgress = topic.status === 'IN_PROGRESS';

          return (
            <button
              key={topic.id}
              onClick={() => !isLocked && onSelectTopic(topic)}
              disabled={isLocked}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-[#F9F8F3] dark:bg-[#252522] border border-[#FF4D31] shadow-sm'
                  : 'hover:bg-[#F9F8F3] dark:hover:bg-[#252522] border border-transparent'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#7A8B7C]" />
                ) : inProgress ? (
                  <PlayCircle className="w-5 h-5 text-[#FF4D31]" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5 text-[#4A4A4A]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#4A4A4A]" />
                )}
              </div>
              <div>
                <div className={`text-sm font-bold ${isActive ? 'text-[#FF4D31]' : 'text-[#1A1A1A] dark:text-[#E8E6DE]'}`}>
                  {topic.title}
                </div>
                {isActive && (
                  <div className="text-[10px] uppercase font-bold text-[#7A8B7C] mt-0.5">
                    Current Topic
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
