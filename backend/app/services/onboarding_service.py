"""
Onboarding conversational service powered by LangChain + OpenAI.

Drives a structured 15-question career diagnostic conversation:
1. Education details (degree, major, graduation year)
2. Professional profile links (GitHub, LinkedIn)
3. Industry experience status
4. Known tech stack
5. Current ongoing projects / portfolio
6. Completed courses / bootcamps / certifications
7. Technical interests & problem domains
8. Target career role / specialization
9. Target timeline / deadline
10. Target salary / placement tier
11. Weekly time commitment (hours/week)
12. Preferred learning format
13. Resource budget preference
14. Immediate motivation / trigger event
15. Preferred language

Performs polite validation on invalid answers, generates question-specific
quick reply suggestions, maintains cumulative JSON state, and prepares data for Supabase.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import JsonOutputParser

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 5 Essential Canonical Category Slugs
# ---------------------------------------------------------------------------
CATEGORY_SLUGS = [
    "careerGoal",
    "industryExperience",
    "technicalStack",
    "weeklyHours",
    "targetTimeline",
]

# ---------------------------------------------------------------------------
# System Prompt for LangChain
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are **PathAI Onboarding Assistant**, an intelligent, polite, and efficient AI career diagnostic assistant.

Your objective is to ask the user EXACTLY 5 quick, essential profile questions to synthesize their personalized learning roadmap.

## THE 5 CORE DIAGNOSTIC QUESTIONS:
1. **careerGoal** — Target career role or specialization (e.g., Data Scientist, Machine Learning Engineer, AI/LLM Engineer, Data Engineer, Full Stack AI Developer).
2. **industryExperience** — Current background and experience level (e.g. Beginner / Student, Transitioning, Intermediate, Working Professional).
3. **technicalStack** — Known tech stack and programming skills (e.g. Python, SQL, Pandas, PyTorch, C++, or "None / Starting Fresh").
4. **weeklyHours** — Weekly study commitment: realistic hours available per week (e.g., 5 hrs, 10 hrs, 15 hrs, 20+ hrs/week).
5. **targetTimeline** — Target completion timeline to reach job-readiness (e.g., 3 months, 6 months, 9 months, 1 year).

## STRICT OPERATIONAL RULES:
1. **ONLY THESE 5 QUESTIONS**: Focus exclusively on these 5 questions in order. Do not ask extraneous or lengthy sub-questions.
2. **AUTO-PROGRESSION**: If the user provides information for multiple categories in one response (e.g. "I want to be a Data Scientist and I know Python, 10 hours a week"), extract all provided fields at once and advance directly to the remaining questions.
3. **QUICK REPLY SUGGESTIONS**: Provide 3 to 4 helpful, clickable sample answers in `quick_reply_chips` tailored to the current question:
   - For careerGoal: ["Data Scientist", "Machine Learning Engineer", "AI Application / LLM Engineer", "Full Stack AI Developer"]
   - For industryExperience: ["Beginner / CS Student", "Intermediate (Self-Taught)", "Working Professional (1-3 yrs)", "Non-tech Transitioning"]
   - For technicalStack: ["Python, SQL, Pandas", "Scikit-Learn, PyTorch", "Java, C++, Data Structures", "Complete Beginner / No Coding"]
   - For weeklyHours: ["5-10 hours/week", "10-15 hours/week", "15-20 hours/week", "20+ hours/week"]
   - For targetTimeline: ["3 Months (Fast-track)", "6 Months (Standard)", "9 Months", "1 Year (Comprehensive)"]
4. **JSON OUTPUT STRUCTURE**:
   You MUST return a valid JSON object matching this schema on EVERY turn:
   ```json
   {
     "assistant_message": "Polite response and next question",
     "quick_reply_chips": ["chip1", "chip2", "chip3", "chip4"],
     "extracted_entities": {
       "target_goal": "string or null",
       "experience_level": "beginner | intermediate | advanced | null",
       "industry_experience_type": "fresher | intern | professional | null",
       "known_skills": ["skill1", "skill2"] or null,
       "weekly_hours": number or null,
       "target_completion_months": "string or null",
       "career_goal": "string or null",
       "target_role": "string or null"
     },
     "completed_categories": ["careerGoal", "industryExperience"],
     "is_profile_complete": false
   }
   ```
   IMPORTANT: Merge existing extracted entities with newly validated entities. Set `is_profile_complete` to true when all 5 categories are completed.
"""


