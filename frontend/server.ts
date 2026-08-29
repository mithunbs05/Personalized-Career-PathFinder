import express, { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "pathai-super-secure-secret-key-2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "pathai-refresh-token-secret-2026";

app.use(express.json());

// In-memory data store for users & roadmaps
interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
  onboardingCompleted: boolean;
  profile?: {
    educationDegree?: string;
    educationMajor?: string;
    graduationYear?: string;
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
  };
  roadmap?: any;
}

const usersDb: Map<string, DbUser> = new Map();

// Helper to seed initial demo user
const seedDemoUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);
  
  const defaultRoadmap = generateDefaultRoadmap("Alex Rivera", "Become an AI/ML Engineer", "intermediate", ["Python", "SQL", "Machine Learning"], 15);
  
  usersDb.set("alex@pathai.dev", {
    id: "user-demo-101",
    name: "Alex Rivera",
    email: "alex@pathai.dev",
    passwordHash,
    role: "Learner",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    onboardingCompleted: true,
    profile: {
      targetGoal: "Become an AI/ML Engineer",
      experienceLevel: "intermediate",
      knownSkills: ["Python", "SQL", "Machine Learning"],
      weeklyHours: 15,
    },
    roadmap: defaultRoadmap
  });
};

seedDemoUser();

function generateDefaultRoadmap(userName: string, targetGoal: string, experience: string, knownSkills: string[], hours: number) {
  const isAIML = targetGoal.toLowerCase().includes("ai") || targetGoal.toLowerCase().includes("ml") || targetGoal.toLowerCase().includes("generative");
  const isFullStack = targetGoal.toLowerCase().includes("full stack") || targetGoal.toLowerCase().includes("fullstack") || targetGoal.toLowerCase().includes("web");
  const isData = targetGoal.toLowerCase().includes("data") && !isAIML;
  const isBackend = targetGoal.toLowerCase().includes("backend") || targetGoal.toLowerCase().includes("server");
  const isDevOps = targetGoal.toLowerCase().includes("devops") || targetGoal.toLowerCase().includes("cloud");
  
  // Dynamic stage generation based on goal
  const stages: any[] = [];
  const competencies: any[] = [];

  if (isFullStack) {
    stages.push(
      {
        id: "stage-1", title: "Stage 1: Frontend Mastery", order: 1,
        status: experience === "advanced" ? "completed" : experience === "intermediate" ? "completed" : "in-progress",
        nodes: [
          {
            id: "node-html-css", title: "Modern HTML5 & CSS3 Architectures", category: "Frontend",
            status: experience !== "beginner" ? "completed" : "current",
            durationWeeks: 2, description: "Semantic HTML, CSS Grid/Flexbox, responsive design, accessibility, and CSS custom properties.",
            prerequisites: [], skillsGained: ["HTML5", "CSS3", "Responsive Design", "Accessibility"],
            progressPercent: experience !== "beginner" ? 100 : 40, difficulty: "Beginner",
            assessmentScore: experience !== "beginner" ? 92 : undefined,
            lessons: [
              { id: "l1", title: "CSS Grid & Flexbox Masterclass", type: "video", durationMinutes: 30, completed: experience !== "beginner" },
              { id: "l2", title: "Build a Responsive Portfolio", type: "project", durationMinutes: 90, completed: experience !== "beginner" },
              { id: "l3", title: "Accessibility Best Practices Quiz", type: "quiz", durationMinutes: 15, completed: experience !== "beginner" }
            ]
          },
          {
            id: "node-js-ts", title: "JavaScript ES2024+ & TypeScript", category: "Frontend",
            status: experience !== "beginner" ? "completed" : "next",
            durationWeeks: 3, description: "Modern JavaScript patterns, TypeScript type system, async/await, and module systems.",
            prerequisites: ["Modern HTML5 & CSS3"], skillsGained: ["JavaScript", "TypeScript", "ES Modules", "Async Patterns"],
            progressPercent: experience !== "beginner" ? 100 : 0, difficulty: "Intermediate",
            lessons: [
              { id: "l4", title: "TypeScript Type System Deep Dive", type: "coding-lab", durationMinutes: 45, completed: experience !== "beginner" },
              { id: "l5", title: "Async Patterns & Error Handling", type: "article", durationMinutes: 20, completed: experience !== "beginner" }
            ]
          }
        ]
      },
      {
        id: "stage-2", title: "Stage 2: React & State Management", order: 2,
        status: experience === "advanced" ? "completed" : "in-progress",
        nodes: [
          {
            id: "node-react", title: "React 19 & Component Architecture", category: "Frontend Framework",
            status: experience === "advanced" ? "completed" : experience === "intermediate" ? "current" : "locked",
            durationWeeks: 3, description: "React hooks, server components, suspense boundaries, and component composition patterns.",
            prerequisites: ["JavaScript ES2024+"], skillsGained: ["React", "Hooks", "Server Components", "Component Patterns"],
            progressPercent: experience === "advanced" ? 100 : experience === "intermediate" ? 60 : 0, difficulty: "Intermediate",
            milestoneTitle: "Full-Stack Task Management App", isMilestone: true,
            lessons: [
              { id: "l6", title: "React Hooks & Custom Hook Patterns", type: "coding-lab", durationMinutes: 50, completed: experience === "advanced" },
              { id: "l7", title: "State Management with Context & Zustand", type: "video", durationMinutes: 35, completed: experience === "advanced" },
              { id: "l8", title: "React Component Architecture Assessment", type: "quiz", durationMinutes: 20, completed: false }
            ]
          },
          {
            id: "node-nextjs", title: "Next.js App Router & Full-Stack Patterns", category: "Full Stack",
            status: experience === "advanced" ? "current" : "locked",
            durationWeeks: 3, description: "Server-side rendering, API routes, middleware, and deployment strategies.",
            prerequisites: ["React 19"], skillsGained: ["Next.js", "SSR", "API Routes", "Edge Functions"],
            progressPercent: experience === "advanced" ? 30 : 0, difficulty: "Advanced",
            lessons: [
              { id: "l9", title: "Next.js App Router Deep Dive", type: "video", durationMinutes: 40, completed: false },
              { id: "l10", title: "Build a SaaS Landing Page", type: "project", durationMinutes: 120, completed: false }
            ]
          }
        ]
      },
      {
        id: "stage-3", title: "Stage 3: Backend & Databases", order: 3, status: "upcoming",
        nodes: [
          {
            id: "node-node-api", title: "Node.js REST & GraphQL APIs", category: "Backend",
            status: "recommended", durationWeeks: 3,
            description: "Express/Fastify APIs, authentication, input validation, and rate limiting.",
            prerequisites: ["Next.js App Router"], skillsGained: ["Node.js", "REST APIs", "GraphQL", "Authentication"],
            progressPercent: 0, difficulty: "Intermediate", milestoneTitle: "Production API with Auth & Rate Limiting", isMilestone: true,
            lessons: [
              { id: "l11", title: "RESTful API Design Patterns", type: "article", durationMinutes: 25, completed: false },
              { id: "l12", title: "Building GraphQL Resolvers", type: "coding-lab", durationMinutes: 60, completed: false }
            ]
          },
          {
            id: "node-db", title: "PostgreSQL & Database Design", category: "Backend",
            status: "locked", durationWeeks: 2,
            description: "Relational schema design, indexing strategies, ORMs, and query optimization.",
            prerequisites: ["Node.js REST & GraphQL APIs"], skillsGained: ["PostgreSQL", "Schema Design", "Prisma ORM", "Query Optimization"],
            progressPercent: 0, difficulty: "Intermediate",
            lessons: [
              { id: "l13", title: "Schema Design & Normalization", type: "video", durationMinutes: 30, completed: false },
              { id: "l14", title: "Build a Multi-Tenant Database", type: "project", durationMinutes: 90, completed: false }
            ]
          }
        ]
      }
    );
    competencies.push(
      { name: "HTML/CSS", score: experience !== "beginner" ? 88 : 35, color: "#FF4D36" },
      { name: "JavaScript/TypeScript", score: experience === "advanced" ? 82 : experience === "intermediate" ? 60 : 20, color: "#6A8D73" },
      { name: "React", score: experience === "advanced" ? 75 : experience === "intermediate" ? 45 : 10, color: "#E84A27" },
      { name: "Backend/Node.js", score: experience === "advanced" ? 55 : 20, color: "#8E9AAF" }
    );
  } else {
    // Default: AI/ML path (existing logic, now with proper prerequisite chains)
    stages.push(
      {
        id: "stage-1", title: "Stage 1: Core Engineering & Mathematics", order: 1,
        status: experience !== "beginner" ? "completed" : "in-progress",
        nodes: [
          {
            id: "node-python", title: "Advanced Python for AI & Data Structures", category: "Core Foundations",
            status: experience !== "beginner" ? "completed" : "current",
            durationWeeks: 2, description: "Master asynchronous Python, memory profiling, and high-performance vector operations.",
            prerequisites: ["Basic Programming"], skillsGained: ["Python", "NumPy", "AsyncIO", "OOP"],
            progressPercent: experience !== "beginner" ? 100 : 40, difficulty: "Intermediate",
            assessmentScore: experience !== "beginner" ? 94 : undefined,
            lessons: [
              { id: "l1", title: "Memory Management & Vectorization in NumPy", type: "video", durationMinutes: 25, completed: experience !== "beginner" },
              { id: "l2", title: "Async Task Execution & Concurrency", type: "coding-lab", durationMinutes: 40, completed: experience !== "beginner" },
              { id: "l3", title: "Python Data Structures Mastery Assessment", type: "quiz", durationMinutes: 20, completed: experience !== "beginner" }
            ]
          },
          {
            id: "node-ml", title: "Applied Machine Learning & Statistical Inference", category: "Machine Learning",
            status: experience !== "beginner" ? "completed" : "next",
            durationWeeks: 3, description: "End-to-end model evaluation, gradient descent mechanics, and feature pipelines.",
            prerequisites: ["Advanced Python for AI"], skillsGained: ["Scikit-Learn", "Feature Engineering", "Model Metrics"],
            progressPercent: experience !== "beginner" ? 100 : 0, difficulty: "Intermediate",
            assessmentScore: experience !== "beginner" ? 88 : undefined,
            lessons: [
              { id: "l4", title: "Bias-Variance Tradeoff & Cross-Validation", type: "article", durationMinutes: 15, completed: experience !== "beginner" },
              { id: "l5", title: "Building a Production Tabular Classifier", type: "project", durationMinutes: 90, completed: experience !== "beginner" }
            ]
          }
        ]
      },
      {
        id: "stage-2", title: "Stage 2: Deep Learning & Modern Transformers", order: 2,
        status: experience === "advanced" ? "completed" : "in-progress",
        nodes: [
          {
            id: "node-dl", title: "Deep Learning Foundations & PyTorch", category: "Deep Learning",
            status: experience === "advanced" ? "completed" : experience === "intermediate" ? "current" : "locked",
            durationWeeks: 2, description: "Neural network backprop mathematics, tensor graph architectures, and GPU acceleration.",
            prerequisites: ["Applied Machine Learning"], skillsGained: ["PyTorch", "Backpropagation", "CUDA"],
            progressPercent: experience === "advanced" ? 100 : experience === "intermediate" ? 75 : 0, difficulty: "Intermediate",
            milestoneTitle: "Custom Autoencoder Implementation", isMilestone: true,
            lessons: [
              { id: "l6", title: "Autograd Engines & Computational Graphs", type: "coding-lab", durationMinutes: 45, completed: experience !== "beginner" },
              { id: "l7", title: "Training Vision and Sequence Models", type: "video", durationMinutes: 30, completed: experience !== "beginner" },
              { id: "l8", title: "PyTorch Optimization Lab", type: "coding-lab", durationMinutes: 50, completed: experience === "advanced" }
            ]
          },
          {
            id: "node-llm", title: "LLM Fundamentals & Attention Mechanisms", category: "Generative AI",
            status: experience === "advanced" ? "current" : "next",
            durationWeeks: 2, description: "Decoder-only architectures, positional embeddings, KV caching, and tokenization dynamics.",
            prerequisites: ["Deep Learning Foundations"], skillsGained: ["Transformers", "Self-Attention", "Tokenizers"],
            progressPercent: experience === "advanced" ? 40 : 0, difficulty: "Advanced",
            lessons: [
              { id: "l9", title: "Inside the Multi-Head Attention Head", type: "article", durationMinutes: 20, completed: false },
              { id: "l10", title: "Building a Micro-GPT from Scratch", type: "coding-lab", durationMinutes: 90, completed: false }
            ]
          }
        ]
      },
      {
        id: "stage-3", title: "Stage 3: Retrieval Augmented Generation & Agents", order: 3, status: "upcoming",
        nodes: [
          {
            id: "node-rag", title: "Production RAG Systems & Vector DBs", category: "Generative AI",
            status: "recommended", durationWeeks: 3,
            description: "Chunking strategies, embedding alignment, semantic search, re-ranking, and latency tuning.",
            prerequisites: ["LLM Fundamentals"], skillsGained: ["Chroma/Pinecone", "Hybrid Search", "LangChain/LlamaIndex"],
            progressPercent: 0, difficulty: "Advanced",
            isMilestone: true, milestoneTitle: "Enterprise Document Q&A Engine",
            lessons: [
              { id: "l11", title: "Vector Embedding Topologies & HNSW", type: "video", durationMinutes: 30, completed: false },
              { id: "l12", title: "Cross-Encoder Re-Ranking Pipelines", type: "coding-lab", durationMinutes: 60, completed: false }
            ]
          },
          {
            id: "node-agents", title: "Autonomous AI Agents & Tool Execution", category: "AI Systems",
            status: "locked", durationWeeks: 3,
            description: "ReAct patterns, planning loops, structured JSON outputs, function calling, and state persistence.",
            prerequisites: ["Production RAG Systems"], skillsGained: ["Tool Calling", "Multi-Agent Protocols", "Evaluation"],
            progressPercent: 0, difficulty: "Advanced",
            milestoneTitle: "Self-Healing Code Assistant", isMilestone: true,
            lessons: [
              { id: "l13", title: "ReAct & Reflexion Agent Architectures", type: "article", durationMinutes: 25, completed: false },
              { id: "l14", title: "Building a Self-Healing Code Assistant", type: "project", durationMinutes: 120, completed: false }
            ]
          }
        ]
      }
    );
    competencies.push(
      { name: "Python", score: experience === "advanced" ? 92 : experience === "intermediate" ? 90 : 45, color: "#FF4D36" },
      { name: "Machine Learning", score: experience === "advanced" ? 85 : experience === "intermediate" ? 78 : 20, color: "#6A8D73" },
      { name: "Generative AI", score: experience === "advanced" ? 70 : experience === "intermediate" ? 62 : 8, color: "#E84A27" },
      { name: "System Design", score: experience === "advanced" ? 60 : experience === "intermediate" ? 41 : 12, color: "#8E9AAF" }
    );
  }

  // Compute overall progress
  const allNodes = stages.flatMap((s: any) => s.nodes);
  const completedNodes = allNodes.filter((n: any) => n.status === "completed").length;
  const overallProgress = Math.round((completedNodes / allNodes.length) * 100);

  // Determine current milestone
  const currentNode = allNodes.find((n: any) => n.status === "current") || allNodes[0];

  // Compute skill gaps based on competencies
  const skillGaps = competencies
    .filter((c: any) => c.score < 80)
    .map((c: any) => ({
      skill: c.name,
      currentLevel: c.score,
      targetLevel: 85,
      gapScore: 85 - c.score,
      priority: c.score < 40 ? "high" : c.score < 65 ? "high" : "medium",
      recommendedAction: `Complete ${c.name} training modules and practice labs`
    }));

  return {
    id: "roadmap-" + Math.random().toString(36).substring(2, 9),
    userId: "user",
    targetGoal: targetGoal || "Generative AI Engineer",
    createdAt: new Date().toISOString(),
    overallProgress,
    estimatedCompletionWeeks: Math.max(8, Math.round(180 / (hours || 10))),
    currentMilestone: currentNode?.milestoneTitle || currentNode?.title || "Getting Started",
    nextRecommendedAction: {
      nodeId: currentNode?.id || "node-1",
      title: currentNode?.title || "Start Learning",
      actionText: "Start Interactive Lab",
      estimatedMinutes: 45
    },
    stages,
    skillGaps,
    competencies
  };
}

