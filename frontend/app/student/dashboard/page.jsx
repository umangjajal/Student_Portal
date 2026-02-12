'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, FileText, IndianRupee } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import api from '@/services/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    attendance: 0,
    exams: 0,
    feesDue: 0
  });
  
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/student/attendance', label: 'Attendance', icon: '📋' },
    { href: '/student/fees', label: 'Fees', icon: '💳' },
    { href: '/student/documents', label: 'Documents', icon: '📄' },
    { href: '/student/exams', label: 'Exams', icon: '📝' },
    { href: '/student/updates', label: 'Updates', icon: '📢' },
    { href: '/student/profile', label: 'Profile', icon: '👤' },
  ];

  useEffect(() => {
    // Check if user is logged in
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
      
      // Fetch stats (TODO: integrate with real API)
      setStats({
        attendance: 92,
        exams: 4,
        feesDue: 15000
      });

      // Fetch university updates
      const response = await api.get('/student/updates');
      setUpdates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load updates');
      setUpdates([]); // Set empty updates on error
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Attendance %', value: `${stats.attendance}%`, icon: CalendarCheck, color: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Upcoming Exams', value: stats.exams, icon: FileText, color: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Fees Due (₹)', value: stats.feesDue, icon: IndianRupee, color: 'bg-green-50', textColor: 'text-green-600' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar userRole="STUDENT" />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" menuItems={menuItems} />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Student Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {cards.map((card, idx) => (
                <div
                  key={idx}
                  className={`${card.color} rounded-xl shadow-lg p-6 flex justify-between items-center hover:shadow-xl transition`}
                >
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{card.label}</p>
                    <h2 className="text-4xl font-bold text-gray-900">{card.value}</h2>
                  </div>
                  <card.icon className={`w-16 h-16 ${card.textColor} opacity-20`} />
                </div>
              ))}
            </div>

            {/* Announcements Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📢 University Announcements</h2>
                <a href="/student/updates" className="text-blue-600 hover:text-blue-800 font-semibold">
                  View All →
                </a>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading updates...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-600 font-semibold">⚠️ Error loading updates</p>
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                  <button 
                    onClick={fetchDashboardData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No announcements yet. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.slice(0, 5).map((update) => (
                    <div
                      key={update._id}
                      className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{update.title}</h3>
                          <p className="text-gray-700 mt-2">{update.message}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              update.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              update.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {update.priority}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(update.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-blue-100 mb-4">Contact your university administrator or visit the help center.</p>
                <a href="/help" className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                  Get Help
                </a>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Update Your Profile</h3>
                <p className="text-purple-100 mb-4">Keep your information up to date for better portal experience.</p>
                <a href="/student/profile" className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
                  Go to Profile
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
