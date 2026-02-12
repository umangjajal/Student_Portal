'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, TrendingDown, Users, ActivitySquare, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState([]);

  // Detailed analytics data
  const attendanceData = [
    { date: '01/01', percentage: 85, target: 90 },
    { date: '01/02', percentage: 88, target: 90 },
    { date: '01/03', percentage: 82, target: 90 },
    { date: '01/04', percentage: 91, target: 90 },
    { date: '01/05', percentage: 89, target: 90 },
    { date: '01/06', percentage: 93, target: 90 },
    { date: '01/07', percentage: 86, target: 90 },
  ];

  const engagementData = [
    { week: 'Week 1', forum: 120, assignments: 200, exams: 45, notifications: 320 },
    { week: 'Week 2', forum: 145, assignments: 220, exams: 60, notifications: 380 },
    { week: 'Week 3', forum: 165, assignments: 240, exams: 55, notifications: 420 },
    { week: 'Week 4', forum: 190, assignments: 260, exams: 75, notifications: 450 },
  ];

  const performanceData = [
    { name: 'Page Load', time: 1.2, target: 2 },
    { name: 'API Response', time: 0.8, target: 1.5 },
    { name: 'Database Query', time: 0.5, target: 1 },
    { name: 'Cache Hit', time: 0.2, target: 0.5 },
  ];

  const userDistribution = [
    { name: 'Active Users', value: 65, color: '#10b981' },
    { name: 'Inactive Users', value: 20, color: '#f59e0b' },
    { name: 'Dormant Users', value: 15, color: '#ef4444' },
  ];

  const retentionData = [
    { month: 'Jan', retention: 92 },
    { month: 'Feb', retention: 88 },
    { month: 'Mar', retention: 90 },
    { month: 'Apr', retention: 93 },
    { month: 'May', retention: 95 },
    { month: 'Jun', retention: 94 },
  ];

  useEffect(() => {
    setAnalytics([
      { label: 'Attendance Updates', count: 1200, icon: Users, trend: '+15%', color: 'bg-blue-100 text-blue-700' },
      { label: 'Exams Published', count: 85, icon: ActivitySquare, trend: '+8%', color: 'bg-purple-100 text-purple-700' },
      { label: 'Notifications Sent', count: 4300, icon: AlertCircle, trend: '+23%', color: 'bg-green-100 text-green-700' },
      { label: 'Logins Today', count: 980, icon: CheckCircle, trend: '+12%', color: 'bg-orange-100 text-orange-700' },
    ]);
  }, []);

  const StatCard = ({ label, count, icon: Icon, trend, color }) => (
    <div className={`${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{count}</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        </div>
        <Icon className="w-8 h-8 opacity-30" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into platform performance and user behavior</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analytics.map((item, index) => (
            <StatCard
              key={index}
              label={item.label}
              count={item.count}
              icon={item.icon}
              trend={item.trend}
              color={item.color}
            />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Trends */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Attendance Trends</h2>
            <p className="text-sm text-gray-500 mb-6">Weekly average vs target</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" style={{ opacity: 0.1 }} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="percentage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAttendance)" name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">User Engagement</h2>
            <p className="text-sm text-gray-500 mb-6">Weekly activity breakdown</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" style={{ opacity: 0.1 }} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="forum" fill="#8b5cf6" name="Forum Posts" />
                <Bar dataKey="assignments" fill="#3b82f6" name="Assignments" />
                <Bar dataKey="exams" fill="#f59e0b" name="Exams" />
                <Bar dataKey="notifications" fill="#10b981" name="Notifications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">User Status Distribution</h2>
            <p className="text-sm text-gray-500 mb-6">Current user base breakdown</p>
            <div className="flex gap-8">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center">
                {userDistribution.map((item, idx) => (
                  <div key={idx} className="py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-700 font-medium">{item.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{item.value}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Retention Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">User Retention Rate</h2>
            <p className="text-sm text-gray-500 mb-6">Monthly retention trend</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" style={{ opacity: 0.1 }} />
                <XAxis dataKey="month" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} name="Retention %" dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceData.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-medium">{item.name}</p>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-blue-600">{item.time}s</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: `${(item.time / item.target) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Target: {item.target}s</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">📈 Growth Trend</h3>
            <p className="text-sm text-blue-800">User base increased by 23% this month with strong engagement metrics across all departments.</p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-2">✅ Performance Status</h3>
            <p className="text-sm text-green-800">All system metrics are within optimal ranges. API response time averaging 0.8s with 99.9% uptime.</p>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 mb-2">⚠️ Recommendation</h3>
            <p className="text-sm text-orange-800">Consider scaling database resources for Q3 to accommodate projected 40% user growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
