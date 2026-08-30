"""
Role Prediction Service — Evidence-Based Multi-Role Career Recommendation Engine.

Computes transparent feature-weighted alignment vectors across 6 distinct career tracks:
1. Machine Learning Engineer
2. Data Scientist
3. AI Application / LLM Engineer
4. Data Engineer
5. Computer Vision & NLP Specialist
6. Full Stack AI Developer

Features evaluated:
- Demonstrated topic masteries vs Role required competencies (weight: 0.40)
- Technical interests & problem domain alignment (weight: 0.25)
- Background, major & experience status (weight: 0.15)
- Diagnostic assessment evidence (weight: 0.20)

Includes ambiguity detection when candidate roles are close (<= 6% difference)
and provides detailed evidence-based rationales.
"""

from __future__ import annotations

import logging
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.knowledge_taxonomy import CAREER_ROLES_BASE, RoleRequirement, TAXONOMY_TOPICS
from app.services.knowledge_state_service import get_or_init_knowledge_state, TopicKnowledgeState

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Schemas for Role Prediction
# ---------------------------------------------------------------------------

class RoleEvidenceItem(BaseModel):
    category: str  # "Strong Alignment", "Emerging Skill", "Current Gap"
    title: str
    detail: str

class RoleFitCandidate(BaseModel):
    role_id: str
    title: str
    category: str
    fit_score: int  # 0 to 100
    model_confidence: float  # 0.0 to 1.0
    is_primary: bool
    summary: str
    strong_alignments: list[str]
    critical_gaps: list[str]
    evidence_breakdown: list[RoleEvidenceItem]

class RolePredictionResponse(BaseModel):
    user_id: str
    primary_role: RoleFitCandidate
    alternative_roles: list[RoleFitCandidate]
    is_ambiguous: bool = False
    ambiguity_explanation: Optional[str] = None
    evaluated_at: str

# ---------------------------------------------------------------------------
# Deterministic Role Scoring Engine
# ---------------------------------------------------------------------------

def calculate_role_fit(
    role: RoleRequirement,
    knowledge_states: dict[str, TopicKnowledgeState],
    user_profile: dict[str, Any],
) -> tuple[int, float, list[str], list[str], list[RoleEvidenceItem]]:
    """
    Computes deterministic role fit score, confidence, strengths, gaps, and evidence items.
    """
    # 1. Skill & Topic Mastery Match Score (Weight: 0.40)
    topic_scores = []
    strong_alignments = []
    critical_gaps = []
    
    for top_id, req_mastery in role.required_topics.items():
        state = knowledge_states.get(top_id)
        current_m = state.mastery if state and state.status != "UNKNOWN" else 0
        ratio = min(1.0, current_m / max(1, req_mastery))
        topic_scores.append(ratio)
        
        top_name = state.topic_title if state else top_id
        if current_m >= 70:
            strong_alignments.append(f"{top_name} ({current_m}% mastery)")
        elif current_m < 50:
            critical_gaps.append(f"{top_name} (Target: {req_mastery}%, Current: {current_m}%)")

    skill_match = (sum(topic_scores) / len(topic_scores)) if topic_scores else 0.40

    # 2. Technical Interests Alignment (Weight: 0.25)
    interests = user_profile.get("technical_interests", [])
    if isinstance(interests, str):
        interests = [interests]
    interests_str = " ".join(str(i).lower() for i in interests)
    
    interest_hits = 0
    for dom in role.core_domains:
        dom_words = dom.lower().split()
        if any(w in interests_str for w in dom_words if len(w) > 3):
            interest_hits += 1
    interest_match = min(1.0, 0.40 + (interest_hits * 0.25))

    # 3. Background & Experience Status (Weight: 0.15)
    exp_type = str(user_profile.get("industry_experience_type", "fresher")).lower()
    exp_match = 0.85 if "professional" in exp_type else (0.75 if "intern" in exp_type else 0.65)

    # 4. Diagnostic Assessment Coverage & Performance (Weight: 0.20)
    known_count = sum(1 for s in knowledge_states.values() if s.status != "UNKNOWN")
    evidence_match = min(1.0, known_count / 6.0)  # full evidence credit after 6 assessed topics

    # Overall Weighted Fit Score
    raw_fit = (
        0.40 * skill_match +
        0.25 * interest_match +
        0.15 * exp_match +
        0.20 * evidence_match
    )
    fit_percentage = max(15, min(96, round(raw_fit * 100)))
    
    # Model confidence based on proportion of role-required topics that have actual assessment evidence
    assessed_required = sum(1 for top_id in role.required_topics if knowledge_states.get(top_id) and knowledge_states[top_id].evidence_count > 0)
    confidence = min(0.95, round(0.30 + 0.65 * (assessed_required / max(1, len(role.required_topics))), 2))

    # Generate structured evidence items
    evidence_items: list[RoleEvidenceItem] = []
    if strong_alignments:
        evidence_items.append(RoleEvidenceItem(
            category="Demonstrated Strength",
            title="Core Competency Match",
            detail=f"High performance verified in {len(strong_alignments)} key topics: {', '.join(strong_alignments[:3])}.",
        ))
    if interests:
        evidence_items.append(RoleEvidenceItem(
            category="Interest Alignment",
            title="Domain Passion",
            detail=f"Your stated interests in {', '.join(interests[:2])} directly power the core {role.category} curriculum.",
        ))
    if critical_gaps:
        evidence_items.append(RoleEvidenceItem(
            category="Development Opportunity",
            title="Prerequisite Gaps",
            detail=f"Acquiring {len(critical_gaps)} prerequisite competencies will accelerate your transition into this role.",
        ))

    return fit_percentage, confidence, strong_alignments, critical_gaps, evidence_items

