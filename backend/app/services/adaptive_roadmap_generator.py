"""
Adaptive Personalized Roadmap Generator Service.

Synthesizes a customized, sequenced curriculum DAG tailored to the learner's:
1. Target Career Role
2. Identified Skill Gaps (skips or fast-tracks already mastered competencies)
3. Prerequisite DAG Dependencies
4. Available Weekly Study Hours (e.g. 10 hrs/week vs 25 hrs/week)
5. Target Timeline (e.g. 3 months vs 6 months vs 12 months)

Calculates realistic time budgets (learning, practice, project, assessment) and
generates data-driven "Why this stage is here" rationales.
"""

from __future__ import annotations

import logging
import math
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.knowledge_taxonomy import (
    CAREER_ROLES_BASE,
    RoleRequirement,
    TAXONOMY_TOPICS,
    TopicDefinition,
    CURATED_RESOURCES,
)
from app.services.knowledge_state_service import get_or_init_knowledge_state, TopicKnowledgeState
from app.services.gap_analysis_service import analyze_learner_gaps

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Schemas for Personalized Roadmap
# ---------------------------------------------------------------------------

class PersonalizedRoadmapTopic(BaseModel):
    id: str
    title: str
    skill_id: str
    skill_name: str
    current_mastery: int
    target_mastery: int
    estimated_hours: float
    key_concepts: list[str]
    status: str  # COMPLETED, IN_PROGRESS, AVAILABLE, LOCKED

class PersonalizedRoadmapResource(BaseModel):
    id: str
    title: str
    provider: str
    type: str
    url: str
    duration: str
    match_score: int = 85
    why_recommended: str

class PersonalizedRoadmapStage(BaseModel):
    id: int
    title: str
    domain: str
    difficulty: str
    status: str  # COMPLETED, IN_PROGRESS, AVAILABLE, LOCKED
    progress: int  # 0 to 100
    estimated_duration: str
    required_hours: float
    why_in_roadmap: str
    career_relevance: str
    prerequisites: list[str]
    skills: list[str]
    topics: list[PersonalizedRoadmapTopic]
    resources: list[PersonalizedRoadmapResource]
    completion_criteria: str
    is_final_capstone: bool = False

class PersonalizedRoadmapOverview(BaseModel):
    user_id: str
    user_name: str
    target_role: str
    roadmap_version: int = 1
    adaptation_reason: Optional[str] = None
    overall_progress: int
    completed_stages: int
    total_stages: int
    weekly_hours_budget: int
    target_timeline_months: int
    estimated_remaining_weeks: int
    is_timeline_feasible: bool = True
    timeline_advisory: Optional[str] = None
    current_stage: Optional[PersonalizedRoadmapStage] = None
    next_stage: Optional[PersonalizedRoadmapStage] = None
    current_blocker: Optional[str] = None
    next_recommended_action: str
    stages: list[PersonalizedRoadmapStage]
    generated_at: str

# In-Memory Roadmap Version Store
_ROADMAP_VERSION_TRACKER: dict[str, int] = {}
_ROADMAP_HISTORY_STORE: dict[str, list[dict[str, Any]]] = {}

# ---------------------------------------------------------------------------
# Dynamic Curriculum Synthesis Engine
# ---------------------------------------------------------------------------

