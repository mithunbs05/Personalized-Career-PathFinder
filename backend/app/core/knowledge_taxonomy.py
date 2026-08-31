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
    subdomain: Optional[str] = None
    specialization: Optional[str] = None
    engineering_domain: Optional[str] = None

class SkillDefinition(BaseModel):
    id: str
    name: str
    domain: str
    description: str
    topics: list[TopicDefinition]
    prerequisites: list[str] = Field(default_factory=list)  # skill IDs
    subdomain: Optional[str] = None
    engineering_domain: Optional[str] = None

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
    engineering_domain: Optional[str] = "Computer & IT"
    subdomain: Optional[str] = None
    specialization: Optional[str] = None

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
# Canonical 18-Domain Hierarchical Engineering Taxonomy Tree
# ---------------------------------------------------------------------------

ENGINEERING_TAXONOMY_TREE: dict[str, dict[str, list[str]]] = {
    "Computer & IT": {
        "Artificial Intelligence": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Generative AI & LLMs"],
        "Software Engineering": ["Full Stack Web", "Systems Programming", "Architecture & Clean Code", "API Engineering"],
        "Cybersecurity": ["Network Security", "Ethical Hacking & Pentesting", "Applied Cryptography", "Application Security & SOC"],
        "Cloud Computing": ["DevOps & SRE", "Kubernetes & Containers", "Infrastructure as Code", "Cloud Architecture"],
        "Data Engineering": ["Big Data Pipelines", "ETL & Orchestration", "Data Warehousing", "Stream Processing"],
    },
    "Electronics & Electrical": {
        "VLSI": ["Digital IC Design", "Verilog & VHDL", "Physical Design & Synthesis", "FPGA Prototyping"],
        "Embedded Systems": ["Embedded C/C++", "Microcontroller Architecture", "Real-Time Operating Systems (RTOS)", "Hardware Protocols", "Embedded Linux & Drivers"],
        "Power Systems": ["Power Generation & Smart Grids", "High Voltage Engineering", "Power Electronics & Inverters", "Renewable Energy Integration"],
        "Telecommunications": ["Wireless & 5G/6G Networks", "RF & Microwave Engineering", "Signal Processing & DSP", "Optical Fiber Communications"],
    },
    "Mechanical": {
        "Automotive": ["EV Powertrain & Battery Tech", "Vehicle Dynamics & Aerodynamics", "Internal Combustion & Hybrid", "Autonomous Vehicles & ADAS"],
        "Manufacturing": ["CNC Machining & Precision Engineering", "Additive Manufacturing (3D Printing)", "Quality Engineering & Six Sigma", "CAD/CAM Modeling"],
        "Mechatronics": ["Industrial Automation & PLC", "Sensors & Actuators Interfacing", "Microcontroller & Motor Drives", "Pneumatics & Hydraulics"],
        "Robotics": ["ROS & ROS2 Architecture", "Robot Kinematics & Dynamics", "Autonomous Navigation & SLAM", "Motion Planning & Control"],
    },
    "Civil & Infrastructure": {
        "Structural": ["Structural Analysis & FEA", "Reinforced Concrete & Steel Design", "Earthquake & Wind Engineering", "Bridge Engineering"],
        "Construction": ["BIM & Construction Project Management", "Estimating, Scheduling & Cost Control", "Construction Safety & Building Codes", "Heavy Civil Methods"],
        "Transportation": ["Traffic Flow & Transport Planning", "Highway & Pavement Design", "Rail & Transit Engineering", "Airport & Port Infrastructure"],
        "Geotechnical": ["Soil Mechanics & Foundation Design", "Slope Stability & Earth Retaining", "Tunneling & Underground Spaces", "Geo-Environmental Engineering"],
    },
    "Chemical & Process": {
        "Process Engineering": ["Chemical Thermodynamics & Kinetics", "Reaction Engineering & Catalysis", "Separation Processes", "Process Dynamics & Plant Safety"],
    },
    "Aerospace & Space": {
        "Aerospace Engineering": ["Aerodynamics & Compressible Flow", "Flight Dynamics, Stability & Control", "Rocket & Jet Propulsion", "Avionics & Spacecraft Systems", "Orbital Mechanics & Astrodynamics"],
    },
    "Biomedical & Biotechnology": {
        "Biomedical Engineering": ["Biomechanics & Orthopedics", "Medical Imaging & Diagnostic Signals", "Biomaterials & Tissue Engineering", "Bioinstrumentation & Neural Engineering"],
    },
    "Materials & Metallurgy": {
        "Materials Science": ["Physical Metallurgy & Phase Diagrams", "Polymer Science & Biomaterials", "Ceramics & Composite Materials", "Nanomaterials & Characterization"],
    },
    "Environmental & Sustainability": {
        "Environmental Engineering": ["Water & Wastewater Treatment", "Air Pollution Control & Carbon Capture", "Solid Waste Management & Circular Economy", "Environmental Impact Assessment"],
    },
    "Industrial & Manufacturing": {
        "Industrial Engineering": ["Operations Research & Supply Chain Optimization", "Lean Manufacturing & Kaizen Systems", "Facilities Layout & Logistics", "Ergonomics & Human Factors"],
    },
    "Mining & Earth": {
        "Mining & Geological Engineering": ["Rock Mechanics & Ground Control", "Mineral Exploration & Geophysics", "Surface & Underground Mining Systems", "Mine Ventilation & Safety"],
    },
    "Marine & Ocean": {
        "Ocean & Marine Engineering": ["Naval Architecture & Hydrodynamics", "Offshore Structures & Subsea Systems", "Marine Propulsion & Auxiliary Systems", "Autonomous Underwater Vehicles (AUVs)"],
    },
    "Nuclear": {
        "Nuclear Engineering": ["Reactor Physics & Neutronics", "Thermal Hydraulics & Plant Safety", "Radiation Protection & Shielding", "Nuclear Fuel Cycle & Fusion Systems"],
    },
    "Agricultural": {
        "Agricultural & Biosystems": ["Precision Agriculture & Smart Sensors", "Irrigation & Water Resources Engineering", "Farm Machinery & Agricultural Robotics", "Post-Harvest Processing Tech"],
    },
    "Textile": {
        "Textile Engineering": ["Fiber Science & Polymer Tech", "Yarn, Weaving & Knitting Manufacturing", "Technical Textiles & Smart Wearables", "Dyeing, Printing & Finishing Chemistry"],
    },
    "Food": {
        "Food Process Engineering": ["Food Microbiology & Safety (HACCP)", "Thermal & Aseptic Processing", "Food Packaging & Preservation", "Biochemical Separation & Rheology"],
    },
    "Energy": {
        "Energy & Renewable Systems": ["Solar Photovoltaics & Thermal Systems", "Wind Turbine Design & Aerodynamics", "Battery Energy Storage & Fuel Cells", "Smart Grid Integration & Energy Audit"],
    },
    "Architectural & Building": {
        "Building & Architectural Engineering": ["Building Information Modeling (BIM)", "HVAC, Lighting & Building Services", "Sustainable Green Architecture (LEED)", "Building Acoustics & Enclosure Physics"],
    },
}

