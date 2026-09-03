from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.movement import router as movement_router

app = FastAPI(
    title="FitLens AI - Computer Vision & Movement Detection Engine",
    version="1.0.0",
    description="Microservice providing Real-Time Kinematic Movement Detection, Repetition Counting, and Biomechanical Form Analysis"
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

@app.get("/")
@app.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "FitLens AI Movement Engine",
        "version": "1.0.0",
        "capabilities": ["Movement Detection", "Repetition Counting", "Form Scoring", "Biomechanics Analysis"]
    }
