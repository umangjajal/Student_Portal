'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { AlertCircle, Check, TrendingUp, DollarSign, Calendar, Users, QrCode, Clock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionManagement() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectingPlan, setSelectingPlan] = useState(false);
  const [gracePeriodCountdown, setGracePeriodCountdown] = useState({});

  useEffect(() => {
    fetchData();
    // Refresh data every 10 seconds to show live updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch current subscription
      const subRes = await api.get('/subscription/my-subscription');
      setSubscription(subRes.data);

      // Fetch all plans
      const plansRes = await api.get('/subscription/pricing-plans');
      setAllPlans(plansRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (newPlan) => {
    if (newPlan === subscription.subscription.planName) {
      alert('You are already on this plan');
      return;
    }

    try {
      setChanging(true);
      setError('');
      setSuccess('');

      const res = await api.post('/subscription/change-plan', {
        newPlan
      });

      setSuccess(`Successfully changed to ${newPlan} plan!`);
      setSubscription(prev => ({
        ...prev,
        subscription: res.data.subscription
      }));

      setTimeout(() => fetchData(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change plan');
    } finally {
      setChanging(false);
    }
  };

  const generateQRCode = (amount) => {
    // UPI payment QR code format
    const upiId = "universityaccount@axis";
    const payeeName = "Student Portal";
    const transactionRef = `UNIV-${Date.now()}`;
    
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent('University Subscription')}&tr=${transactionRef}`;
    
    // Use Google Charts API to generate QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💳 Subscription & Billing</h1>
        <p className="text-gray-600">Manage your plan and view billing information</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
          <Check size={20} />
          <span>{success}</span>
        </div>
      )}

      {subscription && (
        <>
          {/* Live Counter - Students & Faculty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Students Counter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-600">STUDENTS</p>
                <Users size={24} className="text-blue-600" />
              </div>
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {subscription.currentStudentCount}
              </p>
              <p className="text-xs text-gray-500 animate-pulse">Live count • Updates every 10 seconds</p>
            </div>

            {/* Faculty Counter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-600">FACULTY</p>
                <Users size={24} className="text-green-600" />
              </div>
              <p className="text-5xl font-bold text-green-600 mb-2">
                {subscription.currentFacultyCount}
              </p>
              <p className="text-xs text-gray-500 animate-pulse">Live count • Updates every 10 seconds</p>
            </div>

            {/* Total Users */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold opacity-90">TOTAL USERS</p>
                <Users size={24} />
              </div>
              <p className="text-5xl font-bold mb-2">
                {subscription.totalUsers}
              </p>
              <p className="text-xs opacity-75">Students + Faculty</p>
            </div>
          </div>

          {/* Current Plan & Charges */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Plan Name */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">Current Plan</p>
                <p className="text-3xl font-bold text-blue-600">
                  {subscription.subscription.planName}
                </p>
              </div>

              {/* Price Per User */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">Price Per User</p>
                <p className="text-3xl font-bold text-orange-600">
                  ₹{subscription.pricePerUser}
                </p>
              </div>

              {/* Monthly Charges */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">Monthly Charge</p>
                <p className="text-3xl font-bold text-red-600">
                  ₹{subscription.monthlyCharges.toLocaleString()}
                </p>
              </div>

              {/* Renewal Date */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">Next Renewal</p>
                <p className="text-lg font-bold text-purple-600">
                  {new Date(subscription.subscription.renewalDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Payment Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <DollarSign size={24} />
                <div className="text-left">
                  <p className="text-sm opacity-90">Pay Monthly Subscription</p>
                  <p className="text-2xl">₹{subscription.monthlyCharges.toLocaleString()}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Plan Details */}
          {subscription.planDetails && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Plan Features</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Features */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Core Features</h3>
                  <div className="space-y-2">
                    {subscription.planDetails.features.studentManagement && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Student Management
                      </div>
                    )}
                    {subscription.planDetails.features.attendanceTracking && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Attendance Tracking
                      </div>
                    )}
                    {subscription.planDetails.features.notificationSystem && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Notification System
                      </div>
                    )}
                    {subscription.planDetails.features.feeManagement && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Fee Management
                      </div>
                    )}
                    {subscription.planDetails.features.basicReports && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Basic Reports
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Features */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Advanced Features</h3>
                  <div className="space-y-2">
                    {subscription.planDetails.features.advancedAnalytics ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Advanced Analytics
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span size={20}>✗</span>
                        Advanced Analytics
                      </div>
                    )}
                    {subscription.planDetails.features.customReports ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        Custom Reports
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>✗</span>
                        Custom Reports
                      </div>
                    )}
                    {subscription.planDetails.features.apiAccess ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Check size={20} className="text-green-600" />
                        API Access
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>✗</span>
                        API Access
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Storage Limit</p>
                <p className="text-lg font-bold text-blue-600">
                  {subscription.planDetails.storageGB} GB
                </p>
              </div>
            </div>
          )}

          {/* Available Plans */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔄 Change Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allPlans.map((plan) => {
                const isCurrentPlan = plan.planName === subscription.subscription.planName;

                return (
                  <div
                    key={plan._id}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      isCurrentPlan
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.planName}
                    </h3>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{plan.pricePerStudent}
                      </span>
                      <span className="text-gray-600 ml-2">/user</span>
                    </div>

                    {isCurrentPlan && (
                      <div className="mb-4 p-3 bg-green-200 text-green-800 rounded-lg text-sm font-bold">
                        ✓ Current Plan
                      </div>
                    )}

                    <button
                      onClick={() => handleChangePlan(plan.planName)}
                      disabled={isCurrentPlan || changing}
                      className={`w-full py-2 rounded-lg font-bold transition-all ${
                        isCurrentPlan
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {changing ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                    </button>

                    {plan.description && (
                      <p className="mt-4 text-sm text-gray-600">{plan.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && subscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">💳 Payment Details</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              {/* Summary */}
              <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4">Payment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-bold text-gray-900">{subscription.currentStudentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faculty:</span>
                    <span className="font-bold text-gray-900">{subscription.currentFacultyCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-bold text-gray-900">{subscription.totalUsers}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-3 mt-3 flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Rate per User:</span>
                    <span className="font-bold text-green-600">₹{subscription.pricePerUser}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-green-600 mt-2">
                    <span>Total Amount:</span>
                    <span>₹{subscription.monthlyCharges.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-6">
                {/* UPI Payment */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">📱 UPI Payment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* UPI Details */}
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-3 font-bold">UPI ID</p>
                      <div className="bg-white p-3 rounded-lg border border-blue-300 mb-3 flex justify-between items-center">
                        <code className="text-sm font-mono font-bold">universityaccount@axis</code>
                        <button
                          onClick={() => navigator.clipboard.writeText('universityaccount@axis')}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 font-bold">Bank Details</p>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Bank:</span> <span className="font-bold">Axis Bank</span></p>
                        <p><span className="text-gray-600">Account:</span> <span className="font-bold">123456789</span></p>
                        <p><span className="text-gray-600">IFSC:</span> <span className="font-bold">UTIB0002</span></p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-lg p-6 border-2 border-green-300 flex flex-col items-center">
                      <p className="text-sm text-gray-600 mb-4 font-bold">Scan & Pay</p>
                      <img
                        src={generateQRCode(subscription.monthlyCharges)}
                        alt="UPI QR Code"
                        className="w-48 h-48 rounded-lg border border-gray-200"
                      />
                      <p className="mt-4 text-xs text-gray-600 text-center">
                        Amount: ₹{subscription.monthlyCharges.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">📋 Instructions</h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Scan the QR code with any UPI app or use the UPI ID</li>
                    <li>Enter the amount ₹{subscription.monthlyCharges.toLocaleString()}</li>
                    <li>Complete the payment using your bank credentials</li>
                    <li>Payment confirmation will be updated within 24 hours</li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => {
                    const upiId = "universityaccount@axis";
                    const upiString = `upi://pay?pa=${upiId}&pn=StudentPortal&am=${subscription.monthlyCharges}&tn=UniversitySubscription`;
                    window.location.href = upiString;
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Open in UPI App
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
