"""
AI Mentor Service — Server-Side Intelligence & Adaptive Learning Layer.

Powered by LangChain + OpenAI (GPT-4.1-nano) and Supabase DB.
Implements:
1. Deterministic Priority Engine (calculate_todays_focus) with topic drill-down.
2. Structured LLM prompt builders & parsers for Learn, Practice, and Assess.
3. Authoritative server-side assessment generation & grading.
4. Weighted skill mastery recalculation & dynamic focus adaptation.
5. Persistent session and conversation memory.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import JsonOutputParser

from app.core.config import get_settings
from app.core.supabase_client import get_supabase_client
from app.models.mentor import (
    TodaysFocus,
    RelevantSkillItem,
    AssessmentQuestionClient,
    QuestionResult,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Canonical Default Roadmap Stages & Skills (Matching PathAI Curriculum)
# ---------------------------------------------------------------------------
CANONICAL_STAGES = [
    {
        "id": 1,
        "title": "Programming Foundations",
        "order": 1,
        "status": "COMPLETED",
        "skills": ["Data Types", "Loops", "Functions", "Algorithmic Complexity"],
        "prerequisites": [],
    },
    {
        "id": 2,
        "title": "Python for AI",
        "order": 2,
        "status": "COMPLETED",
        "skills": ["Python OOP", "NumPy & Pandas"],
        "prerequisites": ["Programming Foundations"],
    },
    {
        "id": 3,
        "title": "Mathematics & Statistics",
        "order": 3,
        "status": "IN_PROGRESS",
        "skills": ["Linear Algebra", "Calculus", "Probability", "Optimization"],
        "prerequisites": ["Python for AI"],
    },
    {
        "id": 4,
        "title": "Machine Learning",
        "order": 4,
        "status": "NOT_STARTED",
        "skills": ["Regression Models", "Random Forests", "XGBoost", "Model Evaluation"],
        "prerequisites": ["Mathematics & Statistics"],
    },
    {
        "id": 5,
        "title": "Deep Learning",
        "order": 5,
        "status": "LOCKED",
        "skills": ["PyTorch", "Backpropagation", "CNNs & Vision", "RNNs & Sequence Models"],
        "prerequisites": ["Machine Learning"],
    },
    {
        "id": 6,
        "title": "Generative AI & LLMs",
        "order": 6,
        "status": "LOCKED",
        "skills": ["Transformers", "Tokenization", "RAG Systems", "Vector Databases", "Prompt Engineering"],
        "prerequisites": ["Deep Learning"],
    },
]

CANONICAL_SKILLS: list[dict[str, Any]] = [
    {"id": "s1", "name": "Python OOP", "domain": "Foundations & Core Python", "level": "Advanced", "progress": 95, "is_verified": True},
    {"id": "s2", "name": "NumPy & Pandas", "domain": "Foundations & Core Python", "level": "Advanced", "progress": 88, "is_verified": True},
    {"id": "s3", "name": "Algorithmic Complexity", "domain": "Foundations & Core Python", "level": "Developing", "progress": 45, "is_verified": False},
    {"id": "s4", "name": "Linear Algebra", "domain": "Math & Statistics", "level": "Developing", "progress": 45, "is_verified": False},
    {"id": "s5", "name": "Calculus", "domain": "Math & Statistics", "level": "Developing", "progress": 30, "is_verified": False},
    {"id": "s6", "name": "Probability", "domain": "Math & Statistics", "level": "Intermediate", "progress": 60, "is_verified": True},
    {"id": "s7", "name": "Optimization", "domain": "Math & Statistics", "level": "Novice", "progress": 10, "is_verified": False},
    {"id": "s8", "name": "Regression Models", "domain": "Machine Learning", "level": "Intermediate", "progress": 75, "is_verified": True},
    {"id": "s9", "name": "Random Forests", "domain": "Machine Learning", "level": "Intermediate", "progress": 65, "is_verified": False},
    {"id": "s10", "name": "XGBoost", "domain": "Machine Learning", "level": "Novice", "progress": 20, "is_verified": False},
    {"id": "s11", "name": "Model Evaluation", "domain": "Machine Learning", "level": "Developing", "progress": 55, "is_verified": False},
    {"id": "s12", "name": "Transformers", "domain": "Generative AI", "level": "Novice", "progress": 15, "is_verified": False},
    {"id": "s13", "name": "Tokenization", "domain": "Generative AI", "level": "Developing", "progress": 40, "is_verified": False},
    {"id": "s14", "name": "RAG Systems", "domain": "Generative AI", "level": "Developing", "progress": 35, "is_verified": False},
    {"id": "s15", "name": "Vector Databases", "domain": "Generative AI", "level": "Novice", "progress": 25, "is_verified": False},
]

# Topic-level hierarchy for drill-down adaptation
TOPIC_HIERARCHY: dict[str, list[str]] = {
    "Linear Algebra": ["Matrix Operations", "Eigenvalues & Eigenvectors", "Vector Spaces", "SVD"],
    "Calculus": ["Partial Derivatives", "Gradient Descent", "Chain Rule", "Hessian Matrices"],
    "Probability": ["Bayes' Theorem", "Continuous Distributions", "Expectation & Variance", "Maximum Likelihood"],
    "Optimization": ["Convexity", "Adam Optimizer", "Learning Rate Schedules", "Stochastic Gradient Descent"],
    "Regression Models": ["Linear Regression", "L1/L2 Regularization", "Cost Functions", "Residual Analysis"],
    "Transformers": ["Self-Attention Mechanism", "Multi-Head Attention", "Positional Encoding", "KV Caching"],
    "Tokenization": ["Byte-Pair Encoding", "WordPiece", "SentencePiece", "Special Tokens"],
    "RAG Systems": ["Semantic Chunking", "Hybrid Search", "Re-Ranking Pipelines", "RAG Triad Evaluation"],
    "Vector Databases": ["HNSW Indexing", "Cosine Similarity", "Embedding Alignment", "Metadata Filtering"],
}

# Curated Fallback Assessment Question Bank
QUESTION_BANK: dict[str, list[dict[str, Any]]] = {
    "Linear Algebra": [
        {"id": "la-1", "text": "What is the dimension of the resulting matrix when multiplying a 3×2 matrix by a 2×4 matrix?", "options": ["3×4", "2×3", "3×2", "Cannot be multiplied"], "correctAnswer": 0, "explanation": "Matrix multiplication (M×K) × (K×N) yields a matrix of dimensions M×N. Here, (3×2) × (2×4) = 3×4."},
        {"id": "la-2", "text": "What does it mean if the determinant of a square matrix is zero?", "options": ["The matrix is orthogonal", "The matrix is non-invertible (singular)", "The matrix has all zero eigenvalues", "The matrix is symmetric"], "correctAnswer": 1, "explanation": "A determinant of 0 indicates that the matrix compresses space into a lower dimension, making it singular and non-invertible."},
        {"id": "la-3", "text": "What is an eigenvector of a square matrix A?", "options": ["A vector that becomes zero when multiplied by A", "A non-zero vector that only scales by a scalar λ when multiplied by A (Av = λv)", "A vector with all equal components", "The inverse of matrix A"], "correctAnswer": 1, "explanation": "An eigenvector only changes in magnitude (scaled by eigenvalue λ) without changing its directional line: Av = λv."},
        {"id": "la-4", "text": "What does Principal Component Analysis (PCA) utilize to find directions of maximum variance?", "options": ["Matrix determinant", "Eigenvectors of the covariance matrix", "Cross-entropy loss", "LU Decomposition"], "correctAnswer": 1, "explanation": "PCA computes the eigenvectors of the data's covariance matrix; the eigenvectors with the largest eigenvalues represent principal directions of variance."},
        {"id": "la-5", "text": "What is the dot product of two orthogonal vectors?", "options": ["1", "0", "-1", "Infinity"], "correctAnswer": 1, "explanation": "Two vectors are orthogonal (perpendicular) if and only if their inner/dot product equals 0."},
    ],
    "Calculus": [
        {"id": "calc-1", "text": "In gradient descent, in which direction do we update model parameters to minimize loss?", "options": ["In the direction of the gradient", "Opposite to the direction of the gradient (-∇L)", "Perpendicular to the gradient", "Random direction"], "correctAnswer": 1, "explanation": "The gradient ∇L points in the direction of steepest increase. To minimize the loss, parameters step in the opposite direction: θ ← θ - α∇L."},
        {"id": "calc-2", "text": "What calculus rule is the backbone of backpropagation in deep neural networks?", "options": ["Product rule", "Chain rule of differentiation", "L'Hôpital's rule", "Fundamental Theorem of Calculus"], "correctAnswer": 1, "explanation": "Backpropagation computes gradients of loss with respect to inner layer weights by systematically applying the chain rule: dL/dw = (dL/dy) * (dy/dw)."},
        {"id": "calc-3", "text": "What does a partial derivative ∂f/∂x represent for a multivariable function f(x, y)?", "options": ["The rate of change of f with respect to x while keeping y constant", "The sum of derivatives of x and y", "The area under f along the x-axis", "The second derivative with respect to x"], "correctAnswer": 0, "explanation": "A partial derivative measures the rate of change along one variable axis while treating all other variables as fixed constants."},
        {"id": "calc-4", "text": "What does the Hessian matrix contain?", "options": ["First-order partial derivatives", "Second-order partial derivatives", "Eigenvalues of the loss function", "Inverse gradient vectors"], "correctAnswer": 1, "explanation": "The Hessian is a square matrix of all second-order partial derivatives of a scalar-valued function, describing local curvature."},
        {"id": "calc-5", "text": "What happens if the learning rate α in gradient descent is too large?", "options": ["The model converges instantaneously", "The algorithm may oscillate or diverge uncontrollably", "The gradients become exactly zero", "Weights freeze at their initial values"], "correctAnswer": 1, "explanation": "An excessively large learning rate overshoots the minimum and can cause the loss to diverge toward infinity."},
    ],
    "Probability": [
        {"id": "prob-1", "text": "According to Bayes' Theorem, what is P(A|B)?", "options": ["P(B|A) * P(A) / P(B)", "P(A) * P(B) / P(B|A)", "P(A) + P(B) - P(A ∩ B)", "P(A ∩ B) * P(B)"], "correctAnswer": 0, "explanation": "Bayes' Theorem states P(A|B) = [P(B|A) * P(A)] / P(B), relating posterior probability to likelihood and prior."},
        {"id": "prob-2", "text": "In a standard normal distribution, what percentage of data falls within ±1 standard deviation of the mean?", "options": ["50%", "68.2%", "95.4%", "99.7%"], "correctAnswer": 1, "explanation": "By the empirical rule (68-95-99.7), approximately 68.2% of data in a normal distribution lies within ±1σ of the mean μ."},
        {"id": "prob-3", "text": "What does Maximum Likelihood Estimation (MLE) aim to maximize?", "options": ["The learning rate", "The probability of observing the given dataset under the model parameters", "The model complexity", "The cross-validation split ratio"], "correctAnswer": 1, "explanation": "MLE seeks parameter values θ that maximize the likelihood function L(θ|X), making the observed data most probable."},
    ],
    "Transformers": [
        {"id": "tf-1", "text": "In the self-attention formula Attention(Q, K, V) = softmax(QK^T / √d_k)V, why is the dot product scaled by √d_k?", "options": ["To increase parameter count", "To prevent dot products from growing large in magnitude and pushing softmax into vanishing gradients", "To ensure outputs are binary", "To align dimensions for matrix multiplication"], "correctAnswer": 1, "explanation": "For large projection dimensions d_k, dot products grow large, causing softmax to saturate with extremely tiny gradients. Scaling by √d_k maintains stable variance."},
        {"id": "tf-2", "text": "Why do transformer architectures require Positional Encodings?", "options": ["To compress the input tokens", "Because self-attention is permutation-invariant and has no inherent sense of word order", "To initialize attention weights", "To speed up matrix multiplication on GPUs"], "correctAnswer": 1, "explanation": "Self-attention computes token relationships simultaneously regardless of position. Positional encodings inject sequential order into token embeddings."},
        {"id": "tf-3", "text": "What is the primary benefit of KV (Key-Value) Caching during LLM text generation?", "options": ["It reduces vocabulary size", "It avoids recomputing Key and Value vectors for previously generated prompt and output tokens", "It enables training on smaller GPUs", "It replaces the attention mechanism with convolution"], "correctAnswer": 1, "explanation": "During autoregressive decoding, past tokens' keys and values do not change. Caching them avoids quadratic recomputation per new generated token."},
    ],
}

# ---------------------------------------------------------------------------
# LLM Builder
# ---------------------------------------------------------------------------

def _get_llm(temperature: float = 0.5) -> Optional[ChatOpenAI]:
    """Build a LangChain ChatOpenAI instance using configured backend environment."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        return None
    return ChatOpenAI(
        model="gpt-4.1-nano",
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE_URL,
        temperature=temperature,
        max_tokens=1500,
    )


