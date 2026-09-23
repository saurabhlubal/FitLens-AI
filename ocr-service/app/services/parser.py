"""Parsing of raw OCR text into structured workout information.

Rules (see project spec):
- Never invent values. Missing sets/reps become None.
- Return the exercise name exactly as detected (no normalization).
- Support multiple exercises, one per line.
"""

import re
from typing import List, Optional, Tuple

from app.models.response import DetectedExercise

# Ordered patterns; first match wins.
_SETS_AND_REPS_PATTERNS = [
    # "3 sets x 12 reps", "3 sets of 12"
    r"(?P<sets>\d+)\s*sets?\s*(?:x|×|\*|of)?\s*(?P<reps>\d+)\s*(?:reps?)?",
    # "3 x 12", "3x12", "3 × 12"
    r"(?P<sets>\d+)\s*(?:x|×)\s*(?P<reps>\d+)",
    # "3 of 12"
    r"(?P<sets>\d+)\s*of\s*(?P<reps>\d+)",
]

_REPS_ONLY_PATTERN = r"\b(?P<reps>\d+)\s*reps?\b"
_SETS_ONLY_PATTERN = r"\b(?P<sets>\d+)\s*sets?\b"

_LINE_NOISE_PATTERN = re.compile(r"^[\W_]+$")
_LEADING_BULLETS_PATTERN = re.compile(r"^[\s]*(?:[-•*·>#]+|\d+[.)])\s*")
_DECORATIVE_SEPARATORS = set("-–—:*=|")

MIN_NAME_LENGTH = 2


def _strip_decorative_separators(text: str) -> str:
    """Replace separator runs that are NOT part of a word (e.g. 'Push-up' keeps its hyphen)."""
    chars = []
    n = len(text)
    for i, ch in enumerate(text):
        if ch in _DECORATIVE_SEPARATORS:
            prev_is_boundary = i == 0 or text[i - 1].isspace()
            next_is_boundary = i == n - 1 or text[i + 1].isspace()
            if prev_is_boundary or next_is_boundary:
                chars.append(" ")
                continue
        chars.append(ch)
    return "".join(chars)


def _match_sets_reps(line: str) -> Tuple[Optional[int], Optional[int], str]:
    """Return (sets, reps, remaining_line_after_match)."""
    for pattern in _SETS_AND_REPS_PATTERNS:
        match = re.search(pattern, line, flags=re.IGNORECASE)
        if match:
            remaining = line[: match.start()] + " " + line[match.end():]
            return int(match.group("sets")), int(match.group("reps")), remaining

    sets = None
    reps = None
    remaining = line

    reps_match = re.search(_REPS_ONLY_PATTERN, line, flags=re.IGNORECASE)
    if reps_match:
        reps = int(reps_match.group("reps"))
        remaining = line[: reps_match.start()] + " " + line[reps_match.end():]
    else:
        sets_match = re.search(_SETS_ONLY_PATTERN, line, flags=re.IGNORECASE)
        if sets_match:
            sets = int(sets_match.group("sets"))
            remaining = line[: sets_match.start()] + " " + line[sets_match.end():]

    return sets, reps, remaining


def extract_exercise_name(remaining_line: str) -> Optional[str]:
    cleaned = _strip_decorative_separators(remaining_line)
    cleaned = re.sub(r"\b(reps?|sets?)\b", " ", cleaned, flags=re.IGNORECASE)
    cleaned = _LEADING_BULLETS_PATTERN.sub("", " " + cleaned)
    cleaned = re.sub(r"^\s*\d+\s*$", " ", cleaned)
    name = re.sub(r"\s+", " ", cleaned).strip()

    if (
        len(name) < MIN_NAME_LENGTH
        or not any(ch.isalpha() for ch in name)
        or _LINE_NOISE_PATTERN.match(name)
    ):
        return None
    return name


def parse_workout_text(raw_text: str) -> List[DetectedExercise]:
    exercises: List[DetectedExercise] = []

    for line in raw_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        sets, reps, remaining = _match_sets_reps(stripped)
        if sets is None and reps is None:
            remaining = stripped

        name = extract_exercise_name(remaining)
        if name is None:
            continue

        exercises.append(
            DetectedExercise(
                exerciseName=name,
                sets=sets,
                reps=reps,
                confidence=0.0,
            )
        )

    return exercises
