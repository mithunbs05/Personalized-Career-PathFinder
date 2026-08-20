export interface CourseItem {
  id: string;
  title: string;
  provider: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  rating: number;
  matchScore: number; // e.g. 98% AI Match
  tags: string[];
  thumbnailColor: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  skills: string[];
  description: string;
  deliverable: string;
  githubTemplateUrl?: string;
  status: 'not-started' | 'in-progress' | 'submitted' | 'reviewed';
}

export interface AssessmentQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AssessmentItem {
  id: string;
  title: string;
  skill: string;
  totalQuestions: number;
  durationMinutes: number;
  score?: number;
  status: 'available' | 'completed' | 'retake-recommended';
  difficulty: string;
}

export interface AIMentorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'navigate' | 'start-quiz' | 'view-roadmap' | 'add-skill';
    payload?: string;
  }[];
  recommendations?: {
    title: string;
    duration: string;
    priority: string;
  }[];
}