# ---------------------------------------------------------------------------
# 1. Deterministic Priority Engine with Topic Drill-Down
# ---------------------------------------------------------------------------

def calculate_todays_focus(
    stages: list[dict[str, Any]],
    user_skills: list[dict[str, Any]],
    user_name: str = "Learner",
    target_role: str = "AI/ML Engineer",
    topic_progress: Optional[list[dict[str, Any]]] = None,
) -> TodaysFocus:
    """
    Deterministically computes Today's Focus based on:
    1. Skill weakness gap (100 - mastery)
    2. Current stage relevance bonus (+15)
    3. Prerequisite blocking bonus (+30)
    4. Critical mastery threshold (<30: +20, <50: +10)
    5. Topic-level drill-down (if sub-topic progress is available)
    """
    # 1. Identify current stage and next stage
    current_stage = next((s for s in stages if s.get("status") == "IN_PROGRESS"), None)
    next_stage = next((s for s in stages if s.get("status") == "NOT_STARTED"), None)

    # 2. Build skill lookup map
    skill_map = {s["name"].lower(): s for s in user_skills}

    scored_candidates = []

    # Score skills in current stage
    if current_stage:
        for skill_name in current_stage.get("skills", []):
            skill = skill_map.get(skill_name.lower())
            if not skill:
                continue

            progress = skill.get("progress", 0)
            if progress >= 90:  # Skip mastered skills
                continue

            # Composite Score Formula
            gap_score = (100 - progress) * 0.5
            stage_bonus = 15
            blocking_bonus = 30 if next_stage else 0

            critical_bonus = 0
            if progress < 30:
                critical_bonus = 20
            elif progress < 50:
                critical_bonus = 10

            unverified_bonus = 5 if not skill.get("is_verified", False) else 0

            total_score = gap_score + stage_bonus + blocking_bonus + critical_bonus + unverified_bonus

            reason = (
                f"Prerequisite for upcoming '{next_stage['title']}' stage with a {100 - progress}% mastery gap"
                if next_stage and blocking_bonus > 0
                else f"Part of your active '{current_stage['title']}' stage — needs focused practice"
            )

            scored_candidates.append({
                "skill": skill["name"],
                "skill_id": skill["id"],
                "domain": skill.get("domain", "Core Skills"),
                "mastery": progress,
                "score": total_score,
                "reason": reason,
                "blocks_stage": next_stage["title"] if next_stage else None,
            })

    # If no candidates in current stage, score next stage
    if not scored_candidates and next_stage:
        for skill_name in next_stage.get("skills", []):
            skill = skill_map.get(skill_name.lower())
            if not skill:
                continue
            progress = skill.get("progress", 0)
            if progress >= 90:
                continue

            gap_score = (100 - progress) * 0.5
            scored_candidates.append({
                "skill": skill["name"],
                "skill_id": skill["id"],
                "domain": skill.get("domain", "Core Skills"),
                "mastery": progress,
                "score": gap_score + 10,
                "reason": f"Foundational preparation for next stage: '{next_stage['title']}'",
                "blocks_stage": None,
            })

    # Fallback to lowest overall skill if nothing matched
    if not scored_candidates:
        active_skills = [s for s in user_skills if s.get("progress", 0) < 90]
        if active_skills:
            active_skills.sort(key=lambda s: s.get("progress", 0))
            weakest = active_skills[0]
            scored_candidates.append({
                "skill": weakest["name"],
                "skill_id": weakest["id"],
                "domain": weakest.get("domain", "General"),
                "mastery": weakest.get("progress", 0),
                "score": 50,
                "reason": f"Identified as your lowest mastery competency ({weakest.get('progress', 0)}%)",
                "blocks_stage": None,
            })
        else:
            return TodaysFocus(
                domain="Mathematics & Statistics",
                skill="Calculus",
                skill_id="s5",
                topic=None,
                priority="HIGH",
                mastery=30,
                estimated_minutes=45,
                reason="Core foundation for machine learning optimization",
                blocks_stage="Machine Learning",
            )

    # Sort by priority score descending
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    top = scored_candidates[0]

    # Topic-level drill-down: check if subtopics exist and if topic_progress has a weaker subtopic
    selected_topic = None
    if topic_progress:
        # Find weakest subtopic for this skill
        matching_topics = [t for t in topic_progress if t.get("skill_id") == top["skill_id"]]
        if matching_topics:
            matching_topics.sort(key=lambda t: t.get("mastery", 100))
            weakest_topic = matching_topics[0]
            if weakest_topic.get("mastery", 100) < top["mastery"]:
                selected_topic = weakest_topic.get("topic")

    if not selected_topic and top["skill"] in TOPIC_HIERARCHY:
        # Pick the first recommended subtopic
        selected_topic = TOPIC_HIERARCHY[top["skill"]][0]

    # Priority tier
    priority_tier: Any = "HIGH" if top["score"] >= 60 else "MEDIUM" if top["score"] >= 35 else "LOW"

    # Estimated time
    est_mins = 60 if top["mastery"] < 30 else 45 if top["mastery"] < 60 else 30

    return TodaysFocus(
        domain=top["domain"],
        skill=top["skill"],
        skill_id=top["skill_id"],
        topic=selected_topic,
        priority=priority_tier,
        mastery=top["mastery"],
        estimated_minutes=est_mins,
        reason=top["reason"],
        blocks_stage=top["blocks_stage"],
    )


