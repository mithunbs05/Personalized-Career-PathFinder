import React, { useState, useMemo } from 'react';
import { LogOut, Flame, Clock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoadmapStage } from '../types/roadmap';
import { RoadmapCanvas } from '../components/roadmap/RoadmapCanvas';
import { CourseMaterialsDrawer } from '../components/roadmap/CourseMaterialsDrawer';
import SkillMatrix from '../components/roadmap/SkillMatrix';
import { AIMentorPage } from '../components/mentor/AIMentorPage';

// Mock Data Structured for API Integration
const MOCK_STAGES: RoadmapStage[] = [
  {
    id: 1,
    title: "Programming Foundations",
    status: "COMPLETED",
    difficulty: "Beginner",
    estimatedDuration: "2 Weeks",
    whyLearn: "Understanding core programming logic, variables, and control structures is essential before diving into AI-specific languages.",
    prerequisites: [],
    skills: ["Data Types", "Loops", "Functions"],
    learnings: ["Understand variables and data types", "Master control flow (if/else, loops)", "Write basic functions"],
    resources: [
      { id: "r1", title: "CS50 Introduction to Computer Science", type: "COURSE", provider: "Harvard / edX", duration: "12 hours", url: "#" },
      { id: "r2", title: "Basic Logic Practice", type: "PRACTICE", provider: "LeetCode", duration: "2 hours", url: "#" }
    ],
    project: "Build a simple calculator",
    assessment: "a1"
  },
  {
    id: 2,
    title: "Python for AI",
    status: "COMPLETED",
    difficulty: "Beginner",
    estimatedDuration: "3 Weeks",
    whyLearn: "Python is the lingua franca of AI and Machine Learning. You need to master its syntax, data structures, and standard libraries.",
    prerequisites: ["Programming Foundations"],
    skills: ["Lists", "Dictionaries", "OOP"],
    learnings: ["Master Python data structures", "Understand Object-Oriented Programming in Python", "File I/O operations"],
    resources: [
      { id: "r3", title: "Python for Everybody", type: "COURSE", provider: "Coursera", duration: "10 hours", url: "#" },
      { id: "r4", title: "Official Python Docs", type: "DOCUMENTATION", provider: "Python.org", duration: "Readings", url: "#" }
    ],
    project: "Data parser script",
    assessment: "a2"
  },
  {
    id: 3,
    title: "Mathematics & Statistics",
    status: "IN_PROGRESS",
    difficulty: "Intermediate",
    estimatedDuration: "4 Weeks",
    whyLearn: "Linear algebra, calculus, and probability form the theoretical foundation for how machine learning algorithms actually optimize and learn.",
    prerequisites: ["Python for AI"],
    skills: ["Linear Algebra", "Calculus", "Probability"],
    learnings: ["Understand matrix operations", "Grasp derivatives and gradients", "Learn probability distributions"],
    resources: [
      { id: "r5", title: "Mathematics for Machine Learning", type: "COURSE", provider: "Imperial College", duration: "15 hours", url: "#" },
      { id: "r6", title: "Essence of Linear Algebra", type: "VIDEO", provider: "3Blue1Brown", duration: "4 hours", url: "#" }
    ],
    project: "Statistical analysis of a dataset",
    assessment: "a3"
  },
  {
    id: 4,
    title: "Machine Learning",
    status: "NOT_STARTED",
    difficulty: "Intermediate",
    estimatedDuration: "4 Weeks",
    whyLearn: "Learn the classic algorithms (trees, SVMs, clustering) before moving to deep learning to understand feature engineering and evaluation.",
    prerequisites: ["Mathematics & Statistics"],
    skills: ["Scikit-Learn", "Regression", "Classification"],
    learnings: ["Train regression models", "Implement random forests", "Evaluate model metrics (F1, Precision, Recall)"],
    resources: [
      { id: "r7", title: "Machine Learning Specialization", type: "COURSE", provider: "DeepLearning.AI", duration: "20 hours", url: "#" }
    ],
    project: "Predictive model for housing prices",
    assessment: "a4"
  },
  {
    id: 5,
    title: "Deep Learning",
    status: "LOCKED",
    difficulty: "Advanced",
    estimatedDuration: "5 Weeks",
    whyLearn: "Neural networks are the engines behind modern AI. Understanding backpropagation and layer architectures is crucial.",
    prerequisites: ["Machine Learning"],
    skills: ["PyTorch", "TensorFlow", "Neural Networks"],
    learnings: ["Build multi-layer perceptrons", "Understand backpropagation", "Implement CNNs and RNNs"],
    resources: [],
    project: "Image classification model",
    assessment: "a5"
  },
  {
    id: 6,
    title: "Natural Language Processing",
    status: "LOCKED",
    difficulty: "Advanced",
    estimatedDuration: "3 Weeks",
    whyLearn: "Text data is everywhere. NLP techniques allow you to process, tokenize, and extract meaning from human language.",
    prerequisites: ["Deep Learning"],
    skills: ["Tokenization", "Transformers", "Word Embeddings"],
    learnings: ["Process text data", "Understand Word2Vec / GloVe", "Learn Transformer architecture basics"],
    resources: [],
    project: "Sentiment analysis pipeline",
    assessment: "a6"
  },
  {
    id: 7,
    title: "Generative AI & LLMs",
    status: "LOCKED",
    difficulty: "Advanced",
    estimatedDuration: "4 Weeks",
    whyLearn: "Large Language Models represent the state-of-the-art. You must learn how to prompt, fine-tune, and utilize them.",
    prerequisites: ["Natural Language Processing"],
    skills: ["Prompt Engineering", "Fine-Tuning", "HuggingFace"],
    learnings: ["Understand LLM architectures", "Implement PEFT/LoRA", "Use HuggingFace pipelines"],
    resources: [],
    project: "Fine-tune a small LLM",
    assessment: "a7"
  },
  {
    id: 8,
    title: "RAG & AI Applications",
    status: "LOCKED",
    difficulty: "Advanced",
    estimatedDuration: "3 Weeks",
    whyLearn: "Retrieval-Augmented Generation is how you give LLMs external knowledge. This is highly demanded in enterprise AI.",
    prerequisites: ["Generative AI & LLMs"],
    skills: ["Vector DBs", "LangChain", "RAG"],
    learnings: ["Set up Vector Databases (Pinecone, Chroma)", "Build RAG pipelines", "Use LangChain/LlamaIndex"],
    resources: [],
    project: "Build a document Q&A bot",
    assessment: "a8"
  },
  {
    id: 9,
    title: "Deployment & MLOps",
    status: "LOCKED",
    difficulty: "Advanced",
    estimatedDuration: "3 Weeks",
    whyLearn: "A model is useless if it's not in production. Learn how to serve models as APIs and monitor them.",
    prerequisites: ["RAG & AI Applications"],
    skills: ["Docker", "FastAPI", "Model Serving"],
    learnings: ["Containerize AI applications", "Create FastAPI endpoints for inference", "Understand CI/CD for ML"],
    resources: [],
    project: "Deploy an ML API to the cloud",
    assessment: "a9"
  },
  {
    id: 10,
    title: "Enterprise Multi-Modal Document RAG System",
    status: "LOCKED",
    difficulty: "Expert",
    estimatedDuration: "3-4 Weeks",
    whyLearn: "This capstone consolidates all your knowledge into a production-grade, resume-ready enterprise application.",
    prerequisites: ["Deployment & MLOps"],
    skills: ["End-to-End System Design", "Production Deployment", "Full Stack AI"],
    learnings: ["Architect a complex system", "Integrate vision and text models", "Deploy securely to production"],
    resources: [],
    project: "Build an Enterprise Multi-Modal Document RAG System with OCR, Vector Search, and a conversational UI.",
    assessment: "capstone",
    isFinalCapstone: true
  }
];

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stages] = useState<RoadmapStage[]>(MOCK_STAGES);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'skills' | 'mentor' | 'practice'>('roadmap');

  const selectedStage = useMemo(() => {
    return stages.find((s) => s.id === selectedStageId) || null;
  }, [selectedStageId, stages]);

  // Calculate progress
  const completedStages = stages.filter((s) => s.status === 'COMPLETED').length;
  const progressPercentage = Math.round((completedStages / stages.length) * 100);

  return (
    <div className={isDarkMode ? 'dark-mode-active' : ''}>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white shadow-sm shadow-[#ea580c]/20">
                <span className="font-bold text-lg leading-none">P</span>
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Path<span className="text-[#ea580c]">AI</span>
              </span>
            </div>

            {/* Tab Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-semibold">
              {[
                { id: 'roadmap', label: 'Roadmap Timeline' },
                { id: 'skills', label: 'Skill Matrix' },
                { id: 'mentor', label: 'AI Mentor' },
                { id: 'practice', label: 'Active Labs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Learner Cockpit Metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span> Learner Cockpit
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Giri'}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Target Role: <strong className="text-slate-900 dark:text-white">AI/ML Engineer</strong> • Target Pace: <strong className="text-slate-900 dark:text-white">15 hrs/week</strong> • Duration: <strong className="text-slate-900 dark:text-white">6–9 months</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Streak */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[140px]">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg text-[#ea580c]">
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-none">14 Days</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Streak</span>
              </div>
            </div>

            {/* Logged Time */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[140px]">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-none">28.5 hrs</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Logged Time</span>
              </div>
            </div>

            {/* Mastery Progress */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[160px]">
              <div className="relative w-11 h-11 flex-shrink-0">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="14" fill="none" stroke="#ea580c" strokeWidth="3.5"
                    strokeDasharray="88" strokeDashoffset={88 - (88 * progressPercentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-900 dark:text-white">
                  {progressPercentage}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-none">Mastery</span>
                <span className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Overall</span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'roadmap' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Main Canvas Column */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adaptive Curriculum Timeline</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Interactive node graph of your prerequisite dependencies</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse"></span> In Progress</span>
                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></span> Locked</span>
                </div>
              </div>
              
              {/* React Flow Canvas Component */}
              <RoadmapCanvas 
                stages={stages} 
                selectedStageId={selectedStageId}
                onSelectStage={setSelectedStageId}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Right Sticky Column */}
            <div className="lg:col-span-4 relative">
               <CourseMaterialsDrawer stage={selectedStage} />
            </div>

          </div>
        ) : activeTab === 'skills' ? (
          <SkillMatrix />
        ) : activeTab === 'mentor' ? (
          <AIMentorPage stages={stages} user={user} onNavigate={setActiveTab} />
        ) : (
          <div className="flex items-center justify-center h-[500px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Active Labs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">This feature is currently under construction.</p>
            </div>
          </div>
        )}
      </main>
    </div>
    </div>
  );
};

export default Dashboard;
