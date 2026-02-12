'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import api from '@/services/api';

export default function StudentUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

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
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/updates');
      setUpdates(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    HIGH: { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 High' },
    MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🟡 Medium' },
    LOW: { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Low' }
  };

  const filteredUpdates = filter === 'ALL' 
    ? updates 
    : updates.filter(u => u.priority === filter);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar userRole="STUDENT" />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" menuItems={menuItems} />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📢 University Updates</h1>
              <p className="text-gray-600">Stay informed with the latest announcements and updates</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-8 flex-wrap">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                All ({updates.length})
              </button>
              <button
                onClick={() => setFilter('HIGH')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === 'HIGH'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
                }`}
              >
                🔴 High Priority
              </button>
              <button
                onClick={() => setFilter('MEDIUM')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === 'MEDIUM'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-yellow-600'
                }`}
              >
                🟡 Medium Priority
              </button>
              <button
                onClick={() => setFilter('LOW')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === 'LOW'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600'
                }`}
              >
                🟢 Low Priority
              </button>
            </div>

            {/* Updates List */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading updates...</p>
              </div>
            ) : filteredUpdates.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <p className="text-2xl text-gray-500 mb-2">📭</p>
                <p className="text-gray-600">No updates available at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUpdates.map((update) => {
                  const colors = priorityColors[update.priority] || priorityColors.MEDIUM;
                  return (
                    <div
                      key={update._id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden border-l-4 border-blue-600"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">{update.title}</h3>
                            <p className="text-gray-600 mt-2">{update.message}</p>
                          </div>
                          <span className={`${colors.bg} ${colors.text} px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ml-4`}>
                            {colors.label}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex gap-6 text-sm text-gray-600">
                            <span>📅 {new Date(update.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                            <span>🕐 {new Date(update.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                          <span className={`${
                            update.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          } px-3 py-1 rounded-full text-sm font-semibold`}>
                            {update.isActive ? '✓ Active' : '○ Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredUpdates.length === 0 && updates.length > 0 && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-800">No updates found for the selected priority level.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
