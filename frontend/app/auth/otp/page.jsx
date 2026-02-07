'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/otp/verify', {
        studentCode,
        otp
      });

      router.push('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-4">
          Student OTP Verification
        </h1>

        {error && (
          <p className="text-red-600 text-sm text-center mb-2">
            {error}
          </p>
        )}

        <form onSubmit={verifyOTP} className="space-y-4">
          <input
            type="text"
            placeholder="Student ID"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
            className="w-full text-center tracking-widest text-xl px-4 py-2 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-green-600 text-white py-2 rounded-lg"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
