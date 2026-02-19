import axios from "axios";

// Detect environment
const isProduction = process.env.NODE_ENV === "production";

// Base URL logic
const baseURL = isProduction
  ? process.env.NEXT_PUBLIC_API_URL || "https://your-backend-name.onrender.com/api"
  : "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler (helps debugging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Backend not reachable or server down.");
    } else {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data
      );
    }
    return Promise.reject(error);
  }
);

export default api;
