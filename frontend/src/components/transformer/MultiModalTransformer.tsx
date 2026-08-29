import React, { useState, useEffect } from 'react';
import {
  LearningMode,
  TransformerModule,
  LearnerProgress,
  TRANSFORMER_MODULES,
  createInitialProgress
} from './transformerData';
import { TransformerHeader } from './TransformerHeader';
import { VideoCourseMode } from './VideoCourseMode';
import { CodingChallengeMode } from './CodingChallengeMode';
import { TransformationLoader } from './TransformationLoader';
import { useModuleProgress } from '../../hooks/useModuleProgress';
import { transformModule } from '../../api/modules.api';

interface MultiModalTransformerProps {
  initialStageId?: number;
}

export const MultiModalTransformer: React.FC<MultiModalTransformerProps> = ({ initialStageId }) => {
  const initialModule = (initialStageId
    ? TRANSFORMER_MODULES.find((m) => m.stageId === initialStageId)
    : TRANSFORMER_MODULES[0]) || TRANSFORMER_MODULES[0];

  const [currentModule, setCurrentModule] = useState<TransformerModule>(initialModule);
  const [currentMode, setCurrentMode] = useState<LearningMode>('video');
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformFrom, setTransformFrom] = useState<LearningMode>('video');

  // Real backend progress synchronization hook
  const { progress: backendProg, updateVideoTime, refetch: refetchProgress } = useModuleProgress(currentModule.id);

  // Local state initialized and synced with real backend data
  const [localProgress, setLocalProgress] = useState<LearnerProgress>(() => createInitialProgress(initialModule));

  useEffect(() => {
    if (backendProg) {
      setLocalProgress((prev) => ({
        ...prev,
        conceptScore: backendProg.concept || prev.conceptScore,
        practiceScore: backendProg.practice?.passed
          ? Math.round((backendProg.practice.passed / (backendProg.practice.total || 5)) * 100)
          : prev.practiceScore,
        testsPassed: backendProg.practice?.passed ?? prev.testsPassed,
        totalTests: backendProg.practice?.total ?? prev.totalTests,
        masteryLevel: (backendProg.mastery as any) || prev.masteryLevel,
        videoTimePosition: backendProg.videoCurrentTime ?? prev.videoTimePosition,
        writtenCode: backendProg.savedDraftCode || prev.writtenCode
      }));
    }
  }, [backendProg]);

  useEffect(() => {
    if (initialStageId) {
      const match = TRANSFORMER_MODULES.find((m) => m.stageId === initialStageId);
      if (match && match.id !== currentModule.id) {
        setCurrentModule(match);
      }
    }
  }, [initialStageId]);

  const handleUpdateProgress = (update: Partial<LearnerProgress>) => {
    setLocalProgress((prev) => ({
      ...prev,
      ...update
    }));

    if (update.videoTimePosition !== undefined) {
      updateVideoTime(update.videoTimePosition, 720, (update.videoTimePosition >= 710));
    }
  };

  const handleToggleMode = async (targetMode: LearningMode) => {
    if (targetMode === currentMode || isTransforming) return;

    setTransformFrom(currentMode);
    setIsTransforming(true);

    if (targetMode === 'coding') {
      try {
        await transformModule(currentModule.id);
      } catch (err) {
        console.warn('Transform endpoint background execution:', err);
      }
    }

    setTimeout(() => {
      setCurrentMode(targetMode);
      setIsTransforming(false);
      handleUpdateProgress({ lastMode: targetMode });
      refetchProgress();
    }, 1200);
  };

  const handleSelectModule = (mod: TransformerModule) => {
    setCurrentModule(mod);
  };

  return (
    <div className="space-y-4">
      {/* Transformation Animated Modal Overlay */}
      {isTransforming && (
        <TransformationLoader
          fromMode={transformFrom}
          toMode={currentMode === 'video' ? 'coding' : 'video'}
          topicTitle={currentModule.title}
        />
      )}

      {/* Header matching exact minimal layout */}
      <TransformerHeader
        currentModule={currentModule}
        onSelectModule={handleSelectModule}
        currentMode={currentMode}
        onToggleMode={handleToggleMode}
        progress={localProgress}
        isTransforming={isTransforming}
      />

      {/* Active Mode Workspace */}
      <div className="transition-all duration-300">
        {currentMode === 'video' ? (
          <VideoCourseMode
            module={currentModule}
            progress={localProgress}
            onProgressUpdate={handleUpdateProgress}
            onSwitchToCoding={() => handleToggleMode('coding')}
          />
        ) : (
          <CodingChallengeMode
            module={currentModule}
            progress={localProgress}
            onProgressUpdate={handleUpdateProgress}
            onSwitchToVideo={() => handleToggleMode('video')}
          />
        )}
      </div>
    </div>
  );
};

export default MultiModalTransformer;
