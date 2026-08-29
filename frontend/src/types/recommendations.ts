export interface CourseRecommendation {
  id: string;
  title: string;
  provider: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  matchScore: number;
  reasoning: string;
  tags: string[];
  thumbnailColor: string;
  description: string;
  url?: string;
  dismissed?: boolean;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  matchScore: number;
  reasoning: string;
  skills: string[];
  description: string;
  deliverable: string;
  githubTemplateUrl?: string;
  dismissed?: boolean;
}

export interface ResourceRecommendation {
  id: string;
  title: string;
  type: 'documentation' | 'tutorial' | 'tool' | 'community' | 'book' | 'video-series';
  matchScore: number;
  reasoning: string;
  tags: string[];
  description: string;
  url?: string;
  provider: string;
  dismissed?: boolean;
}

export interface RecommendationsResponse {
  courses: CourseRecommendation[];
  projects: ProjectRecommendation[];
  resources: ResourceRecommendation[];
  generatedAt: string;
  profileSummary: {
    targetGoal: string;
    experienceLevel: string;
    topSkillGaps: string[];
  };
}
