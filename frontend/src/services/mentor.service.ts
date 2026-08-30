// AI Mentor Service — Client API Layer & Client-Side Intelligence
// Communicates with backend endpoints (/api/mentor/*) with deterministic fallback.

import { request } from './api';
import { RoadmapStage, SkillCluster, SkillItem } from '../types/roadmap';
import { User } from '../types/auth';
import {
  TodaysFocus,
  MentorMessage,
  MentorMode,
  AssessmentQuestion,
} from '../types/mentor';


// ---------------------------------------------------------------------------
// 1. Live Backend API Methods
// ---------------------------------------------------------------------------

export interface LearnerContextPayload {
  user_id: string;
  user_name: string;
  target_role: string;
  current_stage: string;
  current_stage_order: number;
  current_stage_progress: number;
  overall_mastery: number;
  focus: TodaysFocus | null;
  relevant_skills: Array<{
    id: string;
    name: string;
    domain: string;
    level: string;
    progress: number;
    is_verified?: boolean;
  }>;
  recent_assessments: any[];
  active_session_id?: string | null;
  active_session?: SessionResponsePayload | null;
  recent_messages?: Array<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
}

export function normalizeTodaysFocus(raw: any): TodaysFocus | null {
  if (!raw) return null;
  return {
    domain: raw.domain || 'Core Skills',
    skill: raw.skill || 'Foundational Skill',
    skillId: raw.skillId || raw.skill_id || 's1',
    topic: raw.topic || null,
    priority: (raw.priority || 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
    mastery: typeof raw.mastery === 'number' ? raw.mastery : 50,
    estimatedMinutes: raw.estimatedMinutes || raw.estimated_minutes || 45,
    reason: raw.reason || 'Recommended focus area based on your curriculum roadmap',
    blocksStage: raw.blocksStage || raw.blocks_stage || null,
  };
}

export interface SessionResponsePayload {
  id: string;
  user_id: string;
  domain: string;
  skill: string;
  skill_id?: string;
  topic?: string | null;
  roadmap_stage: string;
  mode: MentorMode;
  started_at: string;
  status: string;
  opening_message?: string;
}

export interface SendMessagePayload {
  id: string;
  reply: string;
  suggested_actions?: string[];
  topic?: string | null;
  recommended_action?: string;
}

export interface PracticeResponsePayload {
  topic: string;
  skill: string;
  exercise_prompt: string;
  difficulty: string;
  hints: string[];
  starter_code?: string;
}

export interface CreateAssessmentPayload {
  assessment_id: string;
  skill: string;
  topic?: string | null;
  total_questions: number;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
  }>;
}

export interface SubmitAssessmentPayload {
  assessment_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  results: Array<{
    question_id: string;
    correct: boolean;
    selected_option: number;
    correct_option: number;
    explanation: string;
  }>;
  new_mastery: number;
  skill_name: string;
  updated_focus?: TodaysFocus | null;
  mentor_feedback: string;
}