// =================== RECOMMENDATION ENGINE ===================

interface Recommendation {
  id: string;
  title: string;
  type: 'course' | 'project' | 'resource';
  provider: string;
  level: string;
  durationHours: number;
  matchScore: number;
  reasoning: string;
  tags: string[];
  description: string;
  thumbnailColor: string;
  url?: string;
  dismissed?: boolean;
  // Project-specific
  skills?: string[];
  deliverable?: string;
  githubTemplateUrl?: string;
  // Resource-specific
  resourceType?: string;
}

// Deterministic recommendation catalog based on career goals
function generateRecommendations(profile: any, roadmap: any): { courses: any[]; projects: any[]; resources: any[] } {
  const goal = (profile?.targetGoal || "AI/ML Engineer").toLowerCase();
  const skills = profile?.knownSkills || [];
  const experience = profile?.experienceLevel || "intermediate";
  const interests = profile?.technicalInterests || [];
  const gaps = roadmap?.skillGaps || [];
  const gapNames = gaps.map((g: any) => g.skill);

  const isAI = goal.includes("ai") || goal.includes("ml") || goal.includes("generative");
  const isWeb = goal.includes("full stack") || goal.includes("web") || goal.includes("frontend");
  const isBackend = goal.includes("backend") || goal.includes("server");
  const isData = goal.includes("data") && !isAI;

  // Courses catalog
  const allCourses = [
    // AI/ML courses
    {
      id: "course-dl-spec", title: "Deep Learning Specialization", provider: "Coursera (Andrew Ng)",
      level: "Intermediate", durationHours: 80, tags: ["Deep Learning", "Neural Networks", "PyTorch"],
      description: "Master deep learning fundamentals: neural networks, hyperparameter tuning, CNNs, sequence models, and transformers.",
      thumbnailColor: "#FF4D31", goalMatch: ["ai", "ml", "generative", "deep learning"],
      reasoning: "Directly addresses your deep learning skill gap and builds the neural network foundations needed for your AI/ML career goal."
    },
    {
      id: "course-llm-eng", title: "LLM Engineering: From Prompts to Production", provider: "DeepLearning.AI",
      level: "Advanced", durationHours: 40, tags: ["LLMs", "RAG", "Prompt Engineering", "LangChain"],
      description: "Build production LLM applications with RAG, function calling, evaluation frameworks, and deployment pipelines.",
      thumbnailColor: "#6A8D73", goalMatch: ["ai", "generative", "llm"],
      reasoning: "Targets your Generative AI skill gap and teaches the RAG pipeline skills you'll need for your production AI systems milestone."
    },
    {
      id: "course-ml-ops", title: "Machine Learning Engineering for Production (MLOps)", provider: "Coursera (Google)",
      level: "Advanced", durationHours: 60, tags: ["MLOps", "Model Deployment", "CI/CD", "Monitoring"],
      description: "End-to-end ML lifecycle: data pipelines, model training at scale, deployment, monitoring, and A/B testing.",
      thumbnailColor: "#8E9AAF", goalMatch: ["ai", "ml", "devops"],
      reasoning: "Fills the System Design gap by teaching production ML infrastructure — essential for senior AI/ML engineering roles."
    },
    {
      id: "course-fastapi", title: "Production FastAPI Microservices", provider: "TestDriven.io",
      level: "Intermediate", durationHours: 25, tags: ["FastAPI", "Python", "REST APIs", "Docker"],
      description: "Build scalable Python APIs with FastAPI, async patterns, Docker containerization, and CI/CD deployment.",
      thumbnailColor: "#E84A27", goalMatch: ["ai", "backend", "full stack"],
      reasoning: "Strengthens your backend API skills which are critical for deploying AI models as production services."
    },
    // Web Dev courses
    {
      id: "course-react-perf", title: "Advanced React Patterns & Performance", provider: "Frontend Masters",
      level: "Advanced", durationHours: 30, tags: ["React", "Performance", "Architecture", "TypeScript"],
      description: "Advanced component patterns, render optimization, code splitting, and large-scale React architecture.",
      thumbnailColor: "#FF4D31", goalMatch: ["web", "full stack", "frontend", "react"],
      reasoning: "Accelerates your React mastery with production patterns used in top-tier engineering teams."
    },
    {
      id: "course-nextjs-full", title: "Next.js 15 Complete Developer Guide", provider: "Udemy (Stephen Grider)",
      level: "Intermediate", durationHours: 45, tags: ["Next.js", "React", "SSR", "Full Stack"],
      description: "Build full-stack applications with Next.js App Router, server actions, caching strategies, and deployment.",
      thumbnailColor: "#6A8D73", goalMatch: ["web", "full stack", "frontend"],
      reasoning: "Next.js is the industry standard for full-stack React — this course directly maps to your career goal."
    },
    {
      id: "course-system-design", title: "System Design for Software Engineers", provider: "Educative.io",
      level: "Advanced", durationHours: 35, tags: ["System Design", "Scalability", "Architecture"],
      description: "Master distributed systems, load balancing, caching, database sharding, and real-time architectures.",
      thumbnailColor: "#8E9AAF", goalMatch: ["backend", "full stack", "ai", "ml"],
      reasoning: "System design is the highest-priority skill gap in your profile — essential for senior engineering interviews."
    },
    {
      id: "course-python-ds", title: "Python for Data Science & Machine Learning", provider: "Udemy (Jose Portilla)",
      level: "Beginner", durationHours: 40, tags: ["Python", "Pandas", "NumPy", "Matplotlib"],
      description: "Complete Python data science toolkit: Pandas, NumPy, Matplotlib, Seaborn, and introductory ML.",
      thumbnailColor: "#FF4D31", goalMatch: ["data", "ai", "ml"],
      reasoning: "Builds the Python data manipulation foundations that underpin all your advanced AI/ML coursework."
    },
  ];

  // Projects catalog
  const allProjects = [
    {
      id: "proj-rag-engine", title: "Enterprise RAG Document Q&A Engine", difficulty: "Advanced",
      estimatedHours: 40, skills: ["LangChain", "Vector DB", "FastAPI", "React"],
      description: "Build a production RAG system with document ingestion, semantic chunking, hybrid search, and a chat UI.",
      deliverable: "Deployed FastAPI + React app with PDF upload, vector search, and conversational Q&A",
      goalMatch: ["ai", "generative", "llm"], matchScore: 97,
      reasoning: "This project directly demonstrates the RAG pipeline skills that top AI companies look for — it's your strongest portfolio piece."
    },
    {
      id: "proj-multi-agent", title: "Multi-Agent Research Assistant", difficulty: "Advanced",
      estimatedHours: 35, skills: ["LangChain", "Tool Calling", "Python", "Agents"],
      description: "Autonomous agents that search the web, synthesize documentation, and write technical reports with citations.",
      deliverable: "Python CLI + API with autonomous research, summarization, and report generation",
      goalMatch: ["ai", "generative", "agents"], matchScore: 94,
      reasoning: "AI agent development is the most in-demand skill for 2026 — this project proves you can build autonomous systems."
    },
    {
      id: "proj-saas-dashboard", title: "SaaS Analytics Dashboard", difficulty: "Intermediate",
      estimatedHours: 30, skills: ["React", "Next.js", "PostgreSQL", "Chart.js"],
      description: "Full-stack analytics dashboard with real-time data visualization, user authentication, and billing integration.",
      deliverable: "Deployed Next.js SaaS app with charts, auth, and Stripe checkout",
      goalMatch: ["web", "full stack", "frontend"], matchScore: 95,
      reasoning: "SaaS dashboards are the bread-and-butter of full-stack roles — this demonstrates end-to-end product thinking."
    },
    {
      id: "proj-ml-pipeline", title: "End-to-End ML Prediction Pipeline", difficulty: "Intermediate",
      estimatedHours: 25, skills: ["Python", "Scikit-Learn", "Docker", "FastAPI"],
      description: "Complete ML pipeline: data preprocessing, model training, hyperparameter tuning, API deployment, and monitoring.",
      deliverable: "Dockerized prediction API with training pipeline and model registry",
      goalMatch: ["ai", "ml", "data"], matchScore: 91,
      reasoning: "Shows you can take a model from notebook to production — a critical skill that separates junior from senior ML engineers."
    },
    {
      id: "proj-realtime-chat", title: "Real-Time Collaborative Chat App", difficulty: "Intermediate",
      estimatedHours: 20, skills: ["React", "WebSockets", "Node.js", "Redis"],
      description: "Build a real-time chat application with WebSocket channels, typing indicators, and message persistence.",
      deliverable: "Real-time chat app with rooms, typing indicators, and message history",
      goalMatch: ["web", "full stack", "backend"], matchScore: 88,
      reasoning: "Real-time systems demonstrate advanced backend skills and WebSocket expertise valued in senior engineering roles."
    },
    {
      id: "proj-automl-platform", title: "AutoML Training Platform", difficulty: "Advanced",
      estimatedHours: 50, skills: ["Python", "PyTorch", "Optuna", "FastAPI", "React"],
      description: "Platform where users upload datasets and get automatically trained, evaluated, and deployed ML models.",
      deliverable: "Web UI + API for automated model training, evaluation comparison, and one-click deployment",
      goalMatch: ["ai", "ml", "full stack"], matchScore: 93,
      reasoning: "Combines your ML knowledge with full-stack engineering — exactly the intersection that AI product companies hire for."
    },
  ];

  // Resources catalog
  const allResources = [
    {
      id: "res-pytorch-docs", title: "PyTorch Official Documentation & Tutorials", type: "documentation",
      provider: "PyTorch.org", tags: ["PyTorch", "Deep Learning", "Tutorials"],
      description: "Comprehensive official tutorials covering tensor operations, autograd, model training, and deployment.",
      goalMatch: ["ai", "ml", "deep learning"],
      reasoning: "PyTorch docs are the primary reference for your deep learning training modules — bookmark for daily practice."
    },
    {
      id: "res-arxiv-papers", title: "Key AI/ML Research Papers Reading List", type: "documentation",
      provider: "arXiv / Papers With Code", tags: ["Research", "Papers", "State-of-the-Art"],
      description: "Curated list of seminal and recent papers: Attention Is All You Need, BERT, GPT series, RLHF, and DPO.",
      goalMatch: ["ai", "generative", "ml"],
      reasoning: "Understanding foundational papers gives you the theoretical depth that top AI teams evaluate during interviews."
    },
    {
      id: "res-lc-docs", title: "LangChain & LlamaIndex Documentation", type: "documentation",
      provider: "LangChain / LlamaIndex", tags: ["LangChain", "RAG", "Agents", "LlamaIndex"],
      description: "Official documentation for building LLM-powered applications: chains, agents, retrieval, and evaluation.",
      goalMatch: ["ai", "generative", "llm", "agents"],
      reasoning: "These are the core frameworks you'll use in your RAG and Agent projects — essential daily reference."
    },
    {
      id: "res-mdn-web", title: "MDN Web Docs — Complete Web Reference", type: "documentation",
      provider: "Mozilla Developer Network", tags: ["HTML", "CSS", "JavaScript", "Web APIs"],
      description: "The authoritative reference for all web technologies: HTML, CSS, JavaScript, and Web APIs.",
      goalMatch: ["web", "full stack", "frontend"],
      reasoning: "MDN is the gold standard reference for web development — use it alongside your React & Next.js coursework."
    },
    {
      id: "res-leetcode-patterns", title: "LeetCode Patterns for Technical Interviews", type: "tool",
      provider: "LeetCode / NeetCode", tags: ["DSA", "Interview Prep", "Algorithms"],
      description: "Curated problem sets organized by pattern: sliding window, two pointers, BFS/DFS, dynamic programming.",
      goalMatch: ["ai", "web", "full stack", "backend", "data"],
      reasoning: "Technical interviews at your target companies require strong algorithm skills — practice 3-5 problems/week."
    },
    {
      id: "res-github-copilot", title: "GitHub Copilot for Accelerated Development", type: "tool",
      provider: "GitHub", tags: ["AI Tools", "Productivity", "Code Generation"],
      description: "AI-powered code completion that accelerates development speed by 30-50% across all programming tasks.",
      goalMatch: ["ai", "web", "full stack", "backend"],
      reasoning: "Copilot fluency is now an expected skill at modern companies — integrate it into your development workflow."
    },
    {
      id: "res-system-design-primer", title: "System Design Primer — Interview Guide", type: "book",
      provider: "GitHub (donnemartin)", tags: ["System Design", "Architecture", "Scalability"],
      description: "Open-source guide covering load balancers, CDNs, databases, caching, and distributed system patterns.",
      goalMatch: ["backend", "full stack", "ai", "ml"],
      reasoning: "Your system design score is the lowest competency — this primer bridges the gap for senior-level interviews."
    },
    {
      id: "res-huggingface", title: "Hugging Face Model Hub & Transformers Library", type: "tool",
      provider: "Hugging Face", tags: ["Transformers", "Models", "NLP", "Fine-tuning"],
      description: "Access 500K+ pre-trained models, datasets, and the Transformers library for fine-tuning and inference.",
      goalMatch: ["ai", "generative", "ml", "nlp"],
      reasoning: "Hugging Face is the de facto platform for accessing and deploying transformer models in production."
    },
  ];

  // Score and filter recommendations based on profile match
  function scoreItem(item: any): number {
    let score = 50; // Base score
    const goalMatches = item.goalMatch || [];
    
    // Goal matching (+30 max)
    for (const gm of goalMatches) {
      if (goal.includes(gm)) score += 15;
    }
    
    // Skill gap matching (+20 max)
    const itemTags = (item.tags || item.skills || []).map((t: string) => t.toLowerCase());
    for (const gap of gapNames) {
      if (itemTags.some((t: string) => gap.toLowerCase().includes(t) || t.includes(gap.toLowerCase()))) {
        score += 10;
      }
    }
    
    // Interest matching (+10 max)
    for (const interest of interests) {
      if (itemTags.some((t: string) => interest.toLowerCase().includes(t) || t.includes(interest.toLowerCase()))) {
        score += 5;
      }
    }
    
    // Experience level alignment (+5)
    if (item.level) {
      if (experience === "beginner" && item.level === "Beginner") score += 5;
      if (experience === "intermediate" && item.level === "Intermediate") score += 5;
      if (experience === "advanced" && item.level === "Advanced") score += 5;
    }
    
    return Math.min(99, score);
  }

  const courses = allCourses
    .map(c => ({ ...c, matchScore: scoreItem(c) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);

  const projects = allProjects
    .map(p => ({ ...p, matchScore: p.matchScore || scoreItem(p) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const resources = allResources
    .map(r => ({ ...r, matchScore: scoreItem(r) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);

  return {
    courses: courses.map(c => ({
      id: c.id, title: c.title, provider: c.provider, level: c.level,
      durationHours: c.durationHours, matchScore: c.matchScore,
      reasoning: c.reasoning, tags: c.tags, thumbnailColor: c.thumbnailColor,
      description: c.description, dismissed: false
    })),
    projects: projects.map((p: any) => ({
      id: p.id, title: p.title, difficulty: p.difficulty,
      estimatedHours: p.estimatedHours, matchScore: p.matchScore,
      reasoning: p.reasoning, skills: p.skills, description: p.description,
      deliverable: p.deliverable, githubTemplateUrl: p.githubTemplateUrl || undefined, dismissed: false
    })),
    resources: resources.map((r: any) => ({
      id: r.id, title: r.title, type: r.type, matchScore: r.matchScore,
      reasoning: r.reasoning, tags: r.tags, description: r.description,
      provider: r.provider, dismissed: false
    }))
  };
}

// Auth Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.user = user as any;
    next();
  });
};

// ================= API ROUTES =================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "PathAI API Service", version: "1.0.0" });
});

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (usersDb.has(normalizedEmail)) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || "password123", salt);

    const newUser: DbUser = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "Learner",
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false
    };

    usersDb.set(normalizedEmail, newUser);

    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        onboardingCompleted: newUser.onboardingCompleted
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 7200
      },
      message: "Registration successful"
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Failed to register user." });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDb.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password credentials." });
    }

    if (password) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password credentials." });
      }
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted,
        profile: user.profile
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 7200
      },
      message: "Login successful"
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Authentication failed." });
  }
});

