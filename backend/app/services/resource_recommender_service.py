"""
Resource Recommender Service — Match Scoring & Continuous Feedback Loop.

Calculates match scores for curated resources based on learner topic deficits,
difficulty alignment, and learning format preferences.
Tracks learner resource usage feedback (completion, time spent, rating, post-resource score).
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.knowledge_taxonomy import CURATED_RESOURCES, ResourceDefinition, TAXONOMY_TOPICS
from app.services.knowledge_state_service import get_or_init_knowledge_state, TopicKnowledgeState

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Schemas for Resources & Feedback
# ---------------------------------------------------------------------------

class ScoredResourceItem(BaseModel):
    id: str
    title: str
    provider: str
    type: str  # COURSE, DOCUMENTATION, LAB, VIDEO
    url: str
    duration_hours: float
    difficulty: str
    match_score: int  # 0 to 100
    target_topics: list[str]
    why_recommended: str
    learning_outcomes: list[str]

class ResourceFeedbackRecord(BaseModel):
    user_id: str
    resource_id: str
    status: str  # STARTED, COMPLETED, DROPPED
    time_spent_minutes: int = 0
    rating: Optional[int] = None  # 1 to 5
    post_assessment_score: Optional[int] = None
    created_at: str

# In-Memory feedback store for performance caching
_RESOURCE_FEEDBACK_STORE: list[ResourceFeedbackRecord] = []

# ---------------------------------------------------------------------------
# Recommendation Match Scoring Engine
# ---------------------------------------------------------------------------

async def recommend_resources_for_learner(
    user_id: str,
    target_role: str = "Machine Learning Engineer",
    preferred_format: Optional[str] = None,
) -> list[ScoredResourceItem]:
    """
    Computes match scores for resources targeting learner's active topic deficits.
    """
    states = await get_or_init_knowledge_state(user_id)
    
    scored_list: list[ScoredResourceItem] = []
    
    for res in CURATED_RESOURCES:
        # Find learner's average mastery across target topics for this resource
        target_states = [states.get(tid) for tid in res.target_topic_ids if states.get(tid)]
        
        if not target_states:
            avg_m = 0
            avg_conf = 0.0
        else:
            avg_m = sum(s.mastery for s in target_states if s.status != "UNKNOWN") / len(target_states)
            avg_conf = sum(s.confidence for s in target_states) / len(target_states)

        # Deficit score: highest when learner has a big gap in these topics
        deficit = max(0, 80 - avg_m)
        deficit_factor = min(1.0, deficit / 80.0)

        # Format factor
        format_factor = 1.0
        if preferred_format and preferred_format.lower() in res.type.lower():
            format_factor = 1.2

        # Compute match percentage [40% - 98%]
        raw_match = 45 + (45 * deficit_factor * format_factor)
        match_score = max(40, min(98, round(raw_match)))

        # Find topic titles
        matched_topics = [
            next((t.title for t in TAXONOMY_TOPICS if t.id == tid), tid)
            for tid in res.target_topic_ids
        ]

        if avg_m < 40:
            why_rec = f"Directly targets critical foundational deficit in {', '.join(matched_topics[:2])} (current mastery: {avg_m:.0f}%)."
        elif avg_m < 75:
            why_rec = f"Strengthens developing competency in {', '.join(matched_topics[:2])} to achieve the {target_role} benchmark."
        else:
            why_rec = f"Comprehensive reference resource for advanced concepts in {', '.join(matched_topics[:2])}."

        scored_list.append(ScoredResourceItem(
            id=res.id,
            title=res.title,
            provider=res.provider,
            type=res.type,
            url=res.url,
            duration_hours=res.duration_hours,
            difficulty=res.difficulty,
            match_score=match_score,
            target_topics=matched_topics,
            why_recommended=why_rec,
            learning_outcomes=res.learning_outcomes,
        ))

    # Sort descending by match_score
    scored_list.sort(key=lambda r: r.match_score, reverse=True)
    return scored_list

# ---------------------------------------------------------------------------
# Resource Feedback Persistence
# ---------------------------------------------------------------------------

async def record_resource_feedback(
    user_id: str,
    resource_id: str,
    status: str,
    time_spent_minutes: int = 0,
    rating: Optional[int] = None,
    post_assessment_score: Optional[int] = None,
) -> ResourceFeedbackRecord:
    """Records learner interaction feedback for a resource."""
    record = ResourceFeedbackRecord(
        user_id=user_id,
        resource_id=resource_id,
        status=status,
        time_spent_minutes=time_spent_minutes,
        rating=rating,
        post_assessment_score=post_assessment_score,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    _RESOURCE_FEEDBACK_STORE.append(record)
    logger.info("Recorded resource feedback for user %s on resource %s (status: %s)", user_id, resource_id, status)
    return record
