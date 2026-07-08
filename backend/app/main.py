


"""AI LifeAssist — FastAPI Application.

A multimodal Generative AI emergency and personal safety assistant.
"""

import logging
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Request
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from google.genai.errors import ClientError, APIError
from app.config import settings
from app.routers import emergency, medicine, reports, hospitals, sos

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI LifeAssist API",
    description=(
        "A Multimodal Generative AI Emergency & Personal Safety Assistant. "
        "Provides first-aid guidance, medicine explanation, report summarization, "
        "hospital finding, and SOS message generation."
    ),
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handlers ─────────────────────────────────────────


@app.exception_handler(ClientError)
async def gemini_client_error_handler(request: Request, exc: ClientError):
    """Handle Gemini API client errors (rate limits, auth, etc.)."""
    status_code = getattr(exc, "status", 500)
    logger.error("Gemini API ClientError (HTTP %s): %s", status_code, exc)

    if status_code == 429:
        return JSONResponse(
            status_code=429,
            content={
                "status": "error",
                "error_type": "rate_limit",
                "message": (
                    "AI service rate limit exceeded. Your Gemini API quota has been "
                    "exhausted. Please wait and try again, or upgrade your API key."
                ),
            },
        )
    elif status_code == 403:
        return JSONResponse(
            status_code=403,
            content={
                "status": "error",
                "error_type": "auth_error",
                "message": "Invalid or expired Gemini API key. Please check your configuration.",
            },
        )
    else:
        return JSONResponse(
            status_code=502,
            content={
                "status": "error",
                "error_type": "api_error",
                "message": f"Gemini API error (HTTP {status_code}). Please try again.",
            },
        )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle configuration and validation errors."""
    logger.error("ValueError: %s", exc)
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error_type": "validation_error",
            "message": str(exc),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all handler to prevent raw 500 stack traces."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_type": "internal_error",
            "message": "An unexpected error occurred. Please try again later.",
        },
    )


# Register routers
app.include_router(emergency.router)
app.include_router(medicine.router)
app.include_router(reports.router)
app.include_router(hospitals.router)
app.include_router(sos.router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "app": "AI LifeAssist",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "Emergency Image Analysis",
            "Medicine Explainer",
            "Medical Report Summarizer",
            "Nearby Hospital Finder",
            "SOS Message Generator",
            "Voice Assistant",
            "Multilingual Support",
        ],
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "maps_configured": bool(settings.GOOGLE_MAPS_API_KEY),
    }
