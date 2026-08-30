import { request } from './api';

export interface LearningResourceItem {
  id: string;
  title: string;
  type: 'COURSE' | 'DOCUMENTATION' | 'VIDEO' | 'PRACTICE' | 'ASSESSMENT';
  provider: string;
  duration: string;
  url: string;
}

export interface RoadmapTopicItem {
  id: string;
  title: string;
  skill_id: string;
  skill_name: string;
  mastery: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'LOCKED';
  estimated_time: string;
  key_concepts: string[];
}

export interface PrerequisiteCheckItem {
  stage_id: number;
  stage_title: string;
  required_skills: string[];
  satisfied: boolean;
  missing_skills?: Array<{
    skill: string;
    required_mastery: number;
    current_mastery: number;
  }>;
}

export interface RoadmapStageSummary {
  id: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'NOT_STARTED' | 'LOCKED';
  difficulty: string;
  estimated_duration: string;
  progress: number;
  is_final_capstone: boolean;
  skills: string[];
}

export interface RoadmapStageDetail {
  id: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'AVAILABLE' | 'NOT_STARTED' | 'LOCKED';
  difficulty: string;
  estimated_duration: string;
  progress: number;
  completed_topics: number;
  total_topics: number;
  why_learn: string;
  career_relevance: string;
  prerequisites: string[];
  prerequisite_checks: PrerequisiteCheckItem[];
  skills: string[];
  learnings: string[];
  topics: RoadmapTopicItem[];
  resources: LearningResourceItem[];
  project: string;
  is_final_capstone: boolean;
  next_best_action: string;
  actions_available: string[];
}

export interface RoadmapOverviewResponse {
  user_id: string;
  user_name: string;
  target_role: string;
  overall_progress: number;
  completed_stages: number;
  total_stages: number;
  current_stage: RoadmapStageSummary | null;
  next_stage: RoadmapStageSummary | null;
  estimated_remaining_weeks: number;
  weekly_hours_budget?: number;
  target_timeline_months?: number;
  current_blocker: string | null;
  next_recommended_action: string;
  stages: RoadmapStageSummary[];
}

export const roadmapService = {
  async getRoadmap(role?: string): Promise<RoadmapOverviewResponse> {
    const url = role ? `/roadmap?role=${encodeURIComponent(role)}` : '/roadmap';
    return request<RoadmapOverviewResponse>(url);
  },

  async getStageDetails(stageId: number): Promise<RoadmapStageDetail> {
    return request<RoadmapStageDetail>(`/roadmap/${stageId}`);
  },

  async getDependencies(stageId: number): Promise<any> {
    return request<any>(`/roadmap/${stageId}/dependencies`);
  },

  async startStage(stageId: number): Promise<{ stage_id: number; status: string; message: string }> {
    return request<{ stage_id: number; status: string; message: string }>(`/roadmap/${stageId}/start`, {
      method: 'POST',
    });
  },

  async updateStageProgress(stageId: number, progress: number): Promise<any> {
    return request<any>(`/roadmap/${stageId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress }),
    });
  },

  async completeStage(stageId: number): Promise<{ stage_id: number; status: string; unlocked_stages: number[] }> {
    return request<{ stage_id: number; status: string; unlocked_stages: number[] }>(`/roadmap/${stageId}/complete`, {
      method: 'POST',
    });
  },
};
