import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes.movement import router as movement_router
from app.routes import ocr

app = FastAPI(
    title="FitLens AI - Movement Detection & OCR Engine",
    version="1.0.0",
    description="Microservice providing Real-Time Kinematic Movement Detection, Repetition Counting, Biomechanical Form Analysis, and Workout Plan OCR"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register AI Movement Routers
app.include_router(movement_router)
app.include_router(ocr.router)
app.include_router(ocr.router, prefix="/api")

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

# Check if static built frontend exists (for unified Docker / Hugging Face deployment)
base_dir = os.path.dirname(os.path.abspath(__file__))
dist_candidates = [
    os.path.join(base_dir, "..", "dist"),
    os.path.join(base_dir, "dist"),
    os.path.join(base_dir, "..", "..", "frontend", "dist"),
    "/app/dist"
]

dist_dir = None
for candidate in dist_candidates:
    if os.path.exists(candidate) and os.path.isdir(candidate):
        dist_dir = candidate
        break

if dist_dir:
    # Mount sub-directories
    for subdir in ["assets", "mediapipe", "models"]:
        subpath = os.path.join(dist_dir, subdir)
        if os.path.exists(subpath):
            app.mount(f"/{subdir}", StaticFiles(directory=subpath), name=subdir)

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve exact file if it exists in dist
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for client-side routing
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build index.html not found"}
else:
    @app.get("/")
    async def root():
        return {
            "service": "FitLens AI Movement Engine",
            "documentation": "/docs",
            "health": "/health",
            "note": "Frontend dist not mounted. API endpoints active at /api/ai/movement/analyze"
        }

