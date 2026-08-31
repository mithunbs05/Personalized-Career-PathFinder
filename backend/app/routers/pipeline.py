"""
Pipeline Router — Core Endpoints for PathAI Dynamic Intelligence Pipeline.

Exposes:
- GET /api/v1/pipeline/knowledge
- POST /api/v1/pipeline/diagnostic/start
- POST /api/v1/pipeline/diagnostic/evaluate
- POST /api/v1/pipeline/roles/predict
- GET /api/v1/pipeline/gaps
- POST /api/v1/pipeline/roadmap/generate
- GET /api/v1/pipeline/roadmap/overview
"""

from __future__ import annotations

import logging
from typing import Any, Optional
from fastapi import APIRouter, Header, HTTPException, Body
from pydantic import BaseModel, Field

from app.services.profile_service import verify_supabase_jwt
from app.services.knowledge_state_service import (
    get_or_init_knowledge_state,
    build_learner_knowledge_profile,
    LearnerKnowledgeProfile,
)
from app.services.role_prediction_service import (
    predict_career_roles,
    RolePredictionResponse,
)
from app.services.gap_analysis_service import (
    analyze_learner_gaps,
    RoleGapAnalysisResponse,
)
from app.services.adaptive_roadmap_generator import (
    generate_personalized_roadmap,
    PersonalizedRoadmapOverview,
)
from app.services.adaptive_assessment_service import (
    select_adaptive_diagnostic_questions,
    evaluate_diagnostic_submission,
)
from app.services.mentor_service import get_user_profile_from_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/pipeline", tags=["Intelligence Pipeline"])

async def _get_auth_user(authorization: Optional[str]) -> dict[str, Any]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        user = await verify_supabase_jwt(token)
        if user:
            return user
    return {"id": "00000000-0000-0000-0000-000000000001", "name": "Learner", "email": "learner@pathai.dev"}

# ---------------------------------------------------------------------------
# 1. Knowledge State Endpoint
# ---------------------------------------------------------------------------
@router.get("/knowledge", response_model=LearnerKnowledgeProfile)
async def get_learner_knowledge(authorization: Optional[str] = Header(None)):
    """Retrieves full granular knowledge profile with mastery, confidence, and status."""
    user = await _get_auth_user(authorization)
    return await build_learner_knowledge_profile(user["id"])

# ---------------------------------------------------------------------------
# 2. Diagnostic Assessment Endpoints
# ---------------------------------------------------------------------------
class DiagnosticStartRequest(BaseModel):
    target_role: Optional[str] = "Machine Learning Engineer"
    max_questions: Optional[int] = 6

@router.post("/diagnostic/start")
async def start_diagnostic_assessment(
    request: DiagnosticStartRequest = Body(...),
    authorization: Optional[str] = Header(None),
):
    """Selects adaptive diagnostic questions targeting learner's highest-uncertainty topics."""
    user = await _get_auth_user(authorization)
    questions = await select_adaptive_diagnostic_questions(
        user_id=user["id"],
        target_role_title=request.target_role or "Machine Learning Engineer",
        max_questions=request.max_questions or 6,
    )
    return {"user_id": user["id"], "total_questions": len(questions), "questions": questions}

class DiagnosticAnswerItem(BaseModel):
    question_id: str
    selected_option: int

class DiagnosticEvaluateRequest(BaseModel):
    answers: list[DiagnosticAnswerItem]
    session_id: Optional[str] = None

@router.post("/diagnostic/evaluate")
async def evaluate_diagnostic(
    request: DiagnosticEvaluateRequest = Body(...),
    authorization: Optional[str] = Header(None),
):
    """Authoritatively evaluates diagnostic quiz, updates topic masteries, and shrinks uncertainty."""
    user = await _get_auth_user(authorization)
    results = await evaluate_diagnostic_submission(
        user_id=user["id"],
        answers=[a.dict() for a in request.answers],
        session_id=request.session_id,
    )
    return results

# ---------------------------------------------------------------------------
# 3. Role Prediction Endpoint
# ---------------------------------------------------------------------------
class RolePredictRequest(BaseModel):
    profile_override: Optional[dict[str, Any]] = None

@router.post("/roles/predict", response_model=RolePredictionResponse)
async def predict_roles(
    request: Optional[RolePredictRequest] = None,
    authorization: Optional[str] = Header(None),
):
    """Computes transparent feature-weighted role fit scores with evidence breakdowns."""
    user = await _get_auth_user(authorization)
    user_prof = await get_user_profile_from_db(user["id"])
    profile_data = {}
    if user_prof and user_prof.get("profile_metadata"):
        profile_data = user_prof["profile_metadata"]
    if request and request.profile_override:
        profile_data.update(request.profile_override)

    return await predict_career_roles(user["id"], profile_data)

