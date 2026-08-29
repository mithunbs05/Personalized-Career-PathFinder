import { request } from './api';
import { LearningRoadmap } from '../types/roadmap';
import { AIMentorMessage } from '../types/learning';

export const roadmapService = {
  async getRoadmap(): Promise<LearningRoadmap> {
    return request<LearningRoadmap>('/roadmap');
  },

  async updateLesson(nodeId: string, lessonId: string, completed: boolean): Promise<{ success: boolean; roadmap: LearningRoadmap }> {
    return request<{ success: boolean; roadmap: LearningRoadmap }>('/roadmap/update-lesson', {
      method: 'POST',
      body: JSON.stringify({ nodeId, lessonId, completed }),
    });
  },

  async askAIMentor(message: string, context?: any): Promise<{ reply: string; suggestedActions?: any[] }> {
    return request<{ reply: string; suggestedActions?: any[] }>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  },

  async generateRoadmap(params?: { targetGoal?: string; experienceLevel?: string; weeklyHours?: number }): Promise<LearningRoadmap> {
    return request<LearningRoadmap>('/roadmap/generate', {
      method: 'POST',
      body: params ? JSON.stringify(params) : undefined,
    });
  },
};
