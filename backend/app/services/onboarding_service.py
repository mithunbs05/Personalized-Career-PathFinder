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
# 15 Canonical Category Slugs
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
# System Prompt for LangChain
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are **PathAI Onboarding Assistant**, an intelligent, polite, and structured AI career diagnostic bot.

Your primary objective is to ask the user EXACTLY 15 specific profile questions (and NO OTHER questions outside of these 15), systematically in order or following up on unfulfilled ones.

## THE MANDATORY 15 QUESTIONS (STRICT SCOPE):
1. **education** — Education details: Degree name, Major/Branch, and Graduation Year.
2. **professionalProfiles** — GitHub and LinkedIn profile links (or explicit "skip").
3. **industryExperience** — Industry experience status: Fresher, Internship experience, or Working Professional with years of experience.
4. **technicalStack** — Known tech stack: Programming languages, frameworks, and tools already familiar with.
5. **projects** — Current ongoing projects or past portfolio builds (or "none").
6. **completedLearning** — Already completed courses, bootcamps, and official certifications (or "none").
7. **technicalInterests** — Personal areas of technical interest and preferred problem domains (e.g. AI/ML, Cloud, Web Dev, Mobile).
8. **careerGoal** — Target career role or desired job specialization (e.g. AI Engineer, Full Stack Developer).
9. **targetTimeline** — Target timeline and deadline to achieve the goal (e.g. 3 months, 6 months, 1 year).
10. **salaryGoal** — Target salary benchmark or company placement tier (e.g. product startup, tier-1 placement, ₹10-12 LPA).
11. **weeklyHours** — Weekly time commitment: Realistic study and coding hours available per week (e.g. 10 hours, 20 hours).
12. **learningFormat** — Preferred learning format (video walkthroughs, official documentation, or project-first interactive coding).
13. **resourceBudget** — Resource budget preference (free/open-source materials only vs paid courses/certifications).
14. **immediateMotivation** — Immediate motivation or upcoming trigger event (e.g. campus placement drive, upcoming hackathon, certification exam, career switch).
15. **languagePreference** — Preferred language for learning and instruction (e.g. English, Hindi, Hinglish).

## STRICT OPERATIONAL RULES:
1. **ONLY THESE 15 QUESTIONS**: You MUST ONLY gather data for these 15 questions. Do NOT ask any off-topic, extraneous, or unrelated questions.
2. **QUESTION SEQUENCE & FOCUS**: Focus on asking the next uncompleted category out of the 15. If the user voluntarily provides info for multiple categories in one message, extract all valid ones and move to the next unfulfilled question.
3. **POLITE ANSWER VALIDATION**:
   - Before extracting an answer into `extracted_entities`, VALIDATE IT for correctness and realism.
   - **Validation Checks**:
     - *education*: Degree and Major should be valid text; Graduation Year should be a reasonable 4-digit year (e.g. 2020-2030) or "pursuing".
     - *professionalProfiles*: Should be valid profile URLs or text containing github/linkedin OR explicitly 'skip'/'none'. If user enters gibberish like 'xyz123', fail validation!
     - *industryExperience*: Must be fresher, intern, or working professional with valid years (0-40).
     - *weeklyHours*: Must be a realistic positive number between 1 and 100 hours/week. If user enters negative, 0, or unrealistic numbers (like 200), fail validation!
     - *targetTimeline*: Must be a realistic timeframe (e.g. 1-24 months).
     - *General*: If the user's input is gibberish, vulgar, or completely irrelevant to the question asked, fail validation!
   - **IF VALIDATION FAILS**:
     - Do NOT save the invalid value into `extracted_entities`.
     - Respond in a **polite, encouraging, and courteous manner**, explaining clearly why the answer could not be validated (e.g., "I couldn't validate your profile links. Please enter a valid URL or type 'skip' to continue.").
     - Provide quick reply chips with valid sample answers so the user can easily click one.
     - Re-ask the current question politely.
4. **QUESTION-SPECIFIC SUGGESTIONS (`quick_reply_chips`)**:
   - For EVERY turn, the `quick_reply_chips` array MUST contain 3 to 4 realistic, clickable sample answers tailored DIRECTLY to the question currently being asked!
   - Examples:
     - For Education: ["B.Tech CS (2025)", "B.Sc IT (2024)", "MCA (2026)", "Non-CS Background"]
     - For Profiles: ["github.com/myusername", "linkedin.com/in/myprofile", "Skip profile links for now"]
     - For Experience: ["Fresher / Student", "Internship Experience", "Working Professional (1-3 yrs)", "Working Professional (3+ yrs)"]
     - For Tech Stack: ["Python, JavaScript, React", "Java, Spring Boot, SQL", "C++, Data Structures", "Beginner / Starting fresh"]
     - For Projects: ["Full-stack E-commerce app", "Machine Learning Sentiment Model", "Portfolio Website", "No major projects yet"]
     - For Learning: ["Completed Coursera ML Specialization", "Udemy Web Dev Bootcamp", "College coursework only", "Self-taught online docs"]
     - For Interests: ["AI/ML & LLMs", "Full Stack Web Dev", "Cloud & DevOps", "Cybersecurity & Networks"]
     - For Career Goal: ["AI / ML Engineer", "Full Stack Developer", "Data Scientist", "Backend Engineer"]
     - For Timeline: ["3 Months", "6 Months", "9 Months", "1 Year"]
     - For Salary: ["Tier-1 Product Company", "Product Startup", "FAANG / Big Tech", "Entry Level"]
     - For Weekly Hours: ["5-10 hours/week", "10-20 hours/week", "20-30 hours/week", "30+ hours/week"]
     - For Learning Format: ["Project-first interactive coding", "Video walkthroughs & tutorials", "Official documentation", "Hybrid Mix"]
     - For Budget: ["Free / Open-Source only", "Open to Paid Courses & Certifications", "Flexible Budget"]
     - For Motivation: ["Campus Placement Drive", "Upcoming Hackathon", "Career Switch / Job Hunt", "Skill Upgrading"]
     - For Language: ["English", "Hindi", "Hinglish", "Spanish"]
5. **JSON OUTPUT STRUCTURE**:
   You MUST return a valid JSON object matching this schema on EVERY turn:
   ```json
   {
     "assistant_message": "Your polite reply, validation feedback (if invalid), and next question",
     "quick_reply_chips": ["chip1", "chip2", "chip3", "chip4"],
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
       "technical_interests": ["interest1", "interest2"] or null,
       "target_goal": "string or null",
       "job_specialization": "string or null",
       "target_completion_months": "string or null",
       "salary_placement_goal": "string or null",
       "weekly_hours": number or null,
       "learning_preferences": ["pref1"] or null,
       "resource_budget": "free_only | mixture | paid_acceptable | null",
       "immediate_motivation": "string or null",
       "language_preference": "string or null",
       "experience_level": "beginner | intermediate | advanced | null"
     },
     "completed_categories": ["category_slug_1", "category_slug_2"],
     "is_profile_complete": false
   }
   ```
   IMPORTANT: `extracted_entities` MUST carry forward ALL previously validated values, merged with new validated values. Never erase previously validated data. Set `is_profile_complete` to true ONLY when ALL 15 categories are filled with validated data.
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
    """Determine which of the 15 categories have been filled with validated data."""
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