# ---------------------------------------------------------------------------
# 2. Secure Prompt Builders & LLM Invocation
# ---------------------------------------------------------------------------

def build_mentor_system_prompt(
    user_name: str,
    target_role: str,
    current_stage: str,
    focus: TodaysFocus,
    mode: str,
) -> str:
    """Builds a strictly controlled, educational mentor system prompt."""
    return f"""You are **PathAI AI Mentor**, an elite, encouraging, and highly technical AI career tutor for {user_name}, who is training to become a **{target_role}**.

## LEARNER PROFILE & REAL-TIME CONTEXT:
- **Learner Name:** {user_name}
- **Target Role:** {target_role}
- **Current Roadmap Stage:** {current_stage}
- **Today's Focus Skill:** {focus.skill} ({focus.mastery}% mastery)
- **Sub-Topic Focus:** {focus.topic or 'Core Concepts'}
- **Focus Domain:** {focus.domain}
- **Priority Reason:** {focus.reason}
- **Active Mode:** {mode.upper()}

## OPERATIONAL GUIDELINES:
1. **Teaching Tone:** Structured, encouraging, concise, and pedagogically sound. Use bullet points and bold highlights for readability.
2. **Context-Anchored:** Relate your explanations directly to the learner's goal of becoming a {target_role} and why this specific skill is critical.
3. **No Hallucinated Progress:** Never claim the learner completed an assessment or stage unless recorded. Stick strictly to their actual mastery ({focus.mastery}%).
4. **Mode Behavior:**
   - **LEARN:** Explain concepts clearly at the learner's current mastery ({focus.mastery}%). Use intuitive analogies, followed by technical rigor and practical examples.
   - **PRACTICE:** Provide targeted practice exercises, interactive challenges, and step-by-step problem walkthroughs.
   - **ASSESS:** Challenge their understanding with focused conceptual questions and explain why answers are right or wrong.
5. **Length:** Keep responses concise and focused (150-300 words).
6. **Mathematical Clarity:** When presenting formulas or mathematical terms, write them in clean, intuitive notation (e.g. `12x² + 4`, `dL/dw = (dL/dy) * (dy/dw)`, `θ ← θ - α∇L`) instead of raw backslash LaTeX markup like `\(...\)` or `\[...\]`.
"""