// Auth: Refresh Token
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required." });
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
    if (err || !decoded) {
      return res.status(403).json({ error: "Invalid refresh token." });
    }

    const user = usersDb.get(decoded.email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      accessToken: newAccessToken,
      expiresIn: 7200
    });
  });
});

// Auth: Logout
app.post("/api/auth/logout", (req, res) => {
  return res.json({ message: "Successfully logged out." });
});

// Auth: Current User Profile
app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
  let user = usersDb.get(req.user!.email);
  if (!user && req.user) {
    user = {
      id: req.user.id || "user-" + Date.now(),
      name: req.user.name || "Learner",
      email: req.user.email,
      passwordHash: "",
      role: req.user.role || "Learner",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      profile: {
        targetGoal: "Become an AI/ML Engineer",
        experienceLevel: "intermediate",
        knownSkills: ["Python", "SQL"],
        weeklyHours: 12
      },
      roadmap: generateDefaultRoadmap(req.user.name || "Learner", "Become an AI/ML Engineer", "intermediate", ["Python", "SQL"], 12)
    };
    usersDb.set(req.user.email, user);
  }

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      onboardingCompleted: user.onboardingCompleted,
      profile: user.profile
    }
  });
});

// Onboarding: Save profile & generate roadmap
app.post("/api/onboarding/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      targetGoal,
      experienceLevel,
      knownSkills,
      weeklyHours,
      educationDegree,
      educationMajor,
      graduationYear,
      githubUrl,
      linkedinUrl,
      industryExperienceType,
      yearsExperience,
      currentProjects,
      completedLearning,
      technicalInterests,
      jobSpecialization,
      targetCompletionMonths,
      salaryPlacementGoal,
      learningPreferences,
      resourceBudget,
      immediateMotivation
    } = req.body;
    
    const user = usersDb.get(req.user!.email);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.profile = {
      educationDegree: educationDegree || user.profile?.educationDegree,
      educationMajor: educationMajor || user.profile?.educationMajor,
      graduationYear: graduationYear || user.profile?.graduationYear,
      githubUrl: githubUrl || user.profile?.githubUrl,
      linkedinUrl: linkedinUrl || user.profile?.linkedinUrl,
      industryExperienceType: industryExperienceType || user.profile?.industryExperienceType,
      yearsExperience: yearsExperience || user.profile?.yearsExperience,
      currentProjects: currentProjects || user.profile?.currentProjects,
      completedLearning: completedLearning || user.profile?.completedLearning,
      technicalInterests: Array.isArray(technicalInterests) ? technicalInterests : user.profile?.technicalInterests,
      jobSpecialization: jobSpecialization || user.profile?.jobSpecialization,
      targetCompletionMonths: targetCompletionMonths || user.profile?.targetCompletionMonths,
      salaryPlacementGoal: salaryPlacementGoal || user.profile?.salaryPlacementGoal,
      learningPreferences: Array.isArray(learningPreferences) ? learningPreferences : user.profile?.learningPreferences,
      resourceBudget: resourceBudget || user.profile?.resourceBudget,
      immediateMotivation: immediateMotivation || user.profile?.immediateMotivation,
      targetGoal: targetGoal || user.profile?.targetGoal || "AI/ML Engineer",
      experienceLevel: experienceLevel || user.profile?.experienceLevel || "intermediate",
      knownSkills: Array.isArray(knownSkills) && knownSkills.length > 0 ? knownSkills : (user.profile?.knownSkills || ["Python"]),
      weeklyHours: Number(weeklyHours) || user.profile?.weeklyHours || 10
    };
    user.onboardingCompleted = true;

    // Generate tailored roadmap
    const roadmap = generateDefaultRoadmap(user.name, user.profile.targetGoal, user.profile.experienceLevel, user.profile.knownSkills, user.profile.weeklyHours);
    user.roadmap = roadmap;

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        onboardingCompleted: true,
        profile: user.profile
      },
      roadmap
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ error: "Failed to save onboarding profile." });
  }
});

