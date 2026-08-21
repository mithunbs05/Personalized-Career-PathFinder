"""
Profile persistence service — saves the completed learner profile to Supabase.
"""

from __future__ import annotations

import logging
from typing import Any

from app.core.supabase_client import get_supabase_client
from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def verify_supabase_jwt(token: str) -> dict[str, Any] | None:
    """
    Verify a Supabase Auth JWT and return the user payload.

    Uses the Supabase client's auth.get_user() with the provided token.
    Returns the user data dict if valid, None otherwise.
    """
    try:
        client = get_supabase_client()
        user_response = client.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "name": (
                    user_response.user.user_metadata.get("name", "")
                    if user_response.user.user_metadata
                    else ""
                ),
            }
        return None
    except Exception as e:
        logger.error("JWT verification failed: %s", e)
        return None


async def save_profile(
    user_id: str,
    profile_metadata: dict[str, Any],
    completed_categories: list[str] | None = None,
) -> dict[str, Any]:
    """
    Upsert the learner profile into the Supabase `profiles` table
    and mark onboarding as completed in the `users` table.

    Args:
        user_id: The authenticated user's UUID.
        profile_metadata: Full 15-category profile JSON.
        completed_categories: List of completed category slugs.

    Returns:
        Dict with success status and message.
    """
    try:
        client = get_supabase_client()

        # 1. Upsert into profiles table
        profile_data = {
            "user_id": user_id,
            "profile_metadata": profile_metadata,
            "completed_categories": completed_categories or [],
            "onboarding_completed": True,
        }

        result = (
            client.table("profiles")
            .upsert(profile_data, on_conflict="user_id")
            .execute()
        )

        if not result.data:
            logger.warning("Profile upsert returned no data for user %s", user_id)

        # 2. Update users table onboarding_completed flag
        client.table("users").update(
            {"onboarding_completed": True}
        ).eq("id", user_id).execute()

        logger.info("Profile saved successfully for user %s", user_id)
        return {
            "success": True,
            "message": "Profile saved and onboarding marked as complete.",
        }

    except Exception as e:
        logger.error("Failed to save profile for user %s: %s", user_id, e, exc_info=True)
        return {
            "success": False,
            "message": f"Failed to save profile: {str(e)}",
        }
