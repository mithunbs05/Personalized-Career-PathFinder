"""
Adaptive Assessment Engine — Confidence-Aware Diagnostic & Continuous Evaluation.

Selects dynamic assessment questions targeting topics with lowest confidence (highest uncertainty).
Stops dynamically when learner knowledge state achieves required certainty threshold.
Performs authoritative server-side scoring and updates knowledge state evidence models.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.knowledge_taxonomy import TAXONOMY_TOPICS, TopicDefinition
from app.services.knowledge_state_service import (
    get_or_init_knowledge_state,
    update_topic_evidence,
    TopicKnowledgeState,
)
from app.services.mentor_service import save_assessment_to_db
from app.models.mentor import QuestionResult

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Question Item Definition & Question Bank
# ---------------------------------------------------------------------------

class DiagnosticQuestion(BaseModel):
    id: str
    topic_id: str
    topic_title: str
    skill_name: str
    domain: str
    difficulty: str  # Beginner, Intermediate, Advanced
    text: str
    options: list[str]
    correct_option: int  # 0-indexed, kept server-side
    explanation: str

DIAGNOSTIC_QUESTION_BANK: list[DiagnosticQuestion] = [
    DiagnosticQuestion(
        id="q-py-1",
        topic_id="top-py-funcs",
        topic_title="Functions, Scope & Error Handling",
        skill_name="Python Fundamentals",
        domain="Programming & Data Structures",
        difficulty="Beginner",
        text="What is the output of `[x**2 for x in range(5) if x % 2 == 1]` in Python?",
        options=["[1, 9]", "[0, 4, 16]", "[1, 4, 9]", "[1, 9, 25]"],
        correct_option=0,
        explanation="range(5) produces [0, 1, 2, 3, 4]. The odd values are 1 and 3, whose squares are 1 and 9.",
    ),
    DiagnosticQuestion(
        id="q-py-2",
        topic_id="top-py-oop",
        topic_title="Object-Oriented Programming (OOP)",
        skill_name="Python OOP & Architecture",
        domain="Programming & Data Structures",
        difficulty="Intermediate",
        text="In Python OOP, what is the primary purpose of the `super().__init__()` call in a subclass constructor?",
        options=[
            "To invoke and initialize attributes defined in the parent superclass",
            "To convert the class into a singleton instance",
            "To override all private methods in the parent class",
            "To prevent multiple inheritance conflicts",
        ],
        correct_option=0,
        explanation="`super().__init__()` ensures that the base class constructor executes properly to set up inherited state.",
    ),
    DiagnosticQuestion(
        id="q-math-1",
        topic_id="top-math-la-matrices",
        topic_title="Matrix Operations & Vector Spaces",
        skill_name="Linear Algebra",
        domain="Applied Mathematics & Statistics",
        difficulty="Intermediate",
        text="If matrix A has shape (4, 3) and matrix B has shape (3, 5), what is the shape of their product A @ B?",
        options=["(4, 5)", "(3, 3)", "(5, 4)", "Matrix multiplication is undefined"],
        correct_option=0,
        explanation="Inner dimensions match (3 == 3), yielding outer dimensions (4, 5).",
    ),
    DiagnosticQuestion(
        id="q-math-2",
        topic_id="top-math-opt-convex",
        topic_title="Convexity & Optimization Algorithms",
        skill_name="Optimization",
        domain="Applied Mathematics & Statistics",
        difficulty="Advanced",
        text="Which mathematical property guarantees that every local minimum of a function is also a global minimum?",
        options=[
            "Strict convexity over a convex domain",
            "Continuous differentiability of order 3",
            "Non-zero determinant of the Jacobian",
            "Bounded Lipschitz continuity",
        ],
        correct_option=0,
        explanation="Convex optimization guarantees that any local stationary minimum is a global minimum.",
    ),
    DiagnosticQuestion(
        id="q-data-1",
        topic_id="top-data-numpy",
        topic_title="NumPy Vectorization & Array Broadcasting",
        skill_name="NumPy Data Manipulation",
        domain="Data Wrangling & Feature Engineering",
        difficulty="Intermediate",
        text="What occurs when broadcasting an array of shape (4, 1) with an array of shape (1, 5) in NumPy?",
        options=[
            "A resulting broadcasted array of shape (4, 5)",
            "A ValueError due to mismatched dimensions",
            "An array of shape (4, 1, 5)",
            "The operation fails unless explicitly reshaped",
        ],
        correct_option=0,
        explanation="Both dimensions stretch along singleton axes (1 -> 5 and 1 -> 4) to yield (4, 5).",
    ),
    DiagnosticQuestion(
        id="q-ml-1",
        topic_id="top-ml-super-reg",
        topic_title="Supervised Learning: Linear & Logistic Regression",
        skill_name="Supervised Learning",
        domain="Machine Learning Foundations",
        difficulty="Intermediate",
        text="What is the key difference between L1 (Lasso) and L2 (Ridge) regularization in regression models?",
        options=[
            "L1 encourages sparse coefficients (feature selection); L2 shrinks weights smoothly towards zero",
            "L1 minimizes hinge loss; L2 minimizes binary cross-entropy",
            "L1 only applies to neural networks; L2 applies to linear models",
            "L1 prevents underfitting; L2 prevents overfitting",
        ],
        correct_option=0,
        explanation="L1 penalty adds absolute value of coefficients (|w|), driving irrelevant weights exactly to zero.",
    ),
    DiagnosticQuestion(
        id="q-ml-2",
        topic_id="top-ml-eval",
        topic_title="Cross-Validation, ROC-AUC & Error Analysis",
        skill_name="Model Evaluation & Validation",
        domain="Machine Learning Foundations",
        difficulty="Intermediate",
        text="When evaluating a model on an imbalanced dataset (99% negative, 1% positive), why is raw Accuracy misleading?",
        options=[
            "A naive model predicting always negative achieves 99% accuracy while detecting 0% of positive cases",
            "Accuracy cannot be computed with binary thresholds",
            "Accuracy always overestimates false positive rates",
            "Accuracy depends on the learning rate parameter",
        ],
        correct_option=0,
        explanation="Class imbalance causes raw accuracy to be dominated by the majority class; PR-AUC and F1-Score are required.",
    ),
    DiagnosticQuestion(
        id="q-dl-1",
        topic_id="top-dl-nn-found",
        topic_title="Feedforward Neural Networks & Backpropagation",
        skill_name="Deep Learning Foundations",
        domain="Deep Learning & Neural Networks",
        difficulty="Intermediate",
        text="How does the ReLU activation function (f(x) = max(0, x)) help mitigate the vanishing gradient problem compared to Sigmoid?",
        options=[
            "Its gradient is constant (1) for all positive inputs, preventing exponential decay across deep layers",
            "It maps all activations to a normalized Gaussian distribution",
            "It computes second-order Hessian curvatures automatically",
            "It eliminates the need for backpropagation",
        ],
        correct_option=0,
        explanation="Sigmoid saturates at 0 and 1 with near-zero derivatives; ReLU maintains a unit derivative for all positive activations.",
    ),
    DiagnosticQuestion(
        id="q-nlp-1",
        topic_id="top-nlp-attention",
        topic_title="Scaled Dot-Product Attention & Self-Attention",
        skill_name="Transformer Architectures",
        domain="NLP, Attention & Transformers",
        difficulty="Advanced",
        text="In Transformer self-attention, why is the dot product of Query and Key scaled by 1 / sqrt(d_k)?",
        options=[
            "To prevent the dot products from growing excessively large for large dimensions, which would push softmax into regions with tiny gradients",
            "To convert the attention weights into probability distributions",
            "To enforce orthogonal rotary positional embeddings",
            "To ensure symmetry in the attention matrix",
        ],
        correct_option=0,
        explanation="Scaling by 1/sqrt(d_k) stabilizes the variance of the dot product to 1, preventing softmax saturation.",
    ),
    DiagnosticQuestion(
        id="q-genai-1",
        topic_id="top-genai-rag",
        topic_title="Retrieval-Augmented Generation (RAG) & Vector DBs",
        skill_name="RAG Architecture",
        domain="Generative AI, RAG & LLMs",
        difficulty="Advanced",
        text="What is the primary benefit of Hybrid Search (combining Dense Vector search and Sparse BM25 keyword search) in RAG pipelines?",
        options=[
            "It captures both semantic conceptual similarity and exact keyword/term matches (such as product IDs or acronyms)",
            "It compresses embedding vectors by 75%",
            "It removes the need for vector databases",
            "It automatically fine-tunes the generator model",
        ],
        correct_option=0,
        explanation="Hybrid search resolves vector blind spots on exact keywords/identifiers while retaining deep semantic matching.",
    ),
]

# ---------------------------------------------------------------------------
# Adaptive Diagnostic Question Selector
# ---------------------------------------------------------------------------

async def select_adaptive_diagnostic_questions(
    user_id: str,
    target_role_title: str = "Machine Learning Engineer",
    max_questions: int = 6,
    target_confidence_threshold: float = 0.60,
) -> list[dict[str, Any]]:
    """
    Selects diagnostic questions targeting topics with lowest confidence (highest uncertainty).
    Stops dynamically when sufficient confidence coverage for target role is achieved.
    """
    from app.core.knowledge_taxonomy import CAREER_ROLES_BASE
    
    states = await get_or_init_knowledge_state(user_id)
    role_def = next((r for r in CAREER_ROLES_BASE if r.title.lower() == target_role_title.lower() or r.role_id == target_role_title), CAREER_ROLES_BASE[0])
    
    # 1. Filter role-required topics that have confidence below target threshold
    role_topic_ids = set(role_def.required_topics.keys())
    uncertain_role_topics = [
        s for s in states.values()
        if s.topic_id in role_topic_ids and s.confidence < target_confidence_threshold
    ]
    # Sort by confidence ascending (lowest confidence first = highest information gain)
    uncertain_role_topics.sort(key=lambda s: (s.evidence_count, s.confidence))
    
    selected_questions: list[dict[str, Any]] = []
    selected_topic_ids: set[str] = set()

    for st in uncertain_role_topics:
        if len(selected_questions) >= max_questions:
            break
            
        q_match = next((q for q in DIAGNOSTIC_QUESTION_BANK if q.topic_id == st.topic_id and q.id not in [sq["id"] for sq in selected_questions]), None)
        if q_match and q_match.topic_id not in selected_topic_ids:
            selected_topic_ids.add(q_match.topic_id)
            selected_questions.append({
                "id": q_match.id,
                "topic_id": q_match.topic_id,
                "topic_title": q_match.topic_title,
                "skill_name": q_match.skill_name,
                "domain": q_match.domain,
                "difficulty": q_match.difficulty,
                "text": q_match.text,
                "options": q_match.options,
            })

    # If still below minimum questions and there are general uncertain topics, backfill
    if len(selected_questions) < 3:
        all_uncertain = sorted(states.values(), key=lambda s: (s.evidence_count, s.confidence))
        for st in all_uncertain:
            if len(selected_questions) >= max_questions:
                break
            q_match = next((q for q in DIAGNOSTIC_QUESTION_BANK if q.topic_id == st.topic_id and q.id not in [sq["id"] for sq in selected_questions]), None)
            if q_match and q_match.topic_id not in selected_topic_ids:
                selected_topic_ids.add(q_match.topic_id)
                selected_questions.append({
                    "id": q_match.id,
                    "topic_id": q_match.topic_id,
                    "topic_title": q_match.topic_title,
                    "skill_name": q_match.skill_name,
                    "domain": q_match.domain,
                    "difficulty": q_match.difficulty,
                    "text": q_match.text,
                    "options": q_match.options,
                })

    return selected_questions

# ---------------------------------------------------------------------------
# Authoritative Server-Side Evaluation & Knowledge State Update
# ---------------------------------------------------------------------------

async def evaluate_diagnostic_submission(
    user_id: str,
    answers: list[dict[str, Any]],  # list of { question_id, selected_option }
    session_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    Evaluates assessment answers against server ground-truth, updates knowledge states,
    and returns detailed results.
    """
    total_q = len(answers)
    correct_cnt = 0
    results: list[QuestionResult] = []
    
    # Track topic scores
    topic_answer_map: dict[str, list[bool]] = {}

    for ans in answers:
        qid = ans.get("question_id")
        sel = ans.get("selected_option")
        
        q_def = next((q for q in DIAGNOSTIC_QUESTION_BANK if q.id == qid), None)
        if not q_def:
            continue
            
        is_correct = (sel == q_def.correct_option)
        if is_correct:
            correct_cnt += 1
            
        if q_def.topic_id not in topic_answer_map:
            topic_answer_map[q_def.topic_id] = []
        topic_answer_map[q_def.topic_id].append(is_correct)

        results.append(QuestionResult(
            question_id=q_def.id,
            correct=is_correct,
            selected_option=sel if sel is not None else -1,
            correct_option=q_def.correct_option,
            explanation=q_def.explanation,
        ))

    score_pct = round((correct_cnt / max(1, total_q)) * 100)

    # Update knowledge state for each assessed topic
    updated_topics = []
    for top_id, bools in topic_answer_map.items():
        top_score = round((sum(1 for b in bools if b) / len(bools)) * 100)
        upd = await update_topic_evidence(
            user_id=user_id,
            topic_id=top_id,
            new_score=top_score,
            source="assessment",
        )
        updated_topics.append({
            "topic_id": upd.topic_id,
            "topic_title": upd.topic_title,
            "new_mastery": upd.mastery,
            "confidence": upd.confidence,
            "status": upd.status,
        })

    # Persist assessment record
    assessment_id = await save_assessment_to_db(
        session_id=session_id,
        user_id=user_id,
        skill="Diagnostic Assessment",
        topic="Multi-Topic Diagnostic",
        score=score_pct,
        total_questions=total_q,
        questions_data=[{"id": a["question_id"]} for a in answers],
        results=results,
    )

    return {
        "assessment_id": assessment_id,
        "score": score_pct,
        "total_questions": total_q,
        "correct_count": correct_cnt,
        "results": [r.dict() for r in results],
        "updated_topics": updated_topics,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }
