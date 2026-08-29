// Strict TypeScript Types for CareerGPS / LearnAI Role-Based Learning Roadmap

export type ResourceType = 'COURSE' | 'DOCUMENTATION' | 'VIDEO' | 'PRACTICE' | 'ASSESSMENT';
export type StageStatus = 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'NOT_STARTED';

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  provider: string;
  duration: string;
  url: string;
}

export type TopicStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'LOCKED';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation: string;
}

export interface Assessment {
  id: string;
  questions: Question[];
  passingScore: number;
  attempts: number;
  bestScore: number | null;
  status: 'NOT_STARTED' | 'PASSED' | 'FAILED';
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  learningContent: {
    explanation: string;
    keyConcepts: string[];
    example: string;
  };
  estimatedTime: string;
  prerequisites: string[];
  status: TopicStatus;
  progress: number;
  assessmentId: string | null;
}

export interface RoadmapStage {
  id: number;
  title: string;
  status: StageStatus;
  difficulty: string;
  estimatedDuration: string;
  whyLearn: string;
  prerequisites: string[];
  skills: string[];
  learnings: string[];
  resources: LearningResource[];
  project: string;
  assessment: string;
  topics?: Topic[]; // Added for Learning System
  isFinalCapstone?: boolean;
}

export interface RoadmapData {
  role: string;
  subtitle: string;
  currentLevel: string;
  estimatedDuration: string;
  metrics: {
    totalStages: number;
    coreSkillAreas: number;
    recommendedResources: number;
    practicalProjects: number;
    assessments: number;
  };
  careerOutcomes: string[];
  finalProject: {
    title: string;
    description: string;
    skillsCovered: string[];
    difficulty: string;
    estimatedTime: string;
  };
  stages: RoadmapStage[];
}

// Backwards-compatibility legacy types (for existing services/components)
export type NodeStatus = 'completed' | 'current' | 'next' | 'locked' | 'recommended';

export interface SkillGapItem {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gapScore: number;
  priority: 'high' | 'medium' | 'low';
  recommendedAction: string;
}

export interface RoadmapLesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'coding-lab' | 'project';
  durationMinutes: number;
  completed: boolean;
  resourceLink?: string;
}

export interface RoadmapResource {
  id: string;
  title: string;
  type: 'course' | 'documentation' | 'video' | 'practice' | 'assessment';
  provider: string;
  description?: string;
  duration?: string;
  url: string;
}

export interface RoadmapProject {
  title: string;
  description: string;
  skills: string[];
  duration: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  category: string;
  status: NodeStatus;
  durationWeeks: number;
  description: string;
  prerequisites: string[];
  skillsGained: string[];
  progressPercent: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: RoadmapLesson[];
  assessmentScore?: number;
  milestoneTitle?: string;
  isMilestone?: boolean;
  whyLearn?: string;
  topics?: string[];
  resources?: RoadmapResource[];
  projects?: RoadmapProject[];
  assessment?: string;
}

export interface LegacyRoadmapStage {
  id: string;
  title: string;
  order: number;
  status: 'completed' | 'in-progress' | 'upcoming';
  nodes: RoadmapNode[];
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  targetGoal: string;
  createdAt: string;
  overallProgress: number;
  estimatedCompletionWeeks: number;
  currentMilestone: string;
  nextRecommendedAction: {
    nodeId: string;
    title: string;
    actionText: string;
    estimatedMinutes: number;
  };
  stages: LegacyRoadmapStage[];
  skillGaps: SkillGapItem[];
  competencies: {
    name: string;
    score: number;
    color?: string;
  }[];
}

// Skill Matrix Specific Types
export type SkillLevel = 'Advanced' | 'Proficient' | 'Intermediate' | 'Developing' | 'Novice' | 'Locked';

export interface RadarMetric {
  subject: string;
  currentLevel: number;
  industryBenchmark: number;
  fullMark: number;
}

export interface SkillVerificationDetails {
  courseName?: string;
  labScore?: number;
  assessmentScore?: number;
  lastVerifiedDate?: string;
  certificateUrl?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
  progress: number;
  isVerified: boolean;
  verificationDetails?: SkillVerificationDetails;
}

export interface SkillCluster {
  id: string;
  categoryName: string;
  description: string;
  skills: SkillItem[];
}
