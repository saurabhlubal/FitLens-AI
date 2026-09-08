# FitLens AI - Autonomous Intelligent Workout & Biomechanics Coaching Platform

FitLens AI is an end-to-end fitness platform that performs real-time computer-vision exercise movement analysis, kinematic angle evaluation, automated repetition counting, and posture feedback alongside workout management.

---

## 🏛️ Architecture Overview

The system operates across three coordinated tiers:

```
[React + Vite Frontend :5173]
       │  ▲
       │  │ (REST / JWT)
       ▼  │
[Spring Boot Backend :8080]
       │  ▲
       │  │ (Kinematics & Movement Stream)
       ▼  │
[Python AI Microservice :8001]
   └── (MediaPipe / Biomechanics State Machines / ONNX Models)
```

1. **Frontend (`frontend/`)**: React 19, TailwindCSS, MediaPipe WASM client-side pose landmark extractor, and real-time form analysis HUD.
2. **Backend (`backend/`)**: Spring Boot 4.1.0, Java 17, Spring Security (Stateless JWT), Spring Data JPA + MySQL, and Movement Detection proxy controller.
3. **AI Microservice (`ocr-service/` / `ai-service/`)**: FastAPI, Uvicorn, Python 3.10+, modular kinematic state machines (`BicepCurlDetector`, `SquatDetector`, `PushUpDetector`, `ShoulderPressDetector`).

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

### 2. Spring Boot Backend

```powershell
# Navigate to backend
cd backend

# Ensure MySQL server is running locally on port 3306 with database `fitlens_db`
# Compile and start backend (Runs on http://localhost:8080)
.\mvnw.cmd spring-boot:run
```

### 3. React Frontend

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

| Exercise | Tracked Joints / Angles | Rep Count Criteria | Form Error Flags |
|---|---|---|---|
| **Bicep Curl** | Elbow Flexion (11-13-15 / 12-14-16), Shoulder Angle | Down: > 155°, Up: < 50° | Shoulder swinging / elbow drift > 35° |
| **Squat** | Hip-Knee-Ankle (23-25-27), Trunk Angle | Stand: > 160°, Squat: ≤ 95° | Chest inclination < 65° |
| **Push-Up** | Elbow Flexion, Shoulder-Hip-Ankle Plank | Top: > 155°, Bottom: ≤ 90° | Hip sag / Pike (< 150° or > 195°) |
| **Shoulder Press** | Overhead Elbow Lockout, Arm Symmetry | Rack: ≤ 85°, Lockout: > 160° | Left/Right asymmetry > 25° |

---

## 🔌 API Endpoints Reference

### AI Movement Inference (`POST /api/ai/movement/analyze`)
- **Payload**:
  ```json
  {
    "exerciseName": "Bicep Curl",
    "landmarks": [{"x": 0.5, "y": 0.2, "z": 0.0, "visibility": 1.0}, ...],
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

### Save Analysis to Workout (`POST /api/ai/movement/workouts/{workoutId}/exercises/{workoutExerciseId}/save-analysis`)
- Saves the computed `formScore`, `reps`, and `aiFeedback` directly into the database.
