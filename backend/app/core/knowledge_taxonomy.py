"""
Core Knowledge Taxonomy, Hierarchical Competency Models, and Career Role Knowledge Base.

Defines:
1. 8 Core Technical Domains with Granular Skills, Topics, Subtopics, and Prerequisites.
2. 6 Structured Career Role Competency Requirements with Topic Benchmarks & Importance Weights.
3. Curated, Verified Learning Resources mapped to specific topic competencies.
"""

from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Schemas for Knowledge Taxonomy
# ---------------------------------------------------------------------------

class TopicDefinition(BaseModel):
    id: str
    title: str
    skill_id: str
    skill_name: str
    domain: str
    difficulty: str  # Beginner, Intermediate, Advanced
    estimated_hours: float
    prerequisites: list[str] = Field(default_factory=list)  # topic IDs
    key_concepts: list[str] = Field(default_factory=list)
    benchmark_mastery: int = 75

class SkillDefinition(BaseModel):
    id: str
    name: str
    domain: str
    description: str
    topics: list[TopicDefinition]
    prerequisites: list[str] = Field(default_factory=list)  # skill IDs

class RoleRequirement(BaseModel):
    role_id: str
    title: str
    category: str
    description: str
    core_domains: list[str]
    required_skills: dict[str, int]  # skill_name -> required_mastery (e.g. "Python OOP": 80)
    required_topics: dict[str, int]  # topic_id -> required_mastery (e.g. "t-py-funcs": 80)
    skill_weights: dict[str, float]  # skill_name -> relative importance weight [0.0 - 1.0]
    typical_duration_weeks: int = 24
    minimum_weekly_hours: int = 8

class ResourceDefinition(BaseModel):
    id: str
    title: str
    provider: str
    type: str  # COURSE, DOCUMENTATION, LAB, VIDEO
    url: str
    duration_hours: float
    difficulty: str
    target_topic_ids: list[str]
    learning_outcomes: list[str]

# ---------------------------------------------------------------------------
# 1. Comprehensive Multi-Domain Knowledge Taxonomy
# ---------------------------------------------------------------------------

TAXONOMY_DOMAINS: list[str] = [
    "Programming & Data Structures",
    "Applied Mathematics & Statistics",
    "Data Wrangling & Feature Engineering",
    "Machine Learning Foundations",
    "Deep Learning & Neural Networks",
    "NLP, Attention & Transformers",
    "Generative AI, RAG & LLMs",
    "MLOps, APIs & Cloud Deployment",
]

