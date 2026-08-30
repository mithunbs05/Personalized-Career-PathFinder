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
    SessionDetailsResponse,
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
    get_active_session_from_db,
    get_session_messages_from_db,
    get_recent_assessments_from_db,
    get_user_profile_from_db,
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
    """Returns real-time learner profile, current stage, skills, Today's Focus, and active session."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    # Load user profile from DB if available
    user_profile = await get_user_profile_from_db(user_id)
    target_role = "AI/ML Engineer"
    user_name = user.get("name", "Learner")
    if user_profile and user_profile.get("profile_metadata"):
        meta = user_profile["profile_metadata"]
        target_role = meta.get("target_role") or meta.get("target_goal") or meta.get("career_goal") or meta.get("role") or target_role

    # 1. Fetch dynamic roadmap overview
    from app.services.roadmap_service import get_roadmap_overview
    from app.services.gap_analysis_service import analyze_learner_gaps
    from app.services.knowledge_state_service import get_or_init_knowledge_state

    roadmap_overview = await get_roadmap_overview(user_id=user_id, user_name=user_name, target_role=target_role)
    gap_analysis = await analyze_learner_gaps(user_id=user_id, target_role=target_role)
    knowledge_states = await get_or_init_knowledge_state(user_id=user_id)

    # Current dynamic stage
    current_stage_title = roadmap_overview.current_stage.title if roadmap_overview.current_stage else "Programming"
    overall_progress = roadmap_overview.overall_progress

    # Determine dynamic Today's Focus based on root-cause gaps
    focus_topic_title = "Functions, Scope & Error Handling"
    focus_skill_name = "Python Functions"
    focus_domain = "Programming & Data Structures"
    focus_mastery = 0
    focus_reason = "Essential foundation for your target role."

    if gap_analysis.priority_gaps:
        top_gap = gap_analysis.priority_gaps[0]
        focus_topic_title = top_gap.topic_title
        focus_skill_name = top_gap.skill_name
        focus_domain = top_gap.domain
        focus_mastery = top_gap.current_mastery
        focus_reason = top_gap.reason
    elif roadmap_overview.current_stage:
        cs = roadmap_overview.current_stage
        focus_domain = cs.title
        focus_topic_title = cs.title
        focus_skill_name = cs.skills[0] if cs.skills else cs.title
        focus_mastery = cs.progress

    focus = TodaysFocus(
        domain=focus_domain,
        skill=focus_skill_name,
        skillId="f-1",
        topic=focus_topic_title,
        mastery=focus_mastery,
        priority="HIGH" if focus_mastery < 40 else "MEDIUM",
        estimatedMinutes=30,
        reason=focus_reason,
        blocksStage=current_stage_title,
    )

    # Convert active knowledge state topics to relevant_skills
    relevant_skills = []
    for t_id, st in list(knowledge_states.items())[:8]:
        relevant_skills.append(RelevantSkillItem(
            id=st.topic_id,
            name=st.topic_title,
            domain=st.domain,
            level="Advanced" if st.mastery >= 85 else ("Proficient" if st.mastery >= 70 else ("Developing" if st.mastery >= 40 else "Novice")),
            progress=st.mastery,
            is_verified=st.evidence_count > 0 and st.mastery >= 75,
        ))

    # Load active session and recent history
    active_sess_db = await get_active_session_from_db(user_id)
    active_sess_id = active_sess_db["id"] if active_sess_db else None
    
    # Also check in-memory store for active session
    if not active_sess_id:
        for sid, sdata in reversed(list(_SESSION_STORE.items())):
            if sdata.get("user_id") == user_id and sdata.get("status") == "active":
                active_sess_id = sid
                active_sess_db = sdata
                break

    recent_messages = []
    if active_sess_id:
        db_msgs = await get_session_messages_from_db(active_sess_id, limit=20)
        if db_msgs:
            recent_messages = [
                {
                    "id": m.get("id"),
                    "sender": "user" if m.get("role") == "user" else "ai",
                    "text": m.get("content", ""),
                    "timestamp": m.get("created_at", ""),
                }
                for m in db_msgs
            ]
        elif active_sess_id in _SESSION_STORE:
            recent_messages = [
                {
                    "id": f"msg-{i}",
                    "sender": "user" if h["role"] == "user" else "ai",
                    "text": h["content"],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                for i, h in enumerate(_SESSION_STORE[active_sess_id].get("history", []))
            ]

    recent_assessments = await get_recent_assessments_from_db(user_id, limit=5)

    return LearnerContextResponse(
        user_id=user_id,
        user_name=user_name,
        target_role=target_role,
        current_stage=current_stage_title,
        current_stage_order=roadmap_overview.current_stage.id if roadmap_overview.current_stage else 1,
        current_stage_progress=roadmap_overview.current_stage.progress if roadmap_overview.current_stage else 0,
        overall_mastery=overall_progress,
        focus=focus,
        relevant_skills=relevant_skills,
        recent_assessments=recent_assessments,
        active_session_id=active_sess_id,
        active_session=active_sess_db,
        recent_messages=recent_messages,
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
    user_profile = await get_user_profile_from_db(user["id"])
    target_role = "AI/ML Engineer"
    if user_profile and user_profile.get("profile_metadata"):
        meta = user_profile["profile_metadata"]
        target_role = meta.get("target_role") or meta.get("target_goal") or meta.get("career_goal") or meta.get("role") or target_role

    # 1. Ground focus directly in priority gap analysis for target role
    try:
        from app.services.gap_analysis_service import analyze_learner_gaps
        gaps_data = await analyze_learner_gaps(user["id"], target_role)
        if gaps_data.priority_gaps:
            top_gap = gaps_data.priority_gaps[0]
            priority_tag = "high" if top_gap.is_blocking or top_gap.priority_score >= 70 else ("medium" if top_gap.priority_score >= 40 else "low")
            return TodaysFocus(
                domain=top_gap.domain,
                skill=top_gap.skill_name,
                skill_id=top_gap.topic_id,
                topic=top_gap.topic_title,
                mastery=top_gap.current_mastery,
                priority=priority_tag,
                estimated_minutes=round(top_gap.estimated_hours_to_close * 30),
                reason=top_gap.reason,
                prerequisites=[],
                blocks_stage=gaps_data.critical_blocker or "Next Roadmap Milestone",
            )
    except Exception as e:
        logger.warning("Could not compute focus from gap analysis, using fallback: %s", e)

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
        target_role=target_role,
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
    topic_override_map = {t["skill_id"]: t["mastery"] for t in topic_progress}
    for t in topic_progress:
        if t.get("skill_name"):
            topic_override_map[t["skill_name"]] = t["mastery"]

    active_skills = [
        {**s, "progress": topic_override_map.get(s["id"], topic_override_map.get(s["name"], s["progress"]))}
        for s in CANONICAL_SKILLS
    ]

    focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=active_skills,
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
# 3.1 GET /api/v1/mentor/sessions/{session_id}
# ---------------------------------------------------------------------------
@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailsResponse,
    summary="Get session details and message history",
)
async def get_mentor_session(
    session_id: str,
    authorization: Optional[str] = Header(None),
) -> SessionDetailsResponse:
    """Retrieves session status and recent conversation history."""
    user = await _get_auth_user(authorization)
    user_id = user["id"]

    session_data = _SESSION_STORE.get(session_id)
    messages = []

    db_messages = await get_session_messages_from_db(session_id)
    if db_messages:
        messages = [
            {
                "id": m.get("id"),
                "sender": "user" if m.get("role") == "user" else "ai",
                "text": m.get("content", ""),
                "timestamp": m.get("created_at", ""),
            }
            for m in db_messages
        ]
    elif session_data and "history" in session_data:
        messages = [
            {
                "id": f"msg-{i}",
                "sender": "user" if h["role"] == "user" else "ai",
                "text": h["content"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            for i, h in enumerate(session_data["history"])
        ]

    if not session_data:
        focus = calculate_todays_focus(
            stages=CANONICAL_STAGES,
            user_skills=CANONICAL_SKILLS,
            user_name=user.get("name", "Learner"),
            target_role="AI/ML Engineer",
        )
        session_resp = MentorSessionResponse(
            id=session_id,
            user_id=user_id,
            domain=focus.domain,
            skill=focus.skill,
            skill_id=focus.skill_id,
            topic=focus.topic,
            roadmap_stage="Mathematics & Statistics",
            mode="learn",
            started_at=datetime.now(timezone.utc).isoformat(),
            status="active",
        )
    else:
        session_resp = MentorSessionResponse(
            id=session_id,
            user_id=session_data.get("user_id", user_id),
            domain=session_data.get("domain", "Math & Statistics"),
            skill=session_data.get("skill", "Linear Algebra"),
            skill_id=session_data.get("skill_id", "s4"),
            topic=session_data.get("topic"),
            roadmap_stage=session_data.get("roadmap_stage", "Mathematics & Statistics"),
            mode=session_data.get("mode", "learn"),
            started_at=session_data.get("started_at", datetime.now(timezone.utc).isoformat()),
            status=session_data.get("status", "active"),
            opening_message=session_data.get("opening_message"),
        )

    return SessionDetailsResponse(
        session=session_resp,
        messages=messages,
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
    user_profile = await get_user_profile_from_db(user_id)
    target_role = "AI/ML Engineer"
    if user_profile and user_profile.get("profile_metadata"):
        meta = user_profile["profile_metadata"]
        target_role = meta.get("target_role") or meta.get("career_goal") or meta.get("role") or target_role

    updated_skills = [
        {**s, "progress": new_mastery if s["id"] == focus.skill_id else s["progress"]}
        for s in CANONICAL_SKILLS
    ]

    updated_focus = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=updated_skills,
        user_name=user.get("name", "Learner"),
        target_role=target_role,
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
