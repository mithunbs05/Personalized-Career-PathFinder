// AI Mentor — Shared Skill Data
// This mirrors the MOCK_SKILL_CLUSTERS from SkillMatrix.tsx so the AI Mentor
// can read skill proficiency data without modifying SkillMatrix.
// SkillMatrix.tsx is NOT changed — it continues using its own inline copy.

import { SkillCluster } from '../types/roadmap';

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'c1',
    categoryName: 'Foundations & Core Python',
    description: 'Fundamental programming paradigms and data structures.',
    skills: [
      {
        id: 's1',
        name: 'Python OOP',
        level: 'Advanced',
        progress: 95,
        isVerified: true,
        verificationDetails: { courseName: 'Python Deep Dive', labScore: 98, assessmentScore: 95 }
      },
      {
        id: 's2',
        name: 'NumPy & Pandas',
        level: 'Advanced',
        progress: 88,
        isVerified: true,
        verificationDetails: { courseName: 'Data Science Fundamentals', labScore: 90, assessmentScore: 85 }
      },
      {
        id: 's3',
        name: 'Algorithmic Complexity',
        level: 'Developing',
        progress: 45,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c2',
    categoryName: 'Math & Statistics',
    description: 'Theoretical groundwork for machine learning algorithms.',
    skills: [
      {
        id: 's4',
        name: 'Linear Algebra',
        level: 'Developing',
        progress: 45,
        isVerified: false,
      },
      {
        id: 's5',
        name: 'Calculus',
        level: 'Developing',
        progress: 30,
        isVerified: false,
      },
      {
        id: 's6',
        name: 'Probability',
        level: 'Intermediate',
        progress: 60,
        isVerified: true,
        verificationDetails: { courseName: 'Stats for ML', assessmentScore: 80 }
      },
      {
        id: 's7',
        name: 'Optimization',
        level: 'Novice',
        progress: 10,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c3',
    categoryName: 'Machine Learning',
    description: 'Classic predictive modeling and evaluation.',
    skills: [
      {
        id: 's8',
        name: 'Regression Models',
        level: 'Intermediate',
        progress: 75,
        isVerified: true,
        verificationDetails: { labScore: 85, assessmentScore: 78 }
      },
      {
        id: 's9',
        name: 'Random Forests',
        level: 'Intermediate',
        progress: 65,
        isVerified: false,
      },
      {
        id: 's10',
        name: 'XGBoost',
        level: 'Novice',
        progress: 20,
        isVerified: false,
      },
      {
        id: 's11',
        name: 'Evaluation Metrics',
        level: 'Intermediate',
        progress: 70,
        isVerified: true,
        verificationDetails: { assessmentScore: 88 }
      }
    ]
  },
  {
    id: 'c4',
    categoryName: 'Deep Learning & NLP',
    description: 'Neural networks, architectures, and text processing.',
    skills: [
      {
        id: 's12',
        name: 'PyTorch',
        level: 'Novice',
        progress: 25,
        isVerified: false,
      },
      {
        id: 's13',
        name: 'Neural Nets',
        level: 'Developing',
        progress: 40,
        isVerified: false,
      },
      {
        id: 's14',
        name: 'Transformers',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's15',
        name: 'Tokenization',
        level: 'Novice',
        progress: 15,
        isVerified: false,
      }
    ]
  },
  {
    id: 'c5',
    categoryName: 'Generative AI & MLOps',
    description: 'Modern LLMs, deployment, and infrastructure.',
    skills: [
      {
        id: 's16',
        name: 'Fine-Tuning (LoRA)',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's17',
        name: 'RAG',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's18',
        name: 'Vector DBs',
        level: 'Locked',
        progress: 0,
        isVerified: false,
      },
      {
        id: 's19',
        name: 'FastAPI & Docker',
        level: 'Novice',
        progress: 10,
        isVerified: false,
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Test User Profiles (dev-only mock data for personalization testing)
// ---------------------------------------------------------------------------

export interface TestUserProfile {
  id: string;
  name: string;
  targetRole: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours: number;
  skillOverrides: Record<string, number>; // skillId → progress override
  stageOverrides: Record<number, 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'LOCKED'>; // stageId → status override
}

export const TEST_USER_PROFILES: TestUserProfile[] = [
  {
    id: 'test-user-a',
    name: 'User A',
    targetRole: 'AI/ML Engineer',
    experienceLevel: 'intermediate',
    weeklyHours: 15,
    skillOverrides: {
      's4': 45,  // Linear Algebra — weak, blocks Deep Learning
      's5': 30,  // Calculus — weak
      's6': 60,  // Probability — okay
      's7': 10,  // Optimization — very weak
    },
    stageOverrides: {
      1: 'COMPLETED',
      2: 'COMPLETED',
      3: 'IN_PROGRESS',
      4: 'NOT_STARTED',
      5: 'LOCKED',
    },
  },
  {
    id: 'test-user-b',
    name: 'User B',
    targetRole: 'Data Scientist',
    experienceLevel: 'beginner',
    weeklyHours: 10,
    skillOverrides: {
      's4': 80,  // Linear Algebra — strong
      's5': 70,  // Calculus — decent
      's6': 35,  // Probability — weak (current focus area)
      's7': 20,  // Optimization — weak
      's8': 40,  // Regression — developing
    },
    stageOverrides: {
      1: 'COMPLETED',
      2: 'COMPLETED',
      3: 'IN_PROGRESS',
      4: 'NOT_STARTED',
      5: 'LOCKED',
    },
  },
  {
    id: 'test-user-c',
    name: 'User C',
    targetRole: 'Generative AI Engineer',
    experienceLevel: 'advanced',
    weeklyHours: 20,
    skillOverrides: {
      's1': 95,
      's2': 90,
      's3': 70,
      's4': 85,
      's5': 80,
      's6': 85,
      's7': 60,
      's8': 85,
      's9': 80,
      's10': 60,
      's11': 85,
      's12': 70,
      's13': 65,
      's14': 15,  // Transformers — weak (upcoming dependency for RAG)
      's15': 40,  // Tokenization — developing
    },
    stageOverrides: {
      1: 'COMPLETED',
      2: 'COMPLETED',
      3: 'COMPLETED',
      4: 'COMPLETED',
      5: 'COMPLETED',
      6: 'IN_PROGRESS',
      7: 'NOT_STARTED',
      8: 'LOCKED',
    },
  }
];