function getOrCreateUser(reqUser: { id?: string; email: string; name?: string; role?: string }): DbUser {
  const normalizedEmail = (reqUser.email || '').toLowerCase().trim();
  let user = usersDb.get(normalizedEmail) || usersDb.get(reqUser.email);
  if (!user) {
    user = {
      id: reqUser.id || `user-${Date.now()}`,
      name: reqUser.name || (reqUser.email ? reqUser.email.split('@')[0] : 'Alex Rivera'),
      email: normalizedEmail,
      passwordHash: '',
      role: reqUser.role || 'Learner',
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      profile: {
        targetGoal: "Generative AI Engineer",
        experienceLevel: "intermediate",
        knownSkills: ["Python", "SQL", "Machine Learning"],
        weeklyHours: 12
      }
    };
    user.roadmap = generateDefaultRoadmap(user.name, user.profile.targetGoal, user.profile.experienceLevel, user.profile.knownSkills, user.profile.weeklyHours);
    usersDb.set(normalizedEmail, user);
  }
  return user;
}

// Roadmap: Get Current Roadmap
app.get("/api/roadmap", authenticateToken, (req: AuthRequest, res) => {
  const user = getOrCreateUser(req.user!);

  if (!user.roadmap) {
    user.roadmap = generateDefaultRoadmap(
      user.name,
      user.profile?.targetGoal || "Generative AI Engineer",
      user.profile?.experienceLevel || "intermediate",
      user.profile?.knownSkills || ["Python"],
      user.profile?.weeklyHours || 12
    );
  }

  return res.json(user.roadmap);
});

// Roadmap: Update Lesson completion or node progress
app.post("/api/roadmap/update-lesson", authenticateToken, (req: AuthRequest, res) => {
  const { nodeId, lessonId, completed } = req.body;
  const user = getOrCreateUser(req.user!);
  if (!user.roadmap) {
    user.roadmap = generateDefaultRoadmap(
      user.name,
      user.profile?.targetGoal || "Generative AI Engineer",
      user.profile?.experienceLevel || "intermediate",
      user.profile?.knownSkills || ["Python"],
      user.profile?.weeklyHours || 12
    );
  }

  let foundLesson = false;
  for (const stage of user.roadmap.stages) {
    for (const node of stage.nodes) {
      if (node.id === nodeId) {
        for (const lesson of node.lessons) {
          if (lesson.id === lessonId) {
            lesson.completed = completed;
            foundLesson = true;
          }
        }
        // Recalculate node progress
        const completedCount = node.lessons.filter((l: any) => l.completed).length;
        node.progressPercent = Math.round((completedCount / (node.lessons.length || 1)) * 100);
        if (node.progressPercent === 100) {
          node.status = 'completed';
        }
      }
    }
  }

  return res.json({ success: true, roadmap: user.roadmap });
});

