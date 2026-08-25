"""
Router for persisting the completed learner profile to Supabase.

POST /api/v1/profile/save — Accepts the verified user's JWT token
and the final structured profile JSON. Upserts into the profiles table.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Header, status

from app.models.onboarding import ProfileSaveRequest, ProfileSaveResponse
from app.services.profile_service import save_profile, verify_supabase_jwt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])


@router.post(
    "/save",
    response_model=ProfileSaveResponse,
    summary="Save completed learner profile to Supabase",
    description=(
        "Verifies the user via Supabase Auth JWT, then upserts the extracted "
        "profile data into the profiles table and marks onboarding as complete."
    ),
)
async def save_learner_profile(
    request: ProfileSaveRequest,
    authorization: str = Header(
        ...,
        description="Bearer token from Supabase Auth (e.g. 'Bearer eyJ...')",
    ),
) -> ProfileSaveResponse:
    """Persist the final onboarding profile."""
    try:
        # Extract JWT from Bearer header
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header must be 'Bearer <token>'.",
            )

        token = authorization.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token.",
            )

        # Verify user via Supabase
        user_data = await verify_supabase_jwt(token)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
            )

        user_id: str = user_data["id"]

        # Save profile
        result = await save_profile(
            user_id=user_id,
            profile_metadata=request.profile_metadata,
            completed_categories=request.completed_categories,
            access_token=token,
        )

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["message"],
            )

        return ProfileSaveResponse(
            success=True,
            message=result["message"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Profile save error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save profile. Please try again.",
        )
