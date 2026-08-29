import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Briefcase,
  Search,
  RotateCcw,
  Signal,
  Clock,
  TrendingUp,
  Cpu,
  BookOpen,
  Code,
  CheckSquare,
  Award,
  GitCommit,
  Trophy,
  CheckCircle2,
  Rocket,
  FolderGit2,
  Target,
  BarChart2,
  CheckCircle,
import { LearningRoadmap, RoadmapNode, RoadmapData, RoadmapStage, StageStatus } from '../types/roadmap';
import confetti from 'canvas-confetti';
import { FlowchartRoadmap } from '../components/roadmap/FlowchartRoadmap';
import { LearningView } from '../components/learning/LearningView';
import { LearningView } from '../components/learning/LearningView';
const ROADMAP_DATA: RoadmapData = {
  role: 'AI Engineer',
  subtitle: 'Master the end-to-end AI lifecycle, from data prep to deploying generative models.',
  currentLevel: 'Beginner',
  estimatedDuration: '6–9 months',
  metrics: {
    totalStages: 9,
    coreSkillAreas: 8,
    recommendedResources: 27,
    practicalProjects: 5,
    assessments: 4,
  },
  careerOutcomes: [
    'Build and deploy RAG systems',
    'Fine-tune open-source LLMs',
    'Design vector database architectures',
    'Serve models with FastAPI',
    '🎯 AI Engineer Ready',
  ],
  finalProject: {
    title: 'AI-Powered Multi-Modal Document RAG System',
    description: 'Build, evaluate, and deploy a cited assistant over a document library with FastAPI and Pinecone.',
    skillsCovered: ['RAG', 'FastAPI', 'Deployment', 'LLMs', 'Vector DB'],
    difficulty: 'Advanced',
    estimatedTime: '3-4 weeks',
  },
  stages: [
    {
      id: 1,
      title: 'Programming Foundations',
      status: 'COMPLETED',
      difficulty: 'Beginner',
      estimatedDuration: '4 Weeks',
      whyLearn: 'Programming fundamentals help you understand algorithms, write efficient code, work with data, and build AI applications.',
      prerequisites: [],
      skills: ['Programming', 'Problem Solving', 'Data Structures'],
      learnings: ['Variables and data types', 'Conditionals and loops', 'Functions and OOP'],
      resources: [
        { id: 'r1', title: 'Programming Foundations Course', type: 'COURSE', provider: 'Online Platform', duration: '20h', url: '#' },
      project: 'Command-line task manager',
      assessment: 'Programming Fundamentals Assessment',
      topics: [
        {
          id: 't1',
          title: 'Introduction to Programming',
          description: 'Learn the basic concepts of programming and why it is important for AI.',
          learningContent: {
            explanation: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task. In AI, programming allows us to build models, manipulate data, and serve results.',
            keyConcepts: ['What is code?', 'Compiled vs Interpreted', 'Why Python?'],
            example: 'Writing a simple script that prints "Hello, AI World!" to the terminal.'
          },
          estimatedTime: '45 mins',
          prerequisites: [],
          status: 'COMPLETED',
          progress: 100,
          assessmentId: null,
        },
        {
          id: 't2',
          title: 'Variables and Data Types',
          description: 'Understand how to store and manipulate different types of data.',
          learningContent: {
            explanation: 'Variables are containers for storing data values. Understanding data types (like integers, strings, and booleans) is crucial because AI models require data to be in specific formats.',
            keyConcepts: ['Variables', 'Strings & Numbers', 'Booleans', 'Lists'],
            example: 'Storing a user age as an integer: `age = 25`'
          },
          estimatedTime: '60 mins',
          prerequisites: ['Introduction to Programming'],
          status: 'IN_PROGRESS',
          progress: 45,
          assessmentId: null,
        },
        {
          id: 't3',
          title: 'Functions and Logic',
          description: 'Learn how to write reusable blocks of code and make decisions.',
          learningContent: {
            explanation: 'Functions allow you to encapsulate logic so it can be reused. Conditionals (if/else) allow your program to make decisions. This is the foundation of any application.',
            keyConcepts: ['Defining functions', 'Arguments & Return values', 'If/Else statements'],
            example: 'def is_adult(age):\n  return age >= 18'
          },
          estimatedTime: '90 mins',
          prerequisites: ['Variables and Data Types'],
          status: 'LOCKED',
          progress: 0,
          assessmentId: null,
        }
      ]
    },
      topics: [
        {
          id: 't1',
          title: 'Introduction to Programming',
          description: 'Learn the basic concepts of programming and why it is important for AI.',
          learningContent: {
            explanation: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task. In AI, programming allows us to build models, manipulate data, and serve results.',
            keyConcepts: ['What is code?', 'Compiled vs Interpreted', 'Why Python?'],
            example: 'Writing a simple script that prints "Hello, AI World!" to the terminal.'
          },
          estimatedTime: '45 mins',
          prerequisites: [],
          status: 'COMPLETED',
          progress: 100,
          assessmentId: null,
        },
        {
          id: 't2',
          title: 'Variables and Data Types',
          description: 'Understand how to store and manipulate different types of data.',
          learningContent: {
            explanation: 'Variables are containers for storing data values. Understanding data types (like integers, strings, and booleans) is crucial because AI models require data to be in specific formats.',
            keyConcepts: ['Variables', 'Strings & Numbers', 'Booleans', 'Lists'],
            example: 'Storing a user age as an integer: `age = 25`'
          },
          estimatedTime: '60 mins',
          prerequisites: ['Introduction to Programming'],
          status: 'IN_PROGRESS',
          progress: 45,
          assessmentId: null,
        },
        {
          id: 't3',
          title: 'Functions and Logic',
          description: 'Learn how to write reusable blocks of code and make decisions.',
          learningContent: {
            explanation: 'Functions allow you to encapsulate logic so it can be reused. Conditionals (if/else) allow your program to make decisions. This is the foundation of any application.',
            keyConcepts: ['Defining functions', 'Arguments & Return values', 'If/Else statements'],
            example: 'def is_adult(age):\n  return age >= 18'
          },
          estimatedTime: '90 mins',
          prerequisites: ['Variables and Data Types'],
          status: 'LOCKED',
          progress: 0,
          assessmentId: null,
        }
      ]
    },
    {
      id: 2,
      title: 'Python for AI',
      status: 'IN_PROGRESS',
      difficulty: 'Beginner',
      estimatedDuration: '4 Weeks',
      whyLearn: 'Python is the primary language for AI engineering, from data preparation to model serving.',
      prerequisites: ['Programming Foundations'],
      skills: ['Python', 'NumPy', 'Pandas'],
      learnings: ['NumPy and Pandas', 'Data cleaning', 'Visualisation'],
      resources: [
        { id: 'r2', title: 'Python for Everybody', type: 'COURSE', provider: 'Coursera', duration: '20h', url: '#' },
        { id: 'r3', title: 'NumPy User Guide', type: 'DOCUMENTATION', provider: 'Official Docs', duration: '5h', url: '#' },
      ],
      project: 'Explore a real dataset',
      assessment: 'Python for AI Quiz',
    },
    {
      id: 3,
      title: 'Mathematics & Statistics',
      status: 'NOT_STARTED',
      difficulty: 'Intermediate',
      estimatedDuration: '5 Weeks',
      whyLearn: 'Mathematics and statistics help you understand how machine learning algorithms work instead of treating them as black boxes.',
      prerequisites: ['Python for AI'],
      skills: ['Linear Algebra', 'Probability', 'Statistics'],
      learnings: ['Linear algebra', 'Probability', 'Descriptive statistics'],
      resources: [
        { id: 'r4', title: 'Mathematics for Machine Learning', type: 'COURSE', provider: 'Coursera', duration: '30h', url: '#' },
      ],
      project: 'Statistical experiment notebook',
      assessment: 'Maths and Statistics Assessment',
    },
    {
      id: 4,
      title: 'Machine Learning',
      status: 'LOCKED',
      difficulty: 'Intermediate',
      estimatedDuration: '5 Weeks',
      whyLearn: 'Machine learning is a core requirement because it teaches you to build systems that learn patterns from data and make predictions.',
      prerequisites: ['Python for AI', 'Mathematics & Statistics'],
      skills: ['Machine Learning', 'Data Analysis', 'Scikit-learn'],
      learnings: ['Supervised learning', 'Feature engineering', 'Model evaluation'],
      resources: [
        { id: 'r5', title: 'Machine Learning Fundamentals', type: 'COURSE', provider: 'DeepLearning.AI', duration: '35h', url: '#' },
      ],
      project: 'Customer churn prediction',
      assessment: 'Machine Learning Fundamentals Quiz',
    },
    {
      id: 5,
      title: 'Deep Learning',
      status: 'LOCKED',
      difficulty: 'Intermediate',
      estimatedDuration: '5 Weeks',
      whyLearn: 'Deep learning powers image, speech, language, and multimodal AI systems used in modern products.',
      prerequisites: ['Machine Learning'],
      skills: ['Deep Learning', 'PyTorch', 'Neural Networks'],
      learnings: ['Neural networks', 'Backpropagation', 'CNNs'],
      resources: [
        { id: 'r6', title: 'Practical Deep Learning', type: 'COURSE', provider: 'fast.ai', duration: '40h', url: '#' },
      ],
      project: 'Image classifier',
      assessment: 'Deep Learning Checkpoint',
    },
    {
      id: 6,
      title: 'Natural Language Processing',
      status: 'LOCKED',
      difficulty: 'Intermediate',
      estimatedDuration: '4 Weeks',
      whyLearn: 'NLP gives you the foundations for search, summarisation, assistants, and every language model workflow.',
      prerequisites: ['Deep Learning'],
      skills: ['NLP', 'Embeddings', 'Transformers'],
      learnings: ['Text preprocessing', 'Embeddings', 'Sequence models'],
      resources: [
        { id: 'r7', title: 'NLP Specialization', type: 'COURSE', provider: 'Coursera', duration: '35h', url: '#' },
      ],
      project: 'Support ticket classifier',
      assessment: 'NLP Foundations Quiz',
    },
    {
      id: 7,
      title: 'Generative AI & LLMs',
      status: 'LOCKED',
      difficulty: 'Advanced',
      estimatedDuration: '4 Weeks',
      whyLearn: 'LLM engineering connects your AI skills to the generative products transforming how people work with information.',
      prerequisites: ['Natural Language Processing'],
      skills: ['LLMs', 'Prompt Engineering', 'Evaluation'],
      learnings: ['Tokenisation and attention', 'Prompt design', 'Fine-tuning'],
      resources: [
        { id: 'r8', title: 'Generative AI with LLMs', type: 'COURSE', provider: 'DeepLearning.AI', duration: '25h', url: '#' },
      ],
      project: 'Reliable research assistant',
      assessment: 'LLM Engineering Assessment',
    },
    {
      id: 8,
      title: 'RAG & AI Applications',
      status: 'LOCKED',
      difficulty: 'Advanced',
      estimatedDuration: '4 Weeks',
      whyLearn: 'RAG lets LLM-based systems retrieve information from external knowledge sources before generating responses.',
      prerequisites: ['Generative AI & LLMs'],
      skills: ['RAG', 'Vector Databases', 'AI Applications'],
      learnings: ['Chunking and retrieval', 'Embeddings', 'Vector databases'],
      resources: [
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- New Additive State for Roles & Enhanced Roadmap ---
  const [activeLearningStage, setActiveLearningStage] = useState<RoadmapStage | null>(null);
  const [selectedRole, setSelectedRole] = useState<'AI Engineer' | 'Data Scientist' | 'DevOps Engineer'>('AI Engineer');
    {
      id: 9,
      title: 'Deployment & MLOps',
      status: 'LOCKED',
      difficulty: 'Advanced',
      estimatedDuration: '4 Weeks',
      whyLearn: 'AI Engineers need to ship, monitor, and improve models in real products, not only train them locally.',
      prerequisites: ['Machine Learning', 'RAG & AI Applications'],
      skills: ['FastAPI', 'Deployment', 'MLOps'],
      learnings: ['FastAPI services', 'Docker', 'CI/CD'],
      resources: [
        { id: 'r10', title: 'MLOps Fundamentals', type: 'COURSE', provider: 'Online Platform', duration: '25h', url: '#' },
      ],
      project: 'Deploy an AI API',
      assessment: 'Production AI Readiness Check',
    }
  ]
};

const ALL_ROLES_DATA: Record<string, RoadmapData> = {
  'AI Engineer': ROADMAP_DATA,
  'Data Scientist': { ...ROADMAP_DATA, role: 'Data Scientist', subtitle: 'Extract insights and build predictive models.', stages: [] },
  'DevOps Engineer': { ...ROADMAP_DATA, role: 'DevOps Engineer', subtitle: 'Build and maintain scalable infrastructure.', stages: [] }
};
  ChevronRight,
  GraduationCap,
  FileText,
  Play,
  Terminal,
  ExternalLink,
  Code2,
  FileCheck2,
  ClipboardCheck,
  Bot,
  Send,
  Bell,
  Check,
  SearchX,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- New Additive State for Roles & Enhanced Roadmap ---
  const [activeLearningStage, setActiveLearningStage] = useState<RoadmapStage | null>(null);
  const [selectedRole, setSelectedRole] = useState<'AI Engineer' | 'Data Scientist' | 'DevOps Engineer'>('AI Engineer');
    return initial;
  });
  
  const currentRoleData = ALL_ROLES_DATA[selectedRole];
  const { progressPercent, enrichedStagesList } = useMemo(() => {
    let completed = 0;
    const enriched = currentRoleData.stages.map(stage => {
      const liveStatus = stageStatuses[stage.id] || stage.status;
      if (liveStatus === 'COMPLETED') completed++;
      return { ...stage, status: liveStatus };
    });
    const progress = currentRoleData.stages.length > 0 ? Math.round((completed / currentRoleData.stages.length) * 100) : 0;
    return { progressPercent: progress, enrichedStagesList: enriched };
  }, [stageStatuses, currentRoleData]);

  // Set initial selected stage once enriched list is ready
  const [selectedRoadmapStage, setSelectedRoadmapStage] = useState<RoadmapStage | null>(null);
  useEffect(() => {
    if (!selectedRoadmapStage && enrichedStagesList.length > 0) {
      setSelectedRoadmapStage(enrichedStagesList.find(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED') || enrichedStagesList[0]);
    }
  }, [enrichedStagesList, selectedRoadmapStage]);

  const [aiWidgetChat, setAiWidgetChat] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Hi! Ask me anything about this stage, prerequisites, or why you need these skills.' }
  ]);
  const [widgetInput, setWidgetInput] = useState('');
  
  const handleWidgetChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetInput.trim()) return;
    setAiWidgetChat(prev => [...prev, { sender: 'user', text: widgetInput }]);
    const currentInput = widgetInput;
    setWidgetInput('');
    setTimeout(() => {
      setAiWidgetChat(prev => [...prev, { 
        sender: 'ai', 
        text: `Here's why ${currentInput} matters: It gives you the foundational context needed to deploy scalable architectures. Keep going!`
      }]);
    }, 600);
  };
  
  const toggleStageStatus = (stageId: number, currentStatus: StageStatus) => {
    setStageStatuses(prev => {
      const newStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const newState = { ...prev, [stageId]: newStatus };
      
      // Simple solver: unlock stages if prereqs are met
      ROADMAP_DATA.stages.forEach(s => {
        if (s.id === stageId) return;
        const currentS = prev[s.id] || s.status;
        if (currentS === 'LOCKED') {
          const allPrereqsMet = s.prerequisites.every(prereqTitle => {
            const pStage = ROADMAP_DATA.stages.find(x => x.title === prereqTitle);
            if (!pStage) return true;
            return (newState[pStage.id] || pStage.status) === 'COMPLETED';
          });
          if (allPrereqsMet) {
            newState[s.id] = 'NOT_STARTED';
          }
        }
      });
      
      return newState;
    });
  };