// Recommendations: Get personalized recommendations
app.get("/api/recommendations", authenticateToken, (req: AuthRequest, res) => {
  const user = getOrCreateUser(req.user!);

  if (!user.roadmap) {
    user.roadmap = generateDefaultRoadmap(
      user.name,
      user.profile?.targetGoal || "AI/ML Engineer",
      user.profile?.experienceLevel || "intermediate",
      user.profile?.knownSkills || ["Python"],
      user.profile?.weeklyHours || 12
    );
  }

  const recs = generateRecommendations(user.profile, user.roadmap);
  return res.json({
    ...recs,
    generatedAt: new Date().toISOString(),
    profileSummary: {
      targetGoal: user.profile?.targetGoal || "AI/ML Engineer",
      experienceLevel: user.profile?.experienceLevel || "intermediate",
      topSkillGaps: (user.roadmap?.skillGaps || []).slice(0, 3).map((g: any) => g.skill)
    }
  });
});

// Recommendations: Refresh recommendations
app.post("/api/recommendations/refresh", authenticateToken, (req: AuthRequest, res) => {
  const user = getOrCreateUser(req.user!);

  if (!user.roadmap) {
    user.roadmap = generateDefaultRoadmap(
      user.name,
      user.profile?.targetGoal || "AI/ML Engineer",
      user.profile?.experienceLevel || "intermediate",
      user.profile?.knownSkills || ["Python"],
      user.profile?.weeklyHours || 12
    );
  }

  const recs = generateRecommendations(user.profile, user.roadmap);
  return res.json({
    ...recs,
    generatedAt: new Date().toISOString(),
    profileSummary: {
      targetGoal: user.profile?.targetGoal || "AI/ML Engineer",
      experienceLevel: user.profile?.experienceLevel || "intermediate",
      topSkillGaps: (user.roadmap?.skillGaps || []).slice(0, 3).map((g: any) => g.skill)
    }
  });
});

// Recommendations: Dismiss a recommendation
app.post("/api/recommendations/dismiss", authenticateToken, (req: AuthRequest, res) => {
  const { id, type } = req.body;
  return res.json({ success: true, dismissed: { id, type } });
});

// Roadmap: Generate fresh roadmap from profile & custom options
app.post("/api/roadmap/generate", authenticateToken, (req: AuthRequest, res) => {
  const user = getOrCreateUser(req.user!);
  const { targetGoal, experienceLevel, weeklyHours } = req.body || {};

  if (targetGoal) {
    if (!user.profile) {
      user.profile = {
        targetGoal,
        experienceLevel: experienceLevel || 'intermediate',
        knownSkills: ['Python'],
        weeklyHours: weeklyHours || 12
      };
    } else {
      user.profile.targetGoal = targetGoal;
      if (experienceLevel) user.profile.experienceLevel = experienceLevel;
      if (weeklyHours) user.profile.weeklyHours = Number(weeklyHours);
    }
  }

  const roadmap = generateDefaultRoadmap(
    user.name,
    targetGoal || user.profile?.targetGoal || "AI/ML Engineer",
    experienceLevel || user.profile?.experienceLevel || "intermediate",
    user.profile?.knownSkills || ["Python"],
    weeklyHours || user.profile?.weeklyHours || 12
  );
  user.roadmap = roadmap;

  return res.json(roadmap);
});

// AI Mentor: Enhanced chat endpoint with full profile context
app.post("/api/mentor/chat", async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Try to get user profile for context enrichment
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userProfile: any = null;
    let userRoadmap: any = null;
    let userRecommendations: any = null;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = usersDb.get(decoded.email);
        if (user) {
          userProfile = user.profile;
          userRoadmap = user.roadmap;
          userRecommendations = generateRecommendations(user.profile, user.roadmap);
        }
      } catch (e) { /* token verification failed, proceed without profile */ }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        // Build profile-aware system instruction
        const profileContext = userProfile ? `
LEARNER PROFILE:
- Career Goal: ${userProfile.targetGoal || "Not specified"}
- Experience Level: ${userProfile.experienceLevel || "intermediate"}
- Known Skills: ${(userProfile.knownSkills || []).join(", ") || "Not specified"}
- Weekly Hours: ${userProfile.weeklyHours || 10} hours/week
- Education: ${userProfile.educationDegree || "Not specified"} ${userProfile.educationMajor || ""}
- Technical Interests: ${(userProfile.technicalInterests || []).join(", ") || "Not specified"}
- Target Timeline: ${userProfile.targetCompletionMonths || "Not specified"} months
` : "";

        const roadmapContext = userRoadmap ? `
CURRENT PROGRESS:
- Overall Progress: ${userRoadmap.overallProgress}%
- Current Milestone: ${userRoadmap.currentMilestone}
- Competencies: ${(userRoadmap.competencies || []).map((c: any) => `${c.name}: ${c.score}%`).join(", ")}
- Skill Gaps: ${(userRoadmap.skillGaps || []).map((g: any) => `${g.skill} (${g.currentLevel}% → ${g.targetLevel}%)`).join(", ")}
` : "";

        const recsContext = userRecommendations ? `
TOP RECOMMENDATIONS (with reasoning):
Courses: ${userRecommendations.courses.slice(0, 3).map((c: any) => `"${c.title}" - ${c.reasoning}`).join("; ")}
Projects: ${userRecommendations.projects.slice(0, 2).map((p: any) => `"${p.title}" - ${p.reasoning}`).join("; ")}
` : "";

        const systemInstruction = `You are PathAI, an elite AI career mentor with deep knowledge of this specific learner's profile, progress, and personalized recommendations.

${profileContext}
${roadmapContext}
${recsContext}

YOUR CAPABILITIES:
1. **Explain Recommendations**: When asked "why was X recommended?", reference the specific reasoning from their profile match.
2. **Progress Guidance**: Provide specific next steps based on their current milestone and skill gaps.
3. **Skill Explanations**: Break down technical concepts at their experience level.
4. **Career Strategy**: Advise on portfolio building, interview prep, and timeline optimization.

Keep responses concise (150-300 words), encouraging, and actionable with bullet points. Always reference specific data from their profile when relevant.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Learner asks: "${message}". Current stage: ${context?.currentMilestone || userRoadmap?.currentMilestone || "Deep Learning"}.`,
          config: {
            systemInstruction
          }
        });

        if (response.text) {
          return res.json({
            reply: response.text,
            suggestedActions: [
              { label: "View Recommendations", actionType: "navigate", payload: "/recommendations" },
              { label: "Take Skill Assessment", actionType: "start-quiz", payload: "vector-search" }
            ]
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini API call skipped or errored, falling back to deterministic response:", geminiErr);
      }
    }

    // Enhanced contextual fallback with profile awareness
    const lower = message.toLowerCase();
    const goalText = userProfile?.targetGoal || context?.targetGoal || "AI/ML Engineer";
    const competencies = userRoadmap?.competencies || [];
    const gaps = userRoadmap?.skillGaps || [];
    
    let reply = "";
    let suggestions = [
      { label: "View Recommendations", actionType: "navigate", payload: "/recommendations" },
      { label: "Assess Skill Gaps", actionType: "start-quiz", payload: "rag-systems" }
    ];

    if (lower.includes("why") && lower.includes("recommend")) {
      // Handle "why was X recommended?" queries
      const topCourse = userRecommendations?.courses?.[0];
      const topProject = userRecommendations?.projects?.[0];
      reply = `Great question! Here's why your top recommendations were selected:

**📚 ${topCourse?.title || "Deep Learning Specialization"}**
${topCourse?.reasoning || "Directly maps to your career goal and addresses key skill gaps."}

**🛠️ ${topProject?.title || "Enterprise RAG Document Q&A Engine"}**
${topProject?.reasoning || "Demonstrates the production skills that hiring managers prioritize."}

Your recommendations are personalized based on your **${goalText}** goal, current competencies, and skill gaps. Each one is scored against your profile for maximum relevance.`;
    } else if (lower.includes("rag") || lower.includes("vector") || lower.includes("embedding")) {
      reply = `**Strategic Sequence for RAG Mastery:**
1. **Embedding Models**: Understand cosine similarity, normalized dot products, and token limits.
2. **Chunking & Metadata**: Implement semantic chunking with recursive boundary splitting.
3. **Vector Databases**: Compare HNSW indexing vs Flat indices in Chroma/Pinecone.
4. **Hybrid Search**: Combine BM25 keyword search with dense semantic retrieval for high-accuracy recall.

👉 *Next Action:* Dive into the **Vector Database Optimization** lab to build your production retrieval pipeline.`;
    } else if (lower.includes("progress") || lower.includes("how am i doing") || lower.includes("status")) {
      const progress = userRoadmap?.overallProgress || 68;
      const compSummary = competencies.map((c: any) => `• **${c.name}**: ${c.score}%`).join("\n");
      reply = `📊 **Your Learning Progress Summary:**

**Overall Mastery**: ${progress}% complete on your **${goalText}** path

**Competency Breakdown:**
${compSummary || "• Python: 90%\n• Machine Learning: 78%\n• Generative AI: 62%\n• System Design: 41%"}

**Priority Gap**: ${gaps[0]?.skill || "System Design"} (${gaps[0]?.currentLevel || 41}% → ${gaps[0]?.targetLevel || 85}%)

You're making excellent progress! Focus your next sessions on closing the ${gaps[0]?.skill || "System Design"} gap.`;
    } else if (lower.includes("project") || lower.includes("portfolio")) {
      reply = `**Top 2 High-Impact Portfolio Projects for ${goalText}:**
1. **${userRecommendations?.projects?.[0]?.title || "Multi-Agent Research Assistant"}**: ${userRecommendations?.projects?.[0]?.reasoning || "Autonomous agents that demonstrate production AI engineering skills."}
2. **${userRecommendations?.projects?.[1]?.title || "Production RAG Engine with Evaluator"}**: ${userRecommendations?.projects?.[1]?.reasoning || "End-to-end Q&A pipeline benchmarked against industry metrics."}`;
    } else if (lower.includes("python") || lower.includes("start") || lower.includes("beginner")) {
      reply = `Based on your profile (${userProfile?.experienceLevel || "intermediate"} level), here's my recommendation:

${(userProfile?.experienceLevel || "intermediate") !== "beginner" ? 
`You already have strong Python foundations! Rather than repeating beginner syntax, focus on:
- **AsyncIO & Fast concurrency** for low-latency model calls
- **Type hints & Pydantic models** for robust AI schemas
- **Vectorized operations in NumPy** for custom tensor manipulation

You are ready to advance directly to **PyTorch Autograd & Transformer Architectures**.` :
`Start with the fundamentals:
- **Python data types & control flow** — build a solid foundation
- **Functions & modules** — organize code professionally
- **List comprehensions & generators** — write Pythonic code

Your recommended course: **Python for Data Science & Machine Learning** on Udemy.`}`;
    } else {
      const currentMilestone = userRoadmap?.currentMilestone || "Deep Learning Foundations";
      reply = `Based on your **${goalText}** profile and current progress:

• **Current Stage**: ${currentMilestone}
• **Strongest Skill**: ${competencies[0]?.name || "Python"} (${competencies[0]?.score || 90}%)
• **Critical Gap**: ${gaps[0]?.skill || "System Design"} (${gaps[0]?.currentLevel || 41}% → ${gaps[0]?.targetLevel || 85}%)

**Recommended Next Steps:**
1. Complete your current milestone: **${currentMilestone}**
2. Start the top-priority skill gap module
3. Build the **${userRecommendations?.projects?.[0]?.title || "Enterprise RAG Document Q&A Engine"}** project

Ask me about any specific topic, and I'll provide a detailed learning sequence!`;
    }

    return res.json({
      reply,
      suggestedActions: suggestions
    });
  } catch (error) {
    console.error("Mentor chat error:", error);
    return res.status(500).json({ error: "Failed to generate mentor response." });
  }
});

