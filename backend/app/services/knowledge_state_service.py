"""
Knowledge State Service — Evidence-Based Learner Knowledge Model.

Maintains granular topic-level mastery, confidence, evidence counts, and status:
- UNKNOWN / INSUFFICIENT_EVIDENCE (requires diagnostic evaluation before gap classification)
- NOVICE (< 40% with evidence)
- DEVELOPING (40% - 69% with evidence)
- INTERMEDIATE (70% - 84% with evidence)
- ADVANCED (85% - 94% with evidence)
- MASTERED (>= 95% with high confidence)

Uses deterministic evidence-weighted mastery updates and uncertainty shrinkage.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.supabase_client import get_supabase_client
from app.core.knowledge_taxonomy import TAXONOMY_TOPICS, TopicDefinition

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Knowledge State Models
# ---------------------------------------------------------------------------

class TopicKnowledgeState(BaseModel):
    topic_id: str
    topic_title: str
    skill_id: str
    skill_name: str
    domain: str
    mastery: int = 0  # 0 to 100
    confidence: float = 0.0  # 0.0 (no evidence) to 1.0 (highly certain)
    evidence_count: int = 0
    assessment_scores: list[int] = Field(default_factory=list)
    practice_attempts: int = 0
    status: str = "UNKNOWN"  # UNKNOWN, NOVICE, DEVELOPING, INTERMEDIATE, ADVANCED, MASTERED
    last_assessed_at: Optional[str] = None
    last_practiced_at: Optional[str] = None

class LearnerKnowledgeProfile(BaseModel):
    user_id: str
    total_topics_tracked: int
    known_topics_count: int
    mastered_topics_count: int
    knowledge_coverage_percentage: int
    average_mastery: int
    overall_confidence: float
    topics: dict[str, TopicKnowledgeState]  # topic_id -> TopicKnowledgeState
    domain_masteries: dict[str, int]  # domain -> average mastery
    engineering_domain: Optional[str] = "Computer & IT"
    subdomain_masteries: dict[str, int] = Field(default_factory=dict)
    domain_hierarchy: dict[str, Any] = Field(default_factory=dict)
    updated_at: str

# In-Memory Cache for fast query response
_IN_MEMORY_KNOWLEDGE_STORE: dict[str, dict[str, TopicKnowledgeState]] = {}

def _ensure_valid_uuid(val: Any) -> str:
    try:
        return str(uuid.UUID(str(val)))
    except Exception:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))

def _compute_status(mastery: int, confidence: float, evidence_count: int) -> str:
    """Classifies topic state distinguishing UNKNOWN from actual weak knowledge."""
    if evidence_count == 0 or confidence < 0.20:
        return "UNKNOWN"
    if mastery >= 95 and confidence >= 0.70:
        return "MASTERED"
    if mastery >= 85:
        return "ADVANCED"
    if mastery >= 70:
        return "INTERMEDIATE"
    if mastery >= 40:
        return "DEVELOPING"
    return "NOVICE"

# ---------------------------------------------------------------------------
# Core Knowledge State Methods
# ---------------------------------------------------------------------------

async def get_or_init_knowledge_state(user_id: str) -> dict[str, TopicKnowledgeState]:
    """Retrieves full granular knowledge state for a learner, initializing empty topics if new."""
    valid_uid = _ensure_valid_uuid(user_id)
    
    if valid_uid not in _IN_MEMORY_KNOWLEDGE_STORE:
        _IN_MEMORY_KNOWLEDGE_STORE[valid_uid] = {}
        
        # 1. Initialize all taxonomy topics with UNKNOWN state
        for t in TAXONOMY_TOPICS:
            _IN_MEMORY_KNOWLEDGE_STORE[valid_uid][t.id] = TopicKnowledgeState(
                topic_id=t.id,
                topic_title=t.title,
                skill_id=t.skill_id,
                skill_name=t.skill_name,
                domain=t.domain,
                mastery=0,
                confidence=0.0,
                evidence_count=0,
                status="UNKNOWN",
            )
            
        # 2. Query Supabase mentor_topic_progress to hydrate existing records
        try:
            client = get_supabase_client()
            res = client.table("mentor_topic_progress").select("*").eq("user_id", valid_uid).execute()
            if res.data:
                for row in res.data:
                    top_id = row.get("skill_id")
                    match_top = next((t for t in TAXONOMY_TOPICS if t.id == top_id or t.title.lower() == str(row.get("topic", "")).lower() or t.skill_name.lower() == str(row.get("skill_name", "")).lower()), None)
                    if match_top:
                        m_val = row.get("mastery", 0)
                        attempts = row.get("attempts", 1)
                        conf = min(0.95, round(1.0 - (0.5 ** attempts), 2))
                        _IN_MEMORY_KNOWLEDGE_STORE[valid_uid][match_top.id] = TopicKnowledgeState(
                            topic_id=match_top.id,
                            topic_title=match_top.title,
                            skill_id=match_top.skill_id,
                            skill_name=match_top.skill_name,
                            domain=match_top.domain,
                            mastery=m_val,
                            confidence=conf,
                            evidence_count=attempts,
                            assessment_scores=[m_val],
                            status=_compute_status(m_val, conf, attempts),
                            last_assessed_at=row.get("last_assessed_at"),
                        )
        except Exception as e:
            logger.warning("Could not hydrate knowledge state from Supabase: %s", e)
            
    return _IN_MEMORY_KNOWLEDGE_STORE[valid_uid]

async def update_topic_evidence(
    user_id: str,
    topic_id: str,
    new_score: int,
    source: str = "assessment",  # "assessment" | "practice" | "self_report"
) -> TopicKnowledgeState:
    """
    Applies deterministic evidence-weighted mastery update with variance-aware uncertainty shrinkage.
    
    Formula:
    - Weight of new evidence: w = 0.60 for assessment, 0.40 for practice, 0.20 for self-report
    - Mastery: M_new = round((1 - w) * M_old + w * Score)
    - Base Confidence: C_base = 1.0 - (0.50 ^ N_evidence)
    - Consistency Adjustment: Penalizes high score variance across multiple attempts.
    """
    valid_uid = _ensure_valid_uuid(user_id)
    states = await get_or_init_knowledge_state(valid_uid)
    
    current = states.get(topic_id)
    if not current:
        top_def = next((t for t in TAXONOMY_TOPICS if t.id == topic_id), None)
        if not top_def:
            top_def = TAXONOMY_TOPICS[0]
        current = TopicKnowledgeState(
            topic_id=top_def.id,
            topic_title=top_def.title,
            skill_id=top_def.skill_id,
            skill_name=top_def.skill_name,
            domain=top_def.domain,
            mastery=0,
            confidence=0.0,
            evidence_count=0,
            status="UNKNOWN",
        )
        states[topic_id] = current

    evidence_weight = 0.60 if source == "assessment" else (0.40 if source == "practice" else 0.20)
    
    # 1. Update Mastery
    if current.evidence_count == 0:
        new_mastery = new_score
    else:
        new_mastery = round((1.0 - evidence_weight) * current.mastery + evidence_weight * new_score)

    current.mastery = max(0, min(100, new_mastery))
    current.evidence_count += 1
    
    if source == "assessment":
        current.assessment_scores.append(new_score)
        current.last_assessed_at = datetime.now(timezone.utc).isoformat()
    elif source == "practice":
        current.practice_attempts += 1
        current.last_practiced_at = datetime.now(timezone.utc).isoformat()

    # 2. Compute Evidence-Grounded Confidence
    scores = current.assessment_scores if current.assessment_scores else [new_score]
    base_conf = min(0.98, round(1.0 - (0.50 ** len(scores)), 2))
    
    # Check consistency: if scores are erratic (e.g., 90% then 20%), penalize confidence
    if len(scores) >= 2:
        mean_score = sum(scores) / len(scores)
        variance = sum((s - mean_score) ** 2 for s in scores) / len(scores)
        std_dev = variance ** 0.5
        variance_penalty = min(0.20, round(std_dev / 250.0, 2))
        current.confidence = max(0.25, round(base_conf - variance_penalty, 2))
    else:
        current.confidence = 0.55 if source == "assessment" else 0.35

    current.status = _compute_status(current.mastery, current.confidence, current.evidence_count)
    
    # Persist update to Supabase mentor_topic_progress table
    try:
        client = get_supabase_client()
        row = {
            "user_id": valid_uid,
            "skill_id": current.topic_id,
            "skill_name": current.skill_name,
            "domain": current.domain,
            "topic": current.topic_title,
            "mastery": current.mastery,
            "attempts": current.evidence_count,
            "correct_answers": sum(1 for s in current.assessment_scores if s >= 70),
            "last_assessed_at": datetime.now(timezone.utc).isoformat(),
        }
        client.table("mentor_topic_progress").upsert(
            row, on_conflict="user_id,skill_id,topic"
        ).execute()
    except Exception as e:
        logger.error("Failed to sync updated topic knowledge to Supabase: %s", e)

    return current

async def build_learner_knowledge_profile(user_id: str) -> LearnerKnowledgeProfile:
    """Builds aggregated domain and overall metrics from learner's knowledge state."""
    valid_uid = _ensure_valid_uuid(user_id)
    states = await get_or_init_knowledge_state(valid_uid)
    
    topics_list = list(states.values())
    known_topics = [t for t in topics_list if t.status != "UNKNOWN"]
    mastered_topics = [t for t in topics_list if t.status in ("ADVANCED", "MASTERED")]
    
    avg_mastery = round(sum(t.mastery for t in known_topics) / max(1, len(known_topics))) if known_topics else 0
    # Average confidence of assessed/known topics
    avg_conf = round(sum(t.confidence for t in known_topics) / max(1, len(known_topics)), 2) if known_topics else 0.0
    coverage_pct = round((len(known_topics) / max(1, len(topics_list))) * 100)
    
    from app.core.knowledge_taxonomy import ENGINEERING_TAXONOMY_TREE, resolve_domain_hierarchy
    
    # Compute average mastery per domain and per subdomain
    domain_map: dict[str, list[int]] = {}
    subdomain_map: dict[str, list[int]] = {}

    for t in topics_list:
        h = resolve_domain_hierarchy(f"{t.domain} {t.topic_title} {t.skill_name}")
        eng_dom = h.get("domain", "Computer & IT")
        sub_dom = h.get("subdomain", "Core")

        if eng_dom not in domain_map:
            domain_map[eng_dom] = []
        if sub_dom not in subdomain_map:
            subdomain_map[sub_dom] = []

        if t.status != "UNKNOWN":
            domain_map[eng_dom].append(t.mastery)
            subdomain_map[sub_dom].append(t.mastery)
            
    domain_masteries: dict[str, int] = {}
    for d, vals in domain_map.items():
        domain_masteries[d] = round(sum(vals) / len(vals)) if vals else 0

    subdomain_masteries: dict[str, int] = {}
    for sd, vals in subdomain_map.items():
        subdomain_masteries[sd] = round(sum(vals) / len(vals)) if vals else 0

    # Determine primary engineering domain from top tracked masteries
    primary_eng_domain = "Computer & IT"
    if domain_masteries:
        primary_eng_domain = max(domain_masteries, key=domain_masteries.get)

    return LearnerKnowledgeProfile(
        user_id=valid_uid,
        total_topics_tracked=len(topics_list),
        known_topics_count=len(known_topics),
        mastered_topics_count=len(mastered_topics),
        knowledge_coverage_percentage=coverage_pct,
        average_mastery=avg_mastery,
        overall_confidence=avg_conf,
        topics=states,
        domain_masteries=domain_masteries,
        engineering_domain=primary_eng_domain,
        subdomain_masteries=subdomain_masteries,
        domain_hierarchy=ENGINEERING_TAXONOMY_TREE,
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
