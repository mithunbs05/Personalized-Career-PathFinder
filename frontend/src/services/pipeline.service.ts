/**
 * Pipeline Service — Frontend client for the PathAI Dynamic Intelligence Pipeline.
 */

import { supabase } from '../lib/supabase';

const API_BASE = '/api/v1/pipeline';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Pipeline API error (${response.status}): ${errBody}`);
  }

  return response.json();
}

export interface DiagnosticQuestionItem {
  id: string;
  topic_id: string;
  topic_title: string;
  skill_name: string;
  domain: string;
  difficulty: string;
  text: string;
  options: string[];
}

export interface RoleFitCandidate {
  role_id: string;
  title: string;
  category: string;
  fit_score: number;
  model_confidence: number;
  is_primary: boolean;
  summary: string;
  strong_alignments: string[];
  critical_gaps: string[];
  evidence_breakdown: { category: string; title: string; detail: string }[];
}

export interface RolePredictionPayload {
  user_id: string;
  primary_role: RoleFitCandidate;
  alternative_roles: RoleFitCandidate[];
  is_ambiguous: boolean;
  ambiguity_explanation?: string;
  evaluated_at: string;
}

export interface CompetencyGapItem {
  topic_id: string;
  topic_title: string;
  skill_name: string;
  domain: string;
  current_mastery: number;
  required_mastery: number;
  deficit: number;
  gap_type: string;
  priority_score: number;
  is_blocking: boolean;
  blocked_topics: string[];
  reason: string;
  estimated_hours_to_close: number;
  completion_criteria: string;
}

export interface RoleGapAnalysisPayload {
  user_id: string;
  target_role: string;
  total_required_topics: number;
  mastered_count: number;
  developing_count: number;
  critical_gaps_count: number;
  unknown_evidence_count: number;
  overall_readiness_percentage: number;
  critical_blocker?: string;
  priority_gaps: CompetencyGapItem[];
  strong_competencies: string[];
}

export interface PersonalizedRoadmapPayload {
  user_id: string;
  user_name: string;
  target_role: string;
  roadmap_version: number;
  adaptation_reason?: string;
  overall_progress: number;
  completed_stages: number;
  total_stages: number;
  weekly_hours_budget: number;
  target_timeline_months: number;
  estimated_remaining_weeks: number;
  is_timeline_feasible: boolean;
  timeline_advisory?: string;
  current_stage?: any;
  next_stage?: any;
  current_blocker?: string;
  next_recommended_action: string;
  stages: any[];
}

export interface TopicKnowledgeItem {
  topic_id: string;
  topic_title: string;
  skill_id: string;
  skill_name: string;
  domain: string;
  mastery: number;
  confidence: number;
  evidence_count: number;
  status: string;
}

export interface LearnerKnowledgeProfile {
  user_id: string;
  total_topics_tracked: number;
  known_topics_count: number;
  mastered_topics_count: number;
  knowledge_coverage_percentage: number;
  average_mastery: number;
  overall_confidence: number;
  topics: Record<string, TopicKnowledgeItem>;
  domain_masteries: Record<string, number>;
  updated_at: string;
}

export const pipelineService = {
  /**
   * Retrieves full granular learner knowledge profile.
   */
  async getKnowledgeProfile(): Promise<LearnerKnowledgeProfile> {
    return request<LearnerKnowledgeProfile>('/knowledge');
  },

  /**
   * Selects adaptive diagnostic questions.
   */
  async startDiagnostic(targetRole = 'Machine Learning Engineer', maxQuestions = 6): Promise<{ questions: DiagnosticQuestionItem[] }> {
    return request<{ questions: DiagnosticQuestionItem[] }>('/diagnostic/start', {
      method: 'POST',
      body: JSON.stringify({ target_role: targetRole, max_questions: maxQuestions }),
    });
  },

  /**
   * Evaluates diagnostic quiz answers and updates knowledge state.
   */
  async evaluateDiagnostic(answers: { question_id: string; selected_option: number }[], sessionId?: string) {
    return request<any>('/diagnostic/evaluate', {
      method: 'POST',
      body: JSON.stringify({ answers, session_id: sessionId }),
    });
  },

  /**
   * Predicts ranked career roles with evidence breakdowns.
   */
  async predictRoles(profileOverride?: any): Promise<RolePredictionPayload> {
    return request<RolePredictionPayload>('/roles/predict', {
      method: 'POST',
      body: JSON.stringify({ profile_override: profileOverride }),
    });
  },

  /**
   * Retrieves root-cause topic gaps and priority gap-filling plans.
   */
  async getSkillGaps(role?: string): Promise<RoleGapAnalysisPayload> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return request<RoleGapAnalysisPayload>(`/gaps${query}`);
  },

  /**
   * Generates a personalized sequenced roadmap.
   */
  async generateRoadmap(targetRole?: string, weeklyHours = 10, targetMonths = 6, adaptationReason?: string): Promise<PersonalizedRoadmapPayload> {
    return request<PersonalizedRoadmapPayload>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({
        target_role: targetRole,
        weekly_hours: weeklyHours,
        target_months: targetMonths,
        adaptation_reason: adaptationReason,
      }),
    });
  },

  /**
   * Retrieves live personalized roadmap overview.
   */
  async getRoadmapOverview(role?: string): Promise<PersonalizedRoadmapPayload> {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return request<PersonalizedRoadmapPayload>(`/roadmap/overview${query}`);
  },
};