// ================= NLP-POWERED REGISTRATION & PROFILE ENDPOINTS =================

// Helper deterministic registration NLP extractor
function deterministicRegistrationExtractor(message: string, currentFields: any) {
  const text = message.trim();
  const extracted: any = {};
  const current = {
    name: currentFields?.name || '',
    email: currentFields?.email || '',
    password: currentFields?.password || '',
    confirmPassword: currentFields?.confirmPassword || currentFields?.password || ''
  };

  // 1. Email extraction (Regex)
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) {
    extracted.email = emailMatch[0].toLowerCase();
    current.email = extracted.email;
  }

  // 2. Name extraction
  const namePatterns = [
    /(?:my name is|i am|i'm|call me|name is|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
    /(?:name[:\s]+)([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
  ];
  for (const pat of namePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!['a', 'an', 'the', 'ready', 'here', 'rahul'].includes(candidate.toLowerCase()) || candidate.length > 2) {
        extracted.name = candidate;
        current.name = candidate;
        break;
      }
    }
  }

  // If no name pattern, but message looks like just a personal name (e.g. "Rahul", "Alex Rivera") and name wasn't provided yet
  if (!extracted.name && !current.name && !text.includes('@') && text.split(/\s+/).length <= 3 && /^[A-Za-z\s]+$/.test(text)) {
    if (!['hi', 'hello', 'hey', 'yes', 'no', 'sure', 'start', 'create', 'ok'].includes(text.toLowerCase())) {
      extracted.name = text.trim();
      current.name = text.trim();
    }
  }

  // 3. Password extraction
  const passwordPatterns = [
    /(?:password is|pass is|set password to|password:\s*|password should be)\s*([^\s,;]+)/i,
    /(?:use password\s+)([^\s,;]+)/i
  ];
  for (const pat of passwordPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      extracted.password = match[1].trim();
      extracted.confirmPassword = match[1].trim();
      current.password = extracted.password;
      current.confirmPassword = extracted.password;
      break;
    }
  }

  // Determine missing fields
  const missingFields: string[] = [];
  if (!current.name) missingFields.push('name');
  if (!current.email) missingFields.push('email');
  if (!current.password || current.password.length < 6) missingFields.push('password');

  const isComplete = missingFields.length === 0;

  // Formulate friendly bot response
  let botReply = '';
  let suggestedReplies: string[] = [];

  if (isComplete) {
    botReply = `Awesome! I have all your required registration details:\n• **Name:** ${current.name}\n• **Email:** ${current.email}\n• **Password:** ••••••••\n\nYou're ready to create your account! Click the button below to finish registration.`;
    suggestedReplies = ['Create My Account', 'Change my email', 'Change my name'];
  } else if (extracted.name && extracted.email && missingFields.includes('password')) {
    botReply = `Great to meet you, ${current.name}! I've saved your email as **${current.email}**. Now, please set a password (at least 6 characters) to protect your account.`;
    suggestedReplies = ['Password123!', 'Create secure password', 'Why do you need a password?'];
  } else if (extracted.name && !current.email) {
    botReply = `Nice to meet you, ${current.name}! What email address should we use for your PathAI account?`;
    suggestedReplies = [`${current.name.toLowerCase().replace(/\s+/g, '')}@example.com`, 'Why is email required?'];
  } else if (extracted.email && !current.name) {
    botReply = `Got your email: **${current.email}**! What is your full name?`;
    suggestedReplies = ['Alex Rivera', 'Jordan Lee', 'Rahul Sharma'];
  } else if (missingFields.includes('name') && missingFields.includes('email')) {
    botReply = `Hi! Let's get your account set up. You can tell me your name and email in one sentence (for example: *"My name is Rahul and my email is rahul@example.com"*).`;
    suggestedReplies = ['My name is Jordan, email jordan@example.com', 'Alex Rivera (alex@pathai.dev)', 'How does this work?'];
  } else if (missingFields.includes('password')) {
    botReply = `Almost there! Please specify a password with at least 6 characters.`;
    suggestedReplies = ['Set password to SecurePass99!', 'Generate password'];
  } else {
    botReply = `I've updated your info! Name: ${current.name || 'Not set'}, Email: ${current.email || 'Not set'}. What else would you like to update?`;
    suggestedReplies = ['Looks good!', 'Change email', 'Change name'];
  }

  return {
    extracted,
    mergedFields: current,
    missingFields,
    isComplete,
    clarificationNeeded: false,
    botReply,
    suggestedReplies
  };
}

