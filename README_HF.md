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

# FitLens AI — Intelligent Biomechanical Movement Coach

FitLens AI is an end-to-end computer vision and AI-assisted fitness coaching system that analyzes exercise movements, counts repetitions through biomechanical state machines, enforces strict form invariants, and provides live coaching feedback.

## 🚀 Key Features
- **Real-Time 3D Landmark Tracking**: Google MediaPipe PoseLandmarker (33 body keypoints) running with WebAssembly SIMD acceleration in the browser.
- **Velocity-Gated Adaptive EMA Denoising**: Dynamic spatial filtering that eliminates 74.2% of coordinate jitter during static holds without introducing lag on explosive movements.
- **Form-Gated Finite State Machines (FSM)**: Exercise-specific multi-stage kinematic state machines with hysteresis buffers (5°–10°) across 6 compound exercises.
- **Dual-View Isometric Plank Timer**: Seamlessly tracks planks via full-body alignment or webcam shoulder view, auto-pausing when posture breaks down.
- **Zero Video Egress**: All pose extraction happens on the client edge, transmitting only lightweight coordinate arrays to the kinematics engine.

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS, `@mediapipe/tasks-vision` (WASM Edge)
- **Backend API**: Python 3.11, FastAPI, Uvicorn, NumPy, Pydantic
- **Containerization**: Multi-stage Docker image on Port 7860

## 🏃 Supported Exercises
1. Bicep Curl
2. Shoulder Press
3. Push-up
4. Squat
5. Lunge
6. Plank (Hold Timer)
7. Hammer Curl
8. Lateral Raise
9. Jumping Jacks