def get_engineering_domains() -> list[str]:
    """Returns all 18 top-level engineering domains."""
    return list(ENGINEERING_TAXONOMY_TREE.keys())

def get_subdomains_for_domain(domain_name: str) -> list[str]:
    """Returns all subdomains under a given engineering domain."""
    return list(ENGINEERING_TAXONOMY_TREE.get(domain_name, {}).keys())

def get_specializations_for_subdomain(domain_name: str, subdomain_name: str) -> list[str]:
    """Returns all specializations under a given engineering subdomain."""
    return ENGINEERING_TAXONOMY_TREE.get(domain_name, {}).get(subdomain_name, [])

def resolve_domain_hierarchy(query: str) -> dict[str, str]:
    """Maps any role or skill string to its canonical Engineering Domain, Subdomain, and Specialization."""
    q = query.lower().strip()
    
    # 1. Exact or keyword matching across hierarchy
    for dom, sub_map in ENGINEERING_TAXONOMY_TREE.items():
        if dom.lower() in q:
            first_sub = next(iter(sub_map.keys()), "General")
            return {"domain": dom, "subdomain": first_sub, "specialization": sub_map.get(first_sub, ["Core"])[0]}
            
        for sub, specs in sub_map.items():
            if sub.lower() in q:
                return {"domain": dom, "subdomain": sub, "specialization": specs[0] if specs else sub}
            for sp in specs:
                if sp.lower() in q or q in sp.lower():
                    return {"domain": dom, "subdomain": sub, "specialization": sp}

    # Keyword heuristics for primary domains
    if any(k in q for k in ["embed", "firmware", "mcu", "arm", "rtos", "vlsi", "fpga", "power system", "telecom", "circuit"]):
        return {"domain": "Electronics & Electrical", "subdomain": "Embedded Systems" if "embed" in q else "VLSI", "specialization": "Embedded Firmware"}
    if any(k in q for k in ["robot", "autonom", "slam", "ros", "automotive", "car", "vehicle", "cad", "cam", "cnc", "mechatronic"]):
        return {"domain": "Mechanical", "subdomain": "Robotics" if "robot" in q else "Automotive", "specialization": "Robotics & Control"}
    if any(k in q for k in ["civil", "structur", "concrete", "steel", "bridge", "traffic", "highway", "geotech", "soil", "construct"]):
        return {"domain": "Civil & Infrastructure", "subdomain": "Structural" if "struct" in q else "Construction", "specialization": "Structural Engineering"}
    if any(k in q for k in ["aero", "space", "flight", "rocket", "orbit", "avionics"]):
        return {"domain": "Aerospace & Space", "subdomain": "Aerospace Engineering", "specialization": "Avionics & Spacecraft"}
    if any(k in q for k in ["biomed", "biotech", "medical", "neural", "biomechanic"]):
        return {"domain": "Biomedical & Biotechnology", "subdomain": "Biomedical Engineering", "specialization": "Biomedical Devices"}
    if any(k in q for k in ["chemical", "thermo", "reactor", "catalysis", "distill"]):
        return {"domain": "Chemical & Process", "subdomain": "Process Engineering", "specialization": "Process Engineering"}
    if any(k in q for k in ["solar", "wind", "energy", "battery", "grid"]):
        return {"domain": "Energy", "subdomain": "Energy & Renewable Systems", "specialization": "Solar & Storage"}

    return {"domain": "Computer & IT", "subdomain": "Artificial Intelligence", "specialization": "Machine Learning"}

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
    "Embedded Systems & Low-Level Programming",
    "Microcontrollers & Hardware Interfacing",
    "Real-Time Operating Systems (RTOS)",
    "Cybersecurity & Network Defense",
    "Cloud Infrastructure, DevOps & SRE",
    "Robotics, Kinematics & Control Systems",
    "Mobile Application Development",
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

    # 9. Embedded Systems & Low-Level Programming (Domain 9)
    TopicDefinition(
        id="top-emb-c-pointers",
        title="Embedded C, Memory Layout & Pointer Arithmetic",
        skill_id="sk-emb-c",
        skill_name="Embedded C/C++ Programming",
        domain="Embedded Systems & Low-Level Programming",
        difficulty="Beginner",
        estimated_hours=10.0,
        prerequisites=[],
        key_concepts=["Stack vs Heap vs Flash", "Volatile keyword & Bitwise operations", "Struct packing & Alignment", "Direct memory access with pointers"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-emb-mcu-arch",
        title="ARM Cortex-M Architecture, Registers & Interrupts",
        skill_id="sk-emb-mcu",
        skill_name="Microcontroller Architecture",
        domain="Embedded Systems & Low-Level Programming",
        difficulty="Intermediate",
        estimated_hours=12.0,
        prerequisites=["top-emb-c-pointers"],
        key_concepts=["Memory-mapped I/O", "Nested Vectored Interrupt Controller (NVIC)", "Clock trees & Power modes", "Boot sequence & Linker scripts"],
        benchmark_mastery=80,
    ),

    # 10. Microcontrollers & Hardware Interfacing (Domain 10)
    TopicDefinition(
        id="top-emb-protocols",
        title="Hardware Communication Buses (I2C, SPI, UART, CAN)",
        skill_id="sk-emb-protocols",
        skill_name="Hardware Protocols & Interfacing",
        domain="Microcontrollers & Hardware Interfacing",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-emb-mcu-arch"],
        key_concepts=["Timing diagrams & Clock polarity", "I2C master/slave addressing", "SPI high-speed DMA transfers", "CAN bus arbitration & Error handling"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-emb-peripherals",
        title="ADC, PWM, Timers & Sensor Interfacing",
        skill_id="sk-emb-peripherals",
        skill_name="Peripheral Interfacing",
        domain="Microcontrollers & Hardware Interfacing",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-emb-protocols"],
        key_concepts=["Timer prescalers & Input capture", "PWM motor & LED control", "ADC sampling & Anti-aliasing", "Oscilloscope & Logic analyzer debugging"],
        benchmark_mastery=80,
    ),

    # 11. Real-Time Operating Systems (RTOS) & Drivers (Domain 11)
    TopicDefinition(
        id="top-emb-rtos",
        title="FreeRTOS Multitasking, Semaphores & Queues",
        skill_id="sk-emb-rtos",
        skill_name="Real-Time Operating Systems (RTOS)",
        domain="Real-Time Operating Systems (RTOS)",
        difficulty="Advanced",
        estimated_hours=14.0,
        prerequisites=["top-emb-mcu-arch"],
        key_concepts=["Preemptive task scheduling", "Mutexes, Semaphores & Priority Inversion", "Message queues & Event groups", "Deterministic hard real-time constraints"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-emb-linux-drivers",
        title="Embedded Linux, Device Tree & Kernel Drivers",
        skill_id="sk-emb-linux",
        skill_name="Embedded Linux & Drivers",
        domain="Real-Time Operating Systems (RTOS)",
        difficulty="Advanced",
        estimated_hours=16.0,
        prerequisites=["top-emb-rtos"],
        key_concepts=["Yocto / Buildroot rootfs", "Character device drivers", "Device Tree bindings (.dts)", "U-Boot bootloader customization"],
        benchmark_mastery=75,
    ),

    # 12. Cybersecurity & Network Defense (Domain 12)
    TopicDefinition(
        id="top-sec-net-found",
        title="Network Protocols, Packet Analysis & Wireshark",
        skill_id="sk-sec-net",
        skill_name="Network Security",
        domain="Cybersecurity & Network Defense",
        difficulty="Beginner",
        estimated_hours=10.0,
        prerequisites=[],
        key_concepts=["TCP/IP 4-way handshake", "DNS, DHCP & ARP spoofing", "Wireshark packet filtering", "Firewalls & Port scanning with Nmap"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-sec-crypto",
        title="Applied Cryptography, PKI, Hashes & TLS",
        skill_id="sk-sec-crypto",
        skill_name="Applied Cryptography",
        domain="Cybersecurity & Network Defense",
        difficulty="Intermediate",
        estimated_hours=10.0,
        prerequisites=["top-sec-net-found"],
        key_concepts=["Symmetric (AES) vs Asymmetric (RSA/ECC)", "SHA-256 & Salted hashing", "Digital certificates & X.509 PKI", "TLS 1.3 key exchange"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-sec-web-pentest",
        title="Web Application Security & OWASP Top 10",
        skill_id="sk-sec-pentest",
        skill_name="Ethical Hacking & Penetration Testing",
        domain="Cybersecurity & Network Defense",
        difficulty="Advanced",
        estimated_hours=14.0,
        prerequisites=["top-sec-crypto"],
        key_concepts=["SQL Injection (SQLi) & XSS", "CSRF & SSRF exploitation", "Burp Suite intercepting proxy", "Authentication bypass & Broken access control"],
        benchmark_mastery=85,
    ),

    # 13. Cloud Infrastructure, DevOps & SRE (Domain 13)
    TopicDefinition(
        id="top-ops-linux-sys",
        title="Linux Systems Administration, Shell & Networking",
        skill_id="sk-ops-linux",
        skill_name="Linux Systems Administration",
        domain="Cloud Infrastructure, DevOps & SRE",
        difficulty="Beginner",
        estimated_hours=10.0,
        prerequisites=[],
        key_concepts=["Process management (ps, top, systemd)", "File permissions (chmod, chown)", "Bash scripting & Cron automation", "SSH key authentication & iptables"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-ops-k8s",
        title="Kubernetes Architecture, Pods & Helm Charts",
        skill_id="sk-ops-k8s",
        skill_name="Kubernetes & Container Orchestration",
        domain="Cloud Infrastructure, DevOps & SRE",
        difficulty="Advanced",
        estimated_hours=14.0,
        prerequisites=["top-ops-linux-sys", "top-mlops-docker"],
        key_concepts=["Pods, Deployments & Services", "Ingress controllers & TLS", "ConfigMaps & Secrets", "Helm chart package management"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-ops-iac-tf",
        title="Infrastructure as Code (IaC) with Terraform & AWS",
        skill_id="sk-ops-iac",
        skill_name="Infrastructure as Code",
        domain="Cloud Infrastructure, DevOps & SRE",
        difficulty="Advanced",
        estimated_hours=12.0,
        prerequisites=["top-ops-k8s"],
        key_concepts=["Terraform HCL syntax & State locking", "AWS VPC, EC2, IAM & S3 modules", "Multi-environment provisioning", "CI/CD automated plan/apply with GitHub Actions"],
        benchmark_mastery=80,
    ),

    # 14. Robotics, Kinematics & Control Systems (Domain 14)
    TopicDefinition(
        id="top-rob-ros2",
        title="ROS2 Core Architecture, Nodes, Topics & Services",
        skill_id="sk-rob-ros",
        skill_name="ROS/ROS2 Framework",
        domain="Robotics, Kinematics & Control Systems",
        difficulty="Beginner",
        estimated_hours=12.0,
        prerequisites=[],
        key_concepts=["DDS communication middleware", "Publishers, Subscribers & Services", "ROS2 Actions & Custom messages", "Launch files & Parameter management"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-rob-kinematics",
        title="Robot Kinematics, Coordinate Transforms (TF2) & URDF",
        skill_id="sk-rob-kinematics",
        skill_name="Robot Kinematics & Modeling",
        domain="Robotics, Kinematics & Control Systems",
        difficulty="Intermediate",
        estimated_hours=12.0,
        prerequisites=["top-rob-ros2", "top-math-la-matrices"],
        key_concepts=["Forward & Inverse Kinematics (DH parameters)", "TF2 transform tree & Quaternions", "URDF / Xacro robot modeling", "Gazebo physics simulation"],
        benchmark_mastery=80,
    ),
    TopicDefinition(
        id="top-rob-slam",
        title="Sensor Fusion, SLAM & Autonomous Navigation",
        skill_id="sk-rob-nav",
        skill_name="SLAM & Autonomous Navigation",
        domain="Robotics, Kinematics & Control Systems",
        difficulty="Advanced",
        estimated_hours=16.0,
        prerequisites=["top-rob-kinematics"],
        key_concepts=["LiDAR & IMU sensor fusion (Extended Kalman Filter)", "2D/3D SLAM mapping (Cartographer)", "Nav2 costmaps & Global/Local path planners", "Obstacle avoidance & Recovery behaviors"],
        benchmark_mastery=75,
    ),

    # 15. Mobile Application Development (Domain 15)
    TopicDefinition(
        id="top-mob-swift-kt",
        title="Native Mobile Architecture: SwiftUI & Jetpack Compose",
        skill_id="sk-mob-ui",
        skill_name="Native Mobile UI",
        domain="Mobile Application Development",
        difficulty="Beginner",
        estimated_hours=12.0,
        prerequisites=[],
        key_concepts=["Declarative UI state paradigms", "Navigation stacks & Deep linking", "Async networking & JSON decoding", "Lifecycle events & Background tasks"],
        benchmark_mastery=85,
    ),
    TopicDefinition(
        id="top-mob-offline",
        title="Offline Data Persistence, SQLite & Architecture Patterns",
        skill_id="sk-mob-arch",
        skill_name="Mobile Architecture & Persistence",
        domain="Mobile Application Development",
        difficulty="Intermediate",
        estimated_hours=12.0,
        prerequisites=["top-mob-swift-kt"],
        key_concepts=["Room DB (Android) / CoreData / SwiftData (iOS)", "Clean Architecture (MVVM/MVI)", "Repository pattern & Cache synchronization", "Push notifications & App Store deployment"],
        benchmark_mastery=80,
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
    RoleRequirement(
        role_id="embedded-system-engineer",
        title="Embedded Systems & Firmware Engineer",
        category="Embedded, Firmware & IoT",
        description="Develops bare-metal firmware, RTOS-driven multi-threaded embedded applications, device drivers, and low-power IoT hardware interfaces.",
        core_domains=[
            "Embedded Systems & Low-Level Programming",
            "Microcontrollers & Hardware Interfacing",
            "Real-Time Operating Systems (RTOS)",
        ],
        required_skills={
            "Embedded C/C++ Programming": 90,
            "Microcontroller Architecture": 85,
            "Hardware Protocols & Interfacing": 85,
            "Peripheral Interfacing": 80,
            "Real-Time Operating Systems (RTOS)": 85,
            "Embedded Linux & Drivers": 75,
        },
        required_topics={
            "top-emb-c-pointers": 90,
            "top-emb-mcu-arch": 85,
            "top-emb-protocols": 85,
            "top-emb-peripherals": 80,
            "top-emb-rtos": 85,
            "top-emb-linux-drivers": 75,
        },
        skill_weights={
            "Embedded Systems & Low-Level Programming": 0.35,
            "Microcontrollers & Hardware Interfacing": 0.35,
            "Real-Time Operating Systems (RTOS)": 0.30,
        },
        typical_duration_weeks=20,
        minimum_weekly_hours=10,
    ),
    RoleRequirement(
        role_id="cybersecurity-analyst",
        title="Cybersecurity & Penetration Testing Specialist",
        category="Security, Defense & Ethical Hacking",
        description="Defends networks and applications, audits cryptographic systems, performs ethical vulnerability assessments, and orchestrates incident response.",
        core_domains=[
            "Cybersecurity & Network Defense",
            "Cloud Infrastructure, DevOps & SRE",
        ],
        required_skills={
            "Network Security": 90,
            "Applied Cryptography": 85,
            "Ethical Hacking & Penetration Testing": 85,
            "Linux Systems Administration": 80,
        },
        required_topics={
            "top-sec-net-found": 90,
            "top-sec-crypto": 85,
            "top-sec-web-pentest": 85,
            "top-ops-linux-sys": 80,
        },
        skill_weights={
            "Cybersecurity & Network Defense": 0.70,
            "Cloud Infrastructure, DevOps & SRE": 0.30,
        },
        typical_duration_weeks=18,
        minimum_weekly_hours=10,
    ),
    RoleRequirement(
        role_id="devops-engineer",
        title="DevOps & Cloud Platform Engineer",
        category="Infrastructure, Cloud & SRE",
        description="Automates resilient cloud infrastructure with Terraform, orchestrates scalable container fleets on Kubernetes, and builds high-velocity CI/CD pipelines.",
        core_domains=[
            "Cloud Infrastructure, DevOps & SRE",
            "MLOps, APIs & Cloud Deployment",
        ],
        required_skills={
            "Linux Systems Administration": 90,
            "Containerization & Deployment": 85,
            "Kubernetes & Container Orchestration": 85,
            "Infrastructure as Code": 85,
        },
        required_topics={
            "top-ops-linux-sys": 90,
            "top-mlops-docker": 85,
            "top-ops-k8s": 85,
            "top-ops-iac-tf": 85,
        },
        skill_weights={
            "Cloud Infrastructure, DevOps & SRE": 0.70,
            "MLOps, APIs & Cloud Deployment": 0.30,
        },
        typical_duration_weeks=18,
        minimum_weekly_hours=10,
    ),
    RoleRequirement(
        role_id="robotics-engineer",
        title="Robotics & Autonomous Systems Engineer",
        category="Robotics, Autonomy & Control",
        description="Builds autonomous navigation stacks, solves forward/inverse kinematics, models physics in Gazebo, and interfaces real-time sensor fusion with ROS2.",
        core_domains=[
            "Robotics, Kinematics & Control Systems",
            "Embedded Systems & Low-Level Programming",
            "Applied Mathematics & Statistics",
        ],
        required_skills={
            "ROS/ROS2 Framework": 90,
            "Robot Kinematics & Modeling": 85,
            "SLAM & Autonomous Navigation": 80,
            "Embedded C/C++ Programming": 80,
            "Linear Algebra": 75,
        },
        required_topics={
            "top-rob-ros2": 90,
            "top-rob-kinematics": 85,
            "top-rob-slam": 80,
            "top-emb-c-pointers": 80,
            "top-math-la-matrices": 75,
        },
        skill_weights={
            "Robotics, Kinematics & Control Systems": 0.50,
            "Embedded Systems & Low-Level Programming": 0.30,
            "Applied Mathematics & Statistics": 0.20,
        },
        typical_duration_weeks=22,
        minimum_weekly_hours=10,
    ),
    RoleRequirement(
        role_id="mobile-developer",
        title="Mobile Application Engineer (iOS & Android)",
        category="Mobile & Client Architecture",
        description="Creates fluid native mobile applications with SwiftUI and Jetpack Compose, architecting offline-first repositories and high-performance client state.",
        core_domains=[
            "Mobile Application Development",
            "Programming & Data Structures",
        ],
        required_skills={
            "Native Mobile UI": 90,
            "Mobile Architecture & Persistence": 85,
            "Python Fundamentals": 75,
        },
        required_topics={
            "top-mob-swift-kt": 90,
            "top-mob-offline": 85,
            "top-py-oop": 75,
        },
        skill_weights={
            "Mobile Application Development": 0.70,
            "Programming & Data Structures": 0.30,
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
    ResourceDefinition(
        id="res-emb-c-course",
        title="Modern Embedded Systems Programming (Miro Samek)",
        provider="Quantum Leaps / YouTube",
        type="COURSE",
        url="https://www.youtube.com/playlist?list=PLPW8O6W-1chwyTzI3BHwBLbGQoPFxPAPM",
        duration_hours=18.0,
        difficulty="Intermediate",
        target_topic_ids=["top-emb-c-pointers", "top-emb-mcu-arch"],
        learning_outcomes=["Understand ARM Cortex-M architecture", "Write bare-metal register drivers", "Master interrupt servicing and state machines"],
    ),
    ResourceDefinition(
        id="res-freertos-guide",
        title="FreeRTOS Official Reference Manual & Kernel Guide",
        provider="FreeRTOS / AWS",
        type="DOCUMENTATION",
        url="https://www.freertos.org/Documentation/RTOS_book.html",
        duration_hours=12.0,
        difficulty="Advanced",
        target_topic_ids=["top-emb-rtos"],
        learning_outcomes=["Master preemptive task scheduling", "Design thread-safe queues and mutexes", "Avoid priority inversion and deadlocks"],
    ),
    ResourceDefinition(
        id="res-sec-owasp",
        title="OWASP Web Security Testing Guide & Top 10",
        provider="OWASP Foundation",
        type="DOCUMENTATION",
        url="https://owasp.org/www-project-web-security-testing-guide/",
        duration_hours=14.0,
        difficulty="Advanced",
        target_topic_ids=["top-sec-web-pentest", "top-sec-crypto"],
        learning_outcomes=["Identify SQLi, XSS, and SSRF flaws", "Perform authenticated security audits with Burp Suite", "Implement defense-in-depth authorization"],
    ),
    ResourceDefinition(
        id="res-k8s-docs",
        title="Kubernetes Official Concepts & Production Architecture",
        provider="Cloud Native Computing Foundation (CNCF)",
        type="DOCUMENTATION",
        url="https://kubernetes.io/docs/concepts/",
        duration_hours=15.0,
        difficulty="Advanced",
        target_topic_ids=["top-ops-k8s", "top-ops-iac-tf"],
        learning_outcomes=["Deploy production multi-container pods", "Manage Ingress controllers and TLS certificates", "Automate cluster upgrades with Helm"],
    ),
    ResourceDefinition(
        id="res-ros2-docs",
        title="ROS 2 Official Documentation & Nav2 Navigation Stack",
        provider="Open Robotics",
        type="DOCUMENTATION",
        url="https://docs.ros.org/en/humble/",
        duration_hours=16.0,
        difficulty="Intermediate",
        target_topic_ids=["top-rob-ros2", "top-rob-kinematics", "top-rob-slam"],
        learning_outcomes=["Architect modular ROS2 nodes and DDS topics", "Build 2D/3D maps with Cartographer SLAM", "Configure Nav2 path planning pipelines"],
    ),
]


def get_topic_by_id(topic_id: str) -> Optional[TopicDefinition]:
    """Finds a topic by ID across static taxonomy and dynamically synthesized cache."""
    # 1. Static topics
    for t in TAXONOMY_TOPICS:
        if t.id == topic_id:
            return t
    # 2. Dynamic synthesized topics
    try:
        from app.services.ai_curriculum_service import get_synthesized_topic
        dyn = get_synthesized_topic(topic_id)
        if dyn:
            return dyn
    except Exception:
        pass
    return None


def get_all_taxonomy_topics() -> list[TopicDefinition]:
    """Returns combined list of static taxonomy topics and dynamically synthesized topics."""
    topics = list(TAXONOMY_TOPICS)
    try:
        from app.services.ai_curriculum_service import get_all_synthesized_topics
        topics.extend(get_all_synthesized_topics())
    except Exception:
        pass
    return topics


def get_all_taxonomy_resources() -> list[ResourceDefinition]:
    """Returns combined list of static curated resources and dynamic synthesized resources."""
    res = list(CURATED_RESOURCES)
    try:
        from app.services.ai_curriculum_service import get_all_synthesized_resources
        res.extend(get_all_synthesized_resources())
    except Exception:
        pass
    return res


def find_career_role(role_query: Optional[str], fallback: bool = True) -> Optional[RoleRequirement]:
    """Finds the best matching canonical career role using fuzzy and synonym matching."""
    if not role_query:
        return CAREER_ROLES_BASE[0] if fallback else None
    q = role_query.lower().strip()

    # 1. Exact title or role_id match
    for r in CAREER_ROLES_BASE:
        if r.title.lower() == q or r.role_id.lower() == q:
            return r

    # 2. Check dynamic synthesized role cache
    try:
        from app.services.ai_curriculum_service import _SYNTHESIZED_ROLE_CACHE
        if q in _SYNTHESIZED_ROLE_CACHE:
            return _SYNTHESIZED_ROLE_CACHE[q]
    except Exception:
        pass

    # 3. Key phrase & synonym mappings across all engineering domains
    if any(k in q for k in ["embed", "firmware", "microcontroller", "arm", "rtos", "iot", "bare metal", "device driver"]):
        for r in CAREER_ROLES_BASE:
            if "embedded" in r.role_id:
                return r

    if any(k in q for k in ["cyber", "security", "infosec", "penetration", "pentest", "soc", "ethical hack", "crypto"]):
        for r in CAREER_ROLES_BASE:
            if "cybersecurity" in r.role_id or "security" in r.role_id:
                return r

    if any(k in q for k in ["devops", "cloud", "sre", "kubernetes", "k8s", "terraform", "infrastructure", "platform engineer"]):
        for r in CAREER_ROLES_BASE:
            if "devops" in r.role_id:
                return r

    if any(k in q for k in ["robot", "autonom", "slam", "ros", "kinematic", "drone", "uav"]):
        for r in CAREER_ROLES_BASE:
            if "robotics" in r.role_id:
                return r

    if any(k in q for k in ["mobile", "ios", "android", "swift", "kotlin", "flutter", "react native"]):
        for r in CAREER_ROLES_BASE:
            if "mobile" in r.role_id:
                return r

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

    if any(k in q for k in ["full stack", "fullstack", "web developer", "frontend developer", "backend developer", "mern", "mean stack"]):
        for r in CAREER_ROLES_BASE:
            if "full stack" in r.title.lower():
                return r

    if any(k in q for k in ["data engineer", "etl engineer", "big data engineer", "spark engineer", "pipeline engineer"]):
        for r in CAREER_ROLES_BASE:
            if "data engineer" in r.title.lower():
                return r

    if any(k in q for k in ["machine learning engineer", "ml engineer", "mlops engineer", "deep learning engineer"]):
        for r in CAREER_ROLES_BASE:
            if "machine learning" in r.title.lower():
                return r

    # 4. Substring match for full title
    for r in CAREER_ROLES_BASE:
        if r.title.lower() in q:
            return r

    return CAREER_ROLES_BASE[0] if fallback else None


async def find_or_synthesize_career_role(role_query: Optional[str]) -> RoleRequirement:
    """Finds matching role or synthesizes a new one dynamically via AI LLM."""
    matched = find_career_role(role_query, fallback=False)
    if matched:
        return matched

    if role_query:
        try:
            from app.services.ai_curriculum_service import synthesize_dynamic_career_role
            syn = await synthesize_dynamic_career_role(role_query)
            if syn:
                return syn
        except Exception as e:
            pass

    return CAREER_ROLES_BASE[0]