export const mentorService = {
  /**
   * Fetches real-time learner context, active stage, and today's focus from backend.
   */
  async getContext(): Promise<LearnerContextPayload> {
    const raw = await request<any>('/mentor/context');
    return {
      ...raw,
      focus: normalizeTodaysFocus(raw.focus),
      relevant_skills: raw.relevant_skills || [],
      recent_assessments: raw.recent_assessments || [],
      active_session_id: raw.active_session_id || null,
      active_session: raw.active_session || null,
      recent_messages: raw.recent_messages || [],
    };
  },

  /**
   * Calculates dynamic Today's Focus on the server.
   */
  async getTodaysFocus(): Promise<TodaysFocus> {
    const raw = await request<any>('/mentor/focus');
    return normalizeTodaysFocus(raw)!;
  },

  /**
   * Initializes a persistent mentor session.
   */
  async createSession(
    mode: MentorMode = 'learn',
    focus?: TodaysFocus | null
  ): Promise<SessionResponsePayload> {
    return request<SessionResponsePayload>('/mentor/sessions', {
      method: 'POST',
      body: JSON.stringify({
        mode,
        domain: focus?.domain,
        skill: focus?.skill,
        skill_id: focus?.skillId,
        topic: focus?.topic,
        roadmap_stage: focus?.blocksStage || 'Mathematics & Statistics',
      }),
    });
  },

  /**
   * Retrieves session history by ID.
   */
  async getSession(sessionId: string): Promise<{ session: SessionResponsePayload; messages: any[] }> {
    return request<{ session: SessionResponsePayload; messages: any[] }>(`/mentor/sessions/${sessionId}`);
  },

  /**
   * Sends user message to AI Mentor and receives conversational guidance.
   */
  async sendMessage(sessionId: string, message: string): Promise<SendMessagePayload> {
    return request<SendMessagePayload>(`/mentor/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Generates a practice challenge for the active session.
   */
  async getPractice(sessionId: string): Promise<PracticeResponsePayload> {
    return request<PracticeResponsePayload>(`/mentor/sessions/${sessionId}/practice`, {
      method: 'POST',
    });
  },

  /**
   * Generates a secure diagnostic assessment (without answer keys).
   */
  async createAssessment(sessionId: string): Promise<CreateAssessmentPayload> {
    return request<CreateAssessmentPayload>(`/mentor/sessions/${sessionId}/assessment`, {
      method: 'POST',
    });
  },

  /**
   * Submits learner answers for authoritative server-side grading and mastery update.
   */
  async submitAssessment(
    assessmentId: string,
    answers: number[]
  ): Promise<SubmitAssessmentPayload> {
    const raw = await request<any>(`/mentor/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    return {
      ...raw,
      updated_focus: normalizeTodaysFocus(raw.updated_focus),
    };
  },

  /**
   * Fetches user's current live skill proficiencies from the server.
   */
  async getUserSkills(): Promise<{ skills: any[] }> {
    return request<{ skills: any[] }>('/mentor/skills');
  },
};


// ---------------------------------------------------------------------------
// 2. Client-Side Priority Algorithm (Local Evaluation & Offline Fallback)
// ---------------------------------------------------------------------------

interface ScoredSkill {
  skill: SkillItem;
  domain: string;
  score: number;
  reason: string;
  blocksStage: string | null;
}

export function calculateTodaysFocus(
  stages: RoadmapStage[],
  skillClusters: SkillCluster[],
  _user: User | null,
  skillOverrides?: Record<string, number>
): TodaysFocus | null {
  // Build effective skill lookup with overrides
  const getEffectiveProgress = (skill: SkillItem): number => {
    if (skillOverrides && skillOverrides[skill.id] !== undefined) {
      return skillOverrides[skill.id];
    }
    return skill.progress;
  };

  const currentStage = stages.find(s => s.status === 'IN_PROGRESS' || s.status === 'AVAILABLE' || s.status === 'NOT_STARTED') || stages[0];
  const nextStage = stages.find(s => s.id > (currentStage?.id || 0) && s.status !== 'COMPLETED');

  if (!currentStage && !nextStage) {
    return null;
  }

  const allSkills: Map<string, { skill: SkillItem; domain: string }> = new Map();
  for (const cluster of skillClusters) {
    for (const skill of cluster.skills) {
      allSkills.set(skill.name.toLowerCase(), { skill, domain: cluster.categoryName });
    }
  }

  const scoredSkills: ScoredSkill[] = [];

  const scoreSkillsForStage = (
    stage: RoadmapStage,
    isCurrentStage: boolean,
    blockingStage: RoadmapStage | null
  ) => {
    const stageSkills = stage.skills && stage.skills.length > 0 ? stage.skills : [stage.title];
    for (const stageSkillName of stageSkills) {
      const match = allSkills.get(stageSkillName.toLowerCase());
      const effectiveProgress = match ? getEffectiveProgress(match.skill) : (stage.progress || 0);

      if (effectiveProgress >= 90) continue;

      let score = 0;
      const reasons: string[] = [];

      const gap = 100 - effectiveProgress;
      score += gap * 0.5;

      if (isCurrentStage) {
        score += 15;
        reasons.push(`Part of your active "${stage.title}" milestone`);
      }

      let blocksStageTitle: string | null = null;
      if (blockingStage) {
        score += 30;
        blocksStageTitle = blockingStage.title;
        reasons.push(`Prerequisite for upcoming "${blockingStage.title}" stage`);
      }

      if (effectiveProgress < 30) {
        score += 20;
        reasons.push('Essential foundational topic — low verified mastery');
      } else if (effectiveProgress < 50) {
        score += 10;
        reasons.push('Developing competency — needs focused practice');
      }

      scoredSkills.push({
        skill: match ? { ...match.skill, progress: effectiveProgress } : {
          id: `sk-${stage.id}`,
          name: stageSkillName,
          level: effectiveProgress >= 70 ? 'Proficient' : (effectiveProgress >= 40 ? 'Developing' : 'Novice'),
          progress: effectiveProgress,
          isVerified: effectiveProgress >= 75,
        },
        domain: match ? match.domain : stage.title,
        score,
        reason: reasons[0] || `Core competency for ${stage.title}`,
        blocksStage: blocksStageTitle,
      });
    }
  };

  if (currentStage) {
    scoreSkillsForStage(currentStage, true, nextStage || null);
  }

  if (nextStage) {
    const stageAfterNext = stages.find(
      s => s.status === 'LOCKED' && s.prerequisites && s.prerequisites.includes(nextStage.title)
    );
    scoreSkillsForStage(nextStage, false, stageAfterNext || null);
  }

  if (scoredSkills.length === 0) {
    if (currentStage) {
      return {
        domain: currentStage.title,
        skill: (currentStage.skills && currentStage.skills[0]) || currentStage.title,
        skillId: `stg-${currentStage.id}`,
        topic: null,
        priority: 'HIGH',
        mastery: currentStage.progress || 0,
        estimatedMinutes: 30,
        reason: `Targeting active milestone '${currentStage.title}' to advance your roadmap progress.`,
        blocksStage: nextStage?.title || null,
      };
    }
    return null;
  }

  scoredSkills.sort((a, b) => b.score - a.score);
  const top = scoredSkills[0];

  let priority: TodaysFocus['priority'] = 'MEDIUM';
  if (top.score >= 60) priority = 'HIGH';
  else if (top.score < 30) priority = 'LOW';

  let estimatedMinutes = 45;
  if (top.skill.progress < 30) estimatedMinutes = 60;
  else if (top.skill.progress < 50) estimatedMinutes = 45;
  else if (top.skill.progress < 70) estimatedMinutes = 30;
  else estimatedMinutes = 20;

  return {
    domain: top.domain,
    skill: top.skill.name,
    skillId: top.skill.id,
    topic: null,
    priority,
    mastery: top.skill.progress,
    estimatedMinutes,
    reason: top.reason,
    blocksStage: top.blocksStage,
  };
}

// ---------------------------------------------------------------------------
// 3. Fallback Question Bank & Explanations
// ---------------------------------------------------------------------------

export function getMentorGreeting(
  focus: TodaysFocus | null,
  userName: string,
  targetRole: string,
  mode: MentorMode
): MentorMessage {
  let text: string;

  if (!focus) {
    text = `Hello ${userName}! 👋\n\nI'm your personalized AI Mentor for your **${targetRole}** path.\n\nAsk me anything about your learning roadmap or click **Start Session** to begin!`;
  } else {
    const modeIntro: Record<MentorMode, string> = {
      learn: `Let's start by building your understanding of **${focus.skill}**${focus.topic ? ` — specifically **${focus.topic}**` : ''}. I'll explain concepts at a level that matches your current ${focus.mastery}% mastery.`,
      practice: `Let's practice **${focus.skill}**${focus.topic ? ` — focusing on **${focus.topic}**` : ''}. I'll generate exercises tailored to strengthen your current ${focus.mastery}% mastery level.`,
      assess: `Let's test your knowledge of **${focus.skill}**${focus.topic ? ` — specifically **${focus.topic}**` : ''}. I'll ask focused questions to evaluate your understanding and identify gaps.`,
    };

    text = `Hello ${userName}! 👋\n\nI'm your personalized AI Mentor for your **${targetRole}** journey.\n\n📌 **Today's Focus: ${focus.skill}** (${focus.mastery}% mastery)\n\n${focus.reason}.\n\n${modeIntro[mode]}\n\nWhat would you like to start with?`;
  }

  return {
    id: `greeting-${Date.now()}`,
    sender: 'ai',
    text,
    timestamp: new Date().toISOString(),
  };
}

export function getSessionGreeting(
  focus: TodaysFocus,
  targetRole: string,
  mode: MentorMode
): MentorMessage {
  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

  const text = `🎯 **${modeLabel} Session Started — ${focus.skill}**\n\nYou're currently working on **${focus.skill}** (${focus.mastery}% mastery). This topic was selected because: *${focus.reason}*.\n\n${
    mode === 'learn'
      ? `Let's begin with concepts appropriate for your current level. What specific concept would you like to master first?`
      : mode === 'practice'
      ? `I'll generate practice exercises at your current level. Let's start!`
      : `I'll test your knowledge with a diagnostic assessment. Answer each question to the best of your ability.`
  }`;

  return {
    id: `session-${Date.now()}`,
    sender: 'ai',
    text,
    timestamp: new Date().toISOString(),
  };
}

export function getMentorResponse(
  userMessage: string,
  focus: TodaysFocus | null,
  mode: MentorMode,
  targetRole: string,
  currentStageName: string
): MentorMessage {
  return {
    id: `response-${Date.now()}`,
    sender: 'ai',
    text: `I'm analyzing your request regarding **${focus?.skill || currentStageName}** for your **${targetRole}** goal. Let's practice or take a quick assessment to reinforce your understanding!`,
    timestamp: new Date().toISOString(),
  };
}

export function getAssessmentQuestions(focus: TodaysFocus | null): AssessmentQuestion[] {
  return [
    { id: 'la-1', text: 'What is the result of multiplying a 3×2 matrix by a 2×4 matrix?', options: ['A 3×4 matrix', 'A 2×3 matrix', 'A 3×2 matrix', 'Not possible'], correctAnswer: 0, explanation: 'Matrix multiplication (3×2) × (2×4) = 3×4.' },
    { id: 'la-2', text: 'What does the determinant of a matrix tell us?', options: ['The number of rows', 'Whether the matrix is invertible and the volume scaling factor', 'The trace of the matrix', 'The rank only'], correctAnswer: 1, explanation: 'The determinant indicates invertibility and linear transformation scaling factor.' },
    { id: 'la-3', text: 'What are eigenvalues?', options: ['The diagonal elements of any matrix', 'Scalars λ where Av = λv for non-zero v', 'The inverse of the matrix', 'The row echelon form entries'], correctAnswer: 1, explanation: 'Eigenvalues are scalars λ such that Av = λv.' },
  ];
}
