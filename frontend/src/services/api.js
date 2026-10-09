import axios from "axios";

// Priority:
// 1. VITE_API_BASE_URL env var (set in .env.local or Vercel dashboard)
// 2. localhost:8080 fallback for local dev
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
  url = url.trim().replace(/\/+$/, ""); // Remove any trailing slash
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API_BASE = getBaseURL();

export default api;

