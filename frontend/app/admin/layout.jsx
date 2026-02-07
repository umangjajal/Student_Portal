'use client';

import Link from 'next/link';
import { LayoutDashboard, University, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const logout = () => {
    localStorage.clear();
    router.replace('/auth/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl">
        <div className="p-6 text-xl font-bold text-blue-600 border-b">
          Admin Panel
        </div>

        <nav className="px-4 py-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/admin/universities"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            <University size={18} />
            Universities
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 text-red-600 w-full text-left transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
