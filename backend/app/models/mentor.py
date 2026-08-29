"""
Pydantic models for the AI Mentor feature.
"""

from __future__ import annotations

from typing import Any, Optional, Literal
from pydantic import BaseModel, Field


class TodaysFocus(BaseModel):
    """Dynamic learning focus calculated by the priority engine."""
    domain: str
    skill: str
    skill_id: str
    topic: Optional[str] = None
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    mastery: int
    estimated_minutes: int
    reason: str
    blocks_stage: Optional[str] = None


class RelevantSkillItem(BaseModel):
    """Snapshot of a learner's skill state."""
    id: str
    name: str
    domain: str
    level: str
    progress: int
    is_verified: bool = False


class LearnerContextResponse(BaseModel):
    """Full contextual profile supplied to the mentor."""
    user_id: str
    user_name: str
    target_role: str
    current_stage: str
    current_stage_order: int
    current_stage_progress: int
    overall_mastery: int
    focus: Optional[TodaysFocus] = None
    relevant_skills: list[RelevantSkillItem] = Field(default_factory=list)
    recent_assessments: list[dict[str, Any]] = Field(default_factory=list)
    active_session_id: Optional[str] = None


class MentorSessionCreateRequest(BaseModel):
    """Request to initialize a new persistent mentor session."""
    mode: Literal["learn", "practice", "assess"] = "learn"
    domain: Optional[str] = None
    skill: Optional[str] = None
    skill_id: Optional[str] = None
    topic: Optional[str] = None
    roadmap_stage: Optional[str] = None


class MentorSessionResponse(BaseModel):
    """Details of a mentor session."""
    id: str
    user_id: str
    domain: str
    skill: str
    skill_id: Optional[str] = None
    topic: Optional[str] = None
    roadmap_stage: str
    mode: str
    started_at: str
    status: str
    opening_message: Optional[str] = None


class MentorMessageItem(BaseModel):
    """Single message in a mentor conversation."""
    id: str
    session_id: str
    sender: Literal["user", "ai", "system"]
    text: str
    timestamp: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class SendMessageRequest(BaseModel):
    """Request to send a message within a mentor session."""
    message: str


class SendMessageResponse(BaseModel):
    """Response containing assistant reply and metadata."""
    id: str
    reply: str
    suggested_actions: list[str] = Field(default_factory=list)
    topic: Optional[str] = None
    recommended_action: Optional[str] = None


class PracticeQuestionItem(BaseModel):
    """Practice exercise item."""
    id: str
    question: str
    code_snippet: Optional[str] = None
    hints: list[str] = Field(default_factory=list)
    difficulty: str


class PracticeResponse(BaseModel):
    """Response containing practice exercise."""
    topic: str
    skill: str
    exercise_prompt: str
    difficulty: str
    hints: list[str] = Field(default_factory=list)
    starter_code: Optional[str] = None


class AssessmentQuestionClient(BaseModel):
    """Assessment question stripped of correct answer (safe for client)."""
    id: str
    text: str
    options: list[str]
    # NOTE: correctAnswer and explanation are omitted for security


class CreateAssessmentResponse(BaseModel):
    """Response returned to client when starting an assessment."""
    assessment_id: str
    skill: str
    topic: Optional[str] = None
    total_questions: int
    questions: list[AssessmentQuestionClient]


class AssessmentSubmitRequest(BaseModel):
    """Learner's submitted answers."""
    assessment_id: str
    answers: list[int] = Field(..., description="Array of selected option indices (0-indexed)")


class QuestionResult(BaseModel):
    """Individual question grading result."""
    question_id: str
    correct: bool
    selected_option: int
    correct_option: int
    explanation: str


class AssessmentSubmitResponse(BaseModel):
    """Server-calculated assessment result."""
    assessment_id: str
    score: int
    correct_count: int
    total_questions: int
    results: list[QuestionResult]
    new_mastery: int
    skill_name: str
    updated_focus: Optional[TodaysFocus] = None
    mentor_feedback: str


class UserSkillUpdateResponse(BaseModel):
    """User's current dynamic skill masteries."""
    skills: list[RelevantSkillItem]
