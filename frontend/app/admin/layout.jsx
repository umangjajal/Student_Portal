"use client";

import Link from "next/link";
import { LayoutDashboard, University, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has correct role
    if (loading) {
      setIsChecking(true);
      return;
    }

    // If context has user with correct role, allow
    if (user && user.role === "ADMIN") {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    // If context is empty, check localStorage directly
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "ADMIN") {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
      } catch (err) {
        // Invalid token
      }
    }

    // Not authorized
    setIsAuthorized(false);
    setIsChecking(false);
    router.replace("/auth/login");
  }, [user?.id, user?.role, loading, router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/auth/login");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking admin access…</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-xl">
        <div className="p-6 text-xl font-bold text-blue-600 border-b">
          Admin Panel
        </div>

        <nav className="px-4 py-4 space-y-2">
          <Link href="/admin/dashboard" className="nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link href="/admin/universities" className="nav-link">
            <University size={18} /> Universities
          </Link>

          <button onClick={logout} className="nav-link text-red-600">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
