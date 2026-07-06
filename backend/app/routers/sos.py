"""SOS message generator router."""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.gemini_service import generate_sos, voice_chat

router = APIRouter(prefix="/api/sos", tags=["SOS"])


class SOSRequest(BaseModel):
    situation: str
    latitude: float
    longitude: float
    language: str = "en"


class VoiceChatRequest(BaseModel):
    message: str
    language: str = "en"


@router.post("/generate")
async def generate_sos_message(request: SOSRequest):
    """Generate an SOS emergency message with location.

    - **situation**: Description of the emergency
    - **latitude**: GPS latitude
    - **longitude**: GPS longitude
    - **language**: Response language code
    """
    result = await generate_sos(
        request.situation,
        request.latitude,
        request.longitude,
        request.language,
    )
    # If the service returned an error dict, send a proper HTTP error
    if result.get("error"):
        error_type = result.get("error_type", "unknown_error")
        status_map = {"rate_limit": 429, "auth_error": 403, "config_error": 422}
        status_code = status_map.get(error_type, 502)
        return JSONResponse(
            status_code=status_code,
            content={"status": "error", "message": result.get("message", "AI service error.")},
        )
    return {"status": "success", "data": result}


@router.post("/voice-chat")
async def handle_voice_chat(request: VoiceChatRequest):
    """Handle a voice assistant conversation turn.

    - **message**: Transcribed voice message text
    - **language**: Response language code
    """
    response_text = await voice_chat(request.message, request.language)
    return {"status": "success", "data": {"response": response_text}}
