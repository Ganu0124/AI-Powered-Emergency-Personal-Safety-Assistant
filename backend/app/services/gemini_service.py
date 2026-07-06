"""Gemini AI service — core multimodal engine for all AI features."""

import json
import asyncio
import logging
# pyrefly: ignore [missing-import]
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types
# pyrefly: ignore [missing-import]
from google.genai.errors import ClientError, APIError
from app.config import settings
from app.prompts.system_prompts import (
    EMERGENCY_PROMPT,
    MEDICINE_PROMPT,
    REPORT_PROMPT,
    SOS_PROMPT,
    VOICE_ASSISTANT_PROMPT,
)

logger = logging.getLogger(__name__)

# Language display map
LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
}

_client = None


def _get_client():
    """Lazily initialize the Gemini client on first use."""
    global _client
    if _client is None:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Please add it to backend/.env file. "
                "Get a free key at https://aistudio.google.com"
            )
        _client = genai.Client(api_key=api_key)
    return _client


def _get_language_name(lang_code: str) -> str:
    """Convert a language code to its display name."""
    return LANGUAGE_MAP.get(lang_code, "English")


def _parse_json_response(text: str) -> dict:
    """Parse JSON from Gemini response, handling potential markdown fences."""
    cleaned = text.strip()
    # Remove markdown code fences if present
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # Remove first line (```json or ```) and last line (```)
        lines = [l for l in lines[1:] if not l.strip() == "```"]
        cleaned = "\n".join(lines)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Return raw text wrapped in a dict if JSON parsing fails
        return {"raw_response": text, "parse_error": True}


def _make_error_response(error: Exception) -> dict:
    """Create a structured error response dict from an exception."""
    if isinstance(error, ClientError):
        status_code = getattr(error, "status", 500)
        if status_code == 429:
            return {
                "error": True,
                "error_type": "rate_limit",
                "message": (
                    "AI service rate limit exceeded. Your free-tier Gemini API quota "
                    "has been exhausted. Please wait a moment and try again, or "
                    "upgrade your API key at https://aistudio.google.com."
                ),
            }
        elif status_code == 403:
            return {
                "error": True,
                "error_type": "auth_error",
                "message": (
                    "Invalid or expired Gemini API key. Please check your "
                    "GEMINI_API_KEY in the backend/.env file."
                ),
            }
        else:
            return {
                "error": True,
                "error_type": "api_error",
                "message": f"Gemini API error (HTTP {status_code}). Please try again.",
            }
    elif isinstance(error, ValueError):
        return {
            "error": True,
            "error_type": "config_error",
            "message": str(error),
        }
    else:
        return {
            "error": True,
            "error_type": "unknown_error",
            "message": "An unexpected error occurred while processing your request. Please try again.",
        }


async def analyze_emergency(image_bytes: bytes, mime_type: str, language: str = "en") -> dict:
    """Analyze an emergency/injury image and provide first-aid guidance."""
    try:
        lang_name = _get_language_name(language)
        prompt = EMERGENCY_PROMPT.format(language=lang_name)

        response = await asyncio.to_thread(
            _get_client().models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error("Emergency analysis failed: %s", e)
        return _make_error_response(e)


async def explain_medicine(image_bytes: bytes, mime_type: str, language: str = "en") -> dict:
    """Explain a medicine/prescription from its image."""
    try:
        lang_name = _get_language_name(language)
        prompt = MEDICINE_PROMPT.format(language=lang_name)

        response = await asyncio.to_thread(
            _get_client().models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error("Medicine explanation failed: %s", e)
        return _make_error_response(e)


async def summarize_report(file_bytes: bytes, mime_type: str, language: str = "en") -> dict:
    """Summarize a medical report from its image or PDF."""
    try:
        lang_name = _get_language_name(language)
        prompt = REPORT_PROMPT.format(language=lang_name)

        response = await asyncio.to_thread(
            _get_client().models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                prompt,
            ],
        )
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error("Report summarization failed: %s", e)
        return _make_error_response(e)


async def generate_sos(
    situation: str, latitude: float, longitude: float, language: str = "en"
) -> dict:
    """Generate an SOS emergency message."""
    try:
        lang_name = _get_language_name(language)
        from datetime import datetime

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        prompt = SOS_PROMPT.format(
            situation=situation,
            latitude=latitude,
            longitude=longitude,
            timestamp=timestamp,
            language=lang_name,
        )

        response = await asyncio.to_thread(
            _get_client().models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        return _parse_json_response(response.text)
    except Exception as e:
        logger.error("SOS generation failed: %s", e)
        return _make_error_response(e)


async def voice_chat(message: str, language: str = "en") -> str:
    """Handle a voice assistant conversation turn."""
    try:
        lang_name = _get_language_name(language)
        system_prompt = VOICE_ASSISTANT_PROMPT.format(language=lang_name)

        response = await asyncio.to_thread(
            _get_client().models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            ),
        )
        return response.text
    except Exception as e:
        logger.error("Voice chat failed: %s", e)
        if isinstance(e, ClientError) and getattr(e, "status", 0) == 429:
            return "I'm temporarily unavailable due to high demand. Please try again in a moment."
        return "Sorry, I encountered an error. Please try again."
