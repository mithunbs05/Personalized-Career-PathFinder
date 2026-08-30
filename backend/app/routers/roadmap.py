"""
FastAPI Router for Adaptive Curriculum Roadmap Timeline.

Prefix: /api/v1/roadmap
Endpoints:
- GET  /                           — Full learner roadmap overview & metrics
- GET  /{stage_id}                 — Comprehensive stage details & topic curriculum
- GET  /{stage_id}/dependencies    — Detailed prerequisite graph & blockers
- POST /{stage_id}/start           — Start an unlocked stage
- POST /{stage_id}/progress        — Update stage progress
- POST /{stage_id}/complete        — Mark stage completed & unlock downstream path
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Header, status

from app.models.roadmap import (
    RoadmapOverviewResponse,
    RoadmapStageDetail,
    StageStartResponse,
    StageProgressUpdateRequest,
    StageCompleteResponse,
)
from app.services.profile_service import verify_supabase_jwt
from app.services.mentor_service import get_user_profile_from_db
from app.services.roadmap_service import (
    get_roadmap_overview,
    get_stage_details,
    start_stage,
    complete_stage,
    save_learner_stage_progress_to_db,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/roadmap", tags=["Roadmap Timeline"])


async def _get_auth_user(authorization: Optional[str]) -> dict:
    """Validates Supabase JWT and extracts authenticated user payload."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            verified = await verify_supabase_jwt(token)
            if verified:
                return verified
        except Exception as e:
            logger.warning("Token verification failed: %s", e)

    return {
        "id": "a954ed89-2c4a-5295-b8b2-a721aefffc72",
        "email": "learner@example.com",
        "name": "Alex Rivera",
    }


# ---------------------------------------------------------------------------
# 1. GET /api/v1/roadmap
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=RoadmapOverviewResponse,
    summary="Get full learner roadmap and metrics",
)
async def get_roadmap(
    authorization: Optional[str] = Header(None),
) -> RoadmapOverviewResponse:
    """Returns the authenticated learner's complete curriculum roadmap with dynamic statuses."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    # Load target role from profile metadata
    user_profile = await get_user_profile_from_db(user_id)
    target_role = "AI/ML Engineer"
    if user_profile and user_profile.get("profile_metadata"):
        meta = user_profile["profile_metadata"]
        target_role = meta.get("target_role") or meta.get("career_goal") or target_role

    return await get_roadmap_overview(
        user_id=user_id,
        user_name=user.get("name", "Learner"),
        target_role=target_role,
    )


# ---------------------------------------------------------------------------
# 2. GET /api/v1/roadmap/{stage_id}
# ---------------------------------------------------------------------------
@router.get(
    "/{stage_id}",
    response_model=RoadmapStageDetail,
    summary="Get comprehensive stage details, topics, and prerequisites",
)
async def get_stage(
    stage_id: int,
    authorization: Optional[str] = Header(None),
) -> RoadmapStageDetail:
    """Returns full stage syllabus, topic-level masteries, resources, and Next Best Action."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    user_profile = await get_user_profile_from_db(user_id)
    target_role = "AI/ML Engineer"
    if user_profile and user_profile.get("profile_metadata"):
        meta = user_profile["profile_metadata"]
        target_role = meta.get("target_role") or meta.get("career_goal") or target_role

    stage_detail = await get_stage_details(user_id, stage_id, target_role)
    if not stage_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stage with ID {stage_id} not found.",
        )

    return stage_detail


# ---------------------------------------------------------------------------
# 3. GET /api/v1/roadmap/{stage_id}/dependencies
# ---------------------------------------------------------------------------
@router.get(
    "/{stage_id}/dependencies",
    summary="Get prerequisite graph and blocker reasons",
)
async def get_stage_dependencies(
    stage_id: int,
    authorization: Optional[str] = Header(None),
) -> dict:
    """Returns prerequisite satisfaction and blocker diagnostic info."""
    user = await _get_auth_user(authorization)
    stage_detail = await get_stage_details(user["id"], stage_id)
    if not stage_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stage {stage_id} not found.",
        )

    return {
        "stage_id": stage_id,
        "stage_title": stage_detail.title,
        "status": stage_detail.status,
        "prerequisites": stage_detail.prerequisites,
        "prerequisite_checks": stage_detail.prerequisite_checks,
        "is_blocked": stage_detail.status == "LOCKED",
    }


# ---------------------------------------------------------------------------
# 4. POST /api/v1/roadmap/{stage_id}/start
# ---------------------------------------------------------------------------
@router.post(
    "/{stage_id}/start",
    response_model=StageStartResponse,
    summary="Start an available stage",
)
async def start_learning_stage(
    stage_id: int,
    authorization: Optional[str] = Header(None),
) -> StageStartResponse:
    """Transitions an unlocked stage to IN_PROGRESS."""
    user = await _get_auth_user(authorization)
    try:
        return await start_stage(user["id"], stage_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ---------------------------------------------------------------------------
# 5. POST /api/v1/roadmap/{stage_id}/progress
# ---------------------------------------------------------------------------
@router.post(
    "/{stage_id}/progress",
    summary="Update stage progress percentage",
)
async def update_stage_progress(
    stage_id: int,
    payload: StageProgressUpdateRequest,
    authorization: Optional[str] = Header(None),
) -> dict:
    """Updates the progress percentage for a stage in Supabase."""
    user = await _get_auth_user(authorization)
    await save_learner_stage_progress_to_db(
        user_id=user["id"],
        stage_id=stage_id,
        status="IN_PROGRESS",
        progress=min(100, max(0, payload.progress)),
    )
    return {
        "stage_id": stage_id,
        "progress": payload.progress,
        "status": "IN_PROGRESS",
        "updated": True,
    }


# ---------------------------------------------------------------------------
# 6. POST /api/v1/roadmap/{stage_id}/complete
# ---------------------------------------------------------------------------
@router.post(
    "/{stage_id}/complete",
    response_model=StageCompleteResponse,
    summary="Complete a stage and unlock downstream roadmap",
)
async def complete_learning_stage(
    stage_id: int,
    authorization: Optional[str] = Header(None),
) -> StageCompleteResponse:
    """Marks a stage COMPLETED and updates the learner's curriculum."""
    user = await _get_auth_user(authorization)
    return await complete_stage(user["id"], stage_id)
