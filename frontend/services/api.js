import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const sessions =
          JSON.parse(localStorage.getItem("sessions")) || {};

        let activeRole =
          localStorage.getItem("activeRole");

        if (!activeRole && Object.keys(sessions).length === 1) {
          activeRole = Object.keys(sessions)[0];
          localStorage.setItem("activeRole", activeRole);
        }

        const token = sessions[activeRole];

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Token read error:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401
    ) {
      if (typeof window !== "undefined") {
        const activeRole =
          localStorage.getItem("activeRole");

        const sessions =
          JSON.parse(localStorage.getItem("sessions")) || {};

        delete sessions[activeRole];

        localStorage.setItem(
          "sessions",
          JSON.stringify(sessions)
        );

        localStorage.removeItem("activeRole");

        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
