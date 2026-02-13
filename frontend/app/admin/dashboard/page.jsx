'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, University, BookOpen, TrendingUp, Activity, Award } from 'lucide-react';
import api from '@/services/api';

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUniversities: 0,
    activeStudents: 0,
    activeFaculty: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Static Data for Charts (Frontend Visualization) ---
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
      
      // Attempt to fetch real data
      const univResponse = await api.get('/admin/universities');
      
      // Update state with real data if available, or fallbacks
      setStats({
        totalUniversities: univResponse.data?.data?.length || 12,
        activeStudents: 5420, // Replace with real API call when available
        activeFaculty: 1280,  // Replace with real API call when available
        totalAdmins: 48
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      
      // Check for 401 Unauthorized (Token expired while on page)
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      setError('Failed to load dashboard data');
      
      // Fallback data so dashboard doesn't crash on visual error
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
    <div className={`${bgColor} rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {loading ? (
             <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-2"></div>
          ) : (
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-lg shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and analytics.</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={University}
          title="Total Universities"
          value={stats.totalUniversities}
          subtitle="Active institutions"
          color="bg-blue-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={Users}
          title="Active Students"
          value={stats.activeStudents.toLocaleString()}
          subtitle="+12% from last month"
          color="bg-green-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={BookOpen}
          title="Faculty Members"
          value={stats.activeFaculty}
          subtitle="Across all universities"
          color="bg-purple-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={Award}
          title="System Admins"
          value={stats.totalAdmins}
          subtitle="Managing the platform"
          color="bg-orange-600"
          bgColor="bg-white"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
              <p className="text-sm text-gray-500">Monthly user statistics</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Students" />
                <Line type="monotone" dataKey="faculty" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Faculty" />
                <Line type="monotone" dataKey="admins" stroke="#ec4899" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Admins" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* University Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">University Types</h2>
            <p className="text-sm text-gray-500">Distribution breakdown</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={universityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
          </div>
          <div className="mt-4 space-y-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Department Analysis</h2>
            <p className="text-sm text-gray-500">Students vs Faculty distribution</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
                <Bar dataKey="faculty" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Platform Activity</h2>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="logins" fill="#10b981" radius={[4, 4, 0, 0]} name="Logins" />
                <Bar dataKey="activities" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;