// POST /api/nlp/parse-registration
app.post("/api/nlp/parse-registration", async (req: Request, res: Response) => {
  try {
    const { message, currentFields, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const prompt = `You are the PathAI Conversational Registration Assistant.
Your task is to analyze the user's natural language message, extract registration fields (name, email, password), handle corrections, and produce a conversational response.

Current stored state:
- Name: "${currentFields?.name || ''}"
- Email: "${currentFields?.email || ''}"
- Password configured: ${Boolean(currentFields?.password && currentFields?.password.length >= 6)}

User message: "${message}"

Conversation History:
${(history || []).slice(-4).map((h: any) => `${h.role}: ${h.content}`).join('\n')}

Instructions:
1. Extract any new or corrected 'name', 'email', 'password' mentioned in the user message.
2. If user mentions "change my email to X" or "actually my name is Y", treat it as a correction.
3. Determine which of the 3 required fields (name, email, password) are still missing.
4. If password is provided, set confirmPassword to the same value.
5. Create a polite, concise, encouraging bot reply (max 2-3 sentences) acknowledging what was captured and asking ONLY for what is still needed.
6. Provide 2-3 relevant quick suggested replies for the user.

Return JSON in this EXACT schema:
{
  "extracted": {
    "name": string or null,
    "email": string or null,
    "password": string or null,
    "confirmPassword": string or null
  },
  "mergedFields": {
    "name": string,
    "email": string,
    "password": string,
    "confirmPassword": string
  },
  "missingFields": string[],
  "isComplete": boolean,
  "clarificationNeeded": boolean,
  "botReply": string,
  "suggestedReplies": string[]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          // Safety merge with current fields if null
          parsed.mergedFields = {
            name: parsed.extracted?.name || parsed.mergedFields?.name || currentFields?.name || '',
            email: parsed.extracted?.email || parsed.mergedFields?.email || currentFields?.email || '',
            password: parsed.extracted?.password || parsed.mergedFields?.password || currentFields?.password || '',
            confirmPassword: parsed.extracted?.confirmPassword || parsed.extracted?.password || parsed.mergedFields?.confirmPassword || currentFields?.confirmPassword || currentFields?.password || ''
          };
          const missing: string[] = [];
          if (!parsed.mergedFields.name) missing.push('name');
          if (!parsed.mergedFields.email) missing.push('email');
          if (!parsed.mergedFields.password || parsed.mergedFields.password.length < 6) missing.push('password');
          parsed.missingFields = missing;
          parsed.isComplete = missing.length === 0;

          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Gemini registration parsing failed, using deterministic NLP engine:", geminiErr);
      }
    }

    // Fallback deterministic NLP engine
    const result = deterministicRegistrationExtractor(message, currentFields);
    return res.json(result);
  } catch (error) {
    console.error("NLP Registration endpoint error:", error);
    const fallback = deterministicRegistrationExtractor(req.body?.message || '', req.body?.currentFields || {});
    return res.json(fallback);
  }
});

// POST /api/nlp/parse-profile (AI-Powered 14-Category Profile Information Gathering)
app.post("/api/nlp/parse-profile", async (req: Request, res: Response) => {
  try {
    const { message, currentProfile, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is required." });
    }

    // Category definitions for tracking
    const categoryNames = [
      'education', 'professionalProfiles', 'industryExperience', 'technicalStack',
      'projects', 'completedLearning', 'technicalInterests', 'careerGoal',
      'targetTimeline', 'salaryGoal', 'weeklyHours', 'learningFormat',
      'resourceBudget', 'immediateMotivation'
    ];

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const prompt = `You are the PathAI 14-Category Career Profile Diagnostic Bot.
You are having a conversational onboarding chat with a learner to gather ALL 14 profile categories for tailoring their personalized learning roadmap. Extract information naturally — don't interrogate. When the learner shares info, acknowledge it warmly and ask about 1-2 missing categories.

The 14 categories to collect:
1. Education (educationDegree, educationMajor, graduationYear) - Degree, Major, Graduation Year
2. Professional Profiles (githubUrl, linkedinUrl) - GitHub & LinkedIn URLs (validate URL format)
3. Industry Experience (industryExperienceType, yearsExperience) - fresher/internship/professional + years
4. Technical Stack & Skills (knownSkills) - Known technologies, languages, frameworks
5. Projects & Portfolio (currentProjects) - Current ongoing projects & past builds
6. Completed Learning (completedLearning) - Courses, bootcamps, certifications completed
7. Technical Interests (technicalInterests) - Web Dev, Mobile, AI/ML, Data Science, Cloud/DevOps, Cybersecurity, Backend, etc.
8. Career Goal & Specialization (targetGoal, jobSpecialization) - Target role & specialization
9. Target Timeline (targetCompletionMonths) - 3, 6, 12 months or custom
10. Salary / Placement Goal (salaryPlacementGoal) - Target company tier / salary benchmark
11. Weekly Time Commitment (weeklyHours) - 5, 10, 15, 20 hrs/week
12. Preferred Learning Format (learningPreferences) - Video, documentation, project-first, interactive coding
13. Resource Budget (resourceBudget) - Free only, mixture, paid acceptable
14. Immediate Motivation (immediateMotivation) - Campus placement, hackathon, certification, job search, career switch

Current Stored Profile:
${JSON.stringify(currentProfile || {}, null, 2)}

User Message: "${message}"

Conversation History:
${(history || []).slice(-6).map((h: any) => `${h.role}: ${h.content}`).join('\n')}

Instructions:
1. Extract any mentioned profile attributes from the user's message across all 14 categories.
2. Merge with existing stored profile (don't lose previously collected data).
3. For GitHub/LinkedIn URLs, validate they look like proper URLs. Accept partial URLs like "github.com/username".
4. Determine which categories are now complete vs still missing.
5. Formulate a friendly, encouraging conversational reply (max 3 sentences) acknowledging what was captured and asking about 1-2 remaining categories naturally.
6. Provide 3 relevant quick reply suggestions for the user.
7. Set isComplete to true only when at least 8 of 14 categories have meaningful data.

Return JSON in this EXACT schema:
{
  "extractedProfile": {
    "educationDegree": string or null,
    "educationMajor": string or null,
    "graduationYear": string or null,
    "githubUrl": string or null,
    "linkedinUrl": string or null,
    "industryExperienceType": "fresher" | "internship" | "professional" | null,
    "yearsExperience": string or null,
    "knownSkills": string[] or null,
    "currentProjects": string or null,
    "completedLearning": string or null,
    "technicalInterests": string[] or null,
    "targetGoal": string or null,
    "jobSpecialization": string or null,
    "targetCompletionMonths": string or null,
    "salaryPlacementGoal": string or null,
    "weeklyHours": number or null,
    "learningPreferences": string[] or null,
    "resourceBudget": string or null,
    "immediateMotivation": string or null,
    "experienceLevel": "beginner" | "intermediate" | "advanced" | null
  },
  "mergedProfile": { ... same fields with merged values ... },
  "completedCategories": string[],
  "missingCategories": string[],
  "botReply": string,
  "suggestedReplies": string[],
  "isComplete": boolean
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          // Ensure completedCategories exists
          if (!parsed.completedCategories) {
            parsed.completedCategories = computeCompletedCategories(parsed.mergedProfile || parsed.extractedProfile || currentProfile);
          }
          if (!parsed.missingCategories) {
            parsed.missingCategories = categoryNames.filter(c => !parsed.completedCategories.includes(c));
          }
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn("Gemini profile parsing failed, using rule-based fallback:", geminiErr);
      }
    }

    // Fallback deterministic 14-category profile extractor
    const text = message.toLowerCase();
    const current: any = {
      educationDegree: currentProfile?.educationDegree || currentProfile?.education || '',
      educationMajor: currentProfile?.educationMajor || '',
      graduationYear: currentProfile?.graduationYear || '',
      githubUrl: currentProfile?.githubUrl || '',
      linkedinUrl: currentProfile?.linkedinUrl || '',
      industryExperienceType: currentProfile?.industryExperienceType || '',
      yearsExperience: currentProfile?.yearsExperience || '',
      knownSkills: Array.isArray(currentProfile?.knownSkills) ? [...currentProfile.knownSkills] : [],
      currentProjects: currentProfile?.currentProjects || '',
      completedLearning: currentProfile?.completedLearning || '',
      technicalInterests: Array.isArray(currentProfile?.technicalInterests) ? [...currentProfile.technicalInterests] : [],
      targetGoal: currentProfile?.targetGoal || '',
      jobSpecialization: currentProfile?.jobSpecialization || '',
      targetCompletionMonths: currentProfile?.targetCompletionMonths || '',
      salaryPlacementGoal: currentProfile?.salaryPlacementGoal || '',
      weeklyHours: currentProfile?.weeklyHours || 0,
      learningPreferences: Array.isArray(currentProfile?.learningPreferences) ? [...currentProfile.learningPreferences] : [],
      resourceBudget: currentProfile?.resourceBudget || '',
      immediateMotivation: currentProfile?.immediateMotivation || '',
      experienceLevel: currentProfile?.experienceLevel || 'intermediate',
    };

    // 1. Education
    if (text.includes("degree") || text.includes("computer science") || text.includes("bachelor") || text.includes("master") || text.includes("bootcamp") || text.includes("self-taught") || text.includes("college") || text.includes("university") || text.includes("b.tech") || text.includes("b.s.") || text.includes("b.e.") || text.includes("mca") || text.includes("bca")) {
      current.educationDegree = message;
      current.education = message;
    }
    const majorPatterns = ['computer science', 'information technology', 'data science', 'electrical', 'mechanical', 'mathematics', 'physics', 'statistics'];
    for (const m of majorPatterns) {
      if (text.includes(m)) { current.educationMajor = m.charAt(0).toUpperCase() + m.slice(1); break; }
    }
    const yearMatch = message.match(/(?:graduat|class of|batch|year)[^\d]*(\d{4})/i) || message.match(/\b(20[1-3]\d)\b/);
    if (yearMatch) current.graduationYear = yearMatch[1];

    // 2. Professional Profiles
    const githubMatch = message.match(/(?:github\.com\/|github[:\s]+)([a-zA-Z0-9_-]+)/i);
    if (githubMatch) current.githubUrl = `https://github.com/${githubMatch[1]}`;
    const githubUrlMatch = message.match(/(https?:\/\/github\.com\/[a-zA-Z0-9_-]+)/i);
    if (githubUrlMatch) current.githubUrl = githubUrlMatch[1];

    const linkedinMatch = message.match(/(?:linkedin\.com\/in\/|linkedin[:\s]+)([a-zA-Z0-9_-]+)/i);
    if (linkedinMatch) current.linkedinUrl = `https://linkedin.com/in/${linkedinMatch[1]}`;
    const linkedinUrlMatch = message.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
    if (linkedinUrlMatch) current.linkedinUrl = linkedinUrlMatch[1];

    // 3. Industry Experience
    if (text.includes("fresher") || text.includes("fresh graduate") || text.includes("no experience")) {
      current.industryExperienceType = 'fresher';
    } else if (text.includes("internship") || text.includes("intern")) {
      current.industryExperienceType = 'internship';
    } else if (text.includes("working") || text.includes("professional") || text.includes("employed") || text.includes("job")) {
      current.industryExperienceType = 'professional';
    }
    const yearsMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp|work)/i);
    if (yearsMatch) current.yearsExperience = yearsMatch[1];

    // 4. Technical Stack & Skills
    const commonSkills = ['Python', 'SQL', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'PyTorch', 'TensorFlow', 'FastAPI', 'Docker', 'AWS', 'Git', 'Machine Learning', 'Deep Learning', 'Generative AI', 'LangChain', 'C++', 'Java', 'Go', 'Rust', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis', 'Next.js', 'Vue', 'Angular', 'Flask', 'Django', 'Spring Boot', 'GraphQL', 'REST API', 'HTML', 'CSS', 'Tailwind', 'Figma', 'Swift', 'Kotlin', 'Flutter', 'React Native'];
    for (const skill of commonSkills) {
      if (text.includes(skill.toLowerCase()) && !current.knownSkills.includes(skill)) {
        current.knownSkills.push(skill);
      }
    }

    // 5. Projects
    if (text.includes("project") || text.includes("built") || text.includes("building") || text.includes("portfolio") || text.includes("app") || text.includes("website")) {
      current.currentProjects = message;
    }

    // 6. Completed Learning
    if (text.includes("course") || text.includes("certificate") || text.includes("certification") || text.includes("bootcamp") || text.includes("udemy") || text.includes("coursera") || text.includes("stanford") || text.includes("mit") || text.includes("completed")) {
      current.completedLearning = message;
    }

    // 7. Technical Interests
    const interestMap: Record<string, string> = {
      'web dev': 'Web Development', 'web development': 'Web Development', 'frontend': 'Frontend Development', 'backend': 'Backend Development',
      'mobile': 'Mobile Development', 'ios': 'iOS Development', 'android': 'Android Development',
      'ai': 'AI/ML', 'machine learning': 'AI/ML', 'ml': 'AI/ML', 'artificial intelligence': 'AI/ML',
      'data science': 'Data Science', 'data analysis': 'Data Science', 'analytics': 'Data Science',
      'cloud': 'Cloud/DevOps', 'devops': 'Cloud/DevOps', 'aws': 'Cloud/DevOps', 'azure': 'Cloud/DevOps',
      'cybersecurity': 'Cybersecurity', 'security': 'Cybersecurity',
      'blockchain': 'Blockchain', 'game dev': 'Game Development', 'generative ai': 'Generative AI',
      'nlp': 'NLP', 'computer vision': 'Computer Vision', 'deep learning': 'Deep Learning',
    };
    for (const [keyword, interest] of Object.entries(interestMap)) {
      if (text.includes(keyword) && !current.technicalInterests.includes(interest)) {
        current.technicalInterests.push(interest);
      }
    }

    // 8. Career Goal
    const goalPatterns = [
      /(?:want to become|goal is|aiming for|target role|aspiring)\s+(?:a |an )?(.+?)(?:\.|,|$)/i,
      /(?:become|be) (?:a |an )?(.+?)(?:\s+engineer|\s+developer|\s+scientist|\s+analyst)?(?:\.|,|$)/i,
    ];
    for (const pat of goalPatterns) {
      const match = message.match(pat);
      if (match && match[1] && match[1].length > 3) {
        current.targetGoal = match[1].trim();
        break;
      }
    }
    if (text.includes("full stack")) current.targetGoal = current.targetGoal || "Full Stack Developer";
    if (text.includes("ai") && text.includes("engineer")) current.targetGoal = current.targetGoal || "AI/ML Engineer";
    if (text.includes("data scientist")) current.targetGoal = current.targetGoal || "Data Scientist";

    // 9. Target Timeline
    const timelineMatch = text.match(/(\d+)\s*months?/);
    if (timelineMatch) current.targetCompletionMonths = timelineMatch[1];
    if (text.includes("3 month")) current.targetCompletionMonths = '3';
    if (text.includes("6 month")) current.targetCompletionMonths = '6';
    if (text.includes("12 month") || text.includes("1 year")) current.targetCompletionMonths = '12';

    // 10. Salary / Placement Goal
    if (text.includes("tier-1") || text.includes("tier 1") || text.includes("faang") || text.includes("maang") || text.includes("google") || text.includes("microsoft") || text.includes("amazon")) {
      current.salaryPlacementGoal = message;
    }
    const salaryMatch = text.match(/(\d+)\s*(?:lpa|lakhs?|k|lakh)/i);
    if (salaryMatch) current.salaryPlacementGoal = current.salaryPlacementGoal || message;

    // 11. Weekly Hours
    const hoursMatch = text.match(/(\d+)\s*(?:hours?|hrs?)\s*(?:per week|\/week|weekly|a week)?/i);
    if (hoursMatch) current.weeklyHours = parseInt(hoursMatch[1], 10);

    // 12. Learning Format
    const formatMap: Record<string, string> = {
      'video': 'Video Walkthroughs', 'videos': 'Video Walkthroughs', 'youtube': 'Video Walkthroughs',
      'documentation': 'Documentation', 'docs': 'Documentation', 'reading': 'Documentation',
      'project': 'Project-First', 'hands-on': 'Project-First', 'build': 'Project-First',
      'interactive': 'Interactive Coding', 'coding': 'Interactive Coding', 'practice': 'Interactive Coding',
    };
    for (const [keyword, format] of Object.entries(formatMap)) {
      if (text.includes(keyword) && !current.learningPreferences.includes(format)) {
        current.learningPreferences.push(format);
      }
    }

    // 13. Resource Budget
    if (text.includes("free only") || text.includes("no budget") || text.includes("free resources")) {
      current.resourceBudget = 'Free only';
    } else if (text.includes("paid") || text.includes("willing to pay") || text.includes("budget")) {
      current.resourceBudget = 'Paid acceptable';
    } else if (text.includes("mix") || text.includes("both")) {
      current.resourceBudget = 'Mixture';
    }

    // 14. Immediate Motivation
    const motivationMap: Record<string, string> = {
      'placement': 'Campus Placement', 'campus': 'Campus Placement',
      'hackathon': 'Hackathon', 'competition': 'Hackathon',
      'certification': 'Certification', 'certified': 'Certification',
      'job search': 'Job Search', 'new job': 'Job Search', 'interview': 'Job Search', 'looking for': 'Job Search',
      'career switch': 'Career Switch', 'career change': 'Career Switch', 'transition': 'Career Switch',
      'upskill': 'Upskilling', 'promotion': 'Upskilling',
      'freelance': 'Freelancing', 'freelancing': 'Freelancing',
      'startup': 'Startup', 'entrepreneurship': 'Startup',
    };
    for (const [keyword, motivation] of Object.entries(motivationMap)) {
      if (text.includes(keyword)) { current.immediateMotivation = motivation; break; }
    }

    // Experience level
    if (text.includes("beginner") || text.includes("starting out") || text.includes("new to")) {
      current.experienceLevel = 'beginner';
    } else if (text.includes("advanced") || text.includes("senior") || text.includes("lead") || text.includes("expert")) {
      current.experienceLevel = 'advanced';
    } else if (text.includes("intermediate") || text.includes("moderate") || text.includes("some experience")) {
      current.experienceLevel = 'intermediate';
    }

    const completedCategories = computeCompletedCategories(current);
    const missingCategories = categoryNames.filter(c => !completedCategories.includes(c));

    // Generate contextual reply based on what's missing
    let botReply = '';
    const completedCount = completedCategories.length;

    if (completedCount >= 10) {
      botReply = `Excellent! Your profile is looking comprehensive with ${completedCount}/14 categories filled. You're ready to generate your personalized roadmap! Click below or share any remaining details.`;
    } else if (completedCount >= 6) {
      const nextAsk = missingCategories.slice(0, 2).map(c => {
        const labels: Record<string, string> = {
          education: 'educational background', professionalProfiles: 'GitHub or LinkedIn profile',
          industryExperience: 'work experience level', technicalStack: 'technical skills',
          projects: 'projects you\'ve built', completedLearning: 'courses or certifications',
          technicalInterests: 'technical interests', careerGoal: 'career goal',
          targetTimeline: 'target timeline', salaryGoal: 'salary/placement goal',
          weeklyHours: 'weekly study hours', learningFormat: 'preferred learning format',
          resourceBudget: 'resource budget', immediateMotivation: 'immediate motivation'
        };
        return labels[c] || c;
      }).join(' and ');
      botReply = `Great progress! I've captured ${completedCount} of 14 categories so far. Could you also tell me about your ${nextAsk}?`;
    } else {
      botReply = `Thanks for sharing! I've noted your details (${completedCount}/14 categories captured). Tell me more about your background, skills, career goals, and learning preferences so I can build the perfect roadmap.`;
    }

    const suggestedReplies = completedCount >= 10
      ? ['Generate My Roadmap Now 🚀', 'Add more details', 'Review my profile']
      : completedCount >= 6
      ? ['Generate My Roadmap Now 🚀', `I know ${current.knownSkills.length > 0 ? current.knownSkills.slice(0,3).join(', ') : 'Python, JavaScript'}`, 'I want to focus on AI/ML']
      : ['I have a B.Tech in CS, targeting AI/ML roles', 'I know Python, React, and SQL', 'I\'m a fresher looking for placements'];

    return res.json({
      extractedProfile: current,
      mergedProfile: current,
      completedCategories,
      missingCategories,
      botReply,
      suggestedReplies,
      isComplete: completedCount >= 8
    });
  } catch (error) {
    console.error("Profile chat error:", error);
    return res.status(500).json({ error: "Failed to parse profile message." });
  }
});

