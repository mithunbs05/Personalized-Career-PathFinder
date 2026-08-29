"""
FastAPI Router for AI Mentor Endpoints.

Prefix: /api/v1/mentor
Endpoints:
- GET  /context                   — Full learner context, relevant skills, today's focus
- GET  /focus                     — Dynamic Today's Focus calculation
- POST /sessions                  — Initialize persistent mentor session
- GET  /sessions/{session_id}     — Session history and details
- POST /sessions/{session_id}/messages — Send message, invoke LLM, persist & return reply
- POST /sessions/{session_id}/practice — Generate practice challenge
- POST /sessions/{session_id}/assessment — Generate client-safe assessment questions
- POST /assessments/{assessment_id}/submit — Server-side authoritative grading & mastery adaptation
- GET  /skills                    — Get user's active skills with dynamic progress
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Header, status

from app.models.mentor import (
    LearnerContextResponse,
    TodaysFocus,
    MentorSessionCreateRequest,
    MentorSessionResponse,
    SendMessageRequest,
    SendMessageResponse,
    PracticeResponse,
    CreateAssessmentResponse,
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
    RelevantSkillItem,
    UserSkillUpdateResponse,
)
from app.services.profile_service import verify_supabase_jwt
from app.services.mentor_service import (
    CANONICAL_STAGES,
    CANONICAL_SKILLS,
    QUESTION_BANK,
    calculate_todays_focus,
    generate_mentor_reply,
    generate_practice_exercise,
    generate_assessment_questions,
    grade_assessment,
    save_session_to_db,
    save_message_to_db,
    save_assessment_to_db,
    update_topic_progress_in_db,
    get_user_topic_progress_from_db,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/mentor", tags=["AI Mentor"])

# In-memory assessment question cache for active test sessions (assessment_id -> server_questions)
_ASSESSMENT_CACHE: dict[str, list[dict[str, Any]]] = {}
# In-memory session store for local development cache
_SESSION_STORE: dict[str, dict[str, Any]] = {}


async def _get_auth_user(authorization: Optional[str]) -> dict[str, Any]:
    """Helper to authenticate user from JWT or fallback to demo learner."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        user = await verify_supabase_jwt(token)
        if user:
            return user
    # Fallback to default learner for development/demo
    return {
        "id": "user-demo-101",
        "name": "Alex Rivera",
        "email": "alex@pathai.dev",
    }


# ---------------------------------------------------------------------------
# 1. GET /api/v1/mentor/context
# ---------------------------------------------------------------------------
@router.get(
    "/context",
    response_model=LearnerContextResponse,
    summary="Get full mentor learner context and today's focus",
)
async def get_mentor_context(
    authorization: Optional[str] = Header(None),
) -> LearnerContextResponse:
    """Returns real-time learner profile, current stage, skills, and Today's Focus."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    # Load topic progress from DB
    topic_progress = await get_user_topic_progress_from_db(user_id)
    topic_override_map = {t["skill_id"]: t["mastery"] for t in topic_progress}

    # Build active skills
    active_skills = [
        {
            **s,
            "progress": topic_override_map.get(s["id"], s["progress"]),
        }
        for s in CANONICAL_SKILLS
    ]

    current_stage = next((s for s in CANONICAL_STAGES if s["status"] == "IN_PROGRESS"), CANONICAL_STAGES[2])
    completed_count = sum(1 for s in CANONICAL_STAGES if s["status"] == "COMPLETED")
    overall_progress = round((completed_count / len(CANONICAL_STAGES)) * 100)

    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=active_skills,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
        topic_progress=topic_progress,
    )

    relevant_skills = [
        RelevantSkillItem(
            id=s["id"],
            name=s["name"],
            domain=s["domain"],
            level=s["level"],
            progress=s["progress"],
            is_verified=s["is_verified"],
        )
        for s in active_skills
    ]

    return LearnerContextResponse(
        user_id=user_id,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
        current_stage=current_stage["title"],
        current_stage_order=current_stage["order"],
        current_stage_progress=65,
        overall_mastery=overall_progress,
        focus=focus,
        relevant_skills=relevant_skills,
        recent_assessments=[],
    )


# ---------------------------------------------------------------------------
# 2. GET /api/v1/mentor/focus
# ---------------------------------------------------------------------------
@router.get(
    "/focus",
    response_model=TodaysFocus,
    summary="Calculate dynamic Today's Focus",
)
async def get_todays_focus(
    authorization: Optional[str] = Header(None),
) -> TodaysFocus:
    """Returns the highest priority learning focus for today."""
    user = await _get_auth_user(authorization)
    topic_progress = await get_user_topic_progress_from_db(user["id"])
    topic_override_map = {t["skill_id"]: t["mastery"] for t in topic_progress}

    active_skills = [
        {**s, "progress": topic_override_map.get(s["id"], s["progress"])}
        for s in CANONICAL_SKILLS
    ]

    return calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=active_skills,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
        topic_progress=topic_progress,
    )


# ---------------------------------------------------------------------------
# 3. POST /api/v1/mentor/sessions
# ---------------------------------------------------------------------------
@router.post(
    "/sessions",
    response_model=MentorSessionResponse,
    summary="Create a persistent mentor session",
)
async def create_mentor_session(
    request: MentorSessionCreateRequest,
    authorization: Optional[str] = Header(None),
) -> MentorSessionResponse:
    """Initializes a new mentor session with dynamic focus and opening message."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    topic_progress = await get_user_topic_progress_from_db(user_id)
    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=CANONICAL_SKILLS,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
        topic_progress=topic_progress,
    )

    domain = request.domain or focus.domain
    skill = request.skill or focus.skill
    topic = request.topic or focus.topic
    stage = request.roadmap_stage or "Mathematics & Statistics"
    mode = request.mode

    session_id = await save_session_to_db(
        user_id=user_id,
        domain=domain,
        skill=skill,
        topic=topic,
        roadmap_stage=stage,
        mode=mode,
    )

    # Store in memory cache
    _SESSION_STORE[session_id] = {
        "id": session_id,
        "user_id": user_id,
        "domain": domain,
        "skill": skill,
        "skill_id": focus.skill_id,
        "topic": topic,
        "roadmap_stage": stage,
        "mode": mode,
        "started_at": "now",
        "status": "active",
        "history": [],
    }

    opening_msg = (
        f"🎯 **{mode.capitalize()} Session Started: {skill}**\n\n"
        f"You're focusing on **{skill}** ({focus.mastery}% mastery) in **{domain}**. "
        f"*{focus.reason}*.\n\n"
        f"How would you like to begin?"
    )

    await save_message_to_db(
        session_id=session_id,
        user_id=user_id,
        role="assistant",
        content=opening_msg,
    )

    return MentorSessionResponse(
        id=session_id,
        user_id=user_id,
        domain=domain,
        skill=skill,
        skill_id=focus.skill_id,
        topic=topic,
        roadmap_stage=stage,
        mode=mode,
        started_at="now",
        status="active",
        opening_message=opening_msg,
    )


