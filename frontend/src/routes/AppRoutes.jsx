import { Routes, Route, Navigate } from "react-router-dom";

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
          AI CAMERA
      ========================= */}

      <Route
        path="/camera"
        element={
          <ProtectedRoute>
            <CameraAnalysisPage />
          </ProtectedRoute>
        }
      />


      {/* =========================
          TRAINING
      ========================= */}

      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <TrainingPage />
          </ProtectedRoute>
        }
      />


      {/* =========================
          UNKNOWN ROUTE
      ========================= */}

      <Route
        path="/404"
        element={<NotFoundPage />}
      />

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}