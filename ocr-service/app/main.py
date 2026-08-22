from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import ocr

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app = FastAPI(
    title="FitLens AI - OCR Service",
    description=(
        "Extracts structured workout information from images. "
        "Independent of the Spring Boot backend and its database."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(ocr.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "fitlens-ocr"}
