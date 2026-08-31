// Progress API Client

export interface ModuleProgressData {
  concept: number;
  practice: {
    passed: number;
    total: number;
  };
  mastery: 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
  overall: number;
  videoCurrentTime?: number;
  videoDuration?: number;
  videoCompleted?: boolean;
  savedDraftCode?: string;
  activeMode?: 'VIDEO' | 'CODING';
}

export async function fetchModuleProgress(moduleId: string): Promise<ModuleProgressData> {
  const res = await fetch(`/api/modules/${moduleId}/progress`);
  if (!res.ok) throw new Error(`Failed to load progress for module ${moduleId}`);
  const data = await res.json();
  return {
    concept: data.concept || 0,
    practice: data.practice || { passed: 0, total: 5 },
    mastery: data.mastery || 'Beginner',
    overall: data.overall || 0,
    videoCurrentTime: data.videoCurrentTime,
    videoDuration: data.videoDuration,
    videoCompleted: data.videoCompleted,
    savedDraftCode: data.savedDraftCode,
    activeMode: data.activeMode
  };
}

export async function saveVideoProgress(
  moduleId: string,
  currentTime: number,
  duration: number,
  completed = false
): Promise<any> {
  const res = await fetch(`/api/modules/${moduleId}/video-progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentTime, duration, completed })
  });
  if (!res.ok) throw new Error(`Failed to save video progress`);
  return await res.json();
}
