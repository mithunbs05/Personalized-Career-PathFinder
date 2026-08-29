// AI API Client for Lesson Chat

export interface LessonChatResponse {
  success: boolean;
  answer: string;
  relatedConcept: string;
}

export async function askLessonAI(moduleId: string, message: string): Promise<LessonChatResponse> {
  const res = await fetch(`/api/ai/lesson-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, message })
  });
  if (!res.ok) throw new Error("Failed to get response from AI Teaching Assistant");
  return await res.json();
}
