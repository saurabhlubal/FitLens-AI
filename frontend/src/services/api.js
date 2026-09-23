import axios from "axios";

// Automatically use VITE_API_BASE_URL if set, or localhost in dev mode, or relative /api in production/HF
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    if (window.location.port === "5173" && window.location.hostname === "localhost") {
      return "http://localhost:8080/api";
    }
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;