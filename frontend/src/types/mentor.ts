// AI Mentor Feature — Type Definitions
// These types are specific to the AI Mentor and do not modify existing types.

export type MentorMode = 'learn' | 'practice' | 'assess';

export interface TodaysFocus {
  domain: string;
  skill: string;
  skillId: string;
  topic: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  mastery: number;
  estimatedMinutes: number;
  reason: string;
  blocksStage: string | null;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isAssessmentQuestion?: boolean;
  questionIndex?: number;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

export interface MentorSession {
  userId: string;
  targetRole: string;
  roadmapStage: string;
  domain: string;
  skill: string;
  topic: string | null;
  proficiency: number;
  priority: string;
  mode: MentorMode;
  startTime: string;
}

export interface AssessmentState {
  questions: AssessmentQuestion[];
  currentIndex: number;
  answers: (number | null)[];
  isComplete: boolean;
  score: number | null;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuickAction {
  label: string;
  prompt: string;
  icon: string;
}

export interface SkillOverride {
  skillId: string;
  newProgress: number;
}