// ==========================================
// 1. PRODUCTION MOCK DATASETS REGISTRY
// ==========================================
export const MOCK_ROADMAP_DATASETS: Record<string, RoadmapData> = {
  'ai-engineer': {
    role: 'AI Engineer',
    subtitle: 'Everything you need to learn to become an AI Engineer, organized in the right sequence.',
    currentLevel: 'Beginner',
    estimatedDuration: '6–9 months',
    metrics: {
      totalStages: 9,
      coreSkillAreas: 8,
      recommendedResources: 18,
      practicalProjects: 5,
      assessments: 7,
    },
    careerOutcomes: [
      'Build machine learning models & data pipelines',
      'Develop deep learning & computer vision/NLP applications',
      'Fine-tune LLMs and engineer production prompt pipelines',
      'Architect enterprise RAG applications using vector databases',
      'Deploy scalable AI microservices via FastAPI and Docker',
      'Implement MLOps tracking, telemetry, and evaluation frameworks',
    ],
    finalProject: {
      title: 'Build an AI-Powered Multi-Modal Document RAG System',
      description:
        'An end-to-end production AI application that parses technical documentation, builds vector embeddings, executes hybrid retrieval over vector stores, and serves streaming contextual answers with guardrails.',
      skillsCovered: ['Python', 'Machine Learning', 'NLP', 'LLMs', 'Vector DBs', 'RAG', 'FastAPI', 'Deployment'],
      difficulty: 'Advanced',
      estimatedTime: '3–4 weeks',
    },
    stages: [
      {
        id: 1,
        title: 'Programming Foundations',
        status: 'COMPLETED',
        difficulty: 'Beginner',
        estimatedDuration: '3–4 weeks',
        whyLearn:
          'Programming fundamentals are required to understand algorithms, write efficient code, work with data, and build AI applications. These concepts form the foundation for Python and machine learning.',
        prerequisites: [],
        skills: ['Programming', 'Problem Solving', 'Data Structures', 'OOP', 'Complexity Analysis'],
        learnings: [
          'Variables, data types, and control flow',
          'Functions, modular code, and recursion',
          'Object-Oriented Programming (Classes, Objects, Inheritance)',
          'Core Data Structures (Lists, Dictionaries, Sets, Queues, Trees)',
        ],
        resources: [
          { id: 'r1', title: 'Programming Fundamentals Course', type: 'COURSE', provider: 'Open Learning Platform', duration: '20 hrs', url: 'https://example.com/course/prog' },
          { id: 'r2', title: 'Python Language Documentation', type: 'DOCUMENTATION', provider: 'Official Python Docs', duration: 'Self-paced', url: 'https://docs.python.org/3/' },
          { id: 'r3', title: 'Data Structures & Algorithmic Practice', type: 'PRACTICE', provider: 'Coding Sandbox', duration: '25 Challenges', url: 'https://example.com/practice/dsa' },
        ],
        project: 'Command-Line Data Storage & Query Utility',
        assessment: 'Programming Foundations Certification Quiz',
      },
      {
        id: 2,
        title: 'Python for AI & Data Analysis',
        status: 'IN_PROGRESS',
        difficulty: 'Beginner-Intermediate',
        estimatedDuration: '2–3 weeks',
        whyLearn:
          'Python is the primary language of modern AI. High-performance numerical computing and data wrangling libraries are essential before training machine learning models.',
        prerequisites: ['Programming Foundations'],
        skills: ['NumPy', 'Pandas', 'Vectorization', 'Matplotlib', 'Data Cleaning'],
        learnings: [
          'Array creation, indexing, and vectorization with NumPy',
          'DataFrame manipulation and aggregation using Pandas',
          'Handling missing values and data transformations',
          'Exploratory Data Analysis (EDA) visualizations',
        ],
        resources: [
          { id: 'r4', title: 'Python for Data Analysis & AI', type: 'COURSE', provider: 'Data Institute', duration: '15 hrs', url: 'https://example.com/course/py-data' },
          { id: 'r5', title: 'NumPy & Pandas Documentation', type: 'DOCUMENTATION', provider: 'PyData Docs', duration: 'Reference', url: 'https://pandas.pydata.org/docs/' },
          { id: 'r6', title: 'Tabular Data Wrangling Labs', type: 'PRACTICE', provider: 'Interactive Labs', duration: '10 Exercises', url: 'https://example.com/practice/pandas' },
        ],
        project: 'Automated EDA & Statistical Data Cleaning Pipeline',
        assessment: 'Python for AI Skill Benchmark',
      },
      {
        id: 3,
          <div className="relative">
            <button 
              onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] hover:bg-[#E8E6DE] dark:hover:bg-[#2C2C29] transition-colors text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase cursor-pointer"
            >
              <span>●</span>
              <span>{selectedRole}</span>
              <svg className={`w-3 h-3 transition-transform ${isRoleSwitcherOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            
            <AnimatePresence>
              {isRoleSwitcherOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-[#1A1A18] rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg overflow-hidden z-50"
                >
                  {Object.keys(ALL_ROLES_DATA).map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role as any);
                        setIsRoleSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        selectedRole === role 
                          ? 'bg-[#F9F8F3] dark:bg-[#252522] text-[#FF4D31]' 
                          : 'text-[#4A4A4A] dark:text-[#A0A09B] hover:bg-[#F9F8F3] dark:hover:bg-[#252522] hover:text-[#1A1A1A] dark:hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        whyLearn:
          'Mathematics and statistics help you understand how machine learning algorithms work instead of treating them as black boxes.',
        prerequisites: ['Python for AI & Data Analysis'],
        skills: ['Linear Algebra', 'Calculus', 'Probability', 'Hypothesis Testing', 'Optimization'],
        learnings: [
          'Vectors, Matrices, Dot Products, and Eigenvalues',
          'Partial derivatives, gradients, and optimization curves',
          'Probability distributions, conditional probability, and Bayes Theorem',
          'Descriptive and inferential statistics',
        ],
        resources: [
          { id: 'r7', title: 'Mathematics for Machine Learning', type: 'COURSE', provider: 'Math For AI Hub', duration: '24 hrs', url: 'https://example.com/course/math-ml' },
          { id: 'r8', title: 'Visualizing Linear Algebra & Calculus', type: 'VIDEO', provider: 'Visual Math Channel', duration: '6 hrs', url: 'https://example.com/video/math' },
          { id: 'r9', title: 'Statistical Inference Problem Sets', type: 'PRACTICE', provider: 'Stats Online', duration: '15 Problem Sets', url: 'https://example.com/practice/stats' },
        ],
        project: 'From-Scratch Gradient Descent & Loss Optimization Engine',
        assessment: 'Mathematical Foundations Assessment',
      },
      {
        id: 4,
        title: 'Machine Learning',
        status: 'LOCKED',
        difficulty: 'Intermediate',
        estimatedDuration: '4–5 weeks',
        whyLearn:
          'Machine learning is a core requirement for an AI Engineer because it teaches you how to build systems that learn patterns from data and make predictions.',
        prerequisites: ['Python for AI & Data Analysis', 'Mathematics & Statistics'],
        skills: ['Supervised Learning', 'Unsupervised Learning', 'Scikit-Learn', 'Model Evaluation', 'Feature Engineering'],
        learnings: [
          'Linear/Logistic Regression, Decision Trees, and Ensembles (Random Forests, XGBoost)',
          'Clustering (K-Means, DBSCAN) and Dimensionality Reduction (PCA)',
          'Train/Test splitting, cross-validation, and hyperparameter tuning',
          'Evaluation metrics: Accuracy, Precision, Recall, F1, ROC-AUC, RMSE',
        ],
        resources: [
          { id: 'r10', title: 'Machine Learning Fundamentals', type: 'COURSE', provider: 'ML Institute', duration: '30 hrs', url: 'https://example.com/course/ml' },
          { id: 'r11', title: 'Scikit-Learn User Guide', type: 'DOCUMENTATION', provider: 'Scikit-Learn Docs', duration: 'Reference', url: 'https://scikit-learn.org/' },
        {/* Banner Section */}
        <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase">
                ✦ LEARNER COCKPIT
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] rounded-md">
                Level: {currentRoleData.currentLevel}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-[#A0A09B] rounded-md">
                Est: {currentRoleData.estimatedDuration}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">
              {currentRoleData.role} Learning Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] max-w-3xl leading-relaxed">
              {currentRoleData.subtitle}
            </p>
            
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                <Code className="w-3.5 h-3.5 text-[#FF4D31]" />
                <span className="text-[11px] font-bold text-[#7A8B7C]">Core Skills:</span>
                <span className="text-[11px] font-bold text-[#1A1A1A] dark:text-white">{currentRoleData.metrics.coreSkillAreas}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                <Play className="w-3.5 h-3.5 text-[#FF4D31]" />
                <span className="text-[11px] font-bold text-[#7A8B7C]">Resources:</span>
                <span className="text-[11px] font-bold text-[#1A1A1A] dark:text-white">{currentRoleData.metrics.recommendedResources}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                <Code className="w-3.5 h-3.5 text-[#FF4D31]" />
                <span className="text-[11px] font-bold text-[#7A8B7C]">Projects:</span>
                <span className="text-[11px] font-bold text-[#1A1A1A] dark:text-white">{currentRoleData.metrics.practicalProjects}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D31]" />
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100vh-80px)]">
        {activeLearningStage ? (
          <LearningView 
            stage={activeLearningStage}
            onClose={() => setActiveLearningStage(null)}
            onUpdateTopicStatus={(topicId, score) => {
              console.log(`Topic ${topicId} completed with score ${score}`);
              // Additional logic would go here to update global state/backend
            }}
          />
        ) : (
          <>
            {/* Banner Section */}
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-[11px] font-bold mb-1.5">
                <span className="text-[#7A8B7C]">Overall Progress</span>
                <span className="text-[#FF4D31]">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#E8E6DE] dark:bg-[#2C2C29] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF4D31] transition-all duration-700 rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          'Deep learning models automatically learn representations from complex unstructured data such as images, speech, and long text sequences.',
        prerequisites: ['Machine Learning'],
        skills: ['PyTorch', 'Neural Networks', 'Backpropagation', 'CNNs', 'Optimization'],
        learnings: [
          'Perceptrons, multi-layer neural networks, and activation functions',
          'Backpropagation mechanics and gradient calculation',
          'Convolutional Neural Networks (CNNs) for vision tasks',
          'Regularization techniques (Dropout, Batch Normalization, Weight Decay)',
        ],
        resources: [
          { id: 'r13', title: 'Deep Learning with PyTorch', type: 'COURSE', provider: 'Deep AI Academy', duration: '28 hrs', url: 'https://example.com/course/dl' },
          { id: 'r14', title: 'PyTorch API Documentation', type: 'DOCUMENTATION', provider: 'PyTorch.org', duration: 'Reference', url: 'https://pytorch.org/docs/' },
        ],
        project: 'Image Classification & Feature Extraction System',
        assessment: 'Deep Learning Architecture Quiz',
      },
      {
        id: 6,
        title: 'Natural Language Processing (NLP)',
        status: 'LOCKED',
        difficulty: 'Intermediate-Advanced',
        estimatedDuration: '3–4 weeks',
        whyLearn:
          'NLP gives AI systems the ability to understand, interpret, and generate human language, forming the direct bridge to LLMs and Generative AI.',
        prerequisites: ['Deep Learning'],
        skills: ['Tokenization', 'Word Embeddings', 'Transformers', 'Self-Attention', 'Hugging Face'],
        learnings: [
          'Text preprocessing, tokenizers (BPE, WordPiece), and vocabulary management',
          'Dense word vectors and semantic similarity',
          'The Transformer Architecture: Self-Attention and Encoder-Decoder blocks',
          'Fine-tuning BERT-style models using Hugging Face',
        ],
        resources: [
          { id: 'r15', title: 'Modern NLP & Transformers', type: 'COURSE', provider: 'NLP Masterclass', duration: '22 hrs', url: 'https://example.com/course/nlp' },
          { id: 'r16', title: 'Hugging Face Transformers Docs', type: 'DOCUMENTATION', provider: 'Hugging Face', duration: 'Reference', url: 'https://huggingface.co/docs' },
        ],
        project: 'Semantic Search & Named Entity Recognition Engine',
        assessment: 'NLP & Transformers Competency Exam',
      },
      {
        id: 7,
        title: 'Generative AI & LLMs',
        status: 'LOCKED',
        difficulty: 'Advanced',
        estimatedDuration: '4 weeks',
        whyLearn:
          'Generative AI and Large Language Models allow developers to build reasoning engines and generative applications through prompt engineering, quantization, and fine-tuning.',
        prerequisites: ['Natural Language Processing (NLP)'],
        skills: ['LLM Fine-Tuning', 'LoRA / QLoRA', 'Prompt Engineering', 'Open-Source Models', 'Quantization'],
        learnings: [
          'Autoregressive decoder-only LLM architectures',
          'Effective prompting strategies, system instructions, and few-shot reasoning',
          'Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA)',
          'Model quantization (GGUF, AWQ, GPTQ) and local model inference',
        ],
        resources: [
          { id: 'r17', title: 'Generative AI & LLM Engineering', type: 'COURSE', provider: 'GenAI Labs', duration: '25 hrs', url: 'https://example.com/course/llm' },
          { id: 'r18', title: 'OpenAI & Open-Weight LLM Guides', type: 'DOCUMENTATION', provider: 'AI Community', duration: 'Reference', url: 'https://example.com/docs/genai' },
        ],
        project: 'Domain-Specific Assistant Fine-Tuned on Custom Data',
              <FlowchartRoadmap 
                stages={enrichedStagesList}
                selectedStageId={selectedRoadmapStage?.id}
                onStageSelect={setSelectedRoadmapStage}
              />
            </div>
                    {currentRoleData.careerOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-[#1A1A1A] dark:text-white">
                        {outcome.includes('🎯') ? null : <CheckCircle2 className="w-4 h-4 text-[#7A8B7C] shrink-0" />}
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
      title: 'Customer Lifetime Value & Churn Prediction System',
      description:
        'An end-to-end data science project modeling customer behavioral trajectories, calculating dynamic CLV, and predicting churn with actionable retention recommendations.',
            {/* Node Inspector Drawer (5 cols) */}
            <div className="lg:col-span-5 sticky top-24">
              {selectedRoadmapStage && (
                <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31]">
                      CURRENT NODE INSPECTOR
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                      {selectedRoadmapStage.estimatedDuration} Est.
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-2">
                      {selectedRoadmapStage.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                      {selectedRoadmapStage.learnings.join(', ')}
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                      Target Skills Acquired
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRoadmapStage.skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisite Checklist */}
                  {selectedRoadmapStage.prerequisites.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                        Prerequisites Status
                      </span>
                      <div className="space-y-2">
                        {selectedRoadmapStage.prerequisites.map(prereq => {
                          const pStage = ROADMAP_DATA.stages.find(s => s.title === prereq);
                          const isMet = pStage && (stageStatuses[pStage.id] || pStage.status) === 'COMPLETED';
                          return (
                            <div key={prereq} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                              <span className="text-xs font-bold">{prereq}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isMet ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#FF4D31]/10 text-[#FF4D31]'}`}>
                    <button
                      onClick={() => setActiveLearningStage(selectedRoadmapStage)}
                      className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm shadow-md shadow-[#FF4D31]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Learning Mode</span>
                    </button>

                  {/* Categorized Resource Cards */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                      Curated Learning Materials
                    </span>
                    <div className="space-y-2.5">
                      {selectedRoadmapStage.resources.map(res => (
                        <div key={res.id} className="p-3 rounded-xl border border-[#E8E6DE] dark:border-[#2C2C29] bg-white dark:bg-[#1A1A18] hover:border-[#7A8B7C] transition-colors flex flex-col gap-2 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                              {res.type === 'COURSE' ? '📚' : res.type === 'DOCUMENTATION' ? '📖' : res.type === 'VIDEO' ? '🎥' : res.type === 'PRACTICE' ? '💻' : '🧪'} {res.type}
                            </span>
                            <span className="text-[10px] text-[#4A4A4A] dark:text-[#A0A09B]">{res.duration}</span>
                          </div>
                          <h4 className="text-sm font-bold">{res.title}</h4>
                          <span className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">{res.provider}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hands-on Deliverable */}
                  {selectedRoadmapStage.project && (
                    <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D31] mb-1">
                        <Award className="w-4 h-4" />
                        <span>Milestone Deliverable:</span>
                      </div>
                      <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                        {selectedRoadmapStage.project}
                      </p>
                    </div>
            {/* Node Inspector Drawer (5 cols) */}
            <div className="lg:col-span-5 sticky top-24">
                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setIsLabOpen(true)}
                      className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm shadow-md shadow-[#FF4D31]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launch Interactive Practice Lab</span>
                    </button>

                    <button
                      onClick={() => toggleStageStatus(selectedRoadmapStage.id, selectedRoadmapStage.status)}
                      className={`w-full py-2.5 rounded-full border transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-xs ${
                        selectedRoadmapStage.status === 'COMPLETED' 
                          ? 'bg-[#7A8B7C] border-[#7A8B7C] text-white hover:opacity-90'
                          : 'border-[#7A8B7C] text-[#7A8B7C] hover:bg-[#7A8B7C] hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {selectedRoadmapStage.status === 'COMPLETED' ? 'Completed (Click to Revert)' : 'Mark Milestone Completed'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Embedded AI Chat Widget */}
                  <div className="mt-4 border border-[#E8E6DE] dark:border-[#2C2C29] rounded-2xl overflow-hidden bg-[#F9F8F3] dark:bg-[#252522]">
                    <div className="px-4 py-2 border-b border-[#E8E6DE] dark:border-[#2C2C29] flex items-center gap-2 bg-white dark:bg-[#1A1A18]">
                      <Bot className="w-3.5 h-3.5 text-[#FF4D31]" />
                      <span className="text-[10px] font-bold text-[#7A8B7C] uppercase">AI Advisor Quick Chat</span>
                    </div>
                    <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                      {aiWidgetChat.map((msg, i) => (
                        <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.sender === 'ai' && (
                            <div className="w-5 h-5 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3 h-3" />
                            </div>
                          )}
                          <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${msg.sender === 'user' ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]' : 'bg-white dark:bg-[#1A1A18] text-[#1A1A1A] dark:text-[#F9F8F3] border border-[#E8E6DE] dark:border-[#2C2C29]'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleWidgetChat} className="p-2 border-t border-[#E8E6DE] dark:border-[#2C2C29] bg-white dark:bg-[#1A1A18] flex items-center gap-2">
                      <input
                        type="text"
                        value={widgetInput}
                        onChange={(e) => setWidgetInput(e.target.value)}
                        placeholder="Ask about this stage..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#F9F8F3] dark:bg-[#252522] text-xs focus:outline-hidden"
                      />
                      <button type="submit" disabled={!widgetInput.trim()} className="p-1.5 rounded-lg bg-[#FF4D31] text-white disabled:opacity-50 cursor-pointer">
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>

                </div>
              )}
        estimatedDuration: '3 weeks',
        whyLearn:
          'Enterprise datasets exceed single-machine memory; PySpark enables processing multi-terabyte data streams.',
        prerequisites: ['Supervised & Unsupervised Machine Learning'],
        skills: ['PySpark', 'Distributed SQL', 'Hadoop/HDFS', 'Parquet', 'BigQuery'],
        learnings: [
          'Resilient Distributed Datasets (RDDs) and DataFrames in Spark',
          'Spark SQL query optimization and partitioning strategies',
          'Reading and writing compressed columnar formats',
        ],
        resources: [
          { id: 'ds4', title: 'PySpark for Large Scale Data Processing', type: 'COURSE', provider: 'Big Data Academy', duration: '18 hrs', url: 'https://example.com/pyspark' },
        ],
        project: 'Multi-Terabyte Log Aggregation Pipeline',
        assessment: 'Big Data Engineering Quiz',
      },
    ],
  },
  'devops-engineer': {
    role: 'DevOps & Platform Engineer',
    subtitle: 'Master cloud infrastructure, CI/CD automation pipelines, containers, and Kubernetes orchestration.',
    currentLevel: 'Intermediate',
    estimatedDuration: '6–8 months',
    metrics: {
      totalStages: 4,
      coreSkillAreas: 6,
      recommendedResources: 15,
      practicalProjects: 4,
      assessments: 5,
    },
    careerOutcomes: [
      'Automate cloud infrastructure provisioning using Terraform IaC',
      'Build zero-downtime CI/CD deployment pipelines using GitHub Actions',
      'Orchestrate resilient containerized applications with Kubernetes & Helm',
      'Implement full-stack Prometheus & Grafana observability telemetry',
    ],
    finalProject: {
      title: 'Multi-Region Kubernetes GitOps Deployment System',
      description:
        'An enterprise platform engineering setup deploying a microservice mesh using Terraform, ArgoCD, Helm, Prometheus, and automated canary deployments.',
      skillsCovered: ['Terraform', 'Docker', 'Kubernetes', 'Helm', 'ArgoCD', 'Prometheus', 'AWS'],
      difficulty: 'Advanced',
      estimatedTime: '4 weeks',
    },
    stages: [
      {
        id: 1,
        title: 'Linux Administration & Shell Scripting',
        status: 'COMPLETED',
        difficulty: 'Beginner',
        estimatedDuration: '3 weeks',
        whyLearn:
          '99% of cloud servers run Linux. Master command-line utilities, permissions, process management, and Bash automation.',
        prerequisites: [],
        skills: ['Linux', 'Bash', 'Systemd', 'SSH', 'Networking Basics'],
        learnings: [
          'File system hierarchy, permissions (chmod/chown), and user management',
          'Automating administration tasks with modular Bash scripts',
          'Process monitoring, systemd service creation, and log inspection',
        ],
        resources: [
          { id: 'dev1', title: 'Linux Systems Administration Handbook', type: 'DOCUMENTATION', provider: 'SysAdmin Docs', duration: 'Reference', url: 'https://example.com/linux' },
        ],
        project: 'Automated Server Health Check & Alert Script',
        assessment: 'Linux Fundamentals Certification',
      },
      {
        id: 2,
        title: 'Containerization with Docker',
        status: 'IN_PROGRESS',
        difficulty: 'Intermediate',
        estimatedDuration: '2–3 weeks',
        whyLearn:
          'Containers encapsulate application runtimes, guaranteeing consistent execution across dev, staging, and production environments.',
        prerequisites: ['Linux Administration & Shell Scripting'],
        skills: ['Docker', 'Docker Compose', 'Multi-stage Builds', 'Container Security', 'Networking'],
        learnings: [
          'Writing optimized Dockerfiles using multi-stage builds',
          'Managing container volumes, bridge networks, and environment variables',
          'Orchestrating multi-container services using Docker Compose',
        ],
        resources: [
          { id: 'dev2', title: 'Docker Deep Dive', type: 'COURSE', provider: 'Container Academy', duration: '14 hrs', url: 'https://example.com/docker' },
        ],
        project: 'Containerized Polyglot Microservices Stack',
        assessment: 'Docker Mastery Benchmark',
      },
      {
        id: 3,
        title: 'Infrastructure as Code (Terraform)',
        status: 'NOT_STARTED',
        difficulty: 'Intermediate',
        estimatedDuration: '3–4 weeks',
        whyLearn:
          'Declarative IaC allows cloud infrastructure to be version-controlled, audited, and reproduced effortlessly.',
        prerequisites: ['Containerization with Docker'],
        skills: ['Terraform', 'HCL', 'AWS/GCP Cloud', 'State Management', 'Modules'],
        learnings: [
          'Writing reusable Terraform modules for VPCs, Subnets, and EC2/GKE',
          'Remote state locking with S3 and DynamoDB',
          'Managing resource dependencies, variables, and drift detection',
        ],
        resources: [
          { id: 'dev3', title: 'Terraform Associate Certification Prep', type: 'COURSE', provider: 'Cloud Hub', duration: '20 hrs', url: 'https://example.com/terraform' },
        ],
        project: 'Automated AWS Production VPC & Cluster Setup',
        assessment: 'Terraform Practitioner Quiz',
      },
      {
        id: 4,
        title: 'Kubernetes Orchestration & GitOps',
        status: 'LOCKED',
        difficulty: 'Advanced',
        estimatedDuration: '4–5 weeks',
        whyLearn:
          'Kubernetes automatically scales, self-heals, and balances traffic across thousands of application containers.',
        prerequisites: ['Infrastructure as Code (Terraform)'],
        skills: ['Kubernetes', 'kubectl', 'Helm', 'ArgoCD', 'Ingress Controllers'],
        learnings: [
          'Pods, Deployments, Services, ConfigMaps, and Secrets',
          'Packaging applications into versioned Helm Charts',
          'Setting up continuous delivery with ArgoCD GitOps pipelines',
        ],
        resources: [
          { id: 'dev4', title: 'CKA Certification Masterclass', type: 'COURSE', provider: 'K8s Institute', duration: '32 hrs', url: 'https://example.com/k8s' },
        ],
        project: 'High-Availability Kubernetes Cluster Deployment',
        assessment: 'Kubernetes Architecture Benchmark',
      },
    ],
  },
};

// Toast message helper interface
interface ToastItem {
  id: string;
  message: string;
  type: 'indigo' | 'emerald' | 'amber';
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  // Active Role Key State
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('ai-engineer');

  // Mutable Roadmap Data State
  const [roadmapData, setRoadmapData] = useState<RoadmapData>(() =>
    JSON.parse(JSON.stringify(MOCK_ROADMAP_DATASETS['ai-engineer']))
  );

  // Selected Stage State
  const [selectedStageId, setSelectedStageId] = useState<number>(1);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // AI Chat Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hi! Ask me anything about your learning roadmap, prerequisites, or why specific skills like Mathematics or Python are required for AI engineering.',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Trigger Toast Notification
  const showToast = (message: string, type: 'indigo' | 'emerald' | 'amber' = 'indigo') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Evaluate Prerequisite Graph dynamically
  const evaluatePrerequisites = (stages: RoadmapStage[]): { stages: RoadmapStage[]; unlockedAny: boolean } => {
    const updated = JSON.parse(JSON.stringify(stages)) as RoadmapStage[];
    let unlockedAny = false;

    const titleStatusMap: Record<string, StageStatus> = {};
    updated.forEach((s) => {
      titleStatusMap[s.title] = s.status;
    });

    updated.forEach((stage) => {
      if (!stage.prerequisites || stage.prerequisites.length === 0) return;

      const allPrereqsMet = stage.prerequisites.every(
        (reqTitle) => titleStatusMap[reqTitle] === 'COMPLETED'
      );

      if (allPrereqsMet) {
        if (stage.status === 'LOCKED') {
          stage.status = 'NOT_STARTED';
          unlockedAny = true;
        }
      } else {
        if (stage.status !== 'COMPLETED') {
          stage.status = 'LOCKED';
        {/* Tab 2: Skill Competency Matrix */}
        {activeTab === 'skills' && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">

    return { stages: updated, unlockedAny };
  };

  // Role Switcher Handler
  const handleRoleChange = (roleKey: string) => {
    if (!MOCK_ROADMAP_DATASETS[roleKey]) return;
    setSelectedRoleKey(roleKey);
    const initial = JSON.parse(JSON.stringify(MOCK_ROADMAP_DATASETS[roleKey]));
    const { stages } = evaluatePrerequisites(initial.stages);
    initial.stages = stages;
    setRoadmapData(initial);
    setSelectedStageId(initial.stages[0]?.id || 1);
    setSearchQuery('');
    showToast(`Switched roadmap to ${initial.role}`, 'indigo');
  };

  // Reset Progress Handler
  const handleResetProgress = () => {
    const initial = JSON.parse(JSON.stringify(MOCK_ROADMAP_DATASETS[selectedRoleKey]));
    const { stages } = evaluatePrerequisites(initial.stages);
    initial.stages = stages;
    setRoadmapData(initial);
    setSelectedStageId(initial.stages[0]?.id || 1);
    showToast(`Reset progress for ${initial.role}`, 'amber');
  };

  // Update Stage Status Handler
  const handleUpdateStatus = (stageId: number, newStatus: StageStatus) => {
    const stage = roadmapData.stages.find((s) => s.id === stageId);
    if (!stage) return;

                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Lab</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Interactive Practice Lab Modal */}
      <AnimatePresence>
        {isLabOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}

    const copyStages = JSON.parse(JSON.stringify(roadmapData.stages)) as RoadmapStage[];
    const target = copyStages.find((s) => s.id === stageId);
        )}
          </>
        )}
      </main>

    setRoadmapData((prev) => ({
      ...prev,
      stages: evaluatedStages,
    }));

    if (newStatus === 'COMPLETED') {
      if (unlockedAny) {
        showToast(`🎉 Stage ${stageId} completed! Downstream stages UNLOCKED!`, 'emerald');
      } else {
        showToast(`✓ Stage ${stageId} marked as COMPLETED!`, 'emerald');
      }
    } else {
      showToast(`● Stage ${stageId} status set to ${newStatus}`, 'indigo');
    }
  };

  // Compute Overall Progress Percentage
  const progressMetrics = useMemo(() => {
    const total = roadmapData.stages.length;
    const completed = roadmapData.stages.filter((s) => s.status === 'COMPLETED').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, remaining: total - completed, percentage };
  }, [roadmapData]);

  // Active Stage Object
          </>
        )}
      </main>
    </div>
  );
};
    return roadmapData.stages.filter((stage) => {
      const matchesStatus = statusFilter === 'ALL' || stage.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        stage.title.toLowerCase().includes(q) ||
        stage.skills.some((s) => s.toLowerCase().includes(q)) ||
        stage.whyLearn.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [roadmapData, statusFilter, searchQuery]);

  // Send AI Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      let response = '';
      const lower = userText.toLowerCase();

      if (lower.includes('calculus') || lower.includes('math')) {
        response =
          'Mathematics & Statistics (Stage 3) is required before Deep Learning because gradient descent relies directly on partial derivatives and matrix multiplication. Without calculus, optimization curves remain a black box!';
      } else if (lower.includes('skip') || lower.includes('llm') || lower.includes('rag')) {
        response =
          'Skipping directly to LLMs (Stage 7) is discouraged because modern LLMs are built on Transformer architectures and self-attention mechanisms learned in Deep Learning (Stage 5) & NLP (Stage 6). Understanding embeddings prevents prompt engineering errors!';
      } else if (lower.includes('python')) {
        response =
          'Python for AI (Stage 2) provides NumPy array vectorization and Pandas tabular data cleaning, which are pre-requisites for passing data tensors into PyTorch or Scikit-Learn models!';
      } else {
        response = `Regarding "${userText}": In the ${roadmapData.role} path, stages are ordered sequentially so every stage builds directly on the competencies of the previous stage. Complete pending prerequisites to unlock your next milestone!`;
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#04070d] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-300">
      
      {/* Toast Notification Floating Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 bg-slate-900 ${
              toast.type === 'emerald'
                ? 'border-emerald-500/50 text-emerald-300'
                : toast.type === 'amber'
                ? 'border-amber-500/50 text-amber-300'
                : 'border-indigo-500/50 text-indigo-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      {/* TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-[#04070d]/90 backdrop-blur-md border-b border-slate-800/80">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#04070d] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  CareerGPS <span className="text-indigo-400 font-normal">/ LearnAI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  RECOMMENDER
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Career Navigation Engine</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, topics, stages..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Profile & Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-[10px] text-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
              </div>
              <div>
                <div className="font-semibold text-slate-200 leading-none">{user?.name || 'Jane Doe'}</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">Beginner • CS Student</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="role-select" className="text-xs font-medium text-slate-400 hidden lg:flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Role:
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={selectedRoleKey}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 text-slate-100 text-xs font-semibold rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ai-engineer">🎯 AI Engineer</option>
                  <option value="data-scientist">🎯 Data Scientist</option>
                  <option value="devops-engineer">🎯 DevOps & Platform Engineer</option>
                </select>
                <div className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  ▼
                </div>
              </div>
            </div>

            <button
              onClick={handleResetProgress}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors relative"
              title="Reset Progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {logout && (
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ROADMAP HEADER & METRICS OVERVIEW */}
        <header className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-md uppercase tracking-wider">
                    {roadmapData.role}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-md flex items-center gap-1">
                    <Signal className="w-3 h-3 text-emerald-400" />
                    Current Level: <strong className="text-white ml-1">{roadmapData.currentLevel}</strong>
                  </span>
                  <span class="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-md flex items-center gap-1">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-md flex items-center gap-1">
                
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {roadmapData.role} Learning Roadmap
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                  {roadmapData.subtitle}
                </p>
              </div>

              {/* Progress Gauge */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 sm:p-5 min-w-[240px] flex flex-col justify-center space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Overall Progress
                  </span>
                  <span className="text-emerald-400 font-extrabold text-sm">{progressMetrics.percentage}%</span>
                </div>
                
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${progressMetrics.percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{progressMetrics.completed} of {progressMetrics.total} Completed</span>
                  <span>{progressMetrics.remaining} Remaining</span>
                </div>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{roadmapData.metrics.coreSkillAreas}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Core Skill Areas</div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{roadmapData.metrics.recommendedResources}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Recommended Links</div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{roadmapData.metrics.practicalProjects}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Hands-on Projects</div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{roadmapData.metrics.assessments}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Assessments</div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2.5 rounded-lg bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">1 Final</div>
                  <div className="text-[11px] text-slate-400 font-medium">Capstone Spec</div>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Filter Pills Bar */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl rounded-xl p-3 border border-slate-800/80 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 pl-2">Filter Stages:</span>
            {(['ALL', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'LOCKED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {filter === 'ALL'
                  ? `All Stages (${roadmapData.stages.length})`
                  : filter === 'COMPLETED'
                  ? 'COMPLETED ✓'
                  : filter === 'IN_PROGRESS'
                  ? 'IN PROGRESS ●'
                  : filter === 'NOT_STARTED'
                  ? 'NOT STARTED ○'
                  : 'LOCKED 🔒'}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 hidden sm:block pr-2 font-medium">
            💡 Click any stage card to view syllabus & materials
          </div>
        </div>

        {/* TWO-COLUMN CORE LAYOUT (65% / 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Connected Visual Timeline (65% width - 7/8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 relative">
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Connected Visual Timeline</h2>
              </div>
              <span className="text-xs text-slate-400">Prerequisite dependency path</span>
            </div>

            <div className="relative pl-1 sm:pl-2">
              {/* Background Rail */}
              <div className="absolute left-[27px] top-[40px] bottom-[40px] w-[3px] bg-slate-800 z-0"></div>
              {/* Progress Rail */}
              <div
                className="absolute left-[27px] top-[40px] w-[3px] bg-gradient-to-b from-emerald-500 to-indigo-500 z-1 transition-all duration-500"
                style={{
                  height: `${(progressMetrics.completed / progressMetrics.total) * 100}%`,
                }}
              ></div>

              {/* Dynamic Stage Cards */}
              <div className="space-y-6 relative z-10">
                {filteredStages.length === 0 ? (
                  <div className="bg-slate-900/80 p-8 rounded-2xl text-center text-slate-400 space-y-3 border border-slate-800">
                    <SearchX className="w-10 h-10 mx-auto text-slate-500" />
                    <p className="font-semibold text-sm">No stages match your search query or filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                      }}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredStages.map((stage) => {
                    const isSelected = stage.id === selectedStageId;

                    return (
                      <div
                        key={stage.id}
                        className={`relative pl-12 sm:pl-14 transition-all duration-300 ${
                          isSelected ? 'scale-[1.01]' : ''
                        }`}
                      >
                        {/* Node Icon */}
                        <div
                          className={`absolute left-0 top-6 w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                            stage.status === 'COMPLETED'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : stage.status === 'IN_PROGRESS'
                              ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                              : stage.status === 'LOCKED'
                              ? 'bg-slate-900 text-slate-500 border-slate-700'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {stage.status === 'COMPLETED' ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : stage.status === 'IN_PROGRESS' ? (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          ) : stage.status === 'LOCKED' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-xs font-bold">{stage.id}</span>
                          )}
                        </div>

                        {/* Card Component */}
                        <div
                          onClick={() => setSelectedStageId(stage.id)}
                          className={`bg-slate-900/80 hover:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-slate-900 shadow-lg shadow-indigo-500/20'
                              : 'border-slate-800/80'
                          }`}
                        >
                          <div className="space-y-4">
                            
                            {/* Card Top Pill */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-indigo-400 tracking-wider uppercase">
                                  STAGE {stage.id}
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 rounded-full">
                                  {stage.difficulty}
                                </span>
                                <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 rounded-full">
                                  {stage.estimatedDuration}
                                </span>
                              </div>

                              <span
                                className={`px-3 py-1 text-xs font-bold border rounded-full ${
                                  stage.status === 'COMPLETED'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : stage.status === 'IN_PROGRESS'
                                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                    : stage.status === 'LOCKED'
                                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {stage.status === 'COMPLETED'
                                  ? '✓ COMPLETED'
                                  : stage.status === 'IN_PROGRESS'
                                  ? '● IN PROGRESS'
                                  : stage.status === 'LOCKED'
                                  ? '🔒 LOCKED'
                                  : '○ NOT STARTED'}
                              </span>
                            </div>

                            {/* Stage Title */}
                            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-between group">
                              <span>{stage.title}</span>
                              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </h3>

                            {/* "WHY DO I NEED TO LEARN THIS?" PROMINENT CALLOUT BOX */}
                            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/25 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                                <HelpCircle className="w-4 h-4 text-indigo-400" /> Why do I need to learn this?
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                {stage.whyLearn}
                              </p>
                            </div>

                            {/* Prerequisite Warning Banner */}
                            {stage.status === 'LOCKED' && stage.prerequisites.length > 0 && (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
                                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="font-bold">Prerequisite Required:</strong> Complete{' '}
                                  <span className="underline decoration-amber-500/50">
                                    {stage.prerequisites.join(', ')}
                                  </span>{' '}
                                  before unlocking this stage.
                                </div>
                              </div>
                            )}

                            {/* Skills Pills & Resource Counts */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {stage.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-md"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {stage.skills.length > 3 && (
                                  <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md">
                                    +{stage.skills.length - 3} more
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {stage.resources?.length || 0} Links
                                </span>
                                <span className="flex items-center gap-1">
                                  <Code className="w-3.5 h-3.5 text-slate-500" /> 1 Project
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Capstone Project Card */}
            <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-7 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md">
                        FINAL CAPSTONE PROJECT
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {roadmapData.finalProject.title}
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full">
                    {roadmapData.finalProject.difficulty}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {roadmapData.finalProject.description}
                </p>

                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Integrated Skills Portfolio:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmapData.finalProject.skillsCovered.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-400" /> Est. Time: <strong className="text-slate-200 ml-1">{roadmapData.finalProject.estimatedTime}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderGit2 className="w-4 h-4 text-emerald-400" /> Portfolio Output: <strong className="text-slate-200 ml-1">Production Sandbox</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => showToast('🚀 Capstone Project Environment Initiated! Sandbox ready.', 'indigo')}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" /> Start Project
                  </button>
                </div>
              </div>
            </div>

            {/* Career Outcomes Footer */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Career Outcome</h3>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                  🎯 {roadmapData.role} Ready
                </span>
              </div>
              
              <p className="text-xs text-slate-300 font-medium">After completing this roadmap, you will be able to:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {roadmapData.careerOutcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="p-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs text-slate-200 font-medium leading-tight">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Stage Detail Explorer & AI Assistant (35% width - 5/4 cols, STICKY) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20 space-y-6">
            
            {/* Stage Detail Explorer Drawer */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden max-h-[calc(100vh-6rem)] flex flex-col">
              
              {/* Detail Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/80 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md">
                    STAGE {activeStage.id} OF {roadmapData.stages.length}
                  </span>
                  
                  <span
                    className={`px-3 py-1 text-xs font-bold border rounded-full ${
                      activeStage.status === 'COMPLETED'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : activeStage.status === 'IN_PROGRESS'
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        : activeStage.status === 'LOCKED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {activeStage.status === 'COMPLETED'
                      ? '✓ COMPLETED'
                      : activeStage.status === 'IN_PROGRESS'
                      ? '● IN PROGRESS'
                      : activeStage.status === 'LOCKED'
                      ? '🔒 LOCKED'
                      : '○ NOT STARTED'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  {activeStage.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-400" /> {activeStage.difficulty}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {activeStage.estimatedDuration}
                  </span>
                </div>
              </div>

              {/* Detail Body (Scrollable) */}
              <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs">

                {/* Interactive Status Controller Button Bar */}
                <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Update Stage Status:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Dynamic Prerequisite Engine</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(activeStage.id, 'COMPLETED')}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Completed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeStage.id, 'IN_PROGRESS')}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" /> Set In Progress
                    </button>
                  </div>
                </div>
                
                {/* Why Learn Rationale */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Why do I need to learn this?</h4>
                  <div className="text-xs text-slate-200 bg-indigo-950/30 border border-indigo-500/20 p-3.5 rounded-xl leading-relaxed">
                    {activeStage.whyLearn}
                  </div>
                </div>

                {/* Prerequisites Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Prerequisites Checklist</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {activeStage.prerequisites.length === 0 ? 'None (Entry Level)' : `${activeStage.prerequisites.length} Required`}
                    </span>
                  </h4>
                  <div className="space-y-1.5">
                    {activeStage.prerequisites.length === 0 ? (
                      <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> No prerequisites required. Direct entry point.
                      </div>
                    ) : (
                      activeStage.prerequisites.map((reqTitle) => {
                        const reqStage = roadmapData.stages.find((s) => s.title === reqTitle);
                        const isMet = reqStage && reqStage.status === 'COMPLETED';

                        return (
                          <div
                            key={reqTitle}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              isMet
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="flex items-center gap-2 font-medium">
                              {isMet ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-amber-400" />
                              )}
                              {reqTitle}
                            </span>
                            <span className={`text-[10px] font-bold uppercase ${isMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {isMet ? 'PASSED ✓' : 'PENDING 🔒'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Syllabus Learnings */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syllabus & Key Competencies</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeStage.learnings.map((item) => (
                      <li key={item} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Curated Learning Materials */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curated Learning Materials</h4>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 rounded-full">
                      {activeStage.resources?.length || 0} Items
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {activeStage.resources?.map((res) => {
                      let formatStyle = 'bg-slate-800 text-slate-300';
                      let FormatIcon = BookOpen;

                      if (res.type === 'COURSE') {
                        formatStyle = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
                        FormatIcon = GraduationCap;
                      } else if (res.type === 'DOCUMENTATION') {
                        formatStyle = 'bg-violet-500/15 text-violet-300 border-violet-500/30';
                        FormatIcon = FileText;
                      } else if (res.type === 'VIDEO') {
                        formatStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                        FormatIcon = Play;
                      } else if (res.type === 'PRACTICE') {
                        formatStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                        FormatIcon = Terminal;
                      } else if (res.type === 'ASSESSMENT') {
                        formatStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                        FormatIcon = Award;
                      }

                      return (
                        <div
                          key={res.id}
                          className="bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 p-3 rounded-xl transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[9px] font-bold border rounded ${formatStyle} flex items-center gap-1`}>
                                <FormatIcon className="w-3 h-3" /> [{res.type}]
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">{res.provider}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{res.title}</h5>
                            <p className="text-[10px] text-slate-400">{res.duration}</p>
                          </div>
                          
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-xs"
                          >
                            <span>Start</span> <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone & Assessment */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hands-on Milestone & Quiz</h4>
                  
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">MILESTONE PROJECT</span>
                        <h5 className="text-xs font-bold text-white mt-0.5">{activeStage.project}</h5>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 mt-0.5">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">STAGE ASSESSMENT</span>
                        <h5 className="text-xs font-bold text-white mt-0.5">{activeStage.assessment}</h5>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => showToast('💻 Sandbox terminal opened for milestone project', 'indigo')}
                        className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Open Sandbox
                      </button>
                      <button
                        onClick={() => showToast('📝 Certification quiz launched', 'emerald')}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" /> Take Quiz
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Embedded AI Advisor Assistant Widget */}
            <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col h-80">
              <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">CareerGPS AI Advisor</h4>
                    <p className="text-[10px] text-emerald-400 font-medium">● Online • Prerequisite Logic Engine</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setChatMessages([
                      {
                        sender: 'ai',
                        text: 'Hi! Ask me anything about your learning roadmap, prerequisites, or why specific skills like Mathematics or Python are required for AI engineering.',
                      },
                    ])
                  }
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Clear
                </button>
              </div>

              <div className="p-3 space-y-3 overflow-y-auto flex-1 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div
                      className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI Assistant a question..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
