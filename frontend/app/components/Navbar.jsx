'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ userRole }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-bold text-lg">SP</span>
            </div>
            <span className="text-white font-bold text-xl">Student Portal</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold">U</span>
              </div>
              <span className="text-white font-medium hidden sm:block">Profile</span>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                <Link 
                  href={`/${userRole.toLowerCase()}/profile`}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-t-lg"
                >
                  View Profile
                </Link>
                <Link 
                  href={`/${userRole.toLowerCase()}/profile/edit`}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50"
                >
                  Edit Profile
                </Link>
                <Link 
                  href={`/${userRole.toLowerCase()}/password-reset`}
                  className="block px-4 py-3 text-gray-700 hover:bg-blue-50"
                >
                  Reset Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg border-t border-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