def _build_llm() -> ChatOpenAI:
    """Build the LangChain ChatOpenAI instance."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Please add it to the backend .env file."
        )
    return ChatOpenAI(
        model="gpt-4.1-nano",
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE_URL,
        temperature=0.4,
        max_tokens=1400,
        model_kwargs={"response_format": {"type": "json_object"}},
    )


def _compute_completed_categories(entities: dict[str, Any]) -> list[str]:
    """Determine which of the 5 core categories have been filled with validated data."""
    completed: list[str] = []

    # 1. Career Goal
    if entities.get("target_goal") or entities.get("career_goal") or entities.get("target_role"):
        completed.append("careerGoal")

    # 2. Industry Experience
    if entities.get("industry_experience_type") or entities.get("experience_level"):
        completed.append("industryExperience")

    # 3. Tech Stack / Skills
    skills = entities.get("known_skills")
    if (isinstance(skills, list) and len(skills) > 0) or entities.get("tech_stack") or "known_skills" in entities:
        completed.append("technicalStack")

    # 4. Weekly Hours
    hours = entities.get("weekly_hours")
    if hours is not None and hours > 0:
        completed.append("weeklyHours")

    # 5. Target Timeline
    if entities.get("target_completion_months") or entities.get("target_timeline"):
        completed.append("targetTimeline")

    return completed


def _merge_entities(
    existing: dict[str, Any], newly_extracted: dict[str, Any]
) -> dict[str, Any]:
    """Merge newly validated entities into the existing JSON state without losing data."""
    merged = {**existing}
    for key, value in newly_extracted.items():
        if value is None:
            continue
        # For lists, merge unique items
        if isinstance(value, list) and isinstance(merged.get(key), list):
            seen = set(merged[key])
            for item in value:
                if item not in seen:
                    merged[key].append(item)
                    seen.add(item)
        else:
            merged[key] = value
    return merged


async def process_onboarding_turn(
    conversation_history: list[dict[str, str]],
    current_entities: dict[str, Any],
) -> dict[str, Any]:
    """
    Process a single conversational turn using a LangChain chain.

    Args:
        conversation_history: List of {"role": "user"|"assistant", "content": "..."} dicts.
        current_entities: The current extracted entity state JSON from prior turns.

    Returns:
        Dict with: assistant_message, quick_reply_chips, extracted_entities,
        completed_categories, is_profile_complete
    """
    try:
        llm = _build_llm()

        # Build LangChain Messages
        langchain_messages: list[Any] = [SystemMessage(content=SYSTEM_PROMPT)]

        # Include current validated entity JSON in system context
        if current_entities:
            entity_context = (
                f"\n\nCurrent validated profile JSON state from previous turns:\n"
                f"```json\n{json.dumps(current_entities, indent=2, default=str)}\n```\n"
                f"\nCompleted categories so far ({len(_compute_completed_categories(current_entities))}/15): "
                f"{_compute_completed_categories(current_entities)}"
            )
            langchain_messages.append(SystemMessage(content=entity_context))

        # Append conversation history
        for msg in conversation_history:
            if msg["role"] == "user":
                langchain_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                langchain_messages.append(AIMessage(content=msg["content"]))

        # If no history, prompt bot to ask Question 1 (Education details)
        if not conversation_history:
            langchain_messages.append(
                HumanMessage(
                    content="[System: The user just arrived. Send your welcoming greeting and ask Question 1: Education details (degree, major/branch, graduation year) with tailored suggestion chips.]"
                )
            )

        # Invoke LLM directly with SystemMessage and conversation messages
        response = await llm.ainvoke(langchain_messages)
        parser = JsonOutputParser()
        parsed = parser.parse(response.content)

        # Merge validated entities into JSON state
        llm_entities = parsed.get("extracted_entities", {})
        merged = _merge_entities(current_entities, llm_entities)

        # Recompute completed categories server-side for accuracy
        completed = _compute_completed_categories(merged)
        is_complete = len(completed) >= 15 or parsed.get("is_profile_complete", False)

        return {
            "assistant_message": parsed.get("assistant_message", ""),
            "quick_reply_chips": parsed.get("quick_reply_chips", []),
            "extracted_entities": merged,
            "completed_categories": completed,
            "is_profile_complete": is_complete,
        }

    except json.JSONDecodeError as e:
        logger.error("Failed to parse LLM JSON response: %s", e)
        return _fallback_response(current_entities, "parse_error")
    except RuntimeError as e:
        logger.error("Configuration error: %s", e)
        raise
    except Exception as e:
        logger.error("Onboarding turn error: %s", e, exc_info=True)
        return _fallback_response(current_entities, "general_error")


def _fallback_response(
    current_entities: dict[str, Any], error_type: str
) -> dict[str, Any]:
    """Generate a graceful fallback response when LLM call encounters issues."""
    completed = _compute_completed_categories(current_entities)
    count = len(completed)

    if error_type == "parse_error":
        message = (
            "I had a small hiccup processing that. Could you please rephrase your answer? "
            "I'm guiding you through the 15 profile diagnostic questions."
        )
    else:
        message = (
            f"I've recorded your details so far ({count}/15 categories captured). "
            "Please answer the remaining profile questions or click 'Generate Roadmap' to finalize."
        )

    return {
        "assistant_message": message,
        "quick_reply_chips": [
            "B.Tech CS (2025)",
            "github.com/myusername",
            "5-10 hours/week",
            "Generate My Roadmap Now 🚀",
        ],
        "extracted_entities": current_entities,
        "completed_categories": completed,
        "is_profile_complete": count >= 15,
    }
