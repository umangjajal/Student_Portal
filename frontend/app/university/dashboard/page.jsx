'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, ClipboardCheck, Bell, RefreshCw, Plus, TrendingUp, Clock, AlertCircle, Menu, X, CreditCard, BarChart3, FileText, Settings, LogOut, Home } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext'; // ✅ Secure logout context

export default function UniversityDashboard() {
  const router = useRouter();
  const { logout } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    // ✅ Check authentication using localStorage
    const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token'); 
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

  function StatCard({ icon: Icon, title, value, subtitle, gradientFrom, gradientTo, link }) {
    return (
      <Link href={link || '#'}>
        <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105 cursor-pointer group border border-white/10`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-sm font-medium">{title}</p>
              <h3 className="text-4xl font-bold text-white mt-2 group-hover:text-gray-100 transition">{value}</h3>
              {subtitle && <p className="text-xs text-white/60 mt-2">{subtitle}</p>}
            </div>
            <div className="p-3 bg-white/20 backdrop-blur rounded-lg group-hover:bg-white/30 transition">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (loading && !recentNotifications.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold text-white">Portal</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg text-gray-300">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/university/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold group hover:shadow-lg transition">
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link href="/university/students" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <Users size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Students</span>}
          </Link>

          <Link href="/university/faculty" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <BookOpen size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Faculty</span>}
          </Link>

          <Link href="/university/attendance" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <ClipboardCheck size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Attendance</span>}
          </Link>

          <Link href="/university/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <BarChart3 size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Analytics</span>}
          </Link>

          <Link href="/university/notices" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <Bell size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Notices</span>}
          </Link>

          <div className="border-t border-slate-700 my-4"></div>

          <Link href="/university/subscription" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg transition group">
            <CreditCard size={20} />
            {sidebarOpen && <span>Subscription</span>}
          </Link>

          <Link href="/university/invoices" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <FileText size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Invoices</span>}
          </Link>

          <Link href="/university/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 transition group">
            <Settings size={20} />
            {sidebarOpen && <span className="group-hover:text-white">Settings</span>}
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {/* Top Bar */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-2">Welcome back! Here's your university overview</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition font-semibold ${refreshing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur">
              <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-200">{error}</p>
                <button onClick={handleRefresh} className="text-red-300 hover:text-red-200 text-sm mt-2 underline">
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
              subtitle="Active enrolled"
              gradientFrom="from-blue-600"
              gradientTo="to-cyan-600"
              link="/university/students"
            />
            <StatCard
              icon={BookOpen}
              title="Faculty Members"
              value={stats.totalFaculty}
              subtitle="Teaching staff"
              gradientFrom="from-purple-600"
              gradientTo="to-pink-600"
              link="/university/faculty"
            />
            <StatCard
              icon={Bell}
              title="Active Updates"
              value={stats.activeNotifications}
              subtitle="Live notifications"
              gradientFrom="from-green-600"
              gradientTo="to-emerald-600"
              link="/university/notices"
            />
            <StatCard
              icon={ClipboardCheck}
              title="Departments"
              value="5"
              subtitle="Active departments"
              gradientFrom="from-orange-600"
              gradientTo="to-red-600"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Updates */}
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Updates</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
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
                      className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-600/20 to-transparent p-4 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-white">{notif.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              notif.priority === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                              notif.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {notif.priority}
                            </span>
                          </div>
                          <p className="text-gray-300">{notif.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                            <span className="bg-slate-700 px-2 py-1 rounded">{notif.roleTarget}</span>
                          </div>
                        </div>
                        {notif.isActive && (
                          <div className="flex items-center gap-1 text-green-400 text-xs font-semibold ml-4">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-gray-400">No updates yet. Create one to get started!</p>
                </div>
              )}

              <Link href="/university/notices" className="block mt-4 text-blue-400 hover:text-blue-300 font-semibold text-center py-2 transition">
                View All Updates →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/university/students" className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl hover:shadow-lg transition font-semibold group">
                  <div className="flex items-center gap-2 group-hover:translate-x-1 transition">
                    <Users size={20} />
                    <span>Manage Students</span>
                  </div>
                </Link>
                <Link href="/university/faculty" className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition font-semibold group">
                  <div className="flex items-center gap-2 group-hover:translate-x-1 transition">
                    <BookOpen size={20} />
                    <span>Manage Faculty</span>
                  </div>
                </Link>
                <Link href="/university/subscription" className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 rounded-xl hover:shadow-lg transition font-semibold group border-2 border-amber-500/50">
                  <div className="flex items-center gap-2 group-hover:translate-x-1 transition">
                    <CreditCard size={20} />
                    <span>View Subscription</span>
                  </div>
                </Link>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition font-semibold group"
                >
                  <div className="flex items-center gap-2 justify-center group-hover:translate-x-1 transition">
                    <Plus size={20} />
                    <span>Create Update</span>
                  </div>
                </button>
              </div>

              {/* System Status */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="font-semibold text-white mb-3">System Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Status</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Sync</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Real-time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Students */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Students</h2>
              <Link href="/university/students" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                View All →
              </Link>
            </div>

            {recentStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Enrollment No</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Department</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Year</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student) => (
                      <tr key={student._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 text-sm font-mono text-blue-400">{student.enrollmentNo}</td>
                        <td className="py-3 px-4 text-sm font-medium text-white">{student.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{student.department}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{student.year || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No students enrolled yet</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Update</h2>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="Update title"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Update message"
                  rows="4"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm({ ...notificationForm, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Target</label>
                  <select
                    value={notificationForm.roleTarget}
                    onChange={(e) => setNotificationForm({ ...notificationForm, roleTarget: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
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