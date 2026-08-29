import { request } from './api';
import { RecommendationsResponse } from '../types/recommendations';

export const recommendationsService = {
  async getRecommendations(): Promise<RecommendationsResponse> {
    return request<RecommendationsResponse>('/recommendations');
  },

  async refreshRecommendations(): Promise<RecommendationsResponse> {
    return request<RecommendationsResponse>('/recommendations/refresh', {
      method: 'POST',
    });
  },

  async dismissRecommendation(
    id: string,
    type: 'course' | 'project' | 'resource'
  ): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/recommendations/dismiss', {
      method: 'POST',
      body: JSON.stringify({ id, type }),
    });
  },
};
