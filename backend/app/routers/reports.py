"""Medical report summarizer router."""

from fastapi import APIRouter, UploadFile, File, Form
from app.services.gemini_service import summarize_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("/summarize")
async def summarize_medical_report(
    file: UploadFile = File(...),
    language: str = Form("en"),
):
    """Summarize a medical report from image or PDF.

    - **file**: Medical report image or PDF
    - **language**: Response language code (en, hi, ta, te, bn, kn, ml)
    """
    file_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    result = await summarize_report(file_bytes, mime_type, language)
    return {"status": "success", "data": result}
