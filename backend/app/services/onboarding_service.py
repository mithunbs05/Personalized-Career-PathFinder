"""
Onboarding conversational service powered by LangChain + GPT-4.1-nano.

Drives a multi-turn career-counselor conversation to extract 15 learner profile
dimensions naturally, producing structured JSON output on every turn.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 15 Category slugs (canonical keys)
# ---------------------------------------------------------------------------
CATEGORY_SLUGS = [
    "education",
    "professionalProfiles",
    "industryExperience",
    "technicalStack",
    "projects",
    "completedLearning",
    "technicalInterests",
    "careerGoal",
    "targetTimeline",
    "salaryGoal",
    "weeklyHours",
    "learningFormat",
    "resourceBudget",
    "immediateMotivation",
    "languagePreference",
]

# ---------------------------------------------------------------------------
# System Prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are **PathAI**, a welcoming, adaptive, and diagnostic career-counselor assistant for an AI-powered personalized learning platform.

Your job is to have a **natural conversation** with a learner to gather information across exactly **15 profile categories**. Never overwhelm the user — ask only 1 to 2 relevant questions at a time. If the user provides information about multiple categories in a single message, extract all of them simultaneously.

## The 15 Profile Categories to Extract
1. **education** — Degree, branch/major, graduation year
2. **professionalProfiles** — GitHub URL, LinkedIn URL (or explicit "skip")
3. **industryExperience** — Fresher, intern, or working professional with years of experience
4. **technicalStack** — Languages, frameworks, tools the learner already knows
5. **projects** — Past builds, ongoing projects, or zero projects
6. **completedLearning** — Completed bootcamps, NPTEL, Coursera courses, or college-only
7. **technicalInterests** — Sub-domains (e.g., Multi-Agent AI, RAG, Web Dev, Embedded Systems)
8. **careerGoal** — Desired specialization or target job profile
9. **targetTimeline** — Target deadline (e.g., 3 months, 6 months, campus drive date)
10. **salaryGoal** — Target compensation tier (e.g., ₹10–12 LPA, FAANG, Tier-1 product)
11. **weeklyHours** — Realistic study/coding hours available per week
12. **learningFormat** — Video walkthroughs, official docs, or project-first interactive coding
13. **resourceBudget** — Free/open-source only vs paid certifications
14. **immediateMotivation** — Placement drive, hackathon, certification exam, career switch
15. **languagePreference** — Preferred language for instruction and documentation

## Rules
- Be warm, encouraging, and conversational. Use emojis sparingly but naturally.
- Acknowledge what the user shared before asking the next question.
- If the user gives a complex response covering multiple categories, extract ALL of them.
- Never repeat information you already collected unless the user wants to change it.
- For professional profiles, accept "skip", "none", "don't have one" as valid responses.
- For weekly hours, convert natural language like "a couple hours a day" into a numeric weekly estimate.
- Set `is_profile_complete` to true when **all 15 categories** have at least some value, OR when at least **12 of 15** categories are filled and the user expresses readiness to proceed.

## Output Format
You MUST respond with valid JSON matching this exact schema on EVERY turn:
```json
{
  "assistant_message": "Your natural language reply and next question(s)",
  "quick_reply_chips": ["chip1", "chip2", "chip3"],
  "extracted_entities": {
    "education_degree": "string or null",
    "education_major": "string or null",
    "graduation_year": "string or null",
    "github_url": "string or null",
    "linkedin_url": "string or null",
    "industry_experience_type": "fresher | intern | working_professional | null",
    "years_experience": "string or null",
    "known_skills": ["skill1", "skill2"] or null,
    "current_projects": "string or null",
    "completed_learning": "string or null",
    "technical_interests": ["interest1"] or null,
    "target_goal": "string or null",
    "job_specialization": "string or null",
    "target_completion_months": "string or null",
    "salary_placement_goal": "string or null",
    "weekly_hours": number or null,
    "learning_preferences": ["pref1"] or null,
    "resource_budget": "string or null",
    "immediate_motivation": "string or null",
    "language_preference": "string or null",
    "experience_level": "beginner | intermediate | advanced | null"
  },
  "completed_categories": ["category_slug_1", "category_slug_2"],
  "is_profile_complete": false
}
```

IMPORTANT: The `extracted_entities` must contain the FULL MERGED state — include ALL previously extracted values plus any new ones from this turn. Do NOT drop previously collected data.

When the conversation is just starting (empty history), send an enthusiastic welcome message introducing yourself and asking the learner to share about their background in a natural way.
"""


