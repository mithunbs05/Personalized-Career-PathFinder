"""
AI-Powered Universal Curriculum & Multi-Domain Role Synthesizer.

Dynamically synthesizes complete, industry-standard career roles, sequenced stages,
granular topics, skill benchmarks, and curated resources for ANY engineering domain
(Embedded Systems, Cybersecurity, DevOps, Robotics, Mobile, Game Dev, Quantum, etc.)
using LLM + multi-tiered in-memory and database caching.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import get_settings
from app.core.knowledge_taxonomy import (
    RoleRequirement,
    TopicDefinition,
    ResourceDefinition,
    CAREER_ROLES_BASE,
    TAXONOMY_TOPICS,
    CURATED_RESOURCES,
)

logger = logging.getLogger(__name__)

# In-Memory Fast Cache for dynamically synthesized roles
_SYNTHESIZED_ROLE_CACHE: dict[str, RoleRequirement] = {}
_SYNTHESIZED_TOPIC_CACHE: dict[str, TopicDefinition] = {}
_SYNTHESIZED_RESOURCE_CACHE: dict[str, ResourceDefinition] = {}


def _get_llm(temperature: float = 0.3) -> Optional[ChatOpenAI]:
    """Build a LangChain ChatOpenAI instance using configured backend environment."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        return None
    return ChatOpenAI(
        model="gpt-4.1-nano",
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE_URL,
        temperature=temperature,
        max_tokens=2500,
    )


# ---------------------------------------------------------------------------
# Structured LLM Prompt for Universal Engineering Curriculum Synthesis
# ---------------------------------------------------------------------------

SYNTHESIS_SYSTEM_PROMPT = """You are PathAI's Chief Engineering Curriculum Architect.
Your task is to generate a complete, rigorous, industry-grade technical curriculum for any given engineering career role or domain.

You MUST output ONLY a valid JSON object matching the exact schema below, with no surrounding Markdown code blocks or extraneous text.

JSON Schema:
{
  "role_id": "kebab-case-role-id",
  "title": "Exact Official Role Title",
  "category": "Engineering Sub-Discipline (e.g., Embedded & Firmware, Cloud & SRE, Security, Robotics)",
  "description": "Comprehensive 2-sentence description of the role responsibilities and engineering impact.",
  "typical_duration_weeks": 20,
  "minimum_weekly_hours": 10,
  "core_domains": [
    "Domain 1: Core Fundamentals & Systems",
    "Domain 2: Hardware/Architecture/Tools",
    "Domain 3: Core Discipline & Advanced Concepts",
    "Domain 4: Production, Testing & Deployment"
  ],
  "stages": [
    {
      "stage_id": 1,
      "domain": "Domain 1: Core Fundamentals & Systems",
      "stage_title": "Stage Title",
      "difficulty": "Beginner | Intermediate | Advanced",
      "estimated_duration": "4 Weeks",
      "why_in_roadmap": "Clear pedagogical rationale for why this stage is placed here.",
      "career_relevance": "How this directly applies to job interviews and daily work.",
      "prerequisites": [],
      "skills": ["Skill 1", "Skill 2"],
      "topics": [
        {
          "topic_id": "top-unique-slug-1",
          "title": "Specific Topic Title",
          "skill_name": "Skill 1",
          "estimated_hours": 10.0,
          "benchmark_mastery": 80,
          "prerequisites": [],
          "key_concepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"]
        }
      ],
      "resources": [
        {
          "resource_id": "res-unique-slug-1",
          "title": "High Quality Course or Official Documentation Title",
          "provider": "Provider Name (e.g. Official Docs, edX, MIT OCW, Coursera)",
          "type": "DOCUMENTATION | COURSE | VIDEO | LAB",
          "url": "https://valid-documentation-or-learning-url.org",
          "duration_hours": 8.0,
          "learning_outcomes": ["Outcome 1", "Outcome 2"]
        }
      ]
    }
  ]
}

STRICT QUALITY RULES:
1. Provide between 4 to 6 logical pedagogical stages that take the learner from fundamentals to production-readiness.
2. Provide 2 to 4 granular, practical topics per stage with concrete key concepts.
3. Provide 1 to 2 verified or realistic learning resources per stage (e.g. official documentation, standard tutorials).
4. Topic IDs must be unique strings prefixed with "top-".
5. The output must be 100% strictly valid parseable JSON.
"""