async def generate_mentor_reply(
    user_message: str,
    history: list[dict[str, str]],
    user_name: str,
    target_role: str,
    current_stage: str,
    focus: TodaysFocus,
    mode: str = "learn",
) -> tuple[str, list[str]]:
    """Generates an AI mentor response using LangChain LLM with fallback."""
    llm = _get_llm(temperature=0.5)

    if not llm:
        return _fallback_mentor_reply(user_message, focus, mode, target_role)

    try:
        system_prompt = build_mentor_system_prompt(
            user_name=user_name,
            target_role=target_role,
            current_stage=current_stage,
            focus=focus,
            mode=mode,
        )

        messages: list[Any] = [SystemMessage(content=system_prompt)]

        # Add recent conversation history (max 8 messages for controlled context window)
        for msg in history[-8:]:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content", "")))

        messages.append(HumanMessage(content=user_message))

        response = await llm.ainvoke(messages)
        reply_text = response.content

        suggested_actions = [
            f"Practice {focus.skill}",
            f"Take {focus.skill} Quiz",
            "Why is this skill important?",
        ]

        return reply_text, suggested_actions

    except Exception as e:
        logger.error("LLM mentor generation failed, using fallback: %s", e)
        return _fallback_mentor_reply(user_message, focus, mode, target_role)


