import { useState, useEffect, useCallback } from "react";
import { fetchModuleProgress, saveVideoProgress, ModuleProgressData } from "../api/progress.api";

export function useModuleProgress(moduleId: string) {
  const [progress, setProgress] = useState<ModuleProgressData>({
    concept: 0,
    practice: { passed: 0, total: 5 },
    mastery: 'Beginner',
    overall: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      const data = await fetchModuleProgress(moduleId);
      setProgress(data);
    } catch (err) {
      console.warn("Error fetching module progress:", err);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const updateVideoTime = async (currentTime: number, duration: number, completed = false) => {
    try {
      const res = await saveVideoProgress(moduleId, currentTime, duration, completed);
      if (res.progress) {
        setProgress(prev => ({
          ...prev,
          ...res.progress,
          videoCurrentTime: currentTime,
          videoDuration: duration,
          videoCompleted: completed
        }));
      }
    } catch (err) {
      console.warn("Failed to sync video progress:", err);
    }
  };

  return {
    progress,
    isLoading,
    updateVideoTime,
    refetch: loadProgress,
    setProgress
  };
}
