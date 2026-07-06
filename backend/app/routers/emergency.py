"""Emergency analysis router — handles injury/accident image analysis."""

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, Form
from app.services.gemini_service import analyze_emergency

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])


@router.post("/analyze")
async def analyze_emergency_image(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    """Analyze an injury/accident image and provide first-aid guidance.

    - **file**: Image of injury or accident scene
    - **language**: Response language code (en, hi, ta, te, bn, kn, ml)
    """
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    result = await analyze_emergency(image_bytes, mime_type, language)
    return {"status": "success", "data": result}