def _fallback_mentor_reply(
    message: str,
    focus: TodaysFocus,
    mode: str,
    target_role: str,
) -> tuple[str, list[str]]:
    """Deterministic fallback when LLM API is unavailable."""
    lower = message.lower()

    if "study today" in lower or "what should i study" in lower:
        text = (
            f"Based on your current progress, I recommend focusing on **{focus.skill}** today.\n\n"
            f"📊 **Current Mastery:** {focus.mastery}%\n"
            f"⏱️ **Estimated Session:** {focus.estimated_minutes} min\n"
            f"📌 **Priority Tier:** {focus.priority}\n\n"
            f"**Why this topic?** {focus.reason}.\n\n"
            f"Would you like to start with an intuitive conceptual breakdown or dive directly into practice problems?"
        )
    elif "weakest" in lower or "weak" in lower:
        text = (
            f"Your most critical area for improvement is **{focus.skill}** with **{focus.mastery}% mastery** in {focus.domain}.\n\n"
            f"{f'⚠️ This is currently a direct prerequisite blocker for **{focus.blocks_stage}**.' if focus.blocks_stage else ''}\n\n"
            f"Here is how to master it:\n"
            f"1. **Foundations:** Review core theory and intuition\n"
            f"2. **Practice:** Solve 3 targeted exercises\n"
            f"3. **Validate:** Complete the 5-question assessment to update your verified score"
        )
    elif "why" in lower and "important" in lower:
        text = (
            f"**Why is {focus.skill} vital for a {target_role}?**\n\n"
            f"{focus.skill} forms the mathematical and structural backbone of modern AI systems. "
            f"Mastering it enables you to debug architectures, optimize models, and implement state-of-the-art algorithms."
        )
    else:
        text = (
            f"You're currently exploring **{focus.skill}** ({focus.mastery}% mastery) in the **{focus.domain}** domain.\n\n"
            f"At your current mastery level, focusing on practical implementation will yield the highest return. "
            f"Click **Practice** or **Assess** to test your knowledge!"
        )

    return text, [f"Practice {focus.skill}", "Test my understanding", "Explain next roadmap stage"]


