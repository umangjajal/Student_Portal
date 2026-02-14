"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  University,
  LogOut,
  BarChart3,
  Settings,
  Users,
  Bell,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Get Auth Context (including the newly updated logout function)
  const { user, loading: authContextLoading, logout: contextLogout } = useAuth();

  // State for protection
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const validateAccess = () => {
      // 1. Wait for Auth Context to load
      if (authContextLoading) return;

      // 2. CHECK CONTEXT (Fastest method)
      if (user) {
        if (user.role === "ADMIN") {
          setIsAuthorized(true);
          setAdminName(user.name || "Admin User");
          setIsChecking(false);
          return;
        } else {
          // User is logged in, but is NOT an Admin (e.g., University/Student)
          console.warn(`Access Denied: Role '${user.role}' is not ADMIN`);
          router.replace("/unauthorized"); // Redirect to unauthorized page
          return;
        }
      }

      // 3. CHECK LOCAL STORAGE (Fallback for Refresh/SSR)
      if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");

        if (token) {
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.role === "ADMIN" && decoded.exp > currentTime) {
              setIsAuthorized(true);
              setAdminName(decoded.name || "Admin User");
              setIsChecking(false);
              return;
            } else if (decoded.exp <= currentTime) {
               sessionStorage.removeItem("token");
               document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
               router.replace("/auth/login");
               return;
            } else {
              router.replace("/unauthorized");
              return;
            }
          } catch (err) {
            sessionStorage.removeItem("token");
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      }

      setIsAuthorized(false);
      setIsChecking(false);
      router.replace("/auth/login");
    };

    validateAccess();
  }, [user, authContextLoading, router]);

  const handleLogout = () => {
    if (contextLogout) {
      contextLogout();
    } else {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("token"); // ✅ Changed to sessionStorage
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
    router.replace("/auth/login");
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href);

  const menuItems = [
    {
      title: "Main",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Management",
      items: [
        { href: "/admin/universities", label: "Universities", icon: University },
        { href: "/admin/users", label: "Users", icon: Users },
      ],
    },
    {
      title: "Analytics & Reports",
      items: [
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      title: "System",
      items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
    },
  ];

  // NavLink Component
  const NavLink = ({ href, label, icon: Icon, isActive: active }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon size={20} />
      {sidebarOpen && <span className="font-medium">{label}</span>}
      {active && sidebarOpen && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
      )}
    </Link>
  );

  // --- LOADING STATE ---
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // --- AUTH GUARD ---
  if (!isAuthorized) return null;

  // --- MAIN RENDER ---
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-20"} 
        bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl border-r border-gray-700 
        transition-all duration-300 flex flex-col fixed h-full z-20`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="text-white" size={24} />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-white font-bold text-lg whitespace-nowrap">
                  Admin
                </h1>
                <p className="text-xs text-gray-400">Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info (Sidebar) */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-sm font-semibold truncate">
                    {adminName}
                  </p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Active
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
          {menuItems.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                  {section.title}
                </p>
              )}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive(item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="px-4 py-3 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
            />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"}`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-gray-800 font-semibold">Welcome back!</h2>
              <p className="text-xs text-gray-500">
                System Status: All systems operational
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Injection */}
        <main className="flex-1 p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

