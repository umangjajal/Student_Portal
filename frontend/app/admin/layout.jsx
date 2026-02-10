"use client";

import Link from "next/link";
import { LayoutDashboard, University, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking admin access…</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

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
