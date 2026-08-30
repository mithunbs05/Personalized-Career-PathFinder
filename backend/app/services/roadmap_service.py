"""
Roadmap Service — Core Curriculum Architecture, Dynamic Dependency Engine, and Stage Progress.

Source of truth for:
1. Canonical AI Engineer Roadmap (10 Stages, Syllabus, Topics, Resources, and Prerequisites).
2. Dynamic Dependency and Blocker Resolution Engine.
3. Learner Stage Progress Tracking in Supabase (`learner_stage_progress`).
4. Cross-System Context for AI Mentor and Skill Matrix.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.supabase_client import get_supabase_client
from app.models.roadmap import (
    RoadmapStageSummary,
    RoadmapStageDetail,
    RoadmapTopicItem,
    LearningResourceItem,
    PrerequisiteCheckItem,
    RoadmapOverviewResponse,
    StageStartResponse,
    StageCompleteResponse,
)
from app.services.mentor_service import (
    get_user_topic_progress_from_db,
    get_user_profile_from_db,
    _ensure_valid_uuid,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Canonical 10-Stage AI/ML Engineer Curriculum Definition
# ---------------------------------------------------------------------------

CANONICAL_ROADMAP_STAGES: list[dict[str, Any]] = [
    {
        "id": 1,
        "title": "Programming Foundations",
        "difficulty": "Beginner",
        "estimated_duration": "2 Weeks",
        "why_learn": "Understanding core programming logic, variables, and control structures is essential before diving into AI-specific languages.",
        "career_relevance": "Builds algorithmic thinking and syntax fluency needed for all software and model engineering.",
        "prerequisites": [],
        "skills": ["Data Types", "Loops", "Functions", "Python OOP"],
        "learnings": [
            "Understand variables, data structures, and memory references",
            "Master control flow, loops, and conditional branching",
            "Write modular, testable functions and object-oriented abstractions",
        ],
        "topics": [
            {
                "id": "t1-1",
                "title": "Variables, Types & Memory Structures",
                "skill_id": "s1",
                "skill_name": "Python OOP",
                "estimated_time": "3 hours",
                "key_concepts": ["Dynamic typing", "Mutability vs Immutability", "Primitive types"],
            },
            {
                "id": "t1-2",
                "title": "Control Flow & Loop Constructs",
                "skill_id": "s1",
                "skill_name": "Python OOP",
                "estimated_time": "4 hours",
                "key_concepts": ["Conditionals", "While/For loops", "List comprehensions"],
            },
            {
                "id": "t1-3",
                "title": "Functions, Scope & Error Handling",
                "skill_id": "s1",
                "skill_name": "Python OOP",
                "estimated_time": "5 hours",
                "key_concepts": ["First-class functions", "Decorators", "Exceptions and Context managers"],
            },
        ],
        "resources": [
            {
                "id": "r1-1",
                "title": "CS50 Introduction to Computer Science",
                "type": "COURSE",
                "provider": "Harvard / edX",
                "duration": "12 hours",
                "url": "https://cs50.harvard.edu/",
            },
            {
                "id": "r1-2",
                "title": "Python Control Flow & Functions Documentation",
                "type": "DOCUMENTATION",
                "provider": "Python.org",
                "duration": "2 hours",
                "url": "https://docs.python.org/3/tutorial/controlflow.html",
            },
            {
                "id": "r1-3",
                "title": "Foundational Python Logic Exercises",
                "type": "PRACTICE",
                "provider": "LeetCode",
                "duration": "3 hours",
                "url": "https://leetcode.com/problemset/all/",
            },
        ],
        "project": "Build a CLI Task Manager and Expense Analyzer with JSON persistence",
    },
    {
        "id": 2,
        "title": "Python for AI",
        "difficulty": "Beginner",
        "estimated_duration": "3 Weeks",
        "why_learn": "Python is the primary language of AI. You must master its data processing libraries: NumPy vectorization and Pandas manipulation.",
        "career_relevance": "95%+ of modern AI/ML pipelines, research implementations, and data loaders are built in Python.",
        "prerequisites": ["Programming Foundations"],
        "skills": ["Lists", "NumPy & Pandas", "Data Cleaning", "Vectorization"],
        "learnings": [
            "Perform fast vectorized array math with NumPy broadcasting",
            "Manipulate tabular datasets, handle missing values, and aggregate with Pandas",
            "Generate exploratory visualizations using Matplotlib and Seaborn",
        ],
        "topics": [
            {
                "id": "t2-1",
                "title": "NumPy Array Creation & Vectorized Operations",
                "skill_id": "s2",
                "skill_name": "NumPy & Pandas",
                "estimated_time": "4 hours",
                "key_concepts": ["Ndarray memory layout", "Broadcasting rules", "Matrix multiplication"],
            },
            {
                "id": "t2-2",
                "title": "Pandas DataFrames & Time Series Wrangling",
                "skill_id": "s2",
                "skill_name": "NumPy & Pandas",
                "estimated_time": "5 hours",
                "key_concepts": ["Filtering", "GroupBy aggregations", "Pivot tables", "Missing data imputation"],
            },
            {
                "id": "t2-3",
                "title": "Exploratory Data Analysis (EDA) & Plotting",
                "skill_id": "s2",
                "skill_name": "NumPy & Pandas",
                "estimated_time": "4 hours",
                "key_concepts": ["Distributions", "Correlation heatmaps", "Outlier detection"],
            },
        ],
        "resources": [
            {
                "id": "r2-1",
                "title": "Python for Everybody Specialization",
                "type": "COURSE",
                "provider": "Coursera",
                "duration": "10 hours",
                "url": "https://www.coursera.org/specializations/python",
            },
            {
                "id": "r2-2",
                "title": "NumPy User Guide & Vectorization Handbook",
                "type": "DOCUMENTATION",
                "provider": "NumPy.org",
                "duration": "3 hours",
                "url": "https://numpy.org/doc/stable/user/",
            },
            {
                "id": "r2-3",
                "title": "Data Wrangling & Feature Prep Exercises",
                "type": "PRACTICE",
                "provider": "Kaggle",
                "duration": "4 hours",
                "url": "https://www.kaggle.com/learn/pandas",
            },
        ],
        "project": "End-to-End Exploratory Data Analysis & Feature Engineering Pipeline on Real Housing Data",
    },
    {
        "id": 3,
        "title": "Mathematics & Statistics",
        "difficulty": "Intermediate",
        "estimated_duration": "4 Weeks",
        "why_learn": "Linear algebra, calculus, and probability form the theoretical foundation for how ML models optimize loss and make inferences.",
        "career_relevance": "Essential for understanding loss landscapes, backpropagation, attention mechanisms, and model diagnostics.",
        "prerequisites": ["Python for AI"],
        "skills": ["Linear Algebra", "Calculus", "Probability", "Optimization"],
        "learnings": [
            "Grasp matrix transformations, eigenvalues, eigenvectors, and dot products",
            "Understand partial derivatives, gradients, Hessians, and chain rule",
            "Apply Bayes theorem, probability distributions, and maximum likelihood estimation",
            "Analyze convex functions and gradient descent convergence behavior",
        ],
        "topics": [
            {
                "id": "t3-1",
                "title": "Linear Algebra: Matrices & Vector Spaces",
                "skill_id": "s4",
                "skill_name": "Linear Algebra",
                "estimated_time": "6 hours",
                "key_concepts": ["Dot products", "Matrix transformations", "Rank", "Eigenvalues & Eigenvectors"],
            },
            {
                "id": "t3-2",
                "title": "Multivariate Calculus & Gradients",
                "skill_id": "s5",
                "skill_name": "Calculus",
                "estimated_time": "5 hours",
                "key_concepts": ["Partial derivatives", "Gradient vectors", "Jacobian & Hessian matrices"],
            },
            {
                "id": "t3-3",
                "title": "Probability Distributions & Bayes Theorem",
                "skill_id": "s6",
                "skill_name": "Probability",
                "estimated_time": "5 hours",
                "key_concepts": ["Gaussian distributions", "Expectation & Variance", "Bayesian inference"],
            },
            {
                "id": "t3-4",
                "title": "Convex Optimization & Gradient Descent",
                "skill_id": "s7",
                "skill_name": "Optimization",
                "estimated_time": "6 hours",
                "key_concepts": ["Convexity", "Gradient descent", "Learning rate scheduling", "Stochastic GD"],
            },
        ],
        "resources": [
            {
                "id": "r3-1",
                "title": "Mathematics for Machine Learning",
                "type": "COURSE",
                "provider": "Imperial College / Coursera",
                "duration": "15 hours",
                "url": "https://www.coursera.org/specializations/mathematics-machine-learning",
            },
            {
                "id": "r3-2",
                "title": "Essence of Linear Algebra",
                "type": "VIDEO",
                "provider": "3Blue1Brown",
                "duration": "4 hours",
                "url": "https://www.3blue1brown.com/topics/linear-algebra",
            },
            {
                "id": "r3-3",
                "title": "Calculus & Optimization Interactive Lab",
                "type": "PRACTICE",
                "provider": "Khan Academy",
                "duration": "5 hours",
                "url": "https://www.khanacademy.org/math/multivariable-calculus",
            },
        ],
        "project": "Implement Gradient Descent & PCA from scratch using pure NumPy",
    },
    {
        "id": 4,
        "title": "Machine Learning",
        "difficulty": "Intermediate",
        "estimated_duration": "4 Weeks",
        "why_learn": "Master classic supervised and unsupervised algorithms, hyperparameter tuning, and cross-validation pipelines.",
        "career_relevance": "Standard baseline algorithms (GBDTs, Random Forests) dominate tabular data problems across enterprise systems.",
        "prerequisites": ["Mathematics & Statistics"],
        "skills": ["Regression Models", "Random Forests", "XGBoost", "Evaluation Metrics"],
        "learnings": [
            "Build linear, ridge, and logistic regression models with regularization",
            "Train decision trees, random forests, and gradient-boosted trees (XGBoost/LightGBM)",
            "Evaluate models using Precision, Recall, F1-score, ROC-AUC, and Confusion Matrices",
            "Construct leak-free Scikit-Learn preprocessing and modeling pipelines",
        ],
        "topics": [
            {
                "id": "t4-1",
                "title": "Supervised Learning: Regression & Regularization",
                "skill_id": "s8",
                "skill_name": "Regression Models",
                "estimated_time": "5 hours",
                "key_concepts": ["OLS", "L1 Lasso", "L2 Ridge", "ElasticNet"],
            },
            {
                "id": "t4-2",
                "title": "Tree-based Ensembles & Boosting",
                "skill_id": "s9",
                "skill_name": "Random Forests",
                "estimated_time": "6 hours",
                "key_concepts": ["Information gain", "Bagging", "Boosting", "Feature importances"],
            },
            {
                "id": "t4-3",
                "title": "Model Validation & Performance Metrics",
                "skill_id": "s11",
                "skill_name": "Evaluation Metrics",
                "estimated_time": "4 hours",
                "key_concepts": ["K-Fold CV", "Precision-Recall tradeoffs", "ROC-AUC", "Log Loss"],
            },
        ],
        "resources": [
            {
                "id": "r4-1",
                "title": "Machine Learning Specialization",
                "type": "COURSE",
                "provider": "DeepLearning.AI / Andrew Ng",
                "duration": "20 hours",
                "url": "https://www.deeplearning.ai/courses/machine-learning-specialization/",
            },
            {
                "id": "r4-2",
                "title": "Scikit-Learn User Guide & API Documentation",
                "type": "DOCUMENTATION",
                "provider": "Scikit-Learn.org",
                "duration": "5 hours",
                "url": "https://scikit-learn.org/stable/user_guide.html",
            },
            {
                "id": "r4-3",
                "title": "Predictive Modeling Benchmarks & Exercises",
                "type": "PRACTICE",
                "provider": "Kaggle",
                "duration": "6 hours",
                "url": "https://www.kaggle.com/competitions",
            },
        ],
        "project": "End-to-end Customer Churn Prediction system with cross-validation and hyperparameter search",
    },
    {
        "id": 5,
        "title": "Deep Learning",
        "difficulty": "Advanced",
        "estimated_duration": "5 Weeks",
        "why_learn": "Deep learning powers modern computer vision, sequence modeling, and representation learning through neural architectures.",
        "career_relevance": "PyTorch tensor operations, custom training loops, and autograd are mandatory for modern AI engineering.",
        "prerequisites": ["Machine Learning"],
        "skills": ["PyTorch", "Neural Nets", "Tensors", "CNNs"],
        "learnings": [
            "Master PyTorch tensor broadcasting, autograd computation graph, and CUDA acceleration",
            "Implement multi-layer perceptrons with custom activations and dropout regularization",
            "Understand convolutional layers, feature extraction, and residual connections (ResNet)",
            "Debug vanishing/exploding gradients and implement learning rate warmup",
        ],
        "topics": [
            {
                "id": "t5-1",
                "title": "PyTorch Fundamentals & Autograd Mechanics",
                "skill_id": "s12",
                "skill_name": "PyTorch",
                "estimated_time": "6 hours",
                "key_concepts": ["Tensor math", "Backward pass", "Optimizer step", "DataLoader & Dataset"],
            },
            {
                "id": "t5-2",
                "title": "Deep Neural Network Architectures",
                "skill_id": "s13",
                "skill_name": "Neural Nets",
                "estimated_time": "7 hours",
                "key_concepts": ["Activation functions", "Batch Normalization", "Dropout", "Weight Initialization"],
            },
        ],
        "resources": [
            {
                "id": "r5-1",
                "title": "Practical Deep Learning for Coders",
                "type": "COURSE",
                "provider": "Fast.ai",
                "duration": "25 hours",
                "url": "https://course.fast.ai/",
            },
            {
                "id": "r5-2",
                "title": "PyTorch Official Tutorials & Recipes",
                "type": "DOCUMENTATION",
                "provider": "PyTorch.org",
                "duration": "6 hours",
                "url": "https://pytorch.org/tutorials/",
            },
        ],
        "project": "Train a custom Convolutional Neural Network with Transfer Learning on Medical Imaging",
    },
    {
        "id": 6,
        "title": "Natural Language Processing",
        "difficulty": "Advanced",
        "estimated_duration": "3 Weeks",
        "why_learn": "Learn to tokenize text, create vector embeddings, and process sequential language data.",
        "career_relevance": "Forms the essential bridge from classical text processing to modern Large Language Models.",
        "prerequisites": ["Deep Learning"],
        "skills": ["Transformers", "Tokenization", "Embeddings", "Hugging Face"],
        "learnings": [
            "Apply Byte-Pair Encoding (BPE) and WordPiece tokenization algorithms",
            "Understand Word2Vec, GloVe, and dense continuous vector embeddings",
            "Grasp sequence-to-sequence modeling, encoder-decoder architectures, and attention mechanisms",
        ],
        "topics": [
            {
                "id": "t6-1",
                "title": "Subword Tokenization & Vocabulary Construction",
                "skill_id": "s15",
                "skill_name": "Tokenization",
                "estimated_time": "4 hours",
                "key_concepts": ["BPE", "WordPiece", "Vocabulary size tradeoffs", "Special tokens"],
            },
            {
                "id": "t6-2",
                "title": "Dense Vector Embeddings & Similarity Metrics",
                "skill_id": "s15",
                "skill_name": "Tokenization",
                "estimated_time": "5 hours",
                "key_concepts": ["Cosine similarity", "High-dimensional vector spaces", "Semantic clustering"],
            },
        ],
        "resources": [
            {
                "id": "r6-1",
                "title": "Hugging Face NLP Course",
                "type": "COURSE",
                "provider": "Hugging Face",
                "duration": "15 hours",
                "url": "https://huggingface.co/learn/nlp-course",
            },
        ],
        "project": "Build a Semantic Search & Intent Classifier using Hugging Face Transformers",
    },
    {
        "id": 7,
        "title": "Generative AI & LLMs",
        "difficulty": "Advanced",
        "estimated_duration": "4 Weeks",
        "why_learn": "Master the Transformer architecture: self-attention, multi-head projections, and parameter-efficient fine-tuning (LoRA).",
        "career_relevance": "Core domain for Generative AI Engineers, Applied AI Engineers, and Foundation Model developers.",
        "prerequisites": ["Natural Language Processing"],
        "skills": ["Transformers", "Fine-Tuning (LoRA)", "Prompt Engineering", "LLM Evaluation"],
        "learnings": [
            "Deconstruct scaled dot-product self-attention and causal masking in decoder-only LLMs",
            "Apply Parameter-Efficient Fine-Tuning (PEFT / LoRA / QLoRA) on open-weights models",
            "Design structured prompts with Few-Shot examples, Chain-of-Thought, and JSON output schema enforcement",
        ],
        "topics": [
            {
                "id": "t7-1",
                "title": "Self-Attention Mechanics & Multi-Head Projections",
                "skill_id": "s14",
                "skill_name": "Transformers",
                "estimated_time": "6 hours",
                "key_concepts": ["Query, Key, Value matrices", "Scaled dot-product", "Positional encoding"],
            },
            {
                "id": "t7-2",
                "title": "Parameter-Efficient Fine-Tuning (LoRA / QLoRA)",
                "skill_id": "s16",
                "skill_name": "Fine-Tuning (LoRA)",
                "estimated_time": "6 hours",
                "key_concepts": ["Low-rank decomposition", "4-bit quantization", "Adapter merging"],
            },
        ],
        "resources": [
            {
                "id": "r7-1",
                "title": "Generative AI with Large Language Models",
                "type": "COURSE",
                "provider": "DeepLearning.AI / AWS",
                "duration": "16 hours",
                "url": "https://www.deeplearning.ai/courses/generative-ai-with-llms/",
            },
        ],
        "project": "Fine-tune a 7B LLM on domain-specific medical summaries using QLoRA",
    },
    {
        "id": 8,
        "title": "RAG & AI Applications",
        "difficulty": "Advanced",
        "estimated_duration": "4 Weeks",
        "why_learn": "Ground LLM responses in real-time, domain-specific private knowledge to eliminate hallucinations and build intelligent agents.",
        "career_relevance": "RAG systems represent 70%+ of production enterprise generative AI implementations today.",
        "prerequisites": ["Generative AI & LLMs"],
        "skills": ["RAG", "Vector DBs", "Chunking Strategies", "Reranking"],
        "learnings": [
            "Implement semantic chunking, recursive character splitting, and contextual embedding generation",
            "Store and query high-dimensional vector embeddings with HNSW indexing in Vector DBs",
            "Apply Cross-Encoder Reranking and hybrid keyword/dense retrieval for optimal context precision",
        ],
        "topics": [
            {
                "id": "t8-1",
                "title": "Document Parsing & Chunking Strategies",
                "skill_id": "s17",
                "skill_name": "RAG",
                "estimated_time": "5 hours",
                "key_concepts": ["Chunk overlap", "Semantic splitting", "Metadata extraction"],
            },
            {
                "id": "t8-2",
                "title": "Vector Databases & HNSW Indexing",
                "skill_id": "s18",
                "skill_name": "Vector DBs",
                "estimated_time": "5 hours",
                "key_concepts": ["Vector index types", "Cosine similarity", "Qdrant / Pinecone / Chroma"],
            },
        ],
        "resources": [
            {
                "id": "r8-1",
                "title": "Building RAG Applications",
                "type": "COURSE",
                "provider": "DeepLearning.AI",
                "duration": "10 hours",
                "url": "https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex/",
            },
        ],
        "project": "Build an Agentic RAG System over complex Financial SEC 10-K Filings with Citations",
    },
    {
        "id": 9,
        "title": "Deployment & MLOps",
        "difficulty": "Advanced",
        "estimated_duration": "4 Weeks",
        "why_learn": "Package, containerize, serve, and monitor machine learning models and LLM endpoints as production microservices.",
        "career_relevance": "Bridges the gap between research notebooks and high-throughput, latency-optimized production software.",
        "prerequisites": ["Machine Learning", "RAG & AI Applications"],
        "skills": ["FastAPI & Docker", "CI/CD", "Model Serving", "Monitoring"],
        "learnings": [
            "Build asynchronous REST APIs using FastAPI with Pydantic payload validation and OpenAPI docs",
            "Create multi-stage production Dockerfiles with minimal image footprints and non-root execution",
            "Configure model monitoring, structured logging, latency tracking, and token usage metrics",
        ],
        "topics": [
            {
                "id": "t9-1",
                "title": "FastAPI Microservices for Model Inference",
                "skill_id": "s19",
                "skill_name": "FastAPI & Docker",
                "estimated_time": "5 hours",
                "key_concepts": ["Async endpoints", "Streaming responses (SSE)", "Dependency injection"],
            },
            {
                "id": "t9-2",
                "title": "Docker Containerization & Multi-Stage Builds",
                "skill_id": "s19",
                "skill_name": "FastAPI & Docker",
                "estimated_time": "5 hours",
                "key_concepts": ["Layer caching", "Slim runtime images", "Docker Compose"],
            },
        ],
        "resources": [
            {
                "id": "r9-1",
                "title": "MLOps Specialization",
                "type": "COURSE",
                "provider": "DeepLearning.AI",
                "duration": "20 hours",
                "url": "https://www.deeplearning.ai/courses/machine-learning-engineering-for-production-mlops/",
            },
        ],
        "project": "Containerize and deploy an inference service with Docker, FastAPI, Prometheus metrics, and automated tests",
    },
    {
        "id": 10,
        "title": "Final AI Engineering Capstone",
        "difficulty": "Advanced",
        "estimated_duration": "4 Weeks",
        "why_learn": "Synthesize data preparation, model training, fine-tuning, RAG retrieval, and containerized deployment into an end-to-end portfolio artifact.",
        "career_relevance": "The ultimate capstone proof-of-work establishing readiness for mid-to-senior AI/ML Engineering roles.",
        "prerequisites": ["Deployment & MLOps"],
        "skills": ["Python OOP", "Machine Learning", "PyTorch", "Transformers", "RAG", "FastAPI & Docker"],
        "learnings": [
            "Design end-to-end architecture integrating vector search, LLM reasoning, and persistent database storage",
            "Deploy a production service with automated CI/CD and observability dashboards",
            "Complete PathAI AI/ML Engineer certification review",
        ],
        "topics": [
            {
                "id": "t10-1",
                "title": "System Architecture & End-to-End Pipeline Design",
                "skill_id": "s19",
                "skill_name": "FastAPI & Docker",
                "estimated_time": "8 hours",
                "key_concepts": ["High-level design", "Service boundaries", "Security and auth"],
            },
        ],
        "resources": [
            {
                "id": "r10-1",
                "title": "PathAI AI Engineering Capstone Rubric & Blueprint",
                "type": "DOCUMENTATION",
                "provider": "PathAI Studio",
                "duration": "10 hours",
                "url": "#",
            },
        ],
        "project": "Full-Stack Multimodal AI Document Assistant with RAG, LoRA Adapter, FastAPI Service, and Dockerized Deployment",
    },
]


# ---------------------------------------------------------------------------
# Database Persistence Helpers (Supabase)
# ---------------------------------------------------------------------------

_IN_MEMORY_STAGE_PROGRESS: dict[str, dict[int, dict[str, Any]]] = {}


async def get_learner_stage_progress_from_db(user_id: str) -> list[dict[str, Any]]:
    """Loads all tracked stage progresses for a user from Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = client.table("learner_stage_progress").select("*").eq("user_id", valid_uid).execute()
        if res.data:
            return res.data
    except Exception as e:
        logger.error("Failed to load learner stage progress from Supabase: %s", e)

    # Return in-memory cached stages
    if valid_uid in _IN_MEMORY_STAGE_PROGRESS:
        return list(_IN_MEMORY_STAGE_PROGRESS[valid_uid].values())
    return []