# ---------------------------------------------------------------------------
# 3. Practice & Assessment Generator
# ---------------------------------------------------------------------------

async def generate_practice_exercise(
    focus: TodaysFocus,
    target_role: str,
) -> dict[str, Any]:
    """Generates a practice problem tailored to the focus topic and mastery."""
    llm = _get_llm(temperature=0.4)

    difficulty = "Beginner" if focus.mastery < 35 else "Intermediate" if focus.mastery < 65 else "Advanced"

    if llm:
        try:
            prompt = f"""Generate a practical coding/conceptual exercise for a {target_role} learning **{focus.skill}** (specifically on **{focus.topic or 'core concepts'}**).
Difficulty: {difficulty} (Current learner mastery is {focus.mastery}%).

Return ONLY valid JSON matching this schema:
{{
  "exercise_prompt": "Clear problem statement and requirements",
  "difficulty": "{difficulty}",
  "hints": ["Hint 1", "Hint 2"],
  "starter_code": "Python starter code template or null"
}}"""
            res = await llm.ainvoke([HumanMessage(content=prompt)])
            parser = JsonOutputParser()
            parsed = parser.parse(res.content)
            return {
                "topic": focus.topic or focus.skill,
                "skill": focus.skill,
                "exercise_prompt": parsed.get("exercise_prompt", ""),
                "difficulty": difficulty,
                "hints": parsed.get("hints", []),
                "starter_code": parsed.get("starter_code"),
            }
        except Exception as e:
            logger.warning("LLM practice generation failed, using template: %s", e)

    # Deterministic fallback practice
    return {
        "topic": focus.topic or focus.skill,
        "skill": focus.skill,
        "exercise_prompt": (
            f"**Practice Challenge: {focus.skill} ({difficulty})**\n\n"
            f"Explain and implement a solution demonstrating {focus.topic or focus.skill} in Python. "
            f"Ensure you handle edge cases and optimize for computational efficiency."
        ),
        "difficulty": difficulty,
        "hints": [
            f"Review standard operations in {focus.skill}",
            "Start by identifying inputs, constraints, and expected output shapes",
        ],
        "starter_code": f"# Starter code for {focus.skill}\nimport numpy as np\n\ndef solution():\n    pass\n",
    }


