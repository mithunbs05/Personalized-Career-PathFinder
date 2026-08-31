"""
Router for the onboarding conversational chat endpoint.

POST /api/v1/onboarding/chat — Accepts conversation history and current
extracted entity state, returns the next assistant message with updated entities.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.models.onboarding import (
    OnboardingChatRequest,
    OnboardingChatResponse,
)
from app.services.onboarding_service import process_onboarding_turn

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/onboarding", tags=["Onboarding"])


@router.post(
    "/chat",
    response_model=OnboardingChatResponse,
    summary="Process one conversational onboarding turn",
    description=(
        "Accepts the full conversation history and the currently extracted "
        "entity state. Returns the assistant's reply, quick-reply chips, "
        "updated entities, completed categories, and completion flag."
    ),
)
async def onboarding_chat(request: OnboardingChatRequest) -> OnboardingChatResponse:
    """Handle a single onboarding conversational turn."""
    try:
        # Convert chat messages to simple dicts
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]

        result: dict[str, Any] = await process_onboarding_turn(
            conversation_history=history,
            current_entities=request.extracted_entities,
        )

        return OnboardingChatResponse(
            assistant_message=result["assistant_message"],
            quick_reply_chips=result.get("quick_reply_chips", []),
            extracted_entities=result.get("extracted_entities", {}),
            completed_categories=result.get("completed_categories", []),
            is_profile_complete=result.get("is_profile_complete", False),
        )

    except RuntimeError as e:
        # Config errors (missing API key, etc.)
        logger.error("Configuration error in onboarding chat: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        logger.error("Unexpected error in onboarding chat: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process onboarding message. Please try again.",
        )