# ---------------------------------------------------------------------------
# Public Prediction API
# ---------------------------------------------------------------------------

async def predict_career_roles(
    user_id: str,
    user_profile: Optional[dict[str, Any]] = None,
) -> RolePredictionResponse:
    """
    Ranks all 6 candidate roles based on active knowledge state and user profile features.
    """
    states = await get_or_init_knowledge_state(user_id)
    profile_data = user_profile or {}

    candidates: list[RoleFitCandidate] = []
    
    for role in CAREER_ROLES_BASE:
        fit_pct, conf, strengths, gaps, evidence = calculate_role_fit(role, states, profile_data)
        candidates.append(RoleFitCandidate(
            role_id=role.role_id,
            title=role.title,
            category=role.category,
            fit_score=fit_pct,
            model_confidence=conf,
            is_primary=False,
            summary=role.description,
            strong_alignments=strengths,
            critical_gaps=gaps,
            evidence_breakdown=evidence,
        ))

    # Rank descending by fit_score, then model_confidence
    candidates.sort(key=lambda c: (c.fit_score, c.model_confidence), reverse=True)
    
    # Designate primary role
    if candidates:
        candidates[0].is_primary = True

    primary = candidates[0]
    alternatives = candidates[1:]

    # Ambiguity Detection (if top two roles differ by <= 6%)
    is_ambiguous = False
    ambiguity_note = None
    if len(candidates) >= 2:
        diff = primary.fit_score - candidates[1].fit_score
        if diff <= 6:
            is_ambiguous = True
            ambiguity_note = (
                f"Close Alignment Detected: '{primary.title}' ({primary.fit_score}%) and '{candidates[1].title}' ({candidates[1].fit_score}%) "
                f"share foundational competencies. Complete targeted assessments in {primary.category} or {candidates[1].category} to increase certainty."
            )

    return RolePredictionResponse(
        user_id=user_id,
        primary_role=primary,
        alternative_roles=alternatives,
        is_ambiguous=is_ambiguous,
        ambiguity_explanation=ambiguity_note,
        evaluated_at="now",
    )
