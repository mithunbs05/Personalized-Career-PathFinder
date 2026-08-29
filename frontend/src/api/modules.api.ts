// Module API Client for Content Transformer

export interface ModuleData {
  id: string;
  courseId: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'Beginner' | 'Guided' | 'Standard' | 'Advanced';
  learningObjectives: string[];
  concepts: string[];
}

export interface TranscriptItem {
  id: string;
  moduleId: string;
  timestamp: string;
  seconds: number;
  content: string;
  concept: string;
  order: number;
}

export interface AIContentBundle {
  narration: Array<{ timestamp: string; title: string; body: string }>;
  codeDemo: Array<{ title: string; language: string; code: string; explanation: string }>;
  visualFlow: Array<{ step: number; title: string; detail: string; status?: string }>;
  takeaways: Array<{ point: string; highlight: string }>;
}

export interface AIInsightData {
  id: string;
  userId: string;
  moduleId: string;
  insightText: string;
  recommendedAction: string;
}

export async function fetchModule(moduleId: string): Promise<ModuleData> {
  const res = await fetch(`/api/modules/${moduleId}`);
  if (!res.ok) throw new Error(`Failed to load module ${moduleId}`);
  const data = await res.json();
  return data.module;
}

export async function fetchTranscript(moduleId: string): Promise<TranscriptItem[]> {
  const res = await fetch(`/api/modules/${moduleId}/transcript`);
  if (!res.ok) throw new Error(`Failed to load transcript for ${moduleId}`);
  const data = await res.json();
  return data.transcripts || [];
}

export async function fetchAIContent(moduleId: string): Promise<AIContentBundle> {
  const res = await fetch(`/api/modules/${moduleId}/ai-content`);
  if (!res.ok) throw new Error(`Failed to load AI content for ${moduleId}`);
  const data = await res.json();
  return data.content;
}

export async function fetchAIInsight(moduleId: string): Promise<AIInsightData> {
  const res = await fetch(`/api/modules/${moduleId}/insight`);
  if (!res.ok) throw new Error(`Failed to load AI insight for ${moduleId}`);
  const data = await res.json();
  return data.insight;
}

export async function transformModule(moduleId: string, forceRegenerate = false): Promise<any> {
  const res = await fetch(`/api/modules/${moduleId}/transform`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceRegenerate })
  });
  if (!res.ok) throw new Error(`Failed to transform module ${moduleId}`);
  const data = await res.json();
  return data.challenge;
}
