"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      // ✅ STORE TOKEN FIRST
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 🛑 Let browser commit storage before redirect
      setTimeout(() => {
        switch (res.data.role) {
          case "ADMIN":
            router.replace("/admin/dashboard");
            break;
          case "UNIVERSITY":
            router.replace("/university/dashboard");
            break;
          case "STUDENT":
            router.replace("/student/dashboard");
            break;
          case "FACULTY":
            router.replace("/faculty/dashboard");
            break;
          default:
            router.replace("/auth/login");
        }
      }, 50);
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder="Email / Enrollment No / Faculty ID"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          University not registered?{" "}
          <span
            onClick={() => router.push("/auth/signup")}
            className="text-indigo-600 cursor-pointer"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}