async def generate_assessment_questions(
    focus: TodaysFocus,
    count: int = 5,
) -> tuple[list[dict[str, Any]], list[AssessmentQuestionClient]]:
    """
    Generates assessment questions.
    Returns:
    - server_questions: contains correctAnswer and explanation (KEPT ON SERVER)
    - client_questions: stripped of answers (SAFE TO RETURN TO CLIENT)
    """
    # Check if curated bank has questions for this skill
    bank_questions = QUESTION_BANK.get(focus.skill)

    server_questions: list[dict[str, Any]] = []

    if bank_questions and len(bank_questions) >= 3:
        server_questions = bank_questions[:count]
    else:
        # Generate with LLM if available
        llm = _get_llm(temperature=0.3)
        if llm:
            try:
                prompt = f"""Generate {count} multiple-choice assessment questions testing **{focus.skill}** (topic: **{focus.topic or 'core concepts'}**).
Target mastery: {focus.mastery}%.

Return ONLY valid JSON:
{{
  "questions": [
    {{
      "id": "q1",
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why Option A is correct"
    }}
  ]
}}"""
                res = await llm.ainvoke([HumanMessage(content=prompt)])
                parser = JsonOutputParser()
                parsed = parser.parse(res.content)
                server_questions = parsed.get("questions", [])
            except Exception as e:
                logger.warning("LLM assessment generation failed, using fallback: %s", e)

    if not server_questions:
        # Ultimate fallback
        server_questions = [
            {
                "id": "gen-1",
                "text": f"What is the primary role of {focus.skill} in AI/ML applications?",
                "options": [
                    "Data visualization only",
                    f"Providing algorithmic and computational foundations for {focus.domain}",
                    "Hardware acceleration",
                    "Database schema migrations",
                ],
                "correctAnswer": 1,
                "explanation": f"{focus.skill} provides core theoretical and computational structures required in {focus.domain}.",
            },
            {
                "id": "gen-2",
                "text": f"When evaluating proficiency in {focus.skill}, which practice is most critical?",
                "options": [
                    "Memorizing documentation without coding",
                    "Testing with diverse real-world edge cases and quantitative metrics",
                    "Using third-party APIs without understanding internals",
                    "Skipping mathematical proofs",
                ],
                "correctAnswer": 1,
                "explanation": "Quantitative validation against edge cases ensures reliable production model performance.",
            },
        ]

    # Build client-safe question list (NO correctAnswer, NO explanation)
    client_questions = [
        AssessmentQuestionClient(
            id=q["id"],
            text=q["text"],
            options=q["options"],
        )
        for q in server_questions
    ]

    return server_questions, client_questions


# ---------------------------------------------------------------------------
# 4. Authoritative Server-Side Grading & Mastery Adaptation
# ---------------------------------------------------------------------------

def grade_assessment(
    server_questions: list[dict[str, Any]],
    user_answers: list[int],
    previous_mastery: int,
) -> tuple[int, list[QuestionResult], int, str]:
    """
    Authoritative server-side grading.
    Formula: new_mastery = min(100, round(previous_mastery * 0.4 + score * 0.6))
    """
    total = len(server_questions)
    correct_count = 0
    results: list[QuestionResult] = []

    for idx, q in enumerate(server_questions):
        user_sel = user_answers[idx] if idx < len(user_answers) else -1
        correct_idx = q.get("correctAnswer", 0)
        is_correct = user_sel == correct_idx

        if is_correct:
            correct_count += 1

        results.append(
            QuestionResult(
                question_id=q.get("id", f"q-{idx}"),
                correct=is_correct,
                selected_option=user_sel,
                correct_option=correct_idx,
                explanation=q.get("explanation", "Correct answer identified."),
            )
        )

    score_percent = round((correct_count / max(1, total)) * 100)

    # Weighted adaptive mastery formula
    new_mastery = min(100, round(previous_mastery * 0.4 + score_percent * 0.6))

    if score_percent >= 80:
        feedback = f"🎉 Outstanding! You scored {score_percent}% ({correct_count}/{total} correct). Your mastery has increased to {new_mastery}%."
    elif score_percent >= 50:
        feedback = f"👍 Good effort! You scored {score_percent}% ({correct_count}/{total} correct). Review the missed concepts to strengthen your score."
    else:
        feedback = f"📚 Keep practicing! You scored {score_percent}% ({correct_count}/{total} correct). Let's review the fundamental concepts before taking the next quiz."

    return score_percent, results, new_mastery, feedback


# ---------------------------------------------------------------------------
# 5. Database Persistence Helpers (Supabase)
# ---------------------------------------------------------------------------

def _ensure_valid_uuid(val: Optional[str]) -> Optional[str]:
    """Ensures input string is a valid UUID, deterministically converting string IDs if necessary."""
    if not val:
        return None
    try:
        uuid.UUID(str(val))
        return str(val)
    except (ValueError, TypeError, AttributeError):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))


async def save_session_to_db(
    user_id: str,
    domain: str,
    skill: str,
    topic: Optional[str],
    roadmap_stage: str,
    mode: str,
) -> str:
    """Creates a new mentor session in Supabase and returns its UUID."""
    valid_uid = _ensure_valid_uuid(user_id)
    fallback_id = str(uuid.uuid4())
    try:
        client = get_supabase_client()
        row = {
            "id": fallback_id,
            "user_id": valid_uid,
            "domain": domain,
            "skill": skill,
            "topic": topic,
            "roadmap_stage": roadmap_stage,
            "mode": mode,
            "status": "active",
        }
        res = client.table("mentor_sessions").insert(row).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]["id"]
    except Exception as e:
        logger.error("Failed to persist mentor session to Supabase: %s", e)
    return fallback_id


