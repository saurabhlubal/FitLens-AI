---
title: FitLens AI - Intelligent Pose & Movement Coach
emoji: 🏋️‍♂️
colorFrom: green
colorTo: lime
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Real-time AI exercise coaching with MediaPipe WASM & kinematic state machines.
---

# FitLens AI - Autonomous Intelligent Workout & Biomechanics Coaching Platform

FitLens AI is an end-to-end fitness platform that performs real-time computer-vision exercise movement analysis, kinematic angle evaluation, automated repetition counting, and posture feedback alongside workout management.

---

## 🚀 Hugging Face Spaces Deployment

FitLens AI is fully configured for Hugging Face Spaces deployment:
- **Port**: 7860
- **Container**: Multi-stage Docker (`node:20-alpine` + `python:3.11-slim`)
- **WebAssembly Acceleration**: Client-side MediaPipe WASM runs at 30+ FPS directly in the browser with zero server video egress.

---

## 🏛️ Architecture Overview

The system operates across three coordinated tiers:

```
[React + Vite Frontend :5173 / :7860]
       │  ▲
       │  │ (REST / Kinematics Stream)
       ▼  │
[Python AI Microservice :8001 / :7860]
   └── (MediaPipe / Biomechanics State Machines / Kinematic Detectors)
```

1. **Frontend (`frontend/`)**: React 19, TailwindCSS, MediaPipe WASM client-side pose landmark extractor, and real-time form analysis HUD.
2. **AI Microservice (`ocr-service/`)**: FastAPI, Uvicorn, Python 3.11, modular kinematic state machines (`BicepCurlDetector`, `SquatDetector`, `PushUpDetector`, `ShoulderPressDetector`, `PlankDetector`, `LungeDetector`, `HammerCurlDetector`, `LateralRaiseDetector`, `JumpingJacksDetector`).
3. **Backend (`backend/`)**: Optional Spring Boot enterprise database & authentication tier.

---

## 🚀 Quick Setup & Run Instructions

### 1. Python AI Movement Microservice

```powershell
# Navigate to AI service
cd ocr-service

# Create and activate virtual environment (if not already done)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the microservice (Runs on http://localhost:8001)
python run_service.py
```

### 2. React Frontend

```powershell
# Navigate to frontend
cd frontend

# Install node dependencies
npm install

# Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

---

## 🦾 Supported Exercises & Movement Telemetry

| Exercise | Tracked Joints / Angles | Rep Count Criteria | Form Invariant Checks |
|---|---|---|---|
| **Bicep Curl** | Elbow Flexion (11-13-15 / 12-14-16) | Down: > 155°, Up: < 50° | Shoulder swinging / elbow drift > 15cm |
| **Squat** | Hip-Knee-Ankle (23-25-27), Trunk Angle | Stand: > 160°, Squat: ≤ 95° | Valgus knee collapse, Chest drop < 65° |
| **Push-Up** | Elbow Flexion, Shoulder-Hip-Ankle Plank | Top: > 155°, Bottom: ≤ 90° | Hip sag / Pike (< 150° or > 195°) |
| **Shoulder Press** | Overhead Elbow Lockout, Arm Symmetry | Rack: ≤ 85°, Lockout: > 160° | Rib flare, left/right asymmetry > 25° |
| **Plank** | Torso Alignment (160°–180°) | Dual-view (Full body & Webcam shoulder) | Sag/Pike auto-pause timer |
| **Lunge** | Lead Knee Angle (75°–155°) | Down: ≤ 90°, Stand: > 155° | Knee overextension past toes |
| **Hammer Curl** | Neutral Elbow Angle (35°–155°) | Down: > 155°, Up: < 50° | Neutral grip trajectory consistency |
| **Lateral Raise** | Shoulder Abduction (20°–85°) | Bottom: < 25°, Top: > 80° | Trapezius shrug compensation (<15°) |
| **Jumping Jacks** | Shoulder Abduction & Stance Width | Closed $\rightarrow$ Open (> 130°) | Foot separation & arm synchronization |

---

## 🔌 API Endpoints Reference

### AI Movement Inference (`POST /api/ai/movement/analyze`)
- **Payload**:
  ```json
  {
    "exerciseName": "Bicep Curl",
    "landmarks": [{"x": 0.5, "y": 0.2, "z": 0.0, "visibility": 1.0}],
    "currentReps": 3,
    "currentStage": "down"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "exerciseName": "Bicep Curl",
    "stage": "up",
    "repetitionCount": 4,
    "repIncremented": true,
    "formScore": 95.0,
    "isCorrectForm": true,
    "feedback": "Rep completed! Great contraction.",
    "jointAngles": { "leftElbow": 42.1, "rightElbow": 44.0 },
    "metrics": { "flexionAngle": 42.1, "romPercentage": 98 }
  }
  ```
