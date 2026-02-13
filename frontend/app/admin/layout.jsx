'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🔹 Send identifier + password
      const res = await api.post('/auth/login', {
        identifier: formData.identifier,
        password: formData.password
      });

      const { token } = res.data;

      if (!token) {
        throw new Error('Token not received from server');
      }

      // 🔹 Save token
      localStorage.setItem('token', token);

      // 🔹 Decode token
      const decoded = jwtDecode(token);
      const role = decoded.role;
      const exp = decoded.exp;

      // 🔹 Check expiration
      if (!exp || Date.now() >= exp * 1000) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      // 🔹 Redirect based on role
      switch (role) {
        case 'ADMIN':
          router.replace('/admin/dashboard');
          break;

        case 'UNIVERSITY':
          router.replace('/university/dashboard');
          break;

        case 'FACULTY':
          router.replace('/faculty/dashboard');
          break;

        case 'STUDENT':
          router.replace('/student/dashboard');
          break;

        default:
          localStorage.removeItem('token');
          setError('Unknown user role. Contact support.');
      }

    } catch (err) {
      console.error('Login Error:', err);
      localStorage.removeItem('token');

      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
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
              name="identifier"
              required
              placeholder="admin@portal.com / UNI-2024..."
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.identifier}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

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
