from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.movement import router as movement_router
from app.routes import ocr

app = FastAPI(
    title="FitLens AI - Movement Detection & OCR Engine",
    version="1.0.0",
    description="Microservice providing Real-Time Kinematic Movement Detection, Repetition Counting, Biomechanical Form Analysis, and Workout Plan OCR"
)

# Enable CORS for Frontend and Spring Boot Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(movement_router)
app.include_router(ocr.router)

@app.get("/")
@app.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "FitLens AI Movement & OCR Engine",
        "version": "1.0.0",
        "capabilities": [
            "Movement Detection",
            "Repetition Counting",
            "Form Scoring",
            "Biomechanics Analysis",
            "Workout Plan OCR"
        ]
    }