async def generate_personalized_roadmap(
    user_id: str,
    target_role_title: str = "Machine Learning Engineer",
    user_name: str = "Learner",
    weekly_hours: int = 10,
    target_months: int = 6,
    adaptation_reason: Optional[str] = None,
) -> PersonalizedRoadmapOverview:
    """
    Generates a personalized, time-feasible, gap-prioritized roadmap for any career role.
    Increments roadmap_version on meaningful adaptations while preserving history.
    """
    # Track version increments
    if user_id not in _ROADMAP_VERSION_TRACKER:
        _ROADMAP_VERSION_TRACKER[user_id] = 1
    elif adaptation_reason:
        _ROADMAP_VERSION_TRACKER[user_id] += 1

    current_version = _ROADMAP_VERSION_TRACKER[user_id]

    states = await get_or_init_knowledge_state(user_id)
    gap_analysis = await analyze_learner_gaps(user_id, target_role_title)
    
    from app.core.knowledge_taxonomy import find_career_role
    role_def = find_career_role(target_role_title)

    # Group role-required topics by domain to form coherent curriculum stages
    domain_topic_map: dict[str, list[TopicDefinition]] = {}
    for top_id in role_def.required_topics:
        top_def = next((t for t in TAXONOMY_TOPICS if t.id == top_id), None)
        if top_def:
            if top_def.domain not in domain_topic_map:
                domain_topic_map[top_def.domain] = []
            domain_topic_map[top_def.domain].append(top_def)

    # Order domains pedagogically
    domain_order = [
        "Programming & Data Structures",
        "Applied Mathematics & Statistics",
        "Data Wrangling & Feature Engineering",
        "Machine Learning Foundations",
        "Deep Learning & Neural Networks",
        "NLP, Attention & Transformers",
        "Generative AI, RAG & LLMs",
        "MLOps, APIs & Cloud Deployment",
    ]

    stages: list[PersonalizedRoadmapStage] = []
    stage_idx = 1
    completed_stage_titles: set[str] = set()

    for dom in domain_order:
        if dom not in domain_topic_map:
            continue
            
        topics_in_domain = domain_topic_map[dom]
        stage_title = dom.split("&")[0].strip() if "&" in dom else dom
        
        # Calculate dynamic stage metrics based on learner knowledge state
        stage_topics: list[PersonalizedRoadmapTopic] = []
        topic_masteries = []
        total_hours = 0.0
        
        for t in topics_in_domain:
            st = states.get(t.id)
            m_val = st.mastery if st and st.status != "UNKNOWN" else 0
            topic_masteries.append(m_val)
            req_m = role_def.required_topics.get(t.id, 75)
            
            # If learner already has high mastery, reduce remaining hours
            rem_hours = max(1.0, round(t.estimated_hours * (max(0, req_m - m_val) / 100.0), 1))
            total_hours += rem_hours
            
            top_status = "COMPLETED" if m_val >= req_m else ("IN_PROGRESS" if m_val >= 40 else "AVAILABLE")
            stage_topics.append(PersonalizedRoadmapTopic(
                id=t.id,
                title=t.title,
                skill_id=t.skill_id,
                skill_name=t.skill_name,
                current_mastery=m_val,
                target_mastery=req_m,
                estimated_hours=rem_hours,
                key_concepts=t.key_concepts,
                status=top_status,
            ))

        avg_mastery = round(sum(topic_masteries) / max(1, len(topic_masteries)))
        
        # Prerequisite check for stage
        prereqs = []
        if stage_idx > 1 and stages:
            prereqs.append(stages[-1].title)
            
        all_prereqs_met = len(prereqs) == 0 or all(p in completed_stage_titles for p in prereqs)

        # Stage Status determination
        if avg_mastery >= 75:
            stage_status = "COMPLETED"
            completed_stage_titles.add(stage_title)
        elif all_prereqs_met:
            stage_status = "IN_PROGRESS" if stages and any(s.status == "COMPLETED" for s in stages) else "AVAILABLE"
        else:
            stage_status = "LOCKED"

        # Duration in weeks based on weekly study hours budget
        duration_weeks = max(1, math.ceil(total_hours / max(4, weekly_hours)))

        # Find verified curated resources for this stage
        stage_resources: list[PersonalizedRoadmapResource] = []
        for r in CURATED_RESOURCES:
            if any(tid in [t.id for t in topics_in_domain] for tid in r.target_topic_ids):
                stage_resources.append(PersonalizedRoadmapResource(
                    id=r.id,
                    title=r.title,
                    provider=r.provider,
                    type=r.type,
                    url=r.url,
                    duration=f"{r.duration_hours:.0f} hours",
                    match_score=92 if avg_mastery < 50 else 82,
                    why_recommended=f"Directly targets core competencies in {stage_title} for your target {role_def.title} goal.",
                ))

        # Personalization Rationale
        if avg_mastery >= 75:
            why_in_roadmap = f"Pre-cleared based on your verified {avg_mastery}% mastery in {dom}."
        elif avg_mastery >= 40:
            why_in_roadmap = f"Fast-tracked stage targeting remaining gaps to reach the {role_def.title} benchmark."
        else:
            why_in_roadmap = f"Essential foundational stage to build core competency required for {role_def.title}."

        skills_list = list(dict.fromkeys(t.skill_name for t in topics_in_domain))

        stages.append(PersonalizedRoadmapStage(
            id=stage_idx,
            title=stage_title,
            domain=dom,
            difficulty="Beginner" if stage_idx <= 2 else ("Intermediate" if stage_idx <= 4 else "Advanced"),
            status=stage_status,
            progress=avg_mastery,
            estimated_duration=f"{duration_weeks} Weeks",
            required_hours=total_hours,
            why_in_roadmap=why_in_roadmap,
            career_relevance=f"Powers key technical capabilities required in day-to-day {role_def.title} roles.",
            prerequisites=prereqs,
            skills=skills_list,
            topics=stage_topics,
            resources=stage_resources[:3],
            completion_criteria=f"Achieve >= 75% average topic mastery and complete the {stage_title} milestone assessment.",
            is_final_capstone=False,
        ))
        stage_idx += 1

    # Add Capstone Project Stage
    if stages:
        capstone_hours = 25.0
        capstone_weeks = max(2, math.ceil(capstone_hours / max(4, weekly_hours)))
        stages.append(PersonalizedRoadmapStage(
            id=stage_idx,
            title=f"{role_def.title} Capstone Project",
            domain="Capstone & Portfolio",
            difficulty="Advanced",
            status="LOCKED" if not all(s.status == "COMPLETED" for s in stages) else "AVAILABLE",
            progress=0,
            estimated_duration=f"{capstone_weeks} Weeks",
            required_hours=capstone_hours,
            why_in_roadmap=f"Comprehensive production portfolio project demonstrating end-to-end {role_def.title} capabilities.",
            career_relevance="Primary proof-of-work project for resume, portfolio, and technical interviews.",
            prerequisites=[stages[-1].title],
            skills=[role_def.title, "Portfolio Build", "Production Testing"],
            topics=[],
            resources=[],
            completion_criteria="Deploy working production application with automated test suite and public GitHub repo.",
            is_final_capstone=True,
        ))

    # Overall Metrics
    total_stages = len(stages)
    completed_count = sum(1 for s in stages if s.status == "COMPLETED")
    overall_progress = round((completed_count / max(1, total_stages)) * 100)

    # Active Stage
    current_stage = next((s for s in stages if s.status == "IN_PROGRESS"), None)
    if not current_stage:
        current_stage = next((s for s in stages if s.status in ("AVAILABLE", "NOT_STARTED")), stages[0] if stages else None)

    next_stage = next((s for s in stages if s.id > (current_stage.id if current_stage else 0)), None)

    total_remaining_weeks = sum(
        int(s.estimated_duration.split()[0])
        for s in stages
        if s.status != "COMPLETED" and s.estimated_duration.split()[0].isdigit()
    ) or 16

    # Feasibility Check
    target_total_weeks = target_months * 4
    is_feasible = total_remaining_weeks <= target_total_weeks
    timeline_advisory = None
    if not is_feasible:
        timeline_advisory = (
            f"At {weekly_hours} hrs/week, this roadmap requires ~{total_remaining_weeks} weeks. "
            f"To achieve your {target_months}-month goal (~{target_total_weeks} weeks), consider increasing weekly study time to ~{math.ceil((total_remaining_weeks * weekly_hours) / target_total_weeks)} hrs/week."
        )

    # Actionable Recommendation
    next_action = f"Continue learning in '{current_stage.title}' to maintain your target pace." if current_stage else "Start your first roadmap milestone."

    return PersonalizedRoadmapOverview(
        user_id=user_id,
        user_name=user_name,
        target_role=role_def.title,
        roadmap_version=current_version,
        adaptation_reason=adaptation_reason,
        overall_progress=overall_progress,
        completed_stages=completed_count,
        total_stages=total_stages,
        weekly_hours_budget=weekly_hours,
        target_timeline_months=target_months,
        estimated_remaining_weeks=total_remaining_weeks,
        is_timeline_feasible=is_feasible,
        timeline_advisory=timeline_advisory,
        current_stage=current_stage,
        next_stage=next_stage,
        current_blocker=gap_analysis.critical_blocker,
        next_recommended_action=next_action,
        stages=stages,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