def _build_llm() -> ChatOpenAI:
    """Build the LangChain ChatOpenAI instance for gpt-4.1-nano."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Please add it to the backend .env file."
        )
    return ChatOpenAI(
        model="gpt-4.1-nano",
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE_URL,
        temperature=0.7,
        max_tokens=1200,
        model_kwargs={"response_format": {"type": "json_object"}},
    )


def _compute_completed_categories(entities: dict[str, Any]) -> list[str]:
    """Determine which of the 15 categories have been filled."""
    completed: list[str] = []

    # 1. Education
    if entities.get("education_degree") or entities.get("education_major"):
        completed.append("education")

    # 2. Professional Profiles
    github = entities.get("github_url")
    linkedin = entities.get("linkedin_url")
    if github or linkedin:
        completed.append("professionalProfiles")

    # 3. Industry Experience
    if entities.get("industry_experience_type"):
        completed.append("industryExperience")

    # 4. Tech Stack
    skills = entities.get("known_skills")
    if isinstance(skills, list) and len(skills) > 0:
        completed.append("technicalStack")

    # 5. Projects
    if entities.get("current_projects"):
        completed.append("projects")

    # 6. Completed Learning
    if entities.get("completed_learning"):
        completed.append("completedLearning")

    # 7. Technical Interests
    interests = entities.get("technical_interests")
    if isinstance(interests, list) and len(interests) > 0:
        completed.append("technicalInterests")

    # 8. Career Goal
    if entities.get("target_goal"):
        completed.append("careerGoal")

    # 9. Target Timeline
    if entities.get("target_completion_months"):
        completed.append("targetTimeline")

    # 10. Salary Goal
    if entities.get("salary_placement_goal"):
        completed.append("salaryGoal")

    # 11. Weekly Hours
    hours = entities.get("weekly_hours")
    if hours is not None and hours > 0:
        completed.append("weeklyHours")

    # 12. Learning Format
    prefs = entities.get("learning_preferences")
    if isinstance(prefs, list) and len(prefs) > 0:
        completed.append("learningFormat")

    # 13. Resource Budget
    if entities.get("resource_budget"):
        completed.append("resourceBudget")

    # 14. Immediate Motivation
    if entities.get("immediate_motivation"):
        completed.append("immediateMotivation")

    # 15. Language Preference
    if entities.get("language_preference"):
        completed.append("languagePreference")

    return completed


def _merge_entities(
    existing: dict[str, Any], newly_extracted: dict[str, Any]
) -> dict[str, Any]:
    """Merge newly extracted entities into the existing state without losing data."""
    merged = {**existing}
    for key, value in newly_extracted.items():
        if value is None:
            continue
        # For lists, merge without duplicates
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
    Process a single conversational turn for onboarding.

    Args:
        conversation_history: List of {"role": "user"|"assistant", "content": "..."} dicts.
        current_entities: The current extracted entity state from prior turns.

    Returns:
        Dict with: assistant_message, quick_reply_chips, extracted_entities,
        completed_categories, is_profile_complete
    """
    try:
        llm = _build_llm()

        # Build the LangChain message list
        messages = [SystemMessage(content=SYSTEM_PROMPT)]

        # Include the current entity state in the system context
        if current_entities:
            entity_context = (
                f"\n\nCurrent extracted profile state from previous turns:\n"
                f"```json\n{json.dumps(current_entities, indent=2, default=str)}\n```\n"
                f"\nCompleted categories so far: {_compute_completed_categories(current_entities)}"
            )
            messages.append(SystemMessage(content=entity_context))

        # Append conversation history
        for msg in conversation_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

        # If no history, start the conversation
        if not conversation_history:
            messages.append(
                HumanMessage(
                    content="[System: The user just arrived at the onboarding page. "
                    "Send your welcome message to start the conversation.]"
                )
            )

        # Invoke the LLM
        response = await llm.ainvoke(messages)
        response_text = response.content

        # Parse the JSON response
        parser = JsonOutputParser()
        parsed = parser.parse(response_text)

        # Merge entities
        llm_entities = parsed.get("extracted_entities", {})
        merged = _merge_entities(current_entities, llm_entities)

        # Recompute completed categories server-side for accuracy
        completed = _compute_completed_categories(merged)
        is_complete = len(completed) >= 12 or parsed.get("is_profile_complete", False)

        return {
            "assistant_message": parsed.get("assistant_message", ""),
            "quick_reply_chips": parsed.get("quick_reply_chips", []),
            "extracted_entities": merged,
            "completed_categories": completed,
            "is_profile_complete": is_complete and len(completed) >= 12,
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
    """Generate a graceful fallback response when LLM call fails."""
    completed = _compute_completed_categories(current_entities)
    count = len(completed)

    if error_type == "parse_error":
        message = (
            "I had a small hiccup processing that. Could you rephrase or tell me "
            "more about your background? I'm tracking your profile across 15 categories."
        )
    else:
        message = (
            f"I've noted your preferences so far ({count}/15 categories captured). "
            "You can continue chatting to fill more categories, or click "
            "'Generate Roadmap' to finalize your profile."
        )

    return {
        "assistant_message": message,
        "quick_reply_chips": [
            "Tell me about my education and skills",
            "I want to share my career goals",
            "Generate My Roadmap Now 🚀",
        ],
        "extracted_entities": current_entities,
        "completed_categories": completed,
        "is_profile_complete": count >= 12,
    }