def _sanitize_json(text: str) -> str:
    """Cleans Markdown code fence wrappers or stray characters from LLM JSON response."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


async def synthesize_dynamic_career_role(role_title: str) -> Optional[RoleRequirement]:
    """
    Synthesizes a full career role curriculum on-demand using AI LLM.
    Registers generated topics and resources into runtime caches.
    """
    norm_title = role_title.strip().lower()
    
    # 1. Check in-memory synthesized cache
    if norm_title in _SYNTHESIZED_ROLE_CACHE:
        return _SYNTHESIZED_ROLE_CACHE[norm_title]

    llm = _get_llm(temperature=0.2)
    if not llm:
        logger.warning("No LLM available for dynamic role synthesis of '%s'", role_title)
        return None

    try:
        messages = [
            SystemMessage(content=SYNTHESIS_SYSTEM_PROMPT),
            HumanMessage(content=f"Synthesize a complete, industry-standard engineering curriculum for the role: '{role_title}'."),
        ]
        
        response = await llm.ainvoke(messages)
        content = _sanitize_json(response.content if hasattr(response, "content") else str(response))
        data = json.loads(content)

        role_id = data.get("role_id") or re.sub(r"[^a-z0-9]+", "-", norm_title).strip("-")
        title = data.get("title", role_title)
        category = data.get("category", "Specialized Engineering")
        description = data.get("description", f"Professional career path and technical syllabus for {role_title}.")
        core_domains = data.get("core_domains", [])
        typical_duration = int(data.get("typical_duration_weeks", 20))
        min_weekly_hours = int(data.get("minimum_weekly_hours", 10))

        required_skills: dict[str, int] = {}
        required_topics: dict[str, int] = {}
        skill_weights: dict[str, float] = {}

        stages_data = data.get("stages", [])
        total_stages = max(1, len(stages_data))
        domain_count: dict[str, int] = {}

        from app.core.knowledge_taxonomy import resolve_domain_hierarchy
        hierarchy = resolve_domain_hierarchy(title)
        eng_domain = hierarchy.get("domain", "Computer & IT")
        subdomain = hierarchy.get("subdomain", "Artificial Intelligence")
        specialization = hierarchy.get("specialization", title)

        for stage in stages_data:
            dom = stage.get("domain", "Core Engineering")
            if dom not in core_domains:
                core_domains.append(dom)
            domain_count[dom] = domain_count.get(dom, 0) + 1

            for top in stage.get("topics", []):
                t_id = top.get("topic_id") or f"top-{re.sub(r'[^a-z0-9]+', '-', str(top.get('title', 'topic')).lower())}"
                t_title = str(top.get("title", "Core Topic"))
                t_skill = str(top.get("skill_name", "Core Competency"))
                t_benchmark = int(top.get("benchmark_mastery", 75))
                t_hours = float(top.get("estimated_hours", 8.0))
                t_concepts = [str(c) for c in top.get("key_concepts", [t_title])]
                t_prereqs = [str(p) for p in top.get("prerequisites", []) if p is not None]

                required_skills[t_skill] = max(required_skills.get(t_skill, 0), t_benchmark)
                required_topics[t_id] = t_benchmark

                # Create and cache TopicDefinition with hierarchy tags
                topic_def = TopicDefinition(
                    id=t_id,
                    title=t_title,
                    skill_id=f"sk-{re.sub(r'[^a-z0-9]+', '-', t_skill.lower())}",
                    skill_name=t_skill,
                    domain=dom,
                    difficulty=str(stage.get("difficulty", "Intermediate")),
                    estimated_hours=t_hours,
                    prerequisites=t_prereqs,
                    key_concepts=t_concepts,
                    benchmark_mastery=t_benchmark,
                    engineering_domain=eng_domain,
                    subdomain=subdomain,
                    specialization=specialization,
                )
                _SYNTHESIZED_TOPIC_CACHE[t_id] = topic_def

            for res in stage.get("resources", []):
                r_id = res.get("resource_id") or f"res-{re.sub(r'[^a-z0-9]+', '-', str(res.get('title', 'res')).lower())}"
                res_def = ResourceDefinition(
                    id=r_id,
                    title=str(res.get("title", f"{stage.get('stage_title', 'Stage')} Resource")),
                    provider=str(res.get("provider", "Official Documentation")),
                    type=str(res.get("type", "DOCUMENTATION")).upper(),
                    url=str(res.get("url", "https://docs.python.org/3/")),
                    duration_hours=float(res.get("duration_hours", 6.0)),
                    difficulty=str(stage.get("difficulty", "Intermediate")),
                    target_topic_ids=list(required_topics.keys())[-3:] if required_topics else [],
                    learning_outcomes=[str(o) for o in res.get("learning_outcomes", [f"Master core concepts in {stage.get('stage_title', 'this stage')}"])],
                )
                _SYNTHESIZED_RESOURCE_CACHE[r_id] = res_def

        # Compute balanced domain weights
        for dom, cnt in domain_count.items():
            skill_weights[dom] = round(cnt / total_stages, 2)

        role_req = RoleRequirement(
            role_id=role_id,
            title=title,
            category=category,
            description=description,
            core_domains=core_domains,
            required_skills=required_skills,
            required_topics=required_topics,
            skill_weights=skill_weights,
            typical_duration_weeks=typical_duration,
            minimum_weekly_hours=min_weekly_hours,
            engineering_domain=eng_domain,
            subdomain=subdomain,
            specialization=specialization,
        )

        # Cache synthesized role under multiple aliases
        _SYNTHESIZED_ROLE_CACHE[norm_title] = role_req
        _SYNTHESIZED_ROLE_CACHE[role_id] = role_req
        _SYNTHESIZED_ROLE_CACHE[title.lower()] = role_req

        logger.info(
            "Successfully synthesized dynamic AI curriculum for '%s' (%d stages, %d topics)",
            title, len(stages_data), len(required_topics)
        )
        return role_req

    except Exception as e:
        logger.error("Failed to dynamically synthesize career role '%s': %s", role_title, e, exc_info=True)
        return None


def get_synthesized_topic(topic_id: str) -> Optional[TopicDefinition]:
    """Retrieves a dynamically synthesized topic by ID."""
    return _SYNTHESIZED_TOPIC_CACHE.get(topic_id)


def get_all_synthesized_topics() -> list[TopicDefinition]:
    """Returns all dynamically synthesized topics."""
    return list(_SYNTHESIZED_TOPIC_CACHE.values())


def get_all_synthesized_resources() -> list[ResourceDefinition]:
    """Returns all dynamically synthesized curated resources."""
    return list(_SYNTHESIZED_RESOURCE_CACHE.values())
