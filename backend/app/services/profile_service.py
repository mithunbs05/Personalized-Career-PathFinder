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
    access_token: str | None = None,
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

        # The request token gives PostgREST the auth.uid() required by the
        # profiles RLS policies.
        if access_token:
            client.postgrest.auth(access_token)

        from app.services.mentor_service import _IN_MEMORY_PROFILES, _ensure_valid_uuid

        # 1. Upsert into profiles table
        profile_data = {
            "user_id": user_id,
            "profile_metadata": profile_metadata,
            "completed_categories": completed_categories or [],
            "onboarding_completed": True,
        }

        # Cache in memory immediately for fast access across services
        valid_uid = _ensure_valid_uuid(user_id)
        _IN_MEMORY_PROFILES[valid_uid] = profile_data
        _IN_MEMORY_PROFILES[user_id] = profile_data

        try:
            client.table("profiles").upsert(
                profile_data, on_conflict="user_id"
            ).execute()
            logger.info("Successfully upserted profile into 'profiles' table for user %s", user_id)
        except Exception as table_err:
            logger.error("Failed to upsert into 'profiles' table: %s", table_err, exc_info=True)
            return {
                "success": False,
                "message": f"Could not save profile to Supabase: {table_err}",
            }

        # 2. Update users table onboarding_completed flag if available
        try:
            client.table("users").update(
                {"onboarding_completed": True}
            ).eq("id", user_id).execute()
        except Exception as user_err:
            logger.warning("Could not update 'users' table onboarding_completed flag: %s", user_err)

        logger.info("Profile save completed for user %s", user_id)
        return {
            "success": True,
            "message": "Profile saved and synced with Supabase.",
        }

    except Exception as e:
        logger.error("Failed to save profile for user %s: %s", user_id, e, exc_info=True)
        return {
            "success": False,
            "message": f"Could not save profile to Supabase: {str(e)}",
        }


def clean_int(val: Any, default: int) -> int:
    """Safely extracts a positive integer from the input value (int, float, string),
    returning the default if conversion fails or if the value is <= 0.
    """
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return int(val) if val > 0 else default
    
    val_str = str(val).strip()
    if not val_str:
        return default
        
    try:
        res = int(val_str)
        return res if res > 0 else default
    except ValueError:
        pass
        
    import re
    match = re.search(r'\d+', val_str)
    if match:
        try:
            res = int(match.group(0))
            return res if res > 0 else default
        except ValueError:
            pass
            
    return default

