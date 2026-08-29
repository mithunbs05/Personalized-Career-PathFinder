import React, { useState } from 'react';
import { Play, CheckCircle2, BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import { Topic, RoadmapStage, LearningResource } from '../../types/roadmap';

interface LearningContentAreaProps {
  stage: RoadmapStage;
  topic: Topic;
  onMarkCompleted: () => void;
  onTakeAssessment: () => void;
  onStartPractice: () => void;
}

export const LearningContentArea: React.FC<LearningContentAreaProps> = ({
  stage,
  topic,
  onMarkCompleted,
  onTakeAssessment,
  onStartPractice,
}) => {
  const [accessedResources, setAccessedResources] = useState<Record<string, Date>>({});

  const handleResourceClick = (res: LearningResource) => {
    setAccessedResources((prev) => ({
      ...prev,
      [res.id]: new Date(),
    }));
    window.open(res.url, '_blank');
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] p-6 sm:p-10 shadow-xs overflow-y-auto">
      {/* Header Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-md text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase">
            {stage.title}
          </span>
          <span className="px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-md text-[10px] font-bold text-[#4A4A4A] dark:text-[#A0A09B]">
            Est. Time: {topic.estimatedTime}
          </span>
          <span className="px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-md text-[10px] font-bold text-[#4A4A4A] dark:text-[#A0A09B]">
            Difficulty: {stage.difficulty}
          </span>
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-4">{topic.title}</h1>
        
        <div className="w-full h-2 bg-[#E8E6DE] dark:bg-[#2C2C29] rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-[#FF4D31] transition-all" 
            style={{ width: `${topic.progress}%` }} 
          />
        </div>
        <div className="flex justify-between text-[11px] font-bold text-[#7A8B7C]">
          <span>Topic Progress</span>
          <span>{topic.progress}%</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="prose dark:prose-invert max-w-none mb-10">
        <h3 className="text-xl font-bold mb-2">What is {topic.title}?</h3>
        <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-6">
          {topic.learningContent.explanation}
        </p>

        <h3 className="text-xl font-bold mb-2">Key Concepts</h3>
        <ul className="space-y-2 mb-6">
          {topic.learningContent.keyConcepts.map((concept, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#7A8B7C] shrink-0 mt-0.5" />
              <span>{concept}</span>
            </li>
          ))}
        </ul>

        <div className="p-4 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
          <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#FF4D31]" />
            Practical Example
          </h4>
          <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] italic">
            "{topic.learningContent.example}"
          </p>
        </div>
      </div>

      {/* External Resources */}
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-4">Recommended Learning Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stage.resources.map((res) => {
            const accessedDate = accessedResources[res.id];
            
            return (
              <div key={res.id} className="p-5 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F9F8F3] dark:bg-[#252522] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8E6DE] dark:bg-[#1A1A18] text-[#7A8B7C]">
                    {res.type === 'COURSE' ? '📚' : res.type === 'DOCUMENTATION' ? '📖' : res.type === 'VIDEO' ? '🎥' : res.type === 'PRACTICE' ? '💻' : '🧪'} {res.type}
                  </span>
                  <span className="text-[10px] text-[#4A4A4A] dark:text-[#A0A09B]">{res.duration}</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold mb-1">{res.title}</h4>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">Provider: {res.provider}</p>
                </div>
                
                <div className="mt-auto pt-3 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between">
                  {accessedDate ? (
                    <div className="text-[10px] font-semibold text-[#7A8B7C]">
                      <span className="block text-[#FF4D31]">● Student marked as completed</span>
                      Last Accessed: {accessedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  ) : (
                    <div className="text-[10px] font-semibold text-[#4A4A4A] dark:text-[#A0A09B]">
                      ○ Not Started
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleResourceClick(res)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] text-[10px] font-bold hover:opacity-90 transition-opacity"
                  >
                    Open Resource <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion & Next Steps */}
      <div className="p-6 rounded-2xl border-2 border-[#FF4D31]/20 bg-[#FF4D31]/5 dark:bg-[#FF4D31]/10 flex flex-col items-center text-center">
        <GraduationCap className="w-10 h-10 text-[#FF4D31] mb-3" />
        <h3 className="text-lg font-bold mb-2">Topic Studied?</h3>
        <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] mb-6 max-w-md">
          Once you have completed the learning materials above, you should practice what you've learned before taking the final assessment.
        </p>
        
        <div className="flex items-center gap-4 w-full max-w-sm">
          <button
            onClick={onStartPractice}
            className="flex-1 py-3 rounded-full border border-[#7A8B7C] text-[#7A8B7C] hover:bg-[#7A8B7C] hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            Practice First
          </button>
          <button
            onClick={() => {
              onMarkCompleted();
              onTakeAssessment();
            }}
            className="flex-1 py-3 rounded-full bg-[#FF4D31] text-white font-bold text-xs shadow-md shadow-[#FF4D31]/20 hover:bg-[#E8402A] transition-all cursor-pointer"
          >
            Take Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
