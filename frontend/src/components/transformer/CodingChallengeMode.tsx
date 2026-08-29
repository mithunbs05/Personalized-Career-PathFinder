import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Lightbulb,
  ArrowRight,
  Search,
  Code2,
  CheckCircle2,
  Circle,
  BrainCircuit,
  Filter,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { TransformerModule, LearnerProgress } from './transformerData';

export interface PracticeProblem {
  id: string;
  title: string;
  topic: string;
  subtopic: string[];
  platform: 'LeetCode' | 'HackerRank' | 'GeeksforGeeks' | 'Codeforces';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relevanceExplanation: string;
  externalUrl: string;
  solved: boolean;
}

const MOCK_PROBLEMS: PracticeProblem[] = [
  {
    id: 'p1',
    title: 'Two Sum',
    topic: 'Arrays & Hashing',
    subtopic: ['Hash Maps', 'Array & Strings'],
    platform: 'LeetCode',
    difficulty: 'Easy',
    relevanceExplanation: 'Tests foundational array iteration and O(1) hash lookup efficiency.',
    externalUrl: '#',
    solved: false
  },
  {
    id: 'p2',
    title: 'Valid Anagram',
    topic: 'Arrays & Hashing',
    subtopic: ['Hash Maps', 'Array & Strings'],
    platform: 'LeetCode',
    difficulty: 'Easy',
    relevanceExplanation: 'Great practice for frequency counters and dictionary manipulation.',
    externalUrl: '#',
    solved: true
  },
  {
    id: 'p3',
    title: 'Nested Lists & Comprehension',
    topic: 'Python Basics',
    subtopic: ['List Comprehension', 'Loops & Iteration'],
    platform: 'HackerRank',
    difficulty: 'Medium',
    relevanceExplanation: 'Forces you to write clean, Pythonic one-liners for nested loops.',
    externalUrl: '#',
    solved: false
  },
  {
    id: 'p4',
    title: 'Group Anagrams',
    topic: 'Arrays & Hashing',
    subtopic: ['Hash Maps', 'Array & Strings'],
    platform: 'LeetCode',
    difficulty: 'Medium',
    relevanceExplanation: 'Requires advanced dictionary usage (e.g. dict of lists) common in ML feature engineering.',
    externalUrl: '#',
    solved: false
  },
  {
    id: 'p5',
    title: 'Itertools Permutations',
    topic: 'Python Built-ins',
    subtopic: ['Loops & Iteration'],
    platform: 'HackerRank',
    difficulty: 'Easy',
    relevanceExplanation: 'Introduces itertools, crucial for generating combinatorial data in AI.',
    externalUrl: '#',
    solved: false
  },
  {
    id: 'p6',
    title: 'Search in a 2D Matrix',
    topic: 'Binary Search',
    subtopic: ['Matrix Manipulation'],
    platform: 'LeetCode',
    difficulty: 'Medium',
    relevanceExplanation: 'Teaches 2D array traversal, the building block of image processing and tensor ops.',
    externalUrl: '#',
    solved: false
  },
  {
    id: 'p7',
    title: 'Trapping Rain Water',
    topic: 'Two Pointers',
    subtopic: ['Array & Strings'],
    platform: 'LeetCode',
    difficulty: 'Hard',
    relevanceExplanation: 'Advanced array manipulation and spatial reasoning required for dynamic programming.',
    externalUrl: '#',
    solved: false
  },
  {
    id: 'p8',
    title: 'Find the Island Perimeter',
    topic: 'Graphs',
    subtopic: ['Matrix Manipulation'],
    platform: 'GeeksforGeeks',
    difficulty: 'Medium',
    relevanceExplanation: 'Excellent introduction to grid-based traversal (DFS/BFS).',
    externalUrl: '#',
    solved: false
  }
];

interface CodingChallengeModeProps {
  module: TransformerModule;
  progress: LearnerProgress;
  onProgressUpdate: (update: Partial<LearnerProgress>) => void;
  onSwitchToVideo: () => void;
}

