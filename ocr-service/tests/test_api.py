import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def make_png(width=320, height=120, color=(255, 255, 255)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (width, height), color).save(buffer, format="PNG")
    return buffer.getvalue()


def analyze(png_bytes: bytes, filename="workout.png", content_type="image/png"):
    return client.post(
        "/ocr/analyze",
        files={"image": (filename, png_bytes, content_type)},
    )


class TestApiContract:
    def test_endpoint_exists_and_accepts_multipart_image_field(self):
        response = analyze(make_png())
        assert response.status_code == 200
        body = response.json()
        # Contract keys from the spec must always be present.
        for key in (
            "success",
            "text",
            "exerciseName",
            "sets",
            "reps",
            "confidence",
            "exercises",
        ):
            assert key in body

    def test_blank_image_returns_failure_contract(self):
        response = analyze(make_png())
        body = response.json()
        assert body["success"] is False
        assert body["text"] == ""
        assert body["exerciseName"] is None
        assert body["sets"] is None
        assert body["reps"] is None
        assert body["confidence"] == 0.0
        assert body["exercises"] == []

    def test_missing_image_field_is_rejected(self):
        response = client.post("/ocr/analyze")
        assert response.status_code == 422

    def test_non_image_bytes_return_400(self):
        response = analyze(b"this is definitely not an image")
        assert response.status_code == 400

    def test_unsupported_content_type_returns_400(self):
        response = analyze(
            make_png(), filename="notes.txt", content_type="text/plain"
        )
        assert response.status_code == 400

    def test_corrupt_png_returns_400(self):
        fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
        response = analyze(fake_png)
        assert response.status_code == 400


class TestHealth:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "UP"
        assert "FitLens" in data["service"]
