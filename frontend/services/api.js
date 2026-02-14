import axios from "axios";

const api = axios.create({
  // Ensure this matches your backend URL perfectly
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// This interceptor automatically attaches the token to EVERY request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      
      // Make sure token exists and isn't just the string "undefined"
      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;