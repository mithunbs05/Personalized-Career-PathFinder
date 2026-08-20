export type NodeStatus = 'completed' | 'current' | 'next' | 'locked' | 'recommended';

export interface SkillGapItem {
  skill: string;
  currentLevel: number; // 0 - 100
  targetLevel: number; // 0 - 100
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
}

export interface RoadmapStage {
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
  overallProgress: number; // 0 - 100
  estimatedCompletionWeeks: number;
  currentMilestone: string;
  nextRecommendedAction: {
    nodeId: string;
    title: string;
    actionText: string;
    estimatedMinutes: number;
  };
  stages: RoadmapStage[];
  skillGaps: SkillGapItem[];
  competencies: {
    name: string;
    score: number;
    color?: string;
  }[];
}
