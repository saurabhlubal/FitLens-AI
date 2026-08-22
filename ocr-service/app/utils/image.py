"""Image validation and light preprocessing."""

from io import BytesIO
from typing import Tuple

import numpy as np
from PIL import Image

ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/bmp",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

_MIN_SIDE_THRESHOLD = 480
_MAX_UPSCALE_FACTOR = 3.0


def validate_upload(file_bytes: bytes, content_type: str) -> None:
    if len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty.")
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError("Image exceeds the maximum allowed size of 10 MB.")
    normalized = content_type.split(";")[0].strip().lower()
    if normalized and normalized not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Unsupported content type: {content_type}")


def load_image_array(file_bytes: bytes) -> np.ndarray:
    """Decode bytes into an RGB uint8 array, upscaling tiny images."""
    try:
        image = Image.open(BytesIO(file_bytes))
        image.load()
    except Exception as exc:
        raise ValueError("Uploaded file is not a readable image.") from exc

    image = image.convert("RGB")

    width, height = image.size
    min_side = min(width, height)
    if min_side > 0 and min_side < _MIN_SIDE_THRESHOLD:
        factor = min(_MIN_SIDE_THRESHOLD / min_side, _MAX_UPSCALE_FACTOR)
        image = image.resize(
            (int(width * factor), int(height * factor)),
            Image.LANCZOS,
        )

    return np.asarray(image, dtype=np.uint8)
