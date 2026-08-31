export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  createdAt?: string;
  onboardingCompleted?: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  educationDegree?: string;
  educationMajor?: string;
  graduationYear?: string;
  education?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  industryExperienceType?: 'fresher' | 'internship' | 'professional';
  yearsExperience?: string;
  knownSkills: string[];
  currentProjects?: string;
  completedLearning?: string;
  technicalInterests?: string[];
  targetGoal: string;
  jobSpecialization?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  targetCompletionMonths?: string;
  salaryPlacementGoal?: string;
  weeklyHours: number;
  learningPreferences?: string[];
  resourceBudget?: string;
  immediateMotivation?: string;
  languagePreference?: string;
  currentRoadmapId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}
