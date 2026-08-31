"""
Gap Analysis & Gap-Filling Planning Service.

Performs root-cause topic-level gap detection comparing learner's Knowledge State
against the Target Role's required competencies.

Classifies gap types:
- KNOWLEDGE_GAP (theory / quiz score < 40%)
- PRACTICE_GAP (good quiz theory, but 0 practical challenges completed)
- PREREQUISITE_GAP (blocks downstream roadmap stages)
- INSUFFICIENT_EVIDENCE (required by role, but not yet assessed)

Constructs structured, actionable gap-filling plans with explicit completion criteria.
"""

from __future__ import annotations

import logging
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.core.knowledge_taxonomy import (
    CAREER_ROLES_BASE,
    RoleRequirement,
    TAXONOMY_TOPICS,
    TopicDefinition,
    CURATED_RESOURCES,
    ResourceDefinition,
)
from app.services.knowledge_state_service import get_or_init_knowledge_state, TopicKnowledgeState

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Models for Gap Analysis & Gap-Filling Plans
# ---------------------------------------------------------------------------

class GapFillingPlanItem(BaseModel):
    step_number: int
    action_type: str  # "LEARN", "PRACTICE", "ASSESS", "PROJECT"
    title: str
    description: str
    estimated_minutes: int
    resource_id: Optional[str] = None
    resource_title: Optional[str] = None
    resource_url: Optional[str] = None

class CompetencyGapItem(BaseModel):
    topic_id: str
    topic_title: str
    skill_name: str
    domain: str
    current_mastery: int
    required_mastery: int
    deficit: int  # required - current
    gap_type: str  # KNOWLEDGE_GAP, PRACTICE_GAP, PREREQUISITE_GAP, INSUFFICIENT_EVIDENCE
    priority_score: int  # 0 to 100
    is_blocking: bool
    blocked_topics: list[str] = Field(default_factory=list)
    reason: str
    estimated_hours_to_close: float
    gap_filling_plan: list[GapFillingPlanItem] = Field(default_factory=list)
    completion_criteria: str

class RoleGapAnalysisResponse(BaseModel):
    user_id: str
    target_role: str
    total_required_topics: int
    mastered_count: int
    developing_count: int
    critical_gaps_count: int
    unknown_evidence_count: int
    overall_readiness_percentage: int
    critical_blocker: Optional[str] = None
    priority_gaps: list[CompetencyGapItem]
    strong_competencies: list[str]
    evaluated_at: str

# ---------------------------------------------------------------------------
# Core Gap Evaluation & Plan Synthesis Engine
# ---------------------------------------------------------------------------

def _build_gap_plan(
    topic: TopicDefinition,
    current_m: int,
    req_m: int,
    gap_type: str,
) -> tuple[list[GapFillingPlanItem], str]:
    """Synthesizes step-by-step actionable learning steps and completion criteria."""
    from app.core.knowledge_taxonomy import get_all_taxonomy_resources
    all_res = get_all_taxonomy_resources()
    matching_res = next((r for r in all_res if topic.id in r.target_topic_ids), None)
    
    plan: list[GapFillingPlanItem] = []
    
    # Step 1: Conceptual Study
    plan.append(GapFillingPlanItem(
        step_number=1,
        action_type="LEARN",
        title=f"Master {topic.title} Core Theory",
        description=f"Study core concepts: {', '.join(topic.key_concepts[:3])}.",
        estimated_minutes=round(topic.estimated_hours * 30),
        resource_id=matching_res.id if matching_res else None,
        resource_title=matching_res.title if matching_res else "Official Documentation",
        resource_url=matching_res.url if matching_res else "#",
    ))
    
    # Step 2: Hands-on Practice
    plan.append(GapFillingPlanItem(
        step_number=2,
        action_type="PRACTICE",
        title=f"Solve Practice Challenges for {topic.skill_name}",
        description="Implement hands-on code examples and algorithmic problem walkthroughs in AI Mentor.",
        estimated_minutes=round(topic.estimated_hours * 20),
    ))
    
    # Step 3: Diagnostic Assessment
    plan.append(GapFillingPlanItem(
        step_number=3,
        action_type="ASSESS",
        title=f"Take {topic.title} Milestone Assessment",
        description=f"Score at least {req_m}% to verify mastery and resolve this competency gap.",
        estimated_minutes=15,
    ))
    
    completion_crit = f"Achieve >= {req_m}% mastery on diagnostic assessment with verified evidence."
    return plan, completion_crit

