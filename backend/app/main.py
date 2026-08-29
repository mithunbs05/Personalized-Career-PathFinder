"""
PathAI FastAPI Backend — Main Application Entry Point.

Hosts the AI-powered onboarding conversational endpoints and profile persistence.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import onboarding, profile, mentor

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PathAI Onboarding & AI Mentor API",
    description=(
        "AI-powered conversational onboarding and adaptive AI Mentor service using LangChain + GPT-4.1-nano."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow the React dev server and production origins
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(onboarding.router)
app.include_router(profile.router)
app.include_router(mentor.router)


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Returns service health status."""
    settings = get_settings()
    return {
        "status": "ok",
        "service": "PathAI Onboarding API",
        "version": "1.0.0",
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY),
    }


# ---------------------------------------------------------------------------
# Startup Event
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    """Validate critical configuration on startup."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        logger.warning(
            "⚠️  OPENAI_API_KEY is not set. The onboarding chat endpoint will not work."
        )
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning(
            "⚠️  Supabase credentials are not configured. Profile save will not work."
        )
    logger.info("🚀 PathAI Onboarding API started on port %s", settings.PORT)
