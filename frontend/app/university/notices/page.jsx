'use client';
import { useEffect, useState } from 'react';
import { Trash2, Edit2, Plus, Clock, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/services/api';

export default function UniversityNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM',
    roleTarget: 'ALL'
  });
  const [editingId, setEditingId] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify token
      const token = localStorage.getItem('token'); // ✅ Using localStorage
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // ✅ Changed endpoint to match backend: /university/notifications
      const response = await api.get('/university/notifications').catch(err => {
        console.error('Notices API Error:', err.response?.status, err.response?.data);
        throw new Error(`${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}`);
      });

      const noticesList = Array.isArray(response.data?.data) 
        ? response.data.data 
        : (Array.isArray(response.data) ? response.data : []);
        
      setNotices(noticesList);
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      setError(`Failed to load notices: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // ✅ Changed endpoint to match backend
        await api.put(`/university/notifications/${editingId}`, formData);
      } else {
        // ✅ Changed endpoint to match backend
        await api.post('/university/notifications', formData);
      }
      setFormData({ title: '', message: '', priority: 'MEDIUM', roleTarget: 'ALL' });
      setEditingId(null);
      setShowModal(false);
      await fetchNotices();
    } catch (err) {
      alert('Failed to save notice: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      // ✅ Changed endpoint to match backend
      await api.delete(`/university/notifications/${id}`);
      await fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const handleEdit = (notice) => {
    setFormData({
      title: notice.title,
      message: notice.message,
      priority: notice.priority,
      roleTarget: notice.roleTarget
    });
    setEditingId(notice._id);
    setShowModal(true);
  };

  const filteredNotices = notices.filter(notice => {
    if (filterPriority !== 'ALL' && notice.priority !== filterPriority) return false;
    if (filterRole !== 'ALL' && notice.roleTarget !== filterRole) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">University Notices</h1>
            <p className="text-gray-600 mt-2">Manage and publish updates for your institution</p>
          </div>
          <button
            onClick={() => {
              setFormData({ title: '', message: '', priority: 'MEDIUM', roleTarget: 'ALL' });
              setEditingId(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <Plus size={20} />
            Create Notice
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              <button onClick={fetchNotices} className="text-red-600 hover:text-red-800 text-sm mt-2 underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Target</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Targets</option>
              <option value="STUDENT">Students</option>
              <option value="FACULTY">Faculty</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Notices</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{filteredNotices.length}</span>
            </div>
          </div>
        </div>

        {/* Notices Grid */}
        {filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredNotices.map((notice) => (
              <div
                key={notice._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border-l-4 border-blue-600 p-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{notice.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                      {notice.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs font-semibold">Inactive</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{notice.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(notice.createdAt).toLocaleDateString()} {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded">Target: {notice.roleTarget}</span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        Views: {Math.floor(Math.random() * 1000)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No notices found. Create one to get started!</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create First Notice
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Notice' : 'Create New Notice'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notice title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Notice message"
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={formData.roleTarget}
                    onChange={(e) => setFormData({ ...formData, roleTarget: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ALL">All Users</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="FACULTY">Faculty Only</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  {editingId ? 'Update Notice' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}