function computeCompletedCategories(profile: any): string[] {
  const completed: string[] = [];
  if (profile?.educationDegree || profile?.education) completed.push('education');
  if (profile?.githubUrl || profile?.linkedinUrl) completed.push('professionalProfiles');
  if (profile?.industryExperienceType) completed.push('industryExperience');
  if (Array.isArray(profile?.knownSkills) && profile.knownSkills.length > 0) completed.push('technicalStack');
  if (profile?.currentProjects) completed.push('projects');
  if (profile?.completedLearning) completed.push('completedLearning');
  if (Array.isArray(profile?.technicalInterests) && profile.technicalInterests.length > 0) completed.push('technicalInterests');
  if (profile?.targetGoal) completed.push('careerGoal');
  if (profile?.targetCompletionMonths) completed.push('targetTimeline');
  if (profile?.salaryPlacementGoal) completed.push('salaryGoal');
  if (profile?.weeklyHours && profile.weeklyHours > 0) completed.push('weeklyHours');
  if (Array.isArray(profile?.learningPreferences) && profile.learningPreferences.length > 0) completed.push('learningFormat');
  if (profile?.resourceBudget) completed.push('resourceBudget');
  if (profile?.immediateMotivation) completed.push('immediateMotivation');
  return completed;
}



// Serve frontend in production or integrate Vite middleware in dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PathAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