async def save_learner_stage_progress_to_db(
    user_id: str,
    stage_id: int,
    status: str,
    progress: int,
    started_at: Optional[str] = None,
    completed_at: Optional[str] = None,
) -> None:
    """Upserts stage progress record in Supabase and in-memory cache."""
    valid_uid = _ensure_valid_uuid(user_id)
    row: dict[str, Any] = {
        "user_id": valid_uid,
        "stage_id": stage_id,
        "status": status,
        "progress": progress,
        "last_activity_at": datetime.now(timezone.utc).isoformat(),
    }
    if started_at:
        row["started_at"] = started_at
    if completed_at:
        row["completed_at"] = completed_at

    # Update in-memory store
    if valid_uid not in _IN_MEMORY_STAGE_PROGRESS:
        _IN_MEMORY_STAGE_PROGRESS[valid_uid] = {}
    _IN_MEMORY_STAGE_PROGRESS[valid_uid][stage_id] = row

    try:
        client = get_supabase_client()
        client.table("learner_stage_progress").upsert(
            row, on_conflict="user_id,stage_id"
        ).execute()
    except Exception as e:
        logger.error("Failed to update learner stage progress in Supabase: %s", e)


async def save_user_roadmap_to_db(
    user_id: str,
    target_role: str,
    stages_data: list[dict[str, Any]],
    overall_progress: int,
) -> None:
    """Upserts full roadmap curriculum record in Supabase public.roadmaps table."""
    valid_uid = _ensure_valid_uuid(user_id)
    row = {
        "user_id": valid_uid,
        "target_role": target_role,
        "stages_data": stages_data,
        "overall_progress": overall_progress,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        client = get_supabase_client()
        client.table("roadmaps").upsert(
            row, on_conflict="user_id,target_role"
        ).execute()
    except Exception as e:
        logger.error("Failed to sync roadmaps table in Supabase: %s", e)


async def get_user_roadmap_from_db(
    user_id: str,
    target_role: str = "AI/ML Engineer",
) -> Optional[dict[str, Any]]:
    """Loads user roadmap record from Supabase public.roadmaps table."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = client.table("roadmaps").select("*").eq("user_id", valid_uid).eq("target_role", target_role).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error("Failed to load user roadmap from Supabase: %s", e)
    return None


# ---------------------------------------------------------------------------
# Dynamic Dependency & Progress Evaluation Engine
# ---------------------------------------------------------------------------

async def evaluate_learner_roadmap(user_id: str) -> list[RoadmapStageSummary]:
    """
    Evaluates dynamic stage statuses (COMPLETED, IN_PROGRESS, AVAILABLE, LOCKED)
    based on database progress records and prerequisite skill masteries.
    """
    valid_uid = _ensure_valid_uuid(user_id)

    # 1. Load user topic progress from Supabase
    topic_progress = await get_user_topic_progress_from_db(user_id)
    mastery_map: dict[str, int] = {t["skill_id"]: t["mastery"] for t in topic_progress}

    # 2. Load custom stage overrides from Supabase / in-memory store
    stage_progress_list = await get_learner_stage_progress_from_db(user_id)
    stage_db_map = {s["stage_id"]: s for s in stage_progress_list}

    stages_summary: list[RoadmapStageSummary] = []
    completed_stage_ids: set[int] = {1, 2}  # default completed foundation stages

    for idx, stage in enumerate(CANONICAL_ROADMAP_STAGES):
        stage_id = stage["id"]
        db_record = stage_db_map.get(stage_id)
        is_capstone = stage_id == len(CANONICAL_ROADMAP_STAGES)

        # Prerequisite check
        prereqs = stage["prerequisites"]
        prereq_stages = [
            s for s in CANONICAL_ROADMAP_STAGES if s["title"] in prereqs
        ]
        all_prereqs_met = (
            len(prereq_stages) == 0
            or all(ps["id"] in completed_stage_ids for ps in prereq_stages)
        )

        stage_topics = stage.get("topics", [])
        topic_masteries = [mastery_map.get(t["skill_id"], 40) for t in stage_topics]
        avg_mastery = round(sum(topic_masteries) / max(len(topic_masteries), 1)) if topic_masteries else 0

        # Determine stage status
        if db_record and db_record.get("status"):
            stage_status = db_record["status"]
            stage_progress = db_record.get("progress", avg_mastery)
        else:
            # Default progressive unlock flow for initial learners:
            if stage_id in (1, 2):
                stage_status = "COMPLETED"
                stage_progress = 100
            elif stage_id == 3:
                stage_status = "IN_PROGRESS"
                stage_progress = 45
            else:
                if all_prereqs_met:
                    stage_status = "AVAILABLE"
                    stage_progress = 0
                else:
                    stage_status = "LOCKED"
                    stage_progress = 0

        if stage_status == "COMPLETED":
            completed_stage_ids.add(stage_id)

        stages_summary.append(
            RoadmapStageSummary(
                id=stage_id,
                title=stage["title"],
                status=stage_status,
                difficulty=stage["difficulty"],
                estimated_duration=stage["estimated_duration"],
                progress=stage_progress,
                is_final_capstone=is_capstone,
                skills=stage["skills"],
            )
        )

    return stages_summary


async def get_roadmap_overview(
    user_id: str,
    user_name: str = "Learner",
    target_role: str = "AI/ML Engineer",
) -> RoadmapOverviewResponse:
    """Builds the full Roadmap Overview with metrics, active position, blockers, and next action."""
    stages = await evaluate_learner_roadmap(user_id)
    total_stages = len(stages)
    completed_count = sum(1 for s in stages if s.status == "COMPLETED")
    overall_progress = round((completed_count / total_stages) * 100)

    # Find current active stage and next stage
    current_stage = next((s for s in stages if s.status == "IN_PROGRESS"), None)
    if not current_stage:
        current_stage = next((s for s in stages if s.status in ("AVAILABLE", "NOT_STARTED")), stages[0])

    next_stage = next(
        (s for s in stages if s.id > (current_stage.id if current_stage else 0) and s.status in ("AVAILABLE", "NOT_STARTED", "LOCKED")),
        None,
    )

    # Calculate remaining weeks
    remaining_weeks = sum(
        int(s.estimated_duration.split()[0])
        for s in stages
        if s.status != "COMPLETED" and s.estimated_duration.split()[0].isdigit()
    ) or 20

    # Determine blocker message if any
    current_blocker = None
    if next_stage and next_stage.status == "LOCKED":
        current_blocker = f"Stage '{next_stage.title}' is locked: Complete '{current_stage.title}' prerequisites first."

    # Next recommended action
    next_action = f"Continue learning '{current_stage.title}' to maintain your target pace."
    if current_stage and current_stage.progress < 50:
        next_action = f"Complete the core syllabus and practice problems for '{current_stage.title}'."
    elif current_stage and current_stage.progress >= 50:
        next_action = f"Take the diagnostic assessment for '{current_stage.title}' to unlock the next milestone."

    # Sync full roadmap structure and overall progress to roadmaps table in Supabase
    try:
        await save_user_roadmap_to_db(
            user_id=user_id,
            target_role=target_role,
            stages_data=[s.dict() for s in stages],
            overall_progress=overall_progress,
        )
    except Exception as sync_err:
        logger.warning("Could not sync roadmaps table in background: %s", sync_err)

    return RoadmapOverviewResponse(
        user_id=user_id,
        user_name=user_name,
        target_role=target_role,
        overall_progress=overall_progress,
        completed_stages=completed_count,
        total_stages=total_stages,
        current_stage=current_stage,
        next_stage=next_stage,
        estimated_remaining_weeks=remaining_weeks,
        current_blocker=current_blocker,
        next_recommended_action=next_action,
        stages=stages,
    )


async def get_stage_details(
    user_id: str,
    stage_id: int,
    target_role: str = "AI/ML Engineer",
) -> Optional[RoadmapStageDetail]:
    """Returns comprehensive stage details with live topic masteries, prerequisite checks, and actions."""
    canonical_stage = next((s for s in CANONICAL_ROADMAP_STAGES if s["id"] == stage_id), None)
    if not canonical_stage:
        return None

    # Load evaluated stages to get real-time status
    all_stages = await evaluate_learner_roadmap(user_id)
    stage_summary = next((s for s in all_stages if s.id == stage_id), None)
    current_status = stage_summary.status if stage_summary else "LOCKED"
    current_progress = stage_summary.progress if stage_summary else 0

    # Load topic progress
    topic_progress = await get_user_topic_progress_from_db(user_id)
    mastery_map: dict[str, int] = {t["skill_id"]: t["mastery"] for t in topic_progress}

    # Build topic items
    topics: list[RoadmapTopicItem] = []
    completed_topics_count = 0

    for raw_topic in canonical_stage.get("topics", []):
        skill_id = raw_topic["skill_id"]
        # Use live mastery if available or deterministic baseline
        live_mastery = mastery_map.get(skill_id, 30 if current_status == "IN_PROGRESS" else 85 if current_status == "COMPLETED" else 0)

        if current_status == "COMPLETED" or live_mastery >= 70:
            top_status = "COMPLETED"
            completed_topics_count += 1
        elif current_status == "IN_PROGRESS":
            top_status = "IN_PROGRESS" if live_mastery > 0 else "NOT_STARTED"
        else:
            top_status = "LOCKED"

        topics.append(
            RoadmapTopicItem(
                id=raw_topic["id"],
                title=raw_topic["title"],
                skill_id=skill_id,
                skill_name=raw_topic["skill_name"],
                mastery=live_mastery,
                status=top_status,
                estimated_time=raw_topic["estimated_time"],
                key_concepts=raw_topic.get("key_concepts", []),
            )
        )

    # Prerequisite verification
    prereq_checks: list[PrerequisiteCheckItem] = []
    for prereq_name in canonical_stage["prerequisites"]:
        prereq_stage = next((s for s in CANONICAL_ROADMAP_STAGES if s["title"] == prereq_name), None)
        if prereq_stage:
            is_satisfied = any(s.id == prereq_stage["id"] and s.status == "COMPLETED" for s in all_stages)
            missing = []
            if not is_satisfied:
                for sk in prereq_stage["skills"]:
                    missing.append({"skill": sk, "required_mastery": 60, "current_mastery": 45})

            prereq_checks.append(
                PrerequisiteCheckItem(
                    stage_id=prereq_stage["id"],
                    stage_title=prereq_stage["title"],
                    required_skills=prereq_stage["skills"],
                    satisfied=is_satisfied,
                    missing_skills=missing,
                )
            )

    # Convert resources
    resources: list[LearningResourceItem] = [
        LearningResourceItem(
            id=r["id"],
            title=r["title"],
            type=r["type"],
            provider=r["provider"],
            duration=r["duration"],
            url=r.get("url", "#"),
        )
        for r in canonical_stage.get("resources", [])
    ]

    # Compute Next Best Action & Available Actions
    if current_status == "IN_PROGRESS":
        next_action = f"Complete '{topics[0].title if topics else canonical_stage['title']}' to advance your stage mastery."
        actions = ["RESUME_STAGE", "ASK_MENTOR", "VIEW_SKILLS"]
    elif current_status in ("AVAILABLE", "NOT_STARTED"):
        next_action = f"Start Stage {stage_id} — review the syllabus and initiate topic learning."
        actions = ["START_STAGE", "ASK_MENTOR", "VIEW_SKILLS"]
    elif current_status == "COMPLETED":
        next_action = "Stage fully completed! You can review materials or practice challenging problems."
        actions = ["REVIEW_STAGE", "ASK_MENTOR", "VIEW_SKILLS"]
    else:
        # LOCKED
        next_action = f"Complete prerequisites ({', '.join(canonical_stage['prerequisites'])}) to unlock this stage."
        actions = ["VIEW_PREREQUISITES", "ASK_MENTOR"]

    return RoadmapStageDetail(
        id=stage_id,
        title=canonical_stage["title"],
        status=current_status,
        difficulty=canonical_stage["difficulty"],
        estimated_duration=canonical_stage["estimated_duration"],
        progress=current_progress,
        completed_topics=completed_topics_count,
        total_topics=len(topics),
        why_learn=canonical_stage["why_learn"],
        career_relevance=canonical_stage.get("career_relevance", ""),
        prerequisites=canonical_stage["prerequisites"],
        prerequisite_checks=prereq_checks,
        skills=canonical_stage["skills"],
        learnings=canonical_stage["learnings"],
        topics=topics,
        resources=resources,
        project=canonical_stage["project"],
        is_final_capstone=(stage_id == len(CANONICAL_ROADMAP_STAGES)),
        next_best_action=next_action,
        actions_available=actions,
    )


async def start_stage(user_id: str, stage_id: int) -> StageStartResponse:
    """Transitions an unlocked stage to IN_PROGRESS."""
    all_stages = await evaluate_learner_roadmap(user_id)
    stage = next((s for s in all_stages if s.id == stage_id), None)
    if not stage:
        raise ValueError("Stage not found")

    if stage.status == "LOCKED":
        raise ValueError("Cannot start locked stage before completing prerequisites")

    started_at = datetime.now(timezone.utc).isoformat()
    await save_learner_stage_progress_to_db(
        user_id=user_id,
        stage_id=stage_id,
        status="IN_PROGRESS",
        progress=stage.progress if stage.progress > 0 else 10,
        started_at=started_at,
    )

    return StageStartResponse(
        stage_id=stage_id,
        status="IN_PROGRESS",
        started_at=started_at,
        message=f"Stage {stage_id} '{stage.title}' started successfully.",
    )


async def complete_stage(user_id: str, stage_id: int) -> StageCompleteResponse:
    """Marks a stage COMPLETED and evaluates newly unlocked stages."""
    completed_at = datetime.now(timezone.utc).isoformat()
    await save_learner_stage_progress_to_db(
        user_id=user_id,
        stage_id=stage_id,
        status="COMPLETED",
        progress=100,
        completed_at=completed_at,
    )

    # Re-evaluate roadmap to determine which downstream stages unlocked
    updated_stages = await evaluate_learner_roadmap(user_id)
    unlocked = [s.id for s in updated_stages if s.status in ("AVAILABLE", "NOT_STARTED", "IN_PROGRESS")]

    return StageCompleteResponse(
        stage_id=stage_id,
        status="COMPLETED",
        completed_at=completed_at,
        message=f"Stage {stage_id} completed. Downstream roadmap updated.",
        unlocked_stages=unlocked,
    )
