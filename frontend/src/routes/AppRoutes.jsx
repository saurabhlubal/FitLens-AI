import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";

import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import FitnessProfilePage from "../pages/FitnessProfile/FitnessProfilePage";

import ProgressPage from "../pages/Progress/ProgressPage";

import WorkoutsPage from "../pages/Workouts/WorkoutsPage";
import WorkoutDetailPage from "../pages/Workouts/WorkoutDetailPage";

import CameraAnalysisPage from "../pages/Camera/CameraAnalysisPage";
import TrainingPage from "../pages/Training/TraininPage";
import ScanPage from "../pages/Scan/ScanPage";
import TrainPage from "../pages/Train/TrainPage";

import NotFoundPage from "../pages/NotFound/NotFoundPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />


      {/* =========================
          PROTECTED ROUTES
      ========================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fitness-profile"
        element={
          <ProtectedRoute>
            <FitnessProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />


      {/* =========================
          WORKOUT ROUTES
      ========================= */}

      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <WorkoutsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workouts/:workoutId"
        element={
          <ProtectedRoute>
            <WorkoutDetailPage />
          </ProtectedRoute>
        }
      />


      {/* =========================
          CAMERA / AI ANALYSIS (Direct Access / In-Browser)
      ========================= */}

      <Route path="/camera" element={<CameraAnalysisPage />} />
      <Route path="/ai-analysis/:exerciseId" element={<CameraAnalysisPage />} />

      {/* =========================
          TRAINING & POSE TRAINER (Direct Access / In-Browser)
      ========================= */}

      <Route path="/training" element={<TrainingPage />} />
      <Route path="/train" element={<TrainPage />} />

      {/* =========================
          404
      ========================= */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}

