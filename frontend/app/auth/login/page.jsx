"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================
     AUTO REDIRECT IF ALREADY LOGGED IN
  ========================================= */
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      redirectByRole(user.role);
    }
  }, [user, authLoading]);

  /* =========================================
     ROLE REDIRECT FUNCTION
  ========================================= */
  const redirectByRole = (role) => {
    switch (role) {
      case "ADMIN":
        router.replace("/admin/dashboard");
        break;
      case "UNIVERSITY":
        router.replace("/university/dashboard");
        break;
      case "FACULTY":
        router.replace("/faculty/dashboard");
        break;
      case "STUDENT":
        router.replace("/student/dashboard");
        break;
      default:
        router.replace("/auth/login");
    }
  };

  /* =========================================
     HANDLE LOGIN SUBMIT
  ========================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        identifier: formData.loginId.trim(),
        password: formData.password,
      });

      const { token } = res.data;

      if (!token) {
        throw new Error("Token not received from server");
      }

      // ✅ Save token via AuthContext
      login(token);

      // Small delay to ensure context updates
      setTimeout(() => {
        const decodedRole = JSON.parse(atob(token.split(".")[1])).role;
        redirectByRole(decodedRole);
      }, 100);

    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.response?.data?.message ||
        "Invalid credentials or server error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          System Login
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or ID
            </label>
            <input
              type="text"
              required
              placeholder="admin@portal.com / UNI-2024..."
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.loginId}
              onChange={(e) =>
                setFormData({ ...formData, loginId: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-4 text-center">
          <Link
            href="/auth/signup"
            className="text-sm text-blue-600 hover:underline"
          >
            Register New University
          </Link>
        </div>
      </div>
    </div>
  );
}