# ---------------------------------------------------------------------------
# 4. Skill Gap Analysis Endpoint
# ---------------------------------------------------------------------------
@router.get("/gaps", response_model=RoleGapAnalysisResponse)
async def get_skill_gaps(
    role: Optional[str] = "Machine Learning Engineer",
    authorization: Optional[str] = Header(None),
):
    """Evaluates root-cause topic gaps, prerequisite blockers, and priority gap-filling plans."""
    user = await _get_auth_user(authorization)
    user_prof = await get_user_profile_from_db(user["id"])
    effective_role = role
    if not effective_role and user_prof and user_prof.get("profile_metadata"):
        meta = user_prof["profile_metadata"]
        effective_role = meta.get("target_goal") or meta.get("target_role")
    if not effective_role:
        effective_role = "Machine Learning Engineer"

    return await analyze_learner_gaps(user["id"], effective_role)

# ---------------------------------------------------------------------------
# 5. Personalized Roadmap Endpoints
# ---------------------------------------------------------------------------
class RoadmapGenerateRequest(BaseModel):
    target_role: Optional[str] = None
    weekly_hours: Optional[int] = 10
    target_months: Optional[int] = 6
    adaptation_reason: Optional[str] = None

@router.post("/roadmap/generate", response_model=PersonalizedRoadmapOverview)
async def generate_roadmap_endpoint(
    request: Optional[RoadmapGenerateRequest] = None,
    authorization: Optional[str] = Header(None),
):
    """Synthesizes a personalized sequenced roadmap matching learner's gaps and schedule."""
    user = await _get_auth_user(authorization)
    user_prof = await get_user_profile_from_db(user["id"])
    
    target_role = "Machine Learning Engineer"
    weekly_hrs = 10
    target_mos = 6
    
    if user_prof and user_prof.get("profile_metadata"):
        meta = user_prof["profile_metadata"]
        target_role = meta.get("target_goal") or meta.get("target_role") or target_role
        weekly_hrs = int(meta.get("weekly_hours", 10))
        target_mos = int(meta.get("target_completion_months", 6))

    if request:
        if request.target_role: target_role = request.target_role
        if request.weekly_hours: weekly_hrs = request.weekly_hours
        if request.target_months: target_mos = request.target_months

    return await generate_personalized_roadmap(
        user_id=user["id"],
        target_role_title=target_role,
        user_name=user.get("name", "Learner"),
        weekly_hours=weekly_hrs,
        target_months=target_mos,
        adaptation_reason=request.adaptation_reason if request else None,
    )

@router.get("/roadmap/overview", response_model=PersonalizedRoadmapOverview)
async def get_personalized_roadmap_overview(
    role: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """Returns live personalized roadmap overview with active milestone and progress."""
    user = await _get_auth_user(authorization)
    user_prof = await get_user_profile_from_db(user["id"])
    target_role = role or "Machine Learning Engineer"
    weekly_hrs = 10
    target_mos = 6
    if user_prof and user_prof.get("profile_metadata"):
        meta = user_prof["profile_metadata"]
        target_role = meta.get("target_goal") or meta.get("target_role") or target_role
        weekly_hrs = int(meta.get("weekly_hours", 10))
        target_mos = int(meta.get("target_completion_months", 6))

    return await generate_personalized_roadmap(
        user_id=user["id"],
        target_role_title=target_role,
        user_name=user.get("name", "Learner"),
        weekly_hours=weekly_hrs,
        target_months=target_mos,
    )

# ---------------------------------------------------------------------------
# 6. Course & Resource Recommendation Endpoints
# ---------------------------------------------------------------------------
@router.get("/resources")
async def get_recommended_resources(
    role: Optional[str] = "Machine Learning Engineer",
    preferred_format: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    """Retrieves ranked learning resources matched to learner's active topic deficits."""
    from app.services.resource_recommender_service import recommend_resources_for_learner
    user = await _get_auth_user(authorization)
    return await recommend_resources_for_learner(
        user_id=user["id"],
        target_role=role or "Machine Learning Engineer",
        preferred_format=preferred_format,
    )

class ResourceFeedbackPayload(BaseModel):
    resource_id: str
    status: str  # STARTED, COMPLETED, DROPPED
    time_spent_minutes: Optional[int] = 0
    rating: Optional[int] = None
    post_assessment_score: Optional[int] = None

@router.post("/resources/feedback")
async def submit_resource_feedback(
    payload: ResourceFeedbackPayload = Body(...),
    authorization: Optional[str] = Header(None),
):
    """Records learner feedback and interaction status for a learning resource."""
    from app.services.resource_recommender_service import record_resource_feedback
    user = await _get_auth_user(authorization)
    return await record_resource_feedback(
        user_id=user["id"],
        resource_id=payload.resource_id,
        status=payload.status,
        time_spent_minutes=payload.time_spent_minutes or 0,
        rating=payload.rating,
        post_assessment_score=payload.post_assessment_score,
    )
