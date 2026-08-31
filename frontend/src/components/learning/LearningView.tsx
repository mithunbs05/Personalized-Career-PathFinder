import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RoadmapStage, Topic, Assessment } from '../../types/roadmap';
import { TopicSidebar } from './TopicSidebar';
import { LearningContentArea } from './LearningContentArea';
import { PracticeAndAssessment } from './PracticeAndAssessment';

interface LearningViewProps {
  stage: RoadmapStage;
  onClose: () => void;
  onUpdateTopicStatus: (topicId: string, score?: number) => void;
}

type ViewMode = 'CONTENT' | 'PRACTICE' | 'ASSESSMENT' | 'RESULT';

export const LearningView: React.FC<LearningViewProps> = ({
  stage,
  onClose,
  onUpdateTopicStatus,
}) => {
  // Find the first non-completed, non-locked topic, or default to first
  const initialTopic = stage.topics?.find(t => t.status === 'IN_PROGRESS' || t.status === 'NOT_STARTED') || stage.topics?.[0];
  
  const [activeTopic, setActiveTopic] = useState<Topic | undefined>(initialTopic);
  const [viewMode, setViewMode] = useState<ViewMode>('CONTENT');
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);

  if (!stage.topics || stage.topics.length === 0 || !activeTopic) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29]">
        <h2 className="text-xl font-bold mb-4">No Topics Available</h2>
        <button onClick={onClose} className="px-6 py-2 rounded-full bg-[#FF4D31] text-white font-bold text-sm">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSelectTopic = (topic: Topic) => {
    setActiveTopic(topic);
    setViewMode('CONTENT');
  };

  const handleStartPractice = () => {
    // Generate mock assessment data for the topic if not provided by backend yet
    const mockAssessment: Assessment = {
      id: `ass-${activeTopic.id}`,
      passingScore: 75,
      attempts: 0,
      bestScore: null,
      status: 'NOT_STARTED',
      questions: [
        {
          id: 'q1',
          text: `You have a dataset containing house size and house price. What type of machine learning problem is this?`,
          options: ['Classification', 'Regression', 'Clustering', 'Dimensionality Reduction'],
          correctAnswer: 1,
          explanation: 'Since house prices are continuous numerical values, predicting them is a regression problem.'
        },
        {
          id: 'q2',
          text: `Which of the following is an example of supervised learning?`,
          options: ['Grouping customers by purchasing behavior', 'Predicting whether an email is spam', 'Reducing 100 features to 10', 'Finding anomalies in server logs'],
          correctAnswer: 1,
          explanation: 'Predicting spam involves learning from labeled examples (spam vs not spam), which is supervised learning.'
        },
        {
          id: 'q3',
          text: `What is the primary goal of the cost function in regression?`,
          options: ['To maximize the number of features', 'To measure how wrong the model is', 'To speed up training', 'To normalize the data'],
          correctAnswer: 1,
          explanation: 'The cost function measures the error between the predictions and the actual values, which we want to minimize.'
        }
      ]
    };
    setCurrentAssessment(mockAssessment);
    setViewMode('PRACTICE');
  };

  const handleStartAssessment = () => {
    if (!currentAssessment) {
      handleStartPractice(); // generate mock assessment if jumped straight to it
    }
    setViewMode('ASSESSMENT');
  };

  const handleCompleteAssessment = (score: number) => {
    setCurrentAssessment(prev => prev ? {
      ...prev,
      bestScore: Math.max(prev.bestScore || 0, score),
      attempts: prev.attempts + 1,
      status: score >= prev.passingScore ? 'PASSED' : 'FAILED'
    } : null);
    
    setViewMode('RESULT');
    
    if (score >= (currentAssessment?.passingScore || 75)) {
      onUpdateTopicStatus(activeTopic.id, score);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-center hover:bg-[#F9F8F3] dark:hover:bg-[#252522] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
        </button>
        <h1 className="text-2xl font-display font-bold">Learning Workspace</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <TopicSidebar 
          stage={stage} 
          activeTopic={activeTopic} 
          onSelectTopic={handleSelectTopic} 
        />
        
        {viewMode === 'CONTENT' && (
          <LearningContentArea 
            stage={stage}
            topic={activeTopic}
            onMarkCompleted={() => {}} // Could optimistically update local state here
            onTakeAssessment={handleStartAssessment}
            onStartPractice={handleStartPractice}
          />
        )}

        {viewMode !== 'CONTENT' && currentAssessment && (
          <PracticeAndAssessment 
            mode={viewMode}
            topic={activeTopic}
            assessment={currentAssessment}
            onFinishPractice={handleStartAssessment}
            onCompleteAssessment={handleCompleteAssessment}
            onRetake={handleStartAssessment}
            onReviewMaterial={() => setViewMode('CONTENT')}
            onNextTopic={() => {
              // Find next topic
              const idx = stage.topics!.findIndex(t => t.id === activeTopic.id);
              if (idx !== -1 && idx < stage.topics!.length - 1) {
                setActiveTopic(stage.topics![idx + 1]);
                setViewMode('CONTENT');
              } else {
                onClose(); // Finished all topics in stage
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