# ---------------------------------------------------------------------------
# 4. POST /api/v1/mentor/sessions/{session_id}/messages
# ---------------------------------------------------------------------------
@router.post(
    "/sessions/{session_id}/messages",
    response_model=SendMessageResponse,
    summary="Send message and generate AI mentor reply",
)
async def send_mentor_message(
    session_id: str,
    request: SendMessageRequest,
    authorization: Optional[str] = Header(None),
) -> SendMessageResponse:
    """Processes learner message, invokes LLM with full context, and persists reply."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    session = _SESSION_STORE.get(session_id, {
        "domain": "Math & Statistics",
        "skill": "Linear Algebra",
        "skill_id": "s4",
        "topic": "Matrix Operations",
        "roadmap_stage": "Mathematics & Statistics",
        "mode": "learn",
        "history": [],
    })

    # Persist user message
    await save_message_to_db(
        session_id=session_id,
        user_id=user_id,
        role="user",
        content=request.message,
    )
    session["history"].append({"role": "user", "content": request.message})

    # Build focus for prompt
    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=CANONICAL_SKILLS,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
    )

    # Generate reply
    reply_text, suggested_actions = await generate_mentor_reply(
        user_message=request.message,
        history=session["history"],
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
        current_stage=session.get("roadmap_stage", "Mathematics & Statistics"),
        focus=focus,
        mode=session.get("mode", "learn"),
    )

    # Persist assistant reply
    msg_id = await save_message_to_db(
        session_id=session_id,
        user_id=user_id,
        role="assistant",
        content=reply_text,
    )
    session["history"].append({"role": "assistant", "content": reply_text})

    return SendMessageResponse(
        id=msg_id,
        reply=reply_text,
        suggested_actions=suggested_actions,
        topic=session.get("topic"),
        recommended_action="Practice or take an assessment to validate knowledge",
    )


# ---------------------------------------------------------------------------
# 5. POST /api/v1/mentor/sessions/{session_id}/practice
# ---------------------------------------------------------------------------
@router.post(
    "/sessions/{session_id}/practice",
    response_model=PracticeResponse,
    summary="Generate practice exercise for active session",
)
async def get_practice_for_session(
    session_id: str,
    authorization: Optional[str] = Header(None),
) -> PracticeResponse:
    """Generates an interactive practice problem for the focus skill."""
    user = await _get_auth_user(authorization)
    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=CANONICAL_SKILLS,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
    )

    practice_data = await generate_practice_exercise(focus, target_role="AI/ML Engineer")

    return PracticeResponse(
        topic=practice_data["topic"],
        skill=practice_data["skill"],
        exercise_prompt=practice_data["exercise_prompt"],
        difficulty=practice_data["difficulty"],
        hints=practice_data["hints"],
        starter_code=practice_data.get("starter_code"),
    )


# ---------------------------------------------------------------------------
# 6. POST /api/v1/mentor/sessions/{session_id}/assessment
# ---------------------------------------------------------------------------
@router.post(
    "/sessions/{session_id}/assessment",
    response_model=CreateAssessmentResponse,
    summary="Generate secure assessment questions",
)
async def create_assessment(
    session_id: str,
    authorization: Optional[str] = Header(None),
) -> CreateAssessmentResponse:
    """Generates assessment questions. Returns questions without answers to client."""
    user = await _get_auth_user(authorization)
    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=CANONICAL_SKILLS,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
    )

    server_questions, client_questions = await generate_assessment_questions(focus, count=5)

    assessment_id = f"asm-{session_id}-{int(datetime.now().timestamp())}"

    # Cache server questions securely for authoritative grading
    _ASSESSMENT_CACHE[assessment_id] = server_questions

    return CreateAssessmentResponse(
        assessment_id=assessment_id,
        skill=focus.skill,
        topic=focus.topic,
        total_questions=len(client_questions),
        questions=client_questions,
    )


# ---------------------------------------------------------------------------
# 7. POST /api/v1/mentor/assessments/{assessment_id}/submit
# ---------------------------------------------------------------------------
@router.post(
    "/assessments/{assessment_id}/submit",
    response_model=AssessmentSubmitResponse,
    summary="Authoritatively score assessment and update learner mastery",
)
async def submit_assessment(
    assessment_id: str,
    request: AssessmentSubmitRequest,
    authorization: Optional[str] = Header(None),
) -> AssessmentSubmitResponse:
    """
    Grades assessment server-side, updates topic mastery in database,
    and recalculates Today's Focus dynamically.
    """
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    # Load server questions with answer key
    server_questions = _ASSESSMENT_CACHE.get(assessment_id)
    if not server_questions:
        # Fallback to standard bank for Linear Algebra
        server_questions = QUESTION_BANK.get("Linear Algebra", [])[:5]

    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=CANONICAL_SKILLS,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
    )

    # 1. Authoritative Grading
    score, results, new_mastery, feedback = grade_assessment(
        server_questions=server_questions,
        user_answers=request.answers,
        previous_mastery=focus.mastery,
    )

    correct_count = sum(1 for r in results if r.correct)

    # 2. Persist to Supabase
    await save_assessment_to_db(
        session_id=None,
        user_id=user_id,
        skill=focus.skill,
        topic=focus.topic,
        score=score,
        total_questions=len(server_questions),
        questions_data=server_questions,
        results=results,
    )

    # 3. Update topic progress
    await update_topic_progress_in_db(
        user_id=user_id,
        skill_id=focus.skill_id,
        skill_name=focus.skill,
        domain=focus.domain,
        topic=focus.topic,
        new_mastery=new_mastery,
        correct_count=correct_count,
    )

    # 4. Recalculate Today's Focus dynamically with the new mastery!
    updated_skills = [
        {**s, "progress": new_mastery if s["id"] == focus.skill_id else s["progress"]}
        for s in CANONICAL_SKILLS
    ]

    updated_focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=updated_skills,
        user_name=user.get("name", "Learner"),
        target_role="AI/ML Engineer",
    )

    return AssessmentSubmitResponse(
        assessment_id=assessment_id,
        score=score,
        correct_count=correct_count,
        total_questions=len(server_questions),
        results=results,
        new_mastery=new_mastery,
        skill_name=focus.skill,
        updated_focus=updated_focus,
        mentor_feedback=feedback,
    )


# ---------------------------------------------------------------------------
# 8. GET /api/v1/mentor/skills
# ---------------------------------------------------------------------------
@router.get(
    "/skills",
    response_model=UserSkillUpdateResponse,
    summary="Get user's live skill masteries",
)
async def get_user_skills(
    authorization: Optional[str] = Header(None),
) -> UserSkillUpdateResponse:
    """Returns all skills with any live overrides from DB assessments."""
    user = await _get_auth_user(authorization)
    topic_progress = await get_user_topic_progress_from_db(user["id"])
    topic_override_map = {t["skill_id"]: t["mastery"] for t in topic_progress}

    items = [
        RelevantSkillItem(
            id=s["id"],
            name=s["name"],
            domain=s["domain"],
            level=s["level"],
            progress=topic_override_map.get(s["id"], s["progress"]),
            is_verified=s["is_verified"],
        )
        for s in CANONICAL_SKILLS
    ]

    return UserSkillUpdateResponse(skills=items)
