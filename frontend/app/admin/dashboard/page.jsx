'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, University, BookOpen, TrendingUp, Activity, Award } from 'lucide-react';
import api from '@/services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUniversities: 0,
    activeStudents: 0,
    activeFaculty: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample Data for Charts
  const userGrowthData = [
    { month: 'Jan', students: 400, faculty: 240, admins: 24 },
    { month: 'Feb', students: 520, faculty: 290, admins: 29 },
    { month: 'Mar', students: 650, faculty: 320, admins: 32 },
    { month: 'Apr', students: 780, faculty: 400, admins: 38 },
    { month: 'May', students: 920, faculty: 450, admins: 42 },
    { month: 'Jun', students: 1100, faculty: 520, admins: 48 },
  ];

  const universityDistribution = [
    { name: 'Public', value: 65, color: '#3b82f6' },
    { name: 'Private', value: 25, color: '#8b5cf6' },
    { name: 'Government', value: 10, color: '#ec4899' },
  ];

  const departmentData = [
    { name: 'Engineering', students: 450, faculty: 85 },
    { name: 'Science', students: 380, faculty: 72 },
    { name: 'Commerce', students: 320, faculty: 60 },
    { name: 'Arts', students: 290, faculty: 55 },
    { name: 'Medicine', students: 150, faculty: 45 },
  ];

  const activityData = [
    { date: '01', logins: 250, activities: 180 },
    { date: '02', logins: 280, activities: 200 },
    { date: '03', logins: 320, activities: 240 },
    { date: '04', logins: 290, activities: 210 },
    { date: '05', logins: 350, activities: 260 },
    { date: '06', logins: 380, activities: 290 },
    { date: '07', logins: 420, activities: 320 },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch universities
      const univResponse = await api.get('/admin/universities');
      
      // Mock data for now - in production, these would come from actual API
      setStats({
        totalUniversities: univResponse.data?.data?.length || 12,
        activeStudents: 5420,
        activeFaculty: 1280,
        totalAdmins: 48
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard data');
      // Set mock data on error
      setStats({
        totalUniversities: 12,
        activeStudents: 5420,
        activeFaculty: 1280,
        totalAdmins: 48
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your system overview.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={University}
            title="Total Universities"
            value={stats.totalUniversities}
            subtitle="Active institutions"
            color="bg-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={Users}
            title="Active Students"
            value={stats.activeStudents.toLocaleString()}
            subtitle="+12% from last month"
            color="bg-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={BookOpen}
            title="Faculty Members"
            value={stats.activeFaculty}
            subtitle="Across all universities"
            color="bg-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={Award}
            title="System Admins"
            value={stats.totalAdmins}
            subtitle="Managing the platform"
            color="bg-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Growth */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
                <p className="text-sm text-gray-500">Monthly user statistics</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" style={{ opacity: 0.1 }} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Students" />
                <Line type="monotone" dataKey="faculty" stroke="#8b5cf6" strokeWidth={2} name="Faculty" />
                <Line type="monotone" dataKey="admins" stroke="#ec4899" strokeWidth={2} name="Admins" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* University Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">University Types</h2>
                <p className="text-sm text-gray-500">Distribution breakdown</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={universityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {universityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {universityDistribution.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                    <span className="text-gray-600">{type.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{type.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Analysis */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Department Analysis</h2>
                <p className="text-sm text-gray-500">Students vs Faculty distribution</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" style={{ opacity: 0.1 }} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Students" />
                <Bar dataKey="faculty" fill="#8b5cf6" name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Platform Activity</h2>
                <p className="text-sm text-gray-500">Last 7 days</p>
              </div>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" style={{ opacity: 0.1 }} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#10b981" name="Logins" />
                <Bar dataKey="activities" fill="#f59e0b" name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/admin/universities" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition">
            <University className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-bold">Manage Universities</h3>
            <p className="text-blue-100 text-sm">Control and monitor institutions</p>
          </a>

          <a href="/admin/analytics" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition">
            <TrendingUp className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-bold">Analytics</h3>
            <p className="text-purple-100 text-sm">Deep dive into platform metrics</p>
          </a>

          <a href="/admin/universities" className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition">
            <Award className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-bold">System Status</h3>
            <p className="text-green-100 text-sm">All systems operational</p>
          </a>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="py-4">
              <p className="text-3xl font-bold text-blue-600">{stats.totalUniversities}</p>
              <p className="text-gray-600 text-sm mt-1">Universities</p>
            </div>
            <div className="py-4">
              <p className="text-3xl font-bold text-green-600">{(stats.activeStudents / 1000).toFixed(1)}K</p>
              <p className="text-gray-600 text-sm mt-1">Students</p>
            </div>
            <div className="py-4">
              <p className="text-3xl font-bold text-purple-600">{stats.activeFaculty}</p>
              <p className="text-gray-600 text-sm mt-1">Faculty</p>
            </div>
            <div className="py-4">
              <p className="text-3xl font-bold text-orange-600">99.9%</p>
              <p className="text-gray-600 text-sm mt-1">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
