from statistics import mean

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.models.response import DetectedExercise, OcrAnalysisResponse
from app.services.ocr_service import OcrResult, run_ocr
from app.services.parser import parse_workout_text
from app.utils.image import validate_upload

router = APIRouter(prefix="/ocr", tags=["ocr"])


def _attach_line_confidence(
    result: OcrResult,
) -> tuple[list[DetectedExercise], float]:
    """Parse each OCR line separately so confidence maps to its source line."""
    exercises: list[DetectedExercise] = []

    for line in result.lines:
        found = parse_workout_text(line.text)
        for exercise in found:
            exercise.confidence = round(line.confidence, 2)
            exercises.append(exercise)

    overall_confidence = 0.0
    if exercises:
        overall_confidence = round(
            mean(exercise.confidence for exercise in exercises), 2
        )
    elif result.lines:
        overall_confidence = round(
            max(line.confidence for line in result.lines), 2
        )

    return exercises, overall_confidence


@router.post(
    "/analyze",
    response_model=OcrAnalysisResponse,
    responses={400: {"description": "Invalid or unsupported image upload"}},
)
async def analyze_workout_image(image: UploadFile = File(...)) -> (
    OcrAnalysisResponse
):
    file_bytes = await image.read()
    try:
        validate_upload(file_bytes, image.content_type or "")
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    try:
        result = run_ocr(file_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    if not result.lines:
        # Failed or unclear OCR (spec section 8).
        return OcrAnalysisResponse(success=False)

    exercises, confidence = _attach_line_confidence(result)

    first = exercises[0] if exercises else None

    return OcrAnalysisResponse(
        success=True,
        text=result.raw_text,
        exerciseName=first.exerciseName if first else None,
        sets=first.sets if first else None,
        reps=first.reps if first else None,
        confidence=confidence,
        exercises=exercises,
    )
