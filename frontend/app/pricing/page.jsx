'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Check, Star, Zap, Crown, Gift } from 'lucide-react';

export default function PricingPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscription/pricing-plans');
      setPlans(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch(planName) {
      case 'FREE_TRIAL':
        return <Gift size={32} className="text-green-500" />;
      case 'BASIC':
        return <Zap size={32} className="text-yellow-500" />;
      case 'ADVANCED':
        return <Star size={32} className="text-blue-500" />;
      case 'PREMIUM':
        return <Crown size={32} className="text-purple-500" />;
      default:
        return <Zap size={32} />;
    }
  };

  const handleClaimFreeTrial = async () => {
    try {
      setClaiming(true);
      const res = await api.post('/subscription/claim-free-trial');
      alert('🎉 Free trial claimed! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/university/dashboard');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim free trial');
    } finally {
      setClaiming(false);
    }
  };

  const handleSelectPlan = async (planName) => {
    try {
      const res = await api.post('/subscription/select-plan', { planName });
      alert('Confirmation email sent! Check your email for the acceptance link.');
      router.push('/university/subscription');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to select plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple & Transparent Pricing
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Choose the perfect plan for your institution. Start with Basic and upgrade anytime as your needs grow.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {plans.length === 0 ? (
          <div className="col-span-full text-center text-slate-400">
            <p className="text-lg">No plans available</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.planName === 'FREE_TRIAL'
                  ? 'md:col-span-2 lg:col-span-1 ring-2 ring-green-500 shadow-2xl shadow-green-500/20 order-first'
                  : plan.badge
                  ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/20'
                  : ''
              }`}
              style={{
                backgroundColor: `${plan.color}15`,
                borderColor: plan.color,
                borderWidth: '2px'
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute top-0 right-0 px-4 py-1 text-white text-sm font-bold"
                  style={{ backgroundColor: plan.color }}
                >
                  {plan.badge}
                </div>
              )}

              {plan.planName === 'FREE_TRIAL' && (
                <div className="absolute top-0 right-0 px-4 py-1 text-white text-sm font-bold bg-green-600">
                  🎁 FREE
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className="mb-6">
                  {getPlanIcon(plan.planName)}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.planName === 'FREE_TRIAL' ? 'Free Trial' : plan.planName}
                </h3>

                {/* Description */}
                {plan.planName === 'FREE_TRIAL' ? (
                  <p className="text-slate-300 text-sm mb-6 font-semibold">
                    30 Days + 100 Free Students
                  </p>
                ) : plan.description ? (
                  <p className="text-slate-400 text-sm mb-6">
                    {plan.description}
                  </p>
                ) : null}

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.planName === 'FREE_TRIAL' ? '₹0' : `₹${plan.pricePerStudent}`}
                    </span>
                    <span className="text-slate-400">
                      {plan.planName === 'FREE_TRIAL' ? '/ free' : '/student/month'}
                    </span>
                  </div>
                  {plan.planName === 'FREE_TRIAL' && (
                    <p className="text-slate-400 text-sm mt-2">
                      30-day full access • No credit card required
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                {plan.planName === 'FREE_TRIAL' ? (
                  <button
                    onClick={handleClaimFreeTrial}
                    disabled={claiming}
                    className="w-full py-3 rounded-lg font-bold mb-8 bg-green-600 hover:bg-green-700 text-white transition-all duration-300 disabled:opacity-50"
                  >
                    {claiming ? 'Claiming...' : '🎉 Claim Free Trial'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.planName)}
                    className={`w-full py-3 rounded-lg font-bold mb-8 transition-all duration-300 ${
                      plan.badge
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : `text-white hover:opacity-80`
                    }`}
                    style={
                      !plan.badge
                        ? {
                            backgroundColor: plan.color,
                            opacity: 0.8
                          }
                        : {}
                    }
                  >
                    Get Started
                  </button>
                )}

                {/* Features List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Included Features
                  </h4>

                  {/* Core Features */}
                  {plan.features.studentManagement && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Student Management</span>
                    </div>
                  )}

                  {plan.features.attendanceTracking && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Attendance Tracking</span>
                    </div>
                  )}

                  {plan.features.notificationSystem && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Notification System</span>
                    </div>
                  )}

                  {plan.features.feeManagement && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Fee Management</span>
                    </div>
                  )}

                  {plan.features.basicReports && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Basic Reports</span>
                    </div>
                  )}

                  {/* Advanced Features */}
                  {plan.features.advancedAnalytics && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Advanced Analytics</span>
                    </div>
                  )}

                  {plan.features.customReports && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Custom Reports</span>
                    </div>
                  )}

                  {plan.features.bulkUpload && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Bulk Upload (CSV)</span>
                    </div>
                  )}

                  {plan.features.apiAccess && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">API Access</span>
                    </div>
                  )}

                  {plan.features.prioritySupport && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Priority Support</span>
                    </div>
                  )}

                  {/* Premium Features */}
                  {plan.features.aiInsights && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">AI Insights</span>
                    </div>
                  )}

                  {plan.features.advancedFeeTracking && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Advanced Fee Tracking</span>
                    </div>
                  )}

                  {plan.features.dedicatedAccountManager && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">Dedicated Account Manager</span>
                    </div>
                  )}

                  {plan.features.sso && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">SSO (Single Sign-On)</span>
                    </div>
                  )}

                  {plan.features.whiteLabel && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Check size={20} style={{ color: plan.color }} className="flex-shrink-0" />
                      <span className="text-sm">White Label Solution</span>
                    </div>
                  )}
                </div>

                {/* Storage */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    💾 {plan.storageGB} GB Storage
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-slate-400">
              Yes! You can upgrade or downgrade your plan instantly. Changes take effect immediately.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">
              How is billing calculated?
            </h3>
            <p className="text-slate-400">
              You pay per active student enrolled in your system. Monthly, quarterly, or annual billing options available.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">
              Is there a setup fee?
            </h3>
            <p className="text-slate-400">
              No setup fees or hidden charges. You only pay for the students in your system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
