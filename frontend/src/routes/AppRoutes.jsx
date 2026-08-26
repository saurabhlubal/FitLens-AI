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

import ScanPage from "../pages/Scan/ScanPage";
import TrainPage from "../pages/Train/TrainPage";

import NotFoundPage from "../pages/NotFound/NotFoundPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          Public Routes
      ========================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* =========================
          Dashboard
      ========================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Profile
      ========================= */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Fitness Profile
      ========================= */}

      <Route
        path="/fitness-profile"
        element={
          <ProtectedRoute>
            <FitnessProfilePage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Progress
      ========================= */}

      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Workouts
      ========================= */}

      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <WorkoutsPage />
          </ProtectedRoute>
        }
      />

      {/* Workout Detail */}
      <Route
        path="/workouts/:id"
        element={
          <ProtectedRoute>
            <WorkoutDetailPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          OCR Scan
      ========================= */}

      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <ScanPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Pose Trainer
      ========================= */}

      <Route
        path="/train"
        element={
          <ProtectedRoute>
            <TrainPage />
          </ProtectedRoute>
        }
      />

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