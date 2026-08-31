// Real Data Store for PathAI Content Transformer
// Relational in-memory & persistence adapter matching Prisma schema

export interface DbModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  category: string;
  duration: number; // minutes
  difficulty: 'Beginner' | 'Guided' | 'Standard' | 'Advanced';
  learningObjectives: string[];
  concepts: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTranscript {
  id: string;
  moduleId: string;
  timestamp: string;
  seconds: number;
  content: string;
  concept: string;
  order: number;
}

export interface DbTestCase {
  id: string;
  challengeId: string;
  input: string;
  expectedOutput: string;
  description: string;
  isHidden: boolean;
  order: number;
}

export interface DbChallenge {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'Beginner' | 'Guided' | 'Standard' | 'Advanced';
  starterCode: string;
  solutionCode?: string;
  instructions: string[];
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  hints: string[];
  testCases: DbTestCase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DbChallengeAttempt {
  id: string;
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  passedCount: number;
  totalCount: number;
  score: number;
  status: 'PASSED' | 'FAILED' | 'PARTIAL' | 'ERROR';
  executionTimeMs: number;
  feedbackSummary?: string;
  feedbackDetails?: any;
  createdAt: Date;
}

export interface DbLearningProgress {
  id: string;
  userId: string;
  moduleId: string;
  activeMode: 'VIDEO' | 'CODING';
  videoCurrentTime: number;
  videoDuration: number;
  videoCompleted: boolean;
  conceptScore: number;
  practiceScore: number;
  testsPassed: number;
  totalTests: number;
  hintsUsed: number;
  attemptCount: number;
  overallProgress: number;
  masteryLevel: 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
  savedDraftCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbAIInsight {
  id: string;
  userId: string;
  moduleId: string;
  insightText: string;
  recommendedAction: string;
  createdAt: Date;
}

export interface DbYouTubeVideo {
  id: string;
  moduleId: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  duration: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  qualityScore: number;
  relevanceScore: number;
  selected: boolean;
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbYouTubeProgress {
  userId: string;
  moduleId: string;
  videoId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
  updatedAt: Date;
}

export class DatabaseStore {
  modules: Map<string, DbModule> = new Map();
  transcripts: Map<string, DbTranscript[]> = new Map(); // moduleId -> transcripts
  challenges: Map<string, DbChallenge> = new Map(); // challengeId -> challenge
  moduleChallenges: Map<string, string> = new Map(); // moduleId -> challengeId
  progress: Map<string, DbLearningProgress> = new Map(); // `${userId}_${moduleId}` -> progress
  attempts: DbChallengeAttempt[] = [];
  insights: Map<string, DbAIInsight> = new Map(); // `${userId}_${moduleId}` -> insight
  youtubeVideos: Map<string, DbYouTubeVideo> = new Map(); // moduleId -> YouTubeVideo
  youtubeProgress: Map<string, DbYouTubeProgress> = new Map(); // `${userId}_${moduleId}` -> YouTubeProgress


  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Seed Module: Python Loops & Iteration Patterns
    const pyLoopsModule: DbModule = {
      id: 'module_py_loops',
      courseId: 'course_ai_ml_eng',
      title: 'Python Loops & Iteration Patterns',
      description: 'Master the mechanics of for-loops, iterators, conditional accumulation, and list comprehension in Python.',
      category: 'Core Python',
      duration: 25,
      difficulty: 'Standard',
      learningObjectives: [
        'Master for-loops and sequence iteration in Python',
        'Implement conditional filtering inside loops (even/odd checks)',
        'Apply accumulation variables and accumulator patterns',
        'Optimize loops using list comprehensions and generators'
      ],
      concepts: [
        'for loops',
        'iterators',
        'conditional accumulation',
        'list comprehension'
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.modules.set(pyLoopsModule.id, pyLoopsModule);

    // 2. Seed Transcripts for Python Loops
    const pyTranscripts: DbTranscript[] = [
      {
        id: 'tr_1',
        moduleId: pyLoopsModule.id,
        timestamp: '00:15',
        seconds: 15,
        content: 'Welcome to this module on Python loops. Unlike traditional C-style loops with counter increments, Python treats loops as first-class sequence traversals.',
        concept: 'for loops',
        order: 1
      },
      {
        id: 'tr_2',
        moduleId: pyLoopsModule.id,
        timestamp: '02:30',
        seconds: 150,
        content: "When filtering data during iteration, we test each item against a predicate. For instance, testing for even numbers using 'num % 2 == 0'.",
        concept: 'conditional accumulation',
        order: 2
      },
      {
        id: 'tr_3',
        moduleId: pyLoopsModule.id,
        timestamp: '05:50',
        seconds: 350,
        content: 'Notice the accumulator pattern: initialize your result sum before entering the loop, then accumulate only matching values.',
        concept: 'iterators',
        order: 3
      },
      {
        id: 'tr_4',
        moduleId: pyLoopsModule.id,
        timestamp: '09:00',
        seconds: 540,
        content: "Now, let's transition straight into the interactive coding challenge to write this logic and verify all edge cases!",
        concept: 'list comprehension',
        order: 4
      }
    ];
    this.transcripts.set(pyLoopsModule.id, pyTranscripts);

    // 3. Seed Initial Coding Challenge for Python Loops
    const pyChallenge: DbChallenge = {
      id: 'challenge_py_loops',
      moduleId: pyLoopsModule.id,
      title: 'Sum of Even Numbers in a List',
      description: 'Write a Python function called sum_even_numbers(numbers) that iterates through a list of numbers and calculates the sum of all even numbers.',
      language: 'python',
      difficulty: 'Standard',
      starterCode: `def sum_even_numbers(numbers):
    """
    Iterates through a list of numbers and calculates the sum of all even numbers.
    """
    total = 0
    # TODO: Iterate through numbers and sum only the even ones
    for num in numbers:
        total += num  # Hint: Currently adding all numbers!
    return total
`,
      solutionCode: `def sum_even_numbers(numbers):\n    return sum(n for n in numbers if n % 2 == 0)`,
      instructions: [
        'Iterate through the `numbers` list',
        'Check if each number is even using `num % 2 == 0`',
        'Accumulate all even numbers into a running sum',
        'Return the total sum (return 0 if empty or no evens)'
      ],
      constraints: [
        'Input can be an empty list: `[]` -> return `0`',
        'Can contain negative even numbers (e.g. `-2`, `-4`)',
        'Zero is an even number (`0 % 2 == 0` evaluates to True)',
        'Time complexity must be O(n)'
      ],
      examples: [
        { input: '[1, 2, 3, 4, 5, 6]', output: '12', explanation: '2 + 4 + 6 = 12' },
        { input: '[1, 3, 5]', output: '0', explanation: 'No even numbers present' },
        { input: '[-4, -2, 0, 3, 5, 8]', output: '2', explanation: '-4 + -2 + 0 + 8 = 2' }
      ],
      hints: [
        'Recall the modulo operator `%`: `num % 2 == 0` is True for even numbers.',
        'Check `if num % 2 == 0:` inside your loop before updating `total`.',
        'Negative even numbers also satisfy `-4 % 2 == 0` in Python.',
        'Alternative one-liner: `return sum(n for n in numbers if n % 2 == 0)`'
      ],
      testCases: [
        { id: 'tc1', challengeId: 'challenge_py_loops', input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12', description: 'Standard mixed list', isHidden: false, order: 1 },
        { id: 'tc2', challengeId: 'challenge_py_loops', input: '[2, 4, 6, 8, 10]', expectedOutput: '30', description: 'All even numbers', isHidden: false, order: 2 },
        { id: 'tc3', challengeId: 'challenge_py_loops', input: '[1, 3, 5, 7, 9]', expectedOutput: '0', description: 'All odd numbers', isHidden: false, order: 3 },
        { id: 'tc4', challengeId: 'challenge_py_loops', input: '[]', expectedOutput: '0', description: 'Empty list edge case', isHidden: true, order: 4 },
        { id: 'tc5', challengeId: 'challenge_py_loops', input: '[-4, -2, 0, 3, 5, 8]', expectedOutput: '2', description: 'Negative evens and zero', isHidden: true, order: 5 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.challenges.set(pyChallenge.id, pyChallenge);
    this.moduleChallenges.set(pyLoopsModule.id, pyChallenge.id);

    // 4. Seed Initial Default Learning Progress (User "demo_user" or "default")
    const initialProg: DbLearningProgress = {
      id: 'prog_demo_py_loops',
      userId: 'default_user',
      moduleId: pyLoopsModule.id,
      activeMode: 'VIDEO',
      videoCurrentTime: 540,
      videoDuration: 720,
      videoCompleted: true,
      conceptScore: 77,
      practiceScore: 60,
      testsPassed: 3,
      totalTests: 5,
      hintsUsed: 1,
      attemptCount: 2,
      overallProgress: 72,
      masteryLevel: 'Developing',
      savedDraftCode: pyChallenge.starterCode,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.progress.set(`default_user_${pyLoopsModule.id}`, initialProg);

    // 5. Seed Initial AI Insight
    const initialInsight: DbAIInsight = {
      id: 'ins_demo_py_loops',
      userId: 'default_user',
      moduleId: pyLoopsModule.id,
      insightText: 'Your concept understanding is strong (77%), but your coding accuracy needs more practice.',
      recommendedAction: 'Try one guided challenge before moving to nested loops.',
      createdAt: new Date()
    };
    this.insights.set(`default_user_${pyLoopsModule.id}`, initialInsight);
  }

  // --- Module Queries ---
  getModule(id: string): DbModule | undefined {
    return this.modules.get(id) || Array.from(this.modules.values())[0];
  }

  getTranscripts(moduleId: string): DbTranscript[] {
    return this.transcripts.get(moduleId) || Array.from(this.transcripts.values())[0] || [];
  }

  // --- Challenge Queries ---
  getChallengeByModule(moduleId: string): DbChallenge | undefined {
    const challengeId = this.moduleChallenges.get(moduleId);
    if (challengeId) return this.challenges.get(challengeId);
    return Array.from(this.challenges.values())[0];
  }

  getChallengeById(challengeId: string): DbChallenge | undefined {
    return this.challenges.get(challengeId);
  }

  saveChallenge(challenge: DbChallenge) {
    this.challenges.set(challenge.id, challenge);
    this.moduleChallenges.set(challenge.moduleId, challenge.id);
  }

  // --- Progress Queries ---
  getProgress(userId: string, moduleId: string): DbLearningProgress {
    const key = `${userId}_${moduleId}`;
    let prog = this.progress.get(key);
    if (!prog) {
      prog = {
        id: `prog_${Date.now()}`,
        userId,
        moduleId,
        activeMode: 'VIDEO',
        videoCurrentTime: 0,
        videoDuration: 720,
        videoCompleted: false,
        conceptScore: 0,
        practiceScore: 0,
        testsPassed: 0,
        totalTests: 5,
        hintsUsed: 0,
        attemptCount: 0,
        overallProgress: 0,
        masteryLevel: 'Beginner',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.progress.set(key, prog);
    }
    return prog;
  }

  updateProgress(userId: string, moduleId: string, updates: Partial<DbLearningProgress>): DbLearningProgress {
    const current = this.getProgress(userId, moduleId);
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date()
    };

    // Calculate server-side overall progress and mastery
    const concept = updated.conceptScore || 0;
    const practice = updated.practiceScore || 0;
    const attemptsBonus = Math.min(20, (updated.attemptCount || 0) * 5);
    
    // Weighted formula: 40% Concept, 40% Practice, 20% Consistency/Attempts
    const overall = Math.round((concept * 0.4) + (practice * 0.4) + attemptsBonus);
    updated.overallProgress = Math.min(100, Math.max(0, overall));

    if (overall >= 80 && practice >= 80) {
      updated.masteryLevel = 'Mastered';
    } else if (overall >= 60) {
      updated.masteryLevel = 'Proficient';
    } else if (overall >= 40) {
      updated.masteryLevel = 'Developing';
    } else {
      updated.masteryLevel = 'Beginner';
    }

    const key = `${userId}_${moduleId}`;
    this.progress.set(key, updated);
    return updated;
  }

  // --- Attempt Recording ---
  recordAttempt(attempt: DbChallengeAttempt) {
    this.attempts.push(attempt);
  }

  getAttempts(userId: string, challengeId: string): DbChallengeAttempt[] {
    return this.attempts.filter(a => a.userId === userId && a.challengeId === challengeId);
  }

  // --- AI Insights Queries ---
  getInsight(userId: string, moduleId: string): DbAIInsight | undefined {
    return this.insights.get(`${userId}_${moduleId}`);
  }

  saveInsight(insight: DbAIInsight) {
    this.insights.set(`${insight.userId}_${insight.moduleId}`, insight);
  }

  // --- YouTube Video Queries ---
  getYoutubeVideo(moduleId: string): DbYouTubeVideo | undefined {
    return this.youtubeVideos.get(moduleId);
  }

  saveYoutubeVideo(video: DbYouTubeVideo) {
    this.youtubeVideos.set(video.moduleId, video);
  }

  // --- YouTube Watch Progress ---
  getYoutubeProgress(userId: string, moduleId: string): DbYouTubeProgress | undefined {
    return this.youtubeProgress.get(`${userId}_${moduleId}`);
  }

  saveYoutubeProgress(progress: DbYouTubeProgress) {
    this.youtubeProgress.set(`${progress.userId}_${progress.moduleId}`, progress);
  }
}

export const db = new DatabaseStore();

