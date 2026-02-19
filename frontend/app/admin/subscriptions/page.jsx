'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { AlertCircle, Check, Edit2, Trash2, Plus } from 'lucide-react';

export default function AdminSubscriptions() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    pricePerStudent: '',
    description: ''
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/subscription/admin/all-subscriptions');
      setSubscriptions(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!formData.planName || !formData.pricePerStudent) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await api.post('/subscription/admin/pricing-plan', {
        planName: formData.planName,
        pricePerStudent: parseFloat(formData.pricePerStudent),
        description: formData.description
      });

      setSuccess('Pricing plan created successfully!');
      setFormData({ planName: '', pricePerStudent: '', description: '' });
      setShowAddPlan(false);
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleUpdateSubscription = async (subscriptionId, updates) => {
    try {
      setError('');
      setSuccess('');
      const res = await api.put(`/subscription/admin/subscription/${subscriptionId}`, updates);

      setSuccess('Subscription updated successfully!');
      fetchSubscriptions();
      setSelectedSub(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.monthlyCharges || 0), 0);
  const totalUniversities = subscriptions.length;
  const totalStudents = subscriptions.reduce((sum, sub) => sum + (sub.currentStudentCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏢 Subscription Management</h1>
        <p className="text-gray-600">Manage all university subscriptions and pricing plans</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Total Universities</p>
          <p className="text-4xl font-bold text-blue-600">{totalUniversities}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Total Students</p>
          <p className="text-4xl font-bold text-green-600">{totalStudents.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Monthly Revenue</p>
          <p className="text-4xl font-bold text-orange-600">₹{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Active Subscriptions</p>
          <p className="text-4xl font-bold">
            {subscriptions.filter(s => s.subscription.status === 'ACTIVE').length}
          </p>
        </div>
      </div>

      {/* Add Plan Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddPlan(!showAddPlan)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add New Pricing Plan
        </button>
      </div>

      {/* Add Plan Form */}
      {showAddPlan && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Pricing Plan</h3>
          <form onSubmit={handleAddPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Plan Name (e.g., BASIC, ADVANCED, PREMIUM)"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-600"
              />
              <input
                type="number"
                placeholder="Price Per Student (₹)"
                value={formData.pricePerStudent}
                onChange={(e) => setFormData({ ...formData, pricePerStudent: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-600"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                Create Plan
              </button>
              <button
                type="button"
                onClick={() => setShowAddPlan(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All University Subscriptions</h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 text-lg">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-bold text-gray-900">
                    Students
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    Monthly Charge
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Renewal Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {sub.universityName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-xs">
                        {sub.subscription.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-gray-900">
                      {sub.currentStudentCount}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      ₹{sub.monthlyCharges.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          sub.subscription.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {sub.subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sub.subscription.renewalDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Subscription</h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">University</p>
                <p className="font-bold text-gray-900">{selectedSub.universityName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Current Plan</p>
                <p className="font-bold text-gray-900">{selectedSub.subscription.planName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <select
                  defaultValue={selectedSub.subscription.status}
                  onChange={(e) =>
                    handleUpdateSubscription(selectedSub._id, { status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-600"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Monthly Charge</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{selectedSub.monthlyCharges.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 rounded-lg transition-all"
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