async def save_message_to_db(
    session_id: str,
    user_id: str,
    role: str,
    content: str,
    metadata: Optional[dict[str, Any]] = None,
) -> str:
    """Persists a message to Supabase."""
    valid_sid = _ensure_valid_uuid(session_id)
    valid_uid = _ensure_valid_uuid(user_id)
    fallback_id = str(uuid.uuid4())
    try:
        client = get_supabase_client()
        row = {
            "id": fallback_id,
            "session_id": valid_sid,
            "user_id": valid_uid,
            "role": role,
            "content": content,
            "metadata": metadata or {},
        }
        res = client.table("mentor_messages").insert(row).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]["id"]
    except Exception as e:
        logger.error("Failed to persist mentor message: %s", e)
    return fallback_id


async def save_assessment_to_db(
    session_id: Optional[str],
    user_id: str,
    skill: str,
    topic: Optional[str],
    score: int,
    total_questions: int,
    questions_data: list[dict[str, Any]],
    results: list[QuestionResult],
) -> str:
    """Persists assessment record and individual answers to Supabase."""
    valid_sid = _ensure_valid_uuid(session_id) if session_id else None
    valid_uid = _ensure_valid_uuid(user_id)
    assessment_id = str(uuid.uuid4())
    try:
        client = get_supabase_client()
        row = {
            "id": assessment_id,
            "session_id": valid_sid,
            "user_id": valid_uid,
            "skill": skill,
            "topic": topic,
            "score": score,
            "total_questions": total_questions,
            "questions_data": questions_data,
        }
        res = client.table("mentor_assessments").insert(row).execute()
        if res.data and len(res.data) > 0:
            assessment_id = res.data[0]["id"]

        # Insert answers
        answer_rows = [
            {
                "id": str(uuid.uuid4()),
                "assessment_id": assessment_id,
                "question_id": r.question_id,
                "answer": str(r.selected_option),
                "correct": r.correct,
            }
            for r in results
        ]
        if answer_rows:
            client.table("mentor_assessment_answers").insert(answer_rows).execute()

    except Exception as e:
        logger.error("Failed to persist assessment to Supabase: %s", e)

    return assessment_id


async def update_topic_progress_in_db(
    user_id: str,
    skill_id: str,
    skill_name: str,
    domain: str,
    topic: Optional[str],
    new_mastery: int,
    correct_count: int,
) -> None:
    """Upserts learner's topic mastery in Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        row = {
            "user_id": valid_uid,
            "skill_id": skill_id,
            "skill_name": skill_name,
            "domain": domain,
            "topic": topic or "Core",
            "mastery": new_mastery,
            "correct_answers": correct_count,
            "last_assessed_at": datetime.now(timezone.utc).isoformat(),
        }
        client.table("mentor_topic_progress").upsert(
            row, on_conflict="user_id,skill_id,topic"
        ).execute()
    except Exception as e:
        logger.error("Failed to update topic progress in Supabase: %s", e)


async def get_user_topic_progress_from_db(user_id: str) -> list[dict[str, Any]]:
    """Loads all tracked topic masteries for a user from Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = client.table("mentor_topic_progress").select("*").eq("user_id", valid_uid).execute()
        return res.data or []
    except Exception as e:
        logger.error("Failed to load user topic progress: %s", e)
        return []


async def get_active_session_from_db(user_id: str) -> Optional[dict[str, Any]]:
    """Loads the most recent active mentor session for a user from Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = (
            client.table("mentor_sessions")
            .select("*")
            .eq("user_id", valid_uid)
            .eq("status", "active")
            .order("started_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error("Failed to load active session: %s", e)
    return None


async def get_session_messages_from_db(session_id: str, limit: int = 50) -> list[dict[str, Any]]:
    """Loads message history for a given mentor session."""
    valid_sid = _ensure_valid_uuid(session_id)
    try:
        client = get_supabase_client()
        res = (
            client.table("mentor_messages")
            .select("*")
            .eq("session_id", valid_sid)
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Failed to load session messages: %s", e)
    return []


async def get_recent_assessments_from_db(user_id: str, limit: int = 5) -> list[dict[str, Any]]:
    """Loads recent assessment records for a user."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = (
            client.table("mentor_assessments")
            .select("*")
            .eq("user_id", valid_uid)
            .order("completed_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Failed to load recent assessments: %s", e)
    return []


async def get_user_profile_from_db(user_id: str) -> Optional[dict[str, Any]]:
    """Loads user profile record containing target_role and onboarding metadata."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = client.table("profiles").select("*").eq("user_id", valid_uid).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error("Failed to load user profile: %s", e)
    return None



