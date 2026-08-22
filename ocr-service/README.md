# FitLens AI — OCR Service

Independent Python microservice that extracts **structured workout information**
from images. It is fully decoupled from the Spring Boot backend and its database
(per the project OCR specification).

```
React (5173) → Spring Boot (8080) → OCR Service (8000)
```

The OCR service never touches the FitLens database, JWT/auth, WorkoutExercise
records, or pose/form analysis.

---

## 1. Tech Stack

| Piece      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Language   | Python 3.10 – 3.13 (tested on 3.13)                |
| Framework  | FastAPI + Uvicorn                                  |
| OCR engine | RapidOCR v2 (PaddleOCR models, ONNX Runtime, CPU)  |
| Images     | Pillow + NumPy                                     |
| Tests      | pytest + FastAPI TestClient                        |

No external binaries are required — models are bundled with the pip package
(downloaded automatically into the virtualenv on first run).

## 2. Setup & Run

```bash
cd ocr-service

python -m venv .venv
# Windows (PowerShell)
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

- Service: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Health check: `GET http://localhost:8000/health`

Run tests:

```bash
pytest tests -q
```

## 3. API Contract

### `POST /ocr/analyze`

- `Content-Type: multipart/form-data`
- Field name: `image` (PNG / JPEG / WEBP / BMP, max 10 MB)

#### Success (single exercise)

```json
{
  "success": true,
  "text": "Squat 3 sets x 12 reps",
  "exerciseName": "Squat",
  "sets": 3,
  "reps": 12,
  "confidence": 0.98,
  "exercises": [
    { "exerciseName": "Squat", "sets": 3, "reps": 12, "confidence": 0.98 }
  ]
}
```

#### Missing information (never invented, `null` instead)

```json
{
  "success": true,
  "text": "Barbell Squat",
  "exerciseName": "Barbell Squat",
  "sets": null,
  "reps": null,
  "confidence": 1.0,
  "exercises": [
    { "exerciseName": "Barbell Squat", "sets": null, "reps": null, "confidence": 1.0 }
  ]
}
```

#### Multiple exercises

```json
{
  "success": true,
  "text": "Squat 3 x 12\nPush-up 3 x 15",
  "exerciseName": "Squat",
  "sets": 3,
  "reps": 12,
  "confidence": 0.98,
  "exercises": [
    { "exerciseName": "Squat", "sets": 3, "reps": 12, "confidence": 0.98 },
    { "exerciseName": "Push-up", "sets": 3, "reps": 15, "confidence": 0.98 }
  ]
}
```

#### Failed or unclear OCR

```json
{
  "success": false,
  "text": "",
  "exerciseName": null,
  "sets": null,
  "reps": null,
  "confidence": 0.0,
  "exercises": []
}
```

Errors:

| Status | Cause                                        |
| ------ | -------------------------------------------- |
| `400`  | Not an image, corrupt/unreadable file, unsupported content type, > 10 MB |
| `422`  | `image` field missing from the multipart request |

### Example call

```bash
curl -X POST http://localhost:8000/ocr/analyze \
  -F "image=@workout.png"
```

## 4. Behavior Rules

- Returns the exercise name **exactly as detected** ("Barbell Squat" stays
  "Barbell Squat"); normalization/matching to DB IDs happens in Spring Boot.
- Missing sets/reps are returned as `null`, never guessed.
- Raw OCR text is always preserved in `text` for debugging.
- No database IDs, no auth/JWT logic, no DB writes.
- Confidence is normalized to `0.0 – 1.0` (mean of the source line's OCR score).

## 5. Project Structure

```
ocr-service/
├── app/
│   ├── main.py               # FastAPI app, CORS (localhost:5173), /health
│   ├── routes/
│   │   └── ocr.py            # POST /ocr/analyze endpoint
│   ├── services/
│   │   ├── ocr_service.py    # RapidOCR engine wrapper, line grouping
│   │   └── parser.py         # text → structured exercises (regex parser)
│   ├── models/
│   │   └── response.py       # Pydantic response schemas
│   └── utils/
│       └── image.py          # validation + light preprocessing
├── tests/
│   ├── test_parser.py        # parsing rules & edge cases
│   └── test_api.py           # API contract tests
├── requirements.txt
└── README.md
```

## 6. CORS

Allows `http://localhost:5173` so React can call it directly during development.
In production the preferred flow keeps the OCR service behind Spring Boot:

```
React → POST /api/ocr/analyze (Spring Boot, JWT validated) → OCR service
```

## 7. Known Limitations / Failure Cases

- Handwriting and very low-light/blurry photos reduce accuracy; confidence drops
  accordingly.
- The regex parser understands common notations (`3 sets x 12 reps`, `3x12`,
  `3 × 12`, `4 sets of 15`, `12 reps` only, `5 sets` only). Unusual formats fall
  back to name-only results with `null` sets/reps rather than guessing.
- A line of digits/symbols with no exercise name is dropped entirely.
- Non-Latin scripts are supported by the model but workout notation parsing is
  tuned for English.
- Very small images (<480 px on the shorter side) are auto-upscaled, which helps
  but cannot recover unreadable text.
