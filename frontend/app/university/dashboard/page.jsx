'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, ClipboardCheck, Bell, RefreshCw, Plus, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext'; // ✅ Secure logout context

export default function UniversityDashboard() {
  const router = useRouter();
  const { logout } = useAuth(); 

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeNotifications: 0,
    totalCourses: 0
  });

  const [recentNotifications, setRecentNotifications] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM',
    roleTarget: 'ALL'
  });

  useEffect(() => {
    // ✅ Check authentication using sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify token exists
      const token = sessionStorage.getItem('token'); 
      if (!token) {
        setError('No authentication token found. Please login again.');
        router.push('/auth/login');
        return;
      }

      // ✅ Fetch aggregated dashboard stats 
      const dashboardRes = await api.get('/university/dashboard-stats').catch(err => {
        const status = err.response?.status;
        const data = err.response?.data;
        console.error('Dashboard API Error - Status:', status, 'Data:', data);
        
        if (status === 401) {
          // Token invalid or expired
          logout(); 
          router.push('/auth/login');
          throw new Error('Authentication token invalid. Please login again.');
        }
        throw new Error(`Dashboard: ${status} - ${data?.message || err.message}`);
      });

      const dashboardData = dashboardRes.data?.data || {};
      
      setStats({
        totalStudents: dashboardData.totalStudents || 0,
        totalFaculty: dashboardData.totalFaculty || 0,
        activeNotifications: dashboardData.activeNotifications || 0,
        totalCourses: dashboardData.totalCourses || 0
      });

      // Safely set arrays to prevent .map() crashes
      setRecentNotifications(Array.isArray(dashboardData.recentNotifications) ? dashboardData.recentNotifications : []);

      // Fetch recent students for the table
      try {
        const studentsRes = await api.get('/university/students').catch(err => {
          console.warn('Students fetch warning:', err.response?.status);
          return { data: [] };
        });
        
        // Backend returns the array directly in res.data
        const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        setRecentStudents(studentsList.slice(0, 5));
      } catch (err) {
        console.warn('Optional students data failed:', err);
        setRecentStudents([]);
      }
    } catch (err) {
      console.error('Dashboard Data Error:', err);
      setError(err.message || 'Failed to load dashboard data. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      // ✅ Correct backend endpoint
      await api.post('/university/notifications', notificationForm);
      setShowCreateModal(false);
      setNotificationForm({ title: '', message: '', priority: 'MEDIUM', roleTarget: 'ALL' });
      await fetchDashboardData();
    } catch (err) {
      alert('Failed to create notification: ' + (err.response?.data?.message || err.message));
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor, link }) => (
    <Link href={link || '#'}>
      <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <h3 className="text-4xl font-bold text-gray-900 mt-2">{value}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading && !recentNotifications.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">University Dashboard</h1>
              <p className="text-gray-600 mt-2">Real-time management and analytics</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${refreshing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              <button onClick={handleRefresh} className="text-red-600 hover:text-red-800 text-sm mt-2 underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.totalStudents}
            subtitle="Active enrolled students"
            color="bg-blue-600"
            bgColor="bg-blue-50"
            link="/university/students"
          />
          <StatCard
            icon={BookOpen}
            title="Faculty Members"
            value={stats.totalFaculty}
            subtitle="Teaching staff"
            color="bg-purple-600"
            bgColor="bg-purple-50"
            link="/university/faculty"
          />
          <StatCard
            icon={Bell}
            title="Active Updates"
            value={stats.activeNotifications}
            subtitle="Live notifications"
            color="bg-green-600"
            bgColor="bg-green-50"
            link="/university/notices"
          />
          <StatCard
            icon={ClipboardCheck}
            title="Departments"
            value="5"
            subtitle="Active departments"
            color="bg-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Updates / Notifications */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Updates</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                New Update
              </button>
            </div>

            {recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{notif.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            notif.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            notif.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {notif.priority}
                          </span>
                        </div>
                        <p className="text-gray-700">{notif.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">{notif.roleTarget}</span>
                        </div>
                      </div>
                      {notif.isActive && (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold ml-4">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No updates yet. Create one to get started!</p>
              </div>
            )}

            <Link href="/university/notices" className="block mt-4 text-blue-600 hover:text-blue-800 font-semibold text-center py-2">
              View All Updates →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/university/students" className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:shadow-lg transition">
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span className="font-semibold">Manage Students</span>
                </div>
              </Link>
              <Link href="/university/faculty" className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:shadow-lg transition">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} />
                  <span className="font-semibold">Manage Faculty</span>
                </div>
              </Link>
              <Link href="/university/profile" className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:shadow-lg transition">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  <span className="font-semibold">Edit Profile</span>
                </div>
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 justify-center">
                  <Plus size={20} />
                  <span className="font-semibold">Create Update</span>
                </div>
              </button>
            </div>

            {/* System Status */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">System Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Status</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Operational
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Sync</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Real-time
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Students</h2>
            <Link href="/university/students" className="text-blue-600 hover:text-blue-800 font-semibold">
              View All →
            </Link>
          </div>

          {recentStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Enrollment No</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Year</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm font-mono text-blue-600">{student.enrollmentNo}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{student.department}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{student.year || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No students enrolled yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Update</h2>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="Update title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Update message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm({ ...notificationForm, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target</label>
                  <select
                    value={notificationForm.roleTarget}
                    onChange={(e) => setNotificationForm({ ...notificationForm, roleTarget: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ALL">All</option>
                    <option value="STUDENT">Students</option>
                    <option value="FACULTY">Faculty</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}