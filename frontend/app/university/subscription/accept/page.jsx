'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

export default function AcceptSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const acceptSubscription = async () => {
      try {
        if (!token) {
          setError('No acceptance token provided. Please use the link from your email.');
          setLoading(false);
          return;
        }

        // Call accept endpoint
        const response = await api.post('/subscription/accept', { token });
        
        setSuccess(true);
        setSubscription(response.data.subscription);
        
        // Redirect to grace period dashboard after 5 seconds
        setTimeout(() => {
          router.push('/university/subscription/grace-period');
        }, 5000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to accept subscription. The link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      acceptSubscription();
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {loading && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <Loader className="w-12 h-12 text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Processing Your Subscription</h1>
            <p className="text-gray-400">Verifying your acceptance token...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-slate-800/50 backdrop-blur border border-red-500/30 rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">Acceptance Failed</h1>
                <p className="text-red-300 mb-6">{error}</p>
                
                <div className="flex gap-3">
                  <Link href="/university/subscription" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                    Go to Subscription Page
                  </Link>
                  <Link href="/university/dashboard" className="px-6 py-2 border border-slate-600 text-gray-300 hover:bg-slate-700 rounded-lg font-semibold transition">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && !loading && (
          <div className="space-y-6">
            {/* Success Card */}
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur border border-green-500/30 rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">Subscription Accepted!</h1>
                  <p className="text-gray-300 mb-4">
                    Your <span className="font-bold text-green-400">{subscription?.planName}</span> plan has been successfully activated.
                  </p>
                  <p className="text-sm text-gray-400">A confirmation email has been sent to your registered email address.</p>
                </div>
              </div>
            </div>

            {/* Grace Period Info */}
            <div className="bg-slate-800/50 backdrop-blur border border-amber-500/30 rounded-2xl shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <Clock className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">⏳ 5-Day Grace Period Started</h2>
                  <p className="text-gray-400 mb-4">You now have 5 days to:</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl font-bold text-blue-400 mb-1">1</div>
                  <p className="font-semibold text-white mb-1">Add Students & Faculty</p>
                  <p className="text-sm text-gray-400">Upload all your students and faculty members</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl font-bold text-green-400 mb-1">2</div>
                  <p className="font-semibold text-white mb-1">View Live Charges</p>
                  <p className="text-sm text-gray-400">See automatic calculation of your bill amount</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl font-bold text-purple-400 mb-1">3</div>
                  <p className="font-semibold text-white mb-1">Make Payment</p>
                  <p className="text-sm text-gray-400">Complete payment for all enrolled users</p>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 font-semibold">
                  ⚠️ <strong>Important:</strong> If you don't complete all three steps within 5 days, your subscription will be marked as overdue.
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-white mb-4">Next Steps</h2>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-semibold flex-shrink-0">1</span>
                  <span>Go to your <Link href="/university/dashboard" className="text-blue-400 hover:text-blue-300 underline">dashboard</Link> to manage your university</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-semibold flex-shrink-0">2</span>
                  <span>Navigate to Students & Faculty sections to add all enrolled members</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-semibold flex-shrink-0">3</span>
                  <span>Return to your subscription page to view charges and complete payment</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-semibold flex-shrink-0">4</span>
                  <span>Complete payment before the grace period ends</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link href="/university/subscription/grace-period" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition font-semibold text-center">
                Go to Grace Period Dashboard
              </Link>
              <Link href="/university/dashboard" className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-center">
                Go to Dashboard
              </Link>
            </div>

            {/* Auto-redirect notice */}
            <p className="text-center text-sm text-gray-400">
              Redirecting to grace period dashboard in 5 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
