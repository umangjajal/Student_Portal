'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/api';

export default function UniversitySignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    place: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/auth/university/signup', form);
      router.push('/auth/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          University Registration
        </h1>

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['name', 'University Name'],
            ['email', 'Official Email'],
            ['password', 'Password'],
            ['place', 'Place'],
            ['city', 'City'],
            ['state', 'State'],
            ['country', 'Country'],
            ['postalCode', 'Postal Code']
          ].map(([key, label]) => (
            <input
              key={key}
              type={key === 'password' ? 'password' : 'text'}
              name={key}
              placeholder={label}
              required
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? 'Registering...' : 'Register University'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already registered?{' '}
          <span
            onClick={() => router.push('/auth/login')}
            className="text-indigo-600 cursor-pointer"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
