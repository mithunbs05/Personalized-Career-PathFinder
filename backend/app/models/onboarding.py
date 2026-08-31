"""
Pydantic models for the onboarding conversational chat and profile save endpoints.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 15 Learner Profile Entities
# ---------------------------------------------------------------------------

class ExtractedEntities(BaseModel):
    """All 15 learner-profile dimensions extracted during onboarding."""

    # 1. Education Details
    education_degree: Optional[str] = Field(None, description="Degree name (e.g. B.Tech, M.Sc)")
    education_major: Optional[str] = Field(None, description="Branch or major (e.g. Computer Science)")
    graduation_year: Optional[str] = Field(None, description="Year of graduation (e.g. 2025)")

    # 2. Professional Profiles
    github_url: Optional[str] = Field(None, description="GitHub profile URL or 'skip'")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL or 'skip'")

    # 3. Industry Experience Status
    industry_experience_type: Optional[str] = Field(
        None, description="fresher | intern | working_professional"
    )
    years_experience: Optional[str] = Field(None, description="Years of experience if applicable")

    # 4. Known Tech Stack
    known_skills: Optional[list[str]] = Field(
        None, description="Languages, frameworks, and tools already familiar with"
    )

    # 5. Projects Portfolio
    current_projects: Optional[str] = Field(
        None, description="Past builds, current ongoing projects, or 'none'"
    )

    # 6. Past Courses & Certifications
    completed_learning: Optional[str] = Field(
        None, description="Completed bootcamps, NPTEL, Coursera, etc."
    )

    # 7. Personal Interests
    technical_interests: Optional[list[str]] = Field(
        None, description="Sub-domains of interest (e.g. Multi-Agent AI, RAG, Web Dev)"
    )

    # 8. Target Role
    target_goal: Optional[str] = Field(None, description="Desired specialization / target job")
    job_specialization: Optional[str] = Field(None, description="Specific specialization area")

    # 9. Target Timeline
    target_completion_months: Optional[str] = Field(
        None, description="Target deadline in months (e.g. 3, 6, 12)"
    )

    # 10. Target Benchmark / Salary
    salary_placement_goal: Optional[str] = Field(
        None, description="Target compensation tier (e.g. ₹10-12 LPA, FAANG)"
    )

    # 11. Weekly Commitment
    weekly_hours: Optional[int] = Field(None, description="Study/coding hours per week")

    # 12. Learning Format Preference
    learning_preferences: Optional[list[str]] = Field(
        None,
        description="Video walkthroughs, documentation, project-first, interactive coding",
    )

    # 13. Budget Constraints
    resource_budget: Optional[str] = Field(
        None, description="free_only | mixture | paid_acceptable"
    )

    # 14. Immediate Motivation / Trigger
    immediate_motivation: Optional[str] = Field(
        None, description="Placement drive, hackathon, certification, career switch, etc."
    )

    # 15. Language Preference
    language_preference: Optional[str] = Field(
        None, description="Preferred language for instruction/documentation (e.g. English, Hindi)"
    )

    # Derived
    experience_level: Optional[str] = Field(
        None, description="beginner | intermediate | advanced"
    )


# ---------------------------------------------------------------------------
# Chat Message
# ---------------------------------------------------------------------------

class ChatMessagePayload(BaseModel):
    """A single message in the conversation history."""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


# ---------------------------------------------------------------------------
# Request / Response for POST /api/v1/onboarding/chat
# ---------------------------------------------------------------------------

class OnboardingChatRequest(BaseModel):
    """Request body for the conversational onboarding turn."""
    conversation_history: list[ChatMessagePayload] = Field(
        default_factory=list,
        description="Full conversation history up to this point",
    )
    extracted_entities: dict[str, Any] = Field(
        default_factory=dict,
        description="Currently extracted profile state from prior turns",
    )


class OnboardingChatResponse(BaseModel):
    """Structured response from the onboarding chat endpoint."""
    assistant_message: str = Field(..., description="Natural language reply and next question")
    quick_reply_chips: list[str] = Field(
        default_factory=list,
        description="3-4 contextual quick-reply options",
    )
    extracted_entities: dict[str, Any] = Field(
        default_factory=dict,
        description="Updated key-value pairs of the 15 categories",
    )
    completed_categories: list[str] = Field(
        default_factory=list,
        description="Category slugs completed so far",
    )
    is_profile_complete: bool = Field(
        False, description="True when all mandatory categories are satisfied"
    )


# ---------------------------------------------------------------------------
# Request / Response for POST /api/v1/profile/save
# ---------------------------------------------------------------------------

class ProfileSaveRequest(BaseModel):
    """Request body for persisting the final profile."""
    profile_metadata: dict[str, Any] = Field(
        ..., description="Complete 15-category profile JSON"
    )
    completed_categories: list[str] = Field(
        default_factory=list,
        description="List of completed category slugs",
    )


class ProfileSaveResponse(BaseModel):
    """Response from profile save endpoint."""
    success: bool
    message: str
