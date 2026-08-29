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

  const [moduleProgressMap, setModuleProgressMap] = useState<Record<string, LearnerProgress>>(() => {
    const initialMap: Record<string, LearnerProgress> = {};
    TRANSFORMER_MODULES.forEach((mod) => {
      initialMap[mod.id] = createInitialProgress(mod);
    });
    return initialMap;
  });

  const currentProgress = moduleProgressMap[currentModule.id] || createInitialProgress(currentModule);

  useEffect(() => {
    if (initialStageId) {
      const match = TRANSFORMER_MODULES.find((m) => m.stageId === initialStageId);
      if (match && match.id !== currentModule.id) {
        setCurrentModule(match);
      }
    }
  }, [initialStageId]);

  const handleUpdateProgress = (update: Partial<LearnerProgress>) => {
    setModuleProgressMap((prev) => ({
      ...prev,
      [currentModule.id]: {
        ...currentProgress,
        ...update
      }
    }));
  };

  const handleToggleMode = (targetMode: LearningMode) => {
    if (targetMode === currentMode || isTransforming) return;

    setTransformFrom(currentMode);
    setIsTransforming(true);

    if (targetMode === 'coding') {
      fetch('/api/transformer/transform-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleTitle: currentModule.title,
          objectives: currentModule.objectives,
          keyTakeaways: currentModule.keyTakeaways,
          difficulty: currentProgress.currentDifficulty || currentModule.challenge.difficulty,
          currentTranscript: currentModule.chapters[currentProgress.currentChapterIndex]?.transcript
        })
      }).catch((err) => console.warn('Transform endpoint background notice:', err));
    }

    setTimeout(() => {
      setCurrentMode(targetMode);
      setIsTransforming(false);
      handleUpdateProgress({ lastMode: targetMode });
    }, 1800);
  };

  const handleSelectModule = (mod: TransformerModule) => {
    setCurrentModule(mod);
    const saved = moduleProgressMap[mod.id];
    if (saved?.lastMode) {
      setCurrentMode(saved.lastMode);
    }
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

      {/* Header matching exact layout in user screenshot */}
      <TransformerHeader
        currentModule={currentModule}
        onSelectModule={handleSelectModule}
        currentMode={currentMode}
        onToggleMode={handleToggleMode}
        progress={currentProgress}
        isTransforming={isTransforming}
      />

      {/* Active Mode Workspace */}
      <div className="transition-all duration-300">
        {currentMode === 'video' ? (
          <VideoCourseMode
            module={currentModule}
            progress={currentProgress}
            onProgressUpdate={handleUpdateProgress}
            onSwitchToCoding={() => handleToggleMode('coding')}
          />
        ) : (
          <CodingChallengeMode
            module={currentModule}
            progress={currentProgress}
            onProgressUpdate={handleUpdateProgress}
            onSwitchToVideo={() => handleToggleMode('video')}
          />
        )}
      </div>
    </div>
  );
};

export default MultiModalTransformer;
