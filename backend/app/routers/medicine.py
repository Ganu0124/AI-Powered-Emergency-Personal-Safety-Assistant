"""Medicine explainer router — analyzes medicine images and prescriptions."""

from fastapi import APIRouter, UploadFile, File, Form
from app.services.gemini_service import explain_medicine

router = APIRouter(prefix="/api/medicine", tags=["Medicine"])


@router.post("/explain")
async def explain_medicine_image(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    """Explain a medicine or prescription from its image.

    - **file**: Image of medicine packaging, pill, or prescription
    - **language**: Response language code (en, hi, ta, te, bn, kn, ml)
    """
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    result = await explain_medicine(image_bytes, mime_type, language)
    return {"status": "success", "data": result}
