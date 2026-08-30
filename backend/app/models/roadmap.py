"""
Roadmap Data Models & Pydantic Schemas for Adaptive Curriculum Timeline.
"""

from __future__ import annotations
from typing import Any, Optional, Literal
from pydantic import BaseModel, Field


class LearningResourceItem(BaseModel):
    id: str
    title: str
    type: Literal["COURSE", "DOCUMENTATION", "VIDEO", "PRACTICE", "ASSESSMENT"]
    provider: str
    duration: str
    url: str = "#"


class RoadmapTopicItem(BaseModel):
    id: str
    title: str
    skill_id: str
    skill_name: str
    mastery: int = 0
    status: Literal["COMPLETED", "IN_PROGRESS", "NOT_STARTED", "LOCKED"]
    estimated_time: str
    key_concepts: list[str] = Field(default_factory=list)


class PrerequisiteCheckItem(BaseModel):
    stage_id: int
    stage_title: str
    required_skills: list[str]
    satisfied: bool
    missing_skills: list[dict[str, Any]] = Field(default_factory=list)


class RoadmapStageSummary(BaseModel):
    id: int
    title: str
    status: Literal["COMPLETED", "IN_PROGRESS", "AVAILABLE", "NOT_STARTED", "LOCKED"]
    difficulty: str
    estimated_duration: str
    progress: int
    is_final_capstone: bool = False
    skills: list[str] = Field(default_factory=list)


class RoadmapStageDetail(BaseModel):
    id: int
    title: str
    status: Literal["COMPLETED", "IN_PROGRESS", "AVAILABLE", "NOT_STARTED", "LOCKED"]
    difficulty: str
    estimated_duration: str
    progress: int
    completed_topics: int
    total_topics: int
    why_learn: str
    career_relevance: str
    prerequisites: list[str] = Field(default_factory=list)
    prerequisite_checks: list[PrerequisiteCheckItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    learnings: list[str] = Field(default_factory=list)
    topics: list[RoadmapTopicItem] = Field(default_factory=list)
    resources: list[LearningResourceItem] = Field(default_factory=list)
    project: str
    is_final_capstone: bool = False
    next_best_action: str
    actions_available: list[str] = Field(default_factory=list)


class RoadmapOverviewResponse(BaseModel):
    user_id: str
    user_name: str
    target_role: str
    overall_progress: int
    completed_stages: int
    total_stages: int
    current_stage: Optional[RoadmapStageSummary] = None
    next_stage: Optional[RoadmapStageSummary] = None
    estimated_remaining_weeks: int
    current_blocker: Optional[str] = None
    next_recommended_action: str
    stages: list[RoadmapStageSummary]


class StageStartResponse(BaseModel):
    stage_id: int
    status: str
    started_at: str
    message: str


class StageProgressUpdateRequest(BaseModel):
    progress: int
    topic_id: Optional[str] = None
    topic_mastery: Optional[int] = None


class StageCompleteResponse(BaseModel):
    stage_id: int
    status: str
    completed_at: str
    message: str
    unlocked_stages: list[int] = Field(default_factory=list)
