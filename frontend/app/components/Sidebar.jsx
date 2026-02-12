'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ userRole, menuItems }) {
  const pathname = usePathname();

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      {/* Sidebar Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-400">{userRole}</h2>
        <p className="text-gray-400 text-sm">Portal Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Additional Info */}
      <div className="mt-12 pt-6 border-t border-gray-700">
        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-3">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/help" className="text-blue-400 hover:text-blue-300">
                Help & Support
              </Link>
            </li>
            <li>
              <Link href="/settings" className="text-blue-400 hover:text-blue-300">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