TAXONOMY_TOPICS: list[TopicDefinition] = [
    # 1. Programming & Data Structures (Domain 1)
    TopicDefinition(
        id="top-py-syntax",
        title="Python Syntax, Variables & Control Flow",
        skill_id="sk-py-core",
        skill_name="Python Fundamentals",
        domain="Programming & Data Structures",
        difficulty="Beginner",
        estimated_hours=6.0,
        prerequisites=[],
        key_concepts=["Dynamic typing", "Conditionals", "Loops", "List comprehensions"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-py-funcs",
        title="Functions, Scope & Error Handling",
        skill_id="sk-py-core",
        skill_name="Python Fundamentals",
        domain="Programming & Data Structures",
        difficulty="Beginner",
        estimated_hours=8.0,
        prerequisites=["top-py-syntax"],
        key_concepts=["First-class functions", "Lambda expressions", "Decorators", "Exceptions"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-py-oop",
        title="Object-Oriented Programming (OOP)",
        skill_id="sk-py-oop",
        skill_name="Python OOP & Architecture",
        domain="Programming & Data Structures",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-py-funcs"],
        key_concepts=["Classes & Instances", "Inheritance & Polymorphism", "Dunder methods", "Composition"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-dsa-basic",
        title="Arrays, Hash Maps & Complexity (Big-O)",
        skill_id="sk-dsa",
        skill_name="Data Structures & Algorithms",
        domain="Programming & Data Structures",
        difficulty="Intermediate",
        estimated_hours=12.0,
        prerequisites=["top-py-funcs"],
        key_concepts=["Time/Space complexity", "Hash tables", "Two-pointer techniques", "Recursion"],
        benchmark_mastery=75,
    ),

    # 2. Applied Mathematics & Statistics (Domain 2)
    TopicDefinition(
        id="top-math-la-matrices",
        title="Matrix Operations & Vector Spaces",
        skill_id="sk-math-la",
        skill_name="Linear Algebra",
        domain="Applied Mathematics & Statistics",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-py-syntax"],
        key_concepts=["Matrix multiplication", "Dot products", "Vector spaces", "Rank and Invertibility"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-math-la-eigen",
        title="Eigenvalues, Eigenvectors & SVD",
        skill_id="sk-math-la",
        skill_name="Linear Algebra",
        domain="Applied Mathematics & Statistics",
        difficulty="Advanced",
        estimated_hours=12.0,
        prerequisites=["top-math-la-matrices"],
        key_concepts=["Characteristic equation", "Eigendecomposition", "Singular Value Decomposition", "Dimensionality reduction intuition"],
        benchmark_mastery=70,
    ),
    TopicDefinition(
        id="top-math-calc-diff",
        title="Multivariate Calculus & Partial Derivatives",
        skill_id="sk-math-calc",
        skill_name="Multivariate Calculus",
        domain="Applied Mathematics & Statistics",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-py-syntax"],
        key_concepts=["Gradients", "Jacobian matrix", "Chain rule in multi-dimensions", "Hessian curvature"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-math-opt-convex",
        title="Convexity & Optimization Algorithms",
        skill_id="sk-math-opt",
        skill_name="Optimization",
        domain="Applied Mathematics & Statistics",
        difficulty="Advanced",
        estimated_hours=12.0,
        prerequisites=["top-math-calc-diff", "top-math-la-matrices"],
        key_concepts=["Convex sets & functions", "Gradient Descent", "Stochastic Gradient Descent", "Momentum and Adam"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-math-prob-bayes",
        title="Probability Distributions & Bayesian Inference",
        skill_id="sk-math-prob",
        skill_name="Probability & Statistics",
        domain="Applied Mathematics & Statistics",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-py-syntax"],
        key_concepts=["Conditional probability", "Bayes theorem", "Gaussian distributions", "Expectation & Variance"],
        benchmark_mastery=75,
    ),

    # 3. Data Wrangling & Feature Engineering (Domain 3)
    TopicDefinition(
        id="top-data-numpy",
        title="NumPy Vectorization & Array Broadcasting",
        skill_id="sk-data-numpy",
        skill_name="NumPy Data Manipulation",
        domain="Data Wrangling & Feature Engineering",
        difficulty="Intermediate",
        estimated_hours=8.0,
        prerequisites=["top-py-funcs", "top-math-la-matrices"],
        key_concepts=["Broadcasting rules", "Strided arrays", "Vectorized linear algebra", "Boolean indexing"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-data-pandas",
        title="Pandas DataFrames, GroupBy & Aggregations",
        skill_id="sk-data-pandas",
        skill_name="Pandas Data Wrangling",
        domain="Data Wrangling & Feature Engineering",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-py-funcs"],
        key_concepts=["Data cleaning", "Handling missing values", "Merging & Joins", "GroupBy aggregations", "Pivot tables"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-data-fe",
        title="Feature Engineering, Encoding & Scaling",
        skill_id="sk-data-fe",
        skill_name="Feature Engineering",
        domain="Data Wrangling & Feature Engineering",
        difficulty="Intermediate",
        estimated_hours=8.0,
        prerequisites=["top-data-pandas", "top-math-prob-bayes"],
        key_concepts=["One-Hot / Target encoding", "Standardization & Normalization", "Outlier detection", "Feature selection"],
        benchmark_mastery=75,
    ),

    # 4. Machine Learning Foundations (Domain 4)
    TopicDefinition(
        id="top-ml-super-reg",
        title="Supervised Learning: Linear & Logistic Regression",
        skill_id="sk-ml-super",
        skill_name="Supervised Learning",
        domain="Machine Learning Foundations",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-math-opt-convex", "top-data-numpy"],
        key_concepts=["Cost functions", "Ordinary Least Squares", "Sigmoid & Odds ratio", "Regularization (L1 Lasso / L2 Ridge)"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-ml-trees",
        title="Decision Trees, Random Forests & XGBoost",
        skill_id="sk-ml-trees",
        skill_name="Ensemble Methods",
        domain="Machine Learning Foundations",
        difficulty="Intermediate",
        estimated_hours=12.0,
        prerequisites=["top-ml-super-reg"],
        key_concepts=["Gini impurity & Entropy", "Bagging vs Boosting", "Gradient Boosted Trees (XGBoost/LightGBM)", "Hyperparameter tuning"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-ml-eval",
        title="Cross-Validation, ROC-AUC & Error Analysis",
        skill_id="sk-ml-eval",
        skill_name="Model Evaluation & Validation",
        domain="Machine Learning Foundations",
        difficulty="Intermediate",
        estimated_hours=8.0,
        prerequisites=["top-ml-super-reg"],
        key_concepts=["K-Fold Cross Validation", "Precision, Recall, F1-Score", "ROC-AUC curves", "Bias-Variance tradeoff"],
        benchmark_mastery=80,
    ),

    # 5. Deep Learning & Neural Networks (Domain 5)
    TopicDefinition(
        id="top-dl-nn-found",
        title="Feedforward Neural Networks & Backpropagation",
        skill_id="sk-dl-found",
        skill_name="Deep Learning Foundations",
        domain="Deep Learning & Neural Networks",
        difficulty="Intermediate",
        estimated_hours=14.0,
        prerequisites=["top-ml-super-reg", "top-math-calc-diff"],
        key_concepts=["Multilayer Perceptrons (MLP)", "Activation functions (ReLU, GELU)", "Computational graph backpropagation", "Vanishing gradients"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-dl-pytorch",
        title="PyTorch Tensor Architecture & Training Loops",
        skill_id="sk-dl-pytorch",
        skill_name="PyTorch Framework",
        domain="Deep Learning & Neural Networks",
        difficulty="Intermediate",
        estimated_hours=12.0,
        prerequisites=["top-dl-nn-found"],
        key_concepts=["torch.nn.Module", "Autograd", "DataLoader & Dataset abstractions", "Custom training & validation loops"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-dl-cnn",
        title="Convolutional Neural Networks (CNNs) & Vision",
        skill_id="sk-dl-cnn",
        skill_name="Computer Vision",
        domain="Deep Learning & Neural Networks",
        difficulty="Advanced",
        estimated_hours=14.0,
        prerequisites=["top-dl-pytorch"],
        key_concepts=["Convolutions & Pooling", "ResNet & Skip connections", "Transfer learning", "Image augmentation"],
        benchmark_mastery=70,
    ),

    # 6. NLP, Attention & Transformers (Domain 6)
    TopicDefinition(
        id="top-nlp-tokenizers",
        title="NLP Preprocessing, Embeddings & Tokenizers",
        skill_id="sk-nlp-found",
        skill_name="NLP Foundations",
        domain="NLP, Attention & Transformers",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-dl-pytorch"],
        key_concepts=["Byte-Pair Encoding (BPE)", "Word2Vec & Sentence embeddings", "HuggingFace Tokenizers", "Cosine similarity"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-nlp-attention",
        title="Scaled Dot-Product Attention & Self-Attention",
        skill_id="sk-nlp-transformers",
        skill_name="Transformer Architectures",
        domain="NLP, Attention & Transformers",
        difficulty="Advanced",
        estimated_hours=16.0,
        prerequisites=["top-nlp-tokenizers", "top-math-la-matrices"],
        key_concepts=["Query, Key, Value mechanics", "Multi-Head Attention", "Positional Encodings", "Encoder-Decoder vs Decoder-only"],
        benchmark_mastery=75,
    ),

    # 7. Generative AI, RAG & LLMs (Domain 7)
    TopicDefinition(
        id="top-genai-rag",
        title="Retrieval-Augmented Generation (RAG) & Vector DBs",
        skill_id="sk-genai-rag",
        skill_name="RAG Architecture",
        domain="Generative AI, RAG & LLMs",
        difficulty="Advanced",
        estimated_hours=14.0,
        prerequisites=["top-nlp-attention"],
        key_concepts=["Chunking strategies", "Dense vector search (Qdrant, Pinecone)", "Hybrid search & Re-ranking", "Context injection"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-genai-lora",
        title="LLM Fine-Tuning (LoRA, QLoRA) & Alignment",
        skill_id="sk-genai-finetune",
        skill_name="LLM Fine-Tuning",
        domain="Generative AI, RAG & LLMs",
        difficulty="Advanced",
        estimated_hours=16.0,
        prerequisites=["top-nlp-attention", "top-dl-pytorch"],
        key_concepts=["Parameter-Efficient Fine-Tuning (PEFT)", "4-bit quantization (bitsandbytes)", "Instruction tuning", "Direct Preference Optimization (DPO)"],
        benchmark_mastery=70,
    ),

    # 8. MLOps, APIs & Cloud Deployment (Domain 8)
    TopicDefinition(
        id="top-mlops-fastapi",
        title="REST APIs, Async Inference & FastAPI",
        skill_id="sk-mlops-api",
        skill_name="Model Serving & APIs",
        domain="MLOps, APIs & Cloud Deployment",
        difficulty="Intermediate",
        estimated_hours=8.0,
        prerequisites=["top-py-oop"],
        key_concepts=["FastAPI routing", "Pydantic validation", "Asynchronous endpoints", "Batched model inference"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-mlops-docker",
        title="Docker Containerization & Cloud Deployment",
        skill_id="sk-mlops-deploy",
        skill_name="Containerization & Deployment",
        domain="MLOps, APIs & Cloud Deployment",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-mlops-fastapi"],
        key_concepts=["Dockerfiles & Multi-stage builds", "Container image optimization", "Health checks & Logging", "Cloud container runtime (AWS/GCP/Render)"],
        benchmark_mastery=75,
    ),
    TopicDefinition(
        id="top-mlops-ci",
        title="Model Registry, Experiment Tracking & CI/CD",
        skill_id="sk-mlops-tracking",
        skill_name="MLOps Pipelines",
        domain="MLOps, APIs & Cloud Deployment",
        difficulty="Advanced",
        estimated_hours=12.0,
        prerequisites=["top-mlops-docker"],
        key_concepts=["MLflow tracking", "Data versioning (DVC)", "Model registry lifecycle", "Automated model validation tests"],
        benchmark_mastery=70,
    ),
]

# ---------------------------------------------------------------------------
# 2. Multi-Role Career Requirement Knowledge Base (6 Distinct Roles)
# ---------------------------------------------------------------------------

CAREER_ROLES_BASE: list[RoleRequirement] = [
    RoleRequirement(
        role_id="ml-engineer",
        title="Machine Learning Engineer",
        category="Engineering & Modeling",
        description="Designs, builds, trains, and deploys production-grade predictive models, ensemble pipelines, and deep neural architectures.",
        core_domains=[
            "Programming & Data Structures",
            "Applied Mathematics & Statistics",
            "Data Wrangling & Feature Engineering",
            "Machine Learning Foundations",
            "Deep Learning & Neural Networks",
            "MLOps, APIs & Cloud Deployment",
        ],
        required_skills={
            "Python Fundamentals": 85,
            "Python OOP & Architecture": 80,
            "Linear Algebra": 75,
            "Multivariate Calculus": 70,
            "Optimization": 75,
            "NumPy Data Manipulation": 85,
            "Pandas Data Wrangling": 80,
            "Feature Engineering": 80,
            "Supervised Learning": 85,
            "Ensemble Methods": 85,
            "Model Evaluation & Validation": 85,
            "Deep Learning Foundations": 75,
            "PyTorch Framework": 80,
            "Model Serving & APIs": 75,
            "Containerization & Deployment": 75,
        },
        required_topics={
            "top-py-funcs": 85,
            "top-py-oop": 80,
            "top-math-la-matrices": 75,
            "top-math-opt-convex": 75,
            "top-data-numpy": 85,
            "top-data-pandas": 80,
            "top-ml-super-reg": 85,
            "top-ml-trees": 85,
            "top-ml-eval": 85,
            "top-dl-pytorch": 80,
            "top-mlops-fastapi": 75,
            "top-mlops-docker": 75,
        },
        skill_weights={
            "Machine Learning Foundations": 0.25,
            "Programming & Data Structures": 0.20,
            "Deep Learning & Neural Networks": 0.20,
            "Applied Mathematics & Statistics": 0.15,
            "MLOps, APIs & Cloud Deployment": 0.15,
            "Data Wrangling & Feature Engineering": 0.05,
        },
        typical_duration_weeks=22,
        minimum_weekly_hours=10,
    ),
    RoleRequirement(
        role_id="data-scientist",
        title="Data Scientist",
        category="Analytics & Statistical Modeling",
        description="Discovers insights from complex data, designs rigorous statistical hypothesis tests, formulates feature representations, and builds business predictive models.",
        core_domains=[
            "Programming & Data Structures",
            "Applied Mathematics & Statistics",
            "Data Wrangling & Feature Engineering",
            "Machine Learning Foundations",
        ],
        required_skills={
            "Python Fundamentals": 85,
            "Probability & Statistics": 90,
            "Linear Algebra": 75,
            "NumPy Data Manipulation": 85,
            "Pandas Data Wrangling": 90,
            "Feature Engineering": 85,
            "Supervised Learning": 85,
            "Ensemble Methods": 80,
            "Model Evaluation & Validation": 90,
        },
        required_topics={
            "top-py-funcs": 85,
            "top-math-prob-bayes": 90,
            "top-data-pandas": 90,
            "top-data-fe": 85,
            "top-ml-super-reg": 85,
            "top-ml-trees": 80,
            "top-ml-eval": 90,
        },
        skill_weights={
            "Applied Mathematics & Statistics": 0.30,
            "Data Wrangling & Feature Engineering": 0.30,
            "Machine Learning Foundations": 0.25,
            "Programming & Data Structures": 0.15,
        },
        typical_duration_weeks=18,
        minimum_weekly_hours=8,
    ),
    RoleRequirement(
        role_id="ai-application-engineer",
        title="AI Application / LLM Engineer",
        category="Generative AI & Systems",
        description="Integrates foundation models, orchestrates RAG knowledge retrieval pipelines, builds autonomous multi-agent systems, and deploys high-throughput AI services.",
        core_domains=[
            "Programming & Data Structures",
            "NLP, Attention & Transformers",
            "Generative AI, RAG & LLMs",
            "MLOps, APIs & Cloud Deployment",
        ],
        required_skills={
            "Python Fundamentals": 85,
            "Python OOP & Architecture": 85,
            "NLP Foundations": 80,
            "Transformer Architectures": 80,
            "RAG Architecture": 90,
            "LLM Fine-Tuning": 75,
            "Model Serving & APIs": 85,
            "Containerization & Deployment": 80,
        },
        required_topics={
            "top-py-oop": 85,
            "top-nlp-tokenizers": 80,
            "top-nlp-attention": 80,
            "top-genai-rag": 90,
            "top-genai-lora": 75,
            "top-mlops-fastapi": 85,
            "top-mlops-docker": 80,
        },
        skill_weights={
            "Generative AI, RAG & LLMs": 0.35,
            "NLP, Attention & Transformers": 0.25,
            "MLOps, APIs & Cloud Deployment": 0.25,
            "Programming & Data Structures": 0.15,
        },
        typical_duration_weeks=20,
        minimum_weekly_hours=10,
    ),
    RoleRequirement(
        role_id="data-engineer",
        title="Data Engineer",
        category="Data Architecture & Big Data",
        description="Architects robust scalable ETL pipelines, orchestrates relational and distributed databases, and manages stream ingestion infrastructure for ML systems.",
        core_domains=[
            "Programming & Data Structures",
            "Data Wrangling & Feature Engineering",
            "MLOps, APIs & Cloud Deployment",
        ],
        required_skills={
            "Python Fundamentals": 90,
            "Python OOP & Architecture": 85,
            "Data Structures & Algorithms": 80,
            "NumPy Data Manipulation": 80,
            "Pandas Data Wrangling": 90,
            "Model Serving & APIs": 80,
            "Containerization & Deployment": 85,
            "MLOps Pipelines": 75,
        },
        required_topics={
            "top-py-oop": 85,
            "top-dsa-basic": 80,
            "top-data-pandas": 90,
            "top-mlops-fastapi": 80,
            "top-mlops-docker": 85,
            "top-mlops-ci": 75,
        },
        skill_weights={
            "Programming & Data Structures": 0.35,
            "Data Wrangling & Feature Engineering": 0.35,
            "MLOps, APIs & Cloud Deployment": 0.30,
        },
        typical_duration_weeks=18,
        minimum_weekly_hours=8,
    ),
    RoleRequirement(
        role_id="nlp-cv-specialist",
        title="Computer Vision & NLP Specialist",
        category="Deep Learning Research & Vision/Language",
        description="Researches and fine-tunes specialized visual transformers, multi-modal perception models, object detection backbones, and audio/speech models.",
        core_domains=[
            "Programming & Data Structures",
            "Applied Mathematics & Statistics",
            "Deep Learning & Neural Networks",
            "NLP, Attention & Transformers",
        ],
        required_skills={
            "Linear Algebra": 85,
            "Multivariate Calculus": 80,
            "Deep Learning Foundations": 85,
            "PyTorch Framework": 90,
            "Computer Vision": 85,
            "NLP Foundations": 85,
            "Transformer Architectures": 90,
        },
        required_topics={
            "top-math-la-matrices": 85,
            "top-math-la-eigen": 80,
            "top-dl-nn-found": 85,
            "top-dl-pytorch": 90,
            "top-dl-cnn": 85,
            "top-nlp-attention": 90,
        },
        skill_weights={
            "Deep Learning & Neural Networks": 0.35,
            "NLP, Attention & Transformers": 0.30,
            "Applied Mathematics & Statistics": 0.20,
            "Programming & Data Structures": 0.15,
        },
        typical_duration_weeks=24,
        minimum_weekly_hours=12,
    ),
    RoleRequirement(
        role_id="fullstack-ai-dev",
        title="Full Stack AI Developer",
        category="Full Stack & AI Integration",
        description="Bridges modern web frontends (React/Next.js), asynchronous backend APIs, streaming token responses, and intelligent agent systems.",
        core_domains=[
            "Programming & Data Structures",
            "Generative AI, RAG & LLMs",
            "MLOps, APIs & Cloud Deployment",
        ],
        required_skills={
            "Python Fundamentals": 90,
            "Python OOP & Architecture": 85,
            "RAG Architecture": 80,
            "Model Serving & APIs": 90,
            "Containerization & Deployment": 85,
        },
        required_topics={
            "top-py-oop": 85,
            "top-genai-rag": 80,
            "top-mlops-fastapi": 90,
            "top-mlops-docker": 85,
        },
        skill_weights={
            "MLOps, APIs & Cloud Deployment": 0.40,
            "Programming & Data Structures": 0.35,
            "Generative AI, RAG & LLMs": 0.25,
        },
        typical_duration_weeks=16,
        minimum_weekly_hours=8,
    ),
]

# ---------------------------------------------------------------------------
# 3. Curated, Verified Learning Resource Catalog
# ---------------------------------------------------------------------------

CURATED_RESOURCES: list[ResourceDefinition] = [
    ResourceDefinition(
        id="res-cs50-py",
        title="CS50's Introduction to Programming with Python",
        provider="Harvard University / edX",
        type="COURSE",
        url="https://cs50.harvard.edu/python/",
        duration_hours=14.0,
        difficulty="Beginner",
        target_topic_ids=["top-py-syntax", "top-py-funcs", "top-py-oop"],
        learning_outcomes=["Write robust Python functions", "Understand OOP design patterns", "Master unit testing with pytest"],
    ),
    ResourceDefinition(
        id="res-la-strang",
        title="MIT 18.06 Linear Algebra (Gilbert Strang)",
        provider="MIT OpenCourseWare",
        type="COURSE",
        url="https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        duration_hours=20.0,
        difficulty="Intermediate",
        target_topic_ids=["top-math-la-matrices", "top-math-la-eigen"],
        learning_outcomes=["Master matrix transformations", "Understand eigenspaces and SVD", "Apply vector algebra to ML"],
    ),
    ResourceDefinition(
        id="res-khan-calc",
        title="Multivariable Calculus & Gradients",
        provider="Khan Academy",
        type="COURSE",
        url="https://www.khanacademy.org/math/multivariable-calculus",
        duration_hours=12.0,
        difficulty="Intermediate",
        target_topic_ids=["top-math-calc-diff", "top-math-opt-convex"],
        learning_outcomes=["Calculate directional derivatives", "Compute Jacobians & Hessians", "Understand optimization curves"],
    ),
    ResourceDefinition(
        id="res-stat-quest",
        title="StatQuest: Machine Learning & Statistics",
        provider="StatQuest (Josh Starmer)",
        type="VIDEO",
        url="https://statquest.org/",
        duration_hours=8.0,
        difficulty="Intermediate",
        target_topic_ids=["top-math-prob-bayes", "top-ml-super-reg", "top-ml-trees"],
        learning_outcomes=["Intuitive grasp of probabilities", "Understand Decision Trees & Boosting", "Master ROC-AUC validation"],
    ),
    ResourceDefinition(
        id="res-dl-coursera",
        title="Deep Learning Specialization",
        provider="DeepLearning.AI (Andrew Ng)",
        type="COURSE",
        url="https://www.deeplearning.ai/courses/deep-learning-specialization/",
        duration_hours=28.0,
        difficulty="Intermediate",
        target_topic_ids=["top-dl-nn-found", "top-dl-pytorch", "top-dl-cnn"],
        learning_outcomes=["Build multi-layer neural networks", "Master hyperparameter tuning & regularization", "Implement CNN vision models"],
    ),
    ResourceDefinition(
        id="res-hf-nlp",
        title="Hugging Face NLP & Transformers Course",
        provider="Hugging Face",
        type="COURSE",
        url="https://huggingface.co/learn/nlp-course/",
        duration_hours=16.0,
        difficulty="Advanced",
        target_topic_ids=["top-nlp-tokenizers", "top-nlp-attention", "top-genai-lora"],
        learning_outcomes=["Master tokenization pipelines", "Fine-tune BERT & GPT models", "Implement Parameter-Efficient Fine-Tuning (PEFT)"],
    ),
    ResourceDefinition(
        id="res-qdrant-rag",
        title="Building Production RAG with Vector Search",
        provider="Qdrant Academy",
        type="DOCUMENTATION",
        url="https://qdrant.tech/documentation/",
        duration_hours=6.0,
        difficulty="Advanced",
        target_topic_ids=["top-genai-rag"],
        learning_outcomes=["Implement dense vector indexing", "Build hybrid search pipelines", "Deploy chunking & retrieval workflows"],
    ),
    ResourceDefinition(
        id="res-fastapi-prod",
        title="FastAPI Official Production Guide",
        provider="FastAPI / Tiangolo",
        type="DOCUMENTATION",
        url="https://fastapi.tiangolo.com/",
        duration_hours=5.0,
        difficulty="Intermediate",
        target_topic_ids=["top-mlops-fastapi", "top-mlops-docker"],
        learning_outcomes=["Build asynchronous model endpoints", "Dockerize Python ML microservices", "Implement production error handlers"],
    ),
]


def find_career_role(role_query: Optional[str]) -> RoleRequirement:
    """Finds the best matching canonical career role using fuzzy and synonym matching."""
    if not role_query:
        return CAREER_ROLES_BASE[0]
    q = role_query.lower().strip()

    # 1. Exact title or role_id match
    for r in CAREER_ROLES_BASE:
        if r.title.lower() == q or r.role_id.lower() == q:
            return r

    # 2. Key phrase & synonym mappings
    if any(k in q for k in ["data scien", "data scientist", "data-scientist", "analytics", "statistician"]):
        for r in CAREER_ROLES_BASE:
            if "data scientist" in r.title.lower():
                return r

    if any(k in q for k in ["llm", "generative", "genai", "rag", "prompt", "agent"]):
        for r in CAREER_ROLES_BASE:
            if "llm" in r.title.lower() or "application" in r.title.lower():
                return r

    if any(k in q for k in ["nlp", "vision", "cv", "speech", "multimodal"]):
        for r in CAREER_ROLES_BASE:
            if "nlp" in r.title.lower():
                return r

    if any(k in q for k in ["full stack", "fullstack", "web developer", "ai developer", "software engineer"]):
        for r in CAREER_ROLES_BASE:
            if "full stack" in r.title.lower():
                return r

    if any(k in q for k in ["data engineer", "etl", "big data", "spark", "pipeline engineer"]):
        for r in CAREER_ROLES_BASE:
            if "data engineer" in r.title.lower():
                return r

    if any(k in q for k in ["machine learning", "ml engineer", "mlops", "deep learning"]):
        for r in CAREER_ROLES_BASE:
            if "machine learning" in r.title.lower():
                return r

    # 3. Substring match fallback
    for r in CAREER_ROLES_BASE:
        if r.title.lower() in q or q in r.title.lower():
            return r

    return CAREER_ROLES_BASE[0]
