"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, University, LogOut, BarChart3, Settings, Users, 
  Bell, FileText, Shield, ChevronDown, Home, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [adminName, setAdminName] = useState("Admin");

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
      setAdminName(user.name || "Admin User");
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
          setAdminName(decoded.name || "Admin User");
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

  const isActive = (href) => pathname === href || pathname.startsWith(href);

  const menuItems = [
    {
      title: "Main",
      items: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "Management",
      items: [
        { href: "/admin/universities", label: "Universities", icon: University },
        { href: "/admin/users", label: "Users", icon: Users },
      ]
    },
    {
      title: "Analytics & Reports",
      items: [
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/reports", label: "Reports", icon: FileText },
      ]
    },
    {
      title: "System",
      items: [
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/security", label: "Security", icon: Shield },
      ]
    }
  ];

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
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
    </Link>
  );

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={24} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-white font-bold text-lg">Admin</h1>
                <p className="text-xs text-gray-400">Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-gray-700">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold truncate">{adminName}</p>
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

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
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
                    label={sidebarOpen ? item.label : ""}
                    icon={item.icon}
                    isActive={isActive(item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status Bar */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="bg-gray-700/50 rounded-lg p-3 text-xs space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Server Status</span>
                <span className="text-green-400 font-semibold flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Uptime</span>
                <span className="text-blue-400 font-semibold">99.9%</span>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <div className="px-4 py-3 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            <ChevronDown size={20} className={`transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>
        </div>
      </aside>

      {/* Top Navigation Bar for Mobile-like appearance */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-gray-800 font-semibold">Welcome back!</h2>
              <p className="text-xs text-gray-500">System Status: All systems operational</p>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