async def analyze_learner_gaps(
    user_id: str,
    target_role_title: str = "Machine Learning Engineer",
) -> RoleGapAnalysisResponse:
    """
    Evaluates root-cause topic gaps, prerequisite blockers, and priority-ranked gap-filling plans.
    """
    states = await get_or_init_knowledge_state(user_id)
    
    # Find role requirement definition
    from app.core.knowledge_taxonomy import find_career_role, get_topic_by_id, get_all_taxonomy_topics
    role_def = find_career_role(target_role_title)

    gaps: list[CompetencyGapItem] = []
    strong_competencies: list[str] = []
    
    mastered_cnt = 0
    developing_cnt = 0
    unknown_cnt = 0

    all_topics = get_all_taxonomy_topics()

    # Build downstream dependency lookup for prerequisite blocking detection
    dependents_map: dict[str, list[str]] = {}
    for top in all_topics:
        for prereq_id in top.prerequisites:
            if prereq_id not in dependents_map:
                dependents_map[prereq_id] = []
            dependents_map[prereq_id].append(top.title)

    for top_id, req_mastery in role_def.required_topics.items():
        top_def = get_topic_by_id(top_id)
        if not top_def:
            continue
            
        state = states.get(top_id)
        current_m = state.mastery if state and state.status != "UNKNOWN" else 0
        has_evidence = state.evidence_count > 0 if state else False
        
        # Check if this topic blocks any required downstream topics
        blocked = dependents_map.get(top_id, [])
        is_blocking = len(blocked) > 0 and current_m < 75

        deficit = max(0, req_mastery - current_m)
        
        if not has_evidence:
            gap_type = "INSUFFICIENT_EVIDENCE"
            unknown_cnt += 1
            reason = f"Required competency for {role_def.title} has no verified assessment evidence."
        elif is_blocking:
            gap_type = "PREREQUISITE_GAP"
            reason = f"Blocks downstream topics ({', '.join(blocked[:2])}) until at least 75% mastery is achieved."
        elif state and state.practice_attempts == 0 and current_m >= 50:
            gap_type = "PRACTICE_GAP"
            reason = "Theoretical concept demonstrated, but practical coding application is unverified."
        else:
            gap_type = "KNOWLEDGE_GAP"
            reason = f"Current mastery ({current_m}%) is below the industry benchmark ({req_mastery}%)."

        # Priority calculation
        # Priority = 0.40 * Deficit + 0.30 * (100 if is_blocking else 40) + 0.30 * (70 if gap_type != INSUFFICIENT_EVIDENCE else 50)
        p_score = round(
            0.40 * deficit +
            0.30 * (100 if is_blocking else 40) +
            0.30 * (70 if has_evidence else 50)
        )
        p_score = max(10, min(99, p_score))

        if current_m >= req_mastery:
            mastered_cnt += 1
            strong_competencies.append(f"{top_def.title} ({current_m}%)")
        else:
            if current_m >= 50:
                developing_cnt += 1
            
            plan, criteria = _build_gap_plan(top_def, current_m, req_mastery, gap_type)
            hours_est = round(top_def.estimated_hours * (deficit / 100.0), 1)

            gaps.append(CompetencyGapItem(
                topic_id=top_def.id,
                topic_title=top_def.title,
                skill_name=top_def.skill_name,
                domain=top_def.domain,
                current_mastery=current_m,
                required_mastery=req_mastery,
                deficit=deficit,
                gap_type=gap_type,
                priority_score=p_score,
                is_blocking=is_blocking,
                blocked_topics=blocked,
                reason=reason,
                estimated_hours_to_close=max(1.5, hours_est),
                gap_filling_plan=plan,
                completion_criteria=criteria,
            ))

    # Sort gaps descending by priority_score
    gaps.sort(key=lambda g: (g.is_blocking, g.priority_score), reverse=True)
    
    critical_blocker = None
    blocking_gap = next((g for g in gaps if g.is_blocking), None)
    if blocking_gap:
        critical_blocker = f"'{blocking_gap.topic_title}' ({blocking_gap.current_mastery}%) is currently blocking progress in {', '.join(blocking_gap.blocked_topics[:2])}."

    total_req = len(role_def.required_topics)
    readiness_pct = round((mastered_cnt / max(1, total_req)) * 100)

    return RoleGapAnalysisResponse(
        user_id=user_id,
        target_role=role_def.title,
        total_required_topics=total_req,
        mastered_count=mastered_cnt,
        developing_count=developing_cnt,
        critical_gaps_count=len(gaps),
        unknown_evidence_count=unknown_cnt,
        overall_readiness_percentage=readiness_pct,
        critical_blocker=critical_blocker,
        priority_gaps=gaps,
        strong_competencies=strong_competencies,
        evaluated_at="now",
    )
