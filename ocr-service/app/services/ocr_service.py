"""OCR engine wrapper.

Uses RapidOCR (ONNX Runtime, bundled models, CPU friendly). The engine is
isolated here so it can be swapped later without touching routes or parsing.

The rest of the service only depends on OcrResult / OcrLine.
"""

from statistics import mean
from typing import Any, List, NamedTuple, Optional

from app.utils.image import load_image_array

_LINE_GROUP_TOLERANCE_RATIO = 0.6


class OcrLine(NamedTuple):
    text: str
    confidence: float


class OcrResult(NamedTuple):
    raw_text: str
    lines: List[OcrLine]
    engine_confidence: Optional[float]


_engine = None


def _get_engine():
    global _engine
    if _engine is None:
        from rapidocr import RapidOCR

        _engine = RapidOCR()
    return _engine


def _group_into_lines(results) -> List[OcrLine]:
    """Group detected word boxes into reading-order lines."""
    if results is None:
        return []

    entries = []
    boxes = results.boxes
    texts = results.txts
    scores = results.scores
    boxes = [] if boxes is None else list(boxes)
    texts = () if texts is None else tuple(texts)
    scores = () if scores is None else tuple(scores)

    for box, text, score in zip(boxes, texts, scores):
        text = str(text).strip()
        score = float(score)
        if not text:
            continue
        ys = [float(point[1]) for point in box]
        xs = [float(point[0]) for point in box]
        height = max(ys) - min(ys)
        center_y = sum(ys) / len(ys)
        left_x = min(xs)
        entries.append(
            {
                "text": text,
                "score": score,
                "center_y": center_y,
                "left_x": left_x,
                "height": max(height, 1.0),
            }
        )

    if not entries:
        return []

    entries.sort(key=lambda e: e["center_y"])
    median_height = sorted(e["height"] for e in entries)[len(entries) // 2]
    tolerance = median_height * _LINE_GROUP_TOLERANCE_RATIO

    grouped_lines: List[List[dict]] = []
    current_line: List[dict] = [entries[0]]
    line_reference_y = entries[0]["center_y"]

    for entry in entries[1:]:
        if abs(entry["center_y"] - line_reference_y) <= tolerance:
            current_line.append(entry)
        else:
            grouped_lines.append(current_line)
            current_line = [entry]
            line_reference_y = entry["center_y"]
    grouped_lines.append(current_line)

    lines: List[OcrLine] = []
    for group in grouped_lines:
        group.sort(key=lambda e: e["left_x"])
        text = " ".join(e["text"] for e in group)
        confidence = mean(e["score"] for e in group)
        lines.append(OcrLine(text=text, confidence=confidence))

    return lines


def run_ocr(file_bytes: bytes) -> OcrResult:
    image_array = load_image_array(file_bytes)
    raw_result = _get_engine()(image_array)

    txts = getattr(raw_result, "txts", None) if raw_result is not None else None
    if txts is None or len(txts) == 0:
        return OcrResult(raw_text="", lines=[], engine_confidence=None)

    lines = _group_into_lines(raw_result)
    raw_text = "\n".join(line.text for line in lines)
    engine_confidence = (
        mean(line.confidence for line in lines) if lines else None
    )

    return OcrResult(
        raw_text=raw_text,
        lines=lines,
        engine_confidence=engine_confidence,
    )
