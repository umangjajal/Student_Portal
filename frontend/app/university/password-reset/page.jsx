'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { KeyRound, ShieldCheck, Mail, AlertCircle, ArrowRight, Clock } from 'lucide-react';

export default function PasswordReset() {
  const router = useRouter();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // ✅ Fixed route to match backend: /api/university/password/request-reset
      const response = await api.post('/university/password/request-reset');
      setEmail(response.data.email);
      setSuccess('OTP sent to your email!');
      setStep('verify');
      setTimer(600); // 10 minutes
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // ✅ Fixed route to match backend: /api/university/password/verify-otp
      await api.post('/university/password/verify-otp', {
        otp,
        newPassword
      });
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => router.push('/university/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. OTP may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 shadow-sm">
          <KeyRound size={32} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-2">Update your university administrator password securely.</p>
      </div>

      {/* Progress Tracker */}
      <div className="flex items-center justify-center mb-12 max-w-md mx-auto">
        <div className={`flex flex-col items-center ${step === 'request' ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-colors ${
            step === 'request' ? 'bg-blue-600 text-white shadow-md' : 'bg-green-500 text-white'
          }`}>
            {step === 'verify' ? <ShieldCheck size={24} /> : '1'}
          </div>
          <span className="text-sm font-semibold text-gray-600 mt-2">Request OTP</span>
        </div>
        
        <div className={`flex-1 h-1.5 mx-4 rounded-full transition-colors ${
          step === 'verify' ? 'bg-green-500' : 'bg-gray-200'
        }`}></div>
        
        <div className={`flex flex-col items-center ${step === 'verify' ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-colors ${
            step === 'verify' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className="text-sm font-semibold text-gray-600 mt-2">Verify & Reset</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <ShieldCheck size={20} className="flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'request' ? (
          <form onSubmit={handleRequestOTP} className="space-y-6 text-center">
            <div className="bg-blue-50 text-blue-800 p-6 rounded-xl border border-blue-100 mb-8">
              <Mail className="mx-auto h-8 w-8 mb-3 text-blue-600" />
              <h2 className="text-xl font-bold mb-2">Email Verification Required</h2>
              <p className="text-sm">
                To protect your account, we need to verify your identity. Click the button below to send a One-Time Password (OTP) to the official email address registered with your university profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Send Secure OTP <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: VERIFY OTP & NEW PASSWORD */
          <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
              <p className="text-gray-500 mt-1">Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{email}</span></p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* OTP Input */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Security Code (OTP)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  placeholder="• • • • • •"
                  className="w-full px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white"
                  required
                />
                <div className="flex justify-between items-center mt-3 px-1 text-sm font-medium">
                  <span className="text-gray-500">Code expires in:</span>
                  <span className={`${timer < 60 ? 'text-red-600' : 'text-orange-600'} flex items-center gap-1`}>
                    <Clock size={14} /> {formatTime(timer)}
                  </span>
                </div>
              </div>

              {/* Password Inputs */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6 || !newPassword}
                className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Reset Password <ShieldCheck size={20} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}