export const CodingChallengeMode: React.FC<CodingChallengeModeProps> = ({
  module,
  progress,
  onProgressUpdate,
  onSwitchToVideo,
}) => {
  const [problems, setProblems] = useState<PracticeProblem[]>(MOCK_PROBLEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Problems');
  const [activePlatform, setActivePlatform] = useState('All Platforms');
  const [activeDifficulty, setActiveDifficulty] = useState('All');

  const categories = ['All Problems', 'Loops & Iteration', 'Array & Strings', 'Hash Maps', 'List Comprehension', 'Matrix Manipulation'];
  const platforms = ['All Platforms', 'LeetCode', 'HackerRank', 'GeeksforGeeks', 'Codeforces'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.subtopic.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All Problems' || p.subtopic.includes(activeCategory);
      const matchesPlatform = activePlatform === 'All Platforms' || p.platform === activePlatform;
      const matchesDifficulty = activeDifficulty === 'All' || p.difficulty === activeDifficulty;
      return matchesSearch && matchesCategory && matchesPlatform && matchesDifficulty;
    });
  }, [problems, searchQuery, activeCategory, activePlatform, activeDifficulty]);

  const toggleSolved = (id: string) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, solved: !p.solved } : p));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
      case 'Medium': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60';
      case 'Hard': return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const loadWarmUp = () => {
    setActivePlatform('HackerRank');
    setActiveDifficulty('Easy');
    setActiveCategory('All Problems');
    setSearchQuery('');
  };

  const loadInterviewClassics = () => {
    setActivePlatform('LeetCode');
    setActiveDifficulty('Medium');
    setActiveCategory('All Problems');
    setSearchQuery('');
  };

  if (isChallengeLoading || !challenge) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF5A3D] border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Loading challenge from backend...
        </p>
      </div>
    );
  }

  const activeTestCase = challenge.testCases[activeTestCaseIdx] || challenge.testCases[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. Context-Aware Topic Sync Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-[10px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Active Context: {module.title}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">External Practice & Problem Matcher</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated challenges from top platforms to reinforce your roadmap concepts.
          </p>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-2xl font-black text-slate-900 dark:text-white">{filteredProblems.length}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Curated Challenges</span>
        </div>
      </div>

      {/* 2. "AI Similar Problem Recommender" Bar */}
      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-[#8B7CFF] shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-300 text-sm">Struggling with a concept?</h3>
            <p className="text-xs text-purple-700 dark:text-purple-400/80 mt-0.5">
              Load beginner-friendly warm-up problems on HackerRank before moving to LeetCode Mediums.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={loadWarmUp} className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-sm cursor-pointer">
            Load Warm-ups
          </button>
          <button onClick={loadInterviewClassics} className="px-3.5 py-2 rounded-xl bg-[#8B7CFF] hover:bg-[#786ae6] text-white text-xs font-bold transition-colors shadow-sm shadow-[#8B7CFF]/20 cursor-pointer">
            Interview Classics
          </button>
        </div>
      </div>

      {/* 3. Live Keyword Search & Subtopic Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Search & Selectors */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search concepts (e.g. arrays, loops, pointers)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all"
            />
          </div>
          
          <select 
            value={activePlatform}
            onChange={(e) => setActivePlatform(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          
          <select 
            value={activeDifficulty}
            onChange={(e) => setActiveDifficulty(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Quick-Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                activeCategory === category
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Problem Recommendation Cards Grid */}
      <div className="space-y-4">
        {filteredProblems.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
            No problems match your current filters. Try adjusting your search.
          </div>
        ) : (
          filteredProblems.map(problem => (
            <div key={problem.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-5 items-start md:items-center">
              
              {/* Checkbox */}
              <button 
                onClick={() => toggleSolved(problem.id)}
                className="shrink-0 mt-1 md:mt-0 text-slate-300 dark:text-slate-700 hover:text-[#f97316] transition-colors cursor-pointer"
                title={problem.solved ? "Mark as unsolved" : "Mark as solved"}
              >
                {problem.solved ? <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> : <Circle className="w-6 h-6" />}
              </button>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-base font-bold transition-colors ${problem.solved ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {problem.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {problem.platform}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 inline-block w-full">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Why this matters: </span>
                  {problem.relevanceExplanation}
                </div>

                <div className="flex gap-2">
                  {problem.subtopic.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold text-slate-500 dark:text-slate-500">
                      #{tag.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <a 
                  href={problem.externalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold transition-all shadow-md shadow-[#f97316]/20 hover:-translate-y-0.5"
                >
                  Solve on {problem.platform} <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
