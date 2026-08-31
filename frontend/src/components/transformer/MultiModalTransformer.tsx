import React, { useState, useEffect, useMemo } from 'react';
import {
  LearningMode,
  TransformerModule,
  LearnerProgress,
  TRANSFORMER_MODULES,
  getModulesForRole,
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
  targetRole?: string;
  overview?: any;
}

export const MultiModalTransformer: React.FC<MultiModalTransformerProps> = ({
  initialStageId,
  targetRole,
  overview,
}) => {
  const roleModules = useMemo(() => {
    return getModulesForRole(targetRole || overview?.target_role, overview?.stages);
  }, [targetRole, overview]);

  const initialModule = useMemo(() => {
    if (initialStageId) {
      const match = roleModules.find((m) => m.stageId === initialStageId);
      if (match) return match;
    }
    return roleModules[0] || TRANSFORMER_MODULES[0];
  }, [roleModules, initialStageId]);

  const [currentModule, setCurrentModule] = useState<TransformerModule>(initialModule);
  const [currentMode, setCurrentMode] = useState<LearningMode>('video');
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformFrom, setTransformFrom] = useState<LearningMode>('video');

  // Real backend progress synchronization hook
  const { progress: backendProg, updateVideoTime, refetch: refetchProgress } = useModuleProgress(currentModule.id);

  // Local state initialized and synced with real backend data
  const [localProgress, setLocalProgress] = useState<LearnerProgress>(() => createInitialProgress(initialModule));

  // Sync current module if roleModules change
  useEffect(() => {
    const match = initialStageId
      ? roleModules.find((m) => m.stageId === initialStageId)
      : roleModules[0];
    if (match) {
      setCurrentModule(match);
      setLocalProgress(createInitialProgress(match));
    }
  }, [roleModules, initialStageId]);

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
        availableModules={roleModules}
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
