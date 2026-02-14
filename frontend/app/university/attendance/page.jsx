'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { BarChart2, Search, Users, Activity } from 'lucide-react';

export default function UniversityAttendance() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Fetching from the university-specific attendance route
      const res = await api.get('/university/attendance/summary');
      
      const data = res.data?.data || res.data;
      setSummary(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      
      // Temporary Development Fallback: 
      // If the backend route isn't built yet (404), show mock data so you can test the UI.
      if (err.response?.status === 404) {
        console.warn("API route not found, using placeholder data for UI development.");
        setSummary([
          { department: 'Computer Science (CSE)', percentage: 91, totalStudents: 450 },
          { department: 'Information Technology (IT)', percentage: 88, totalStudents: 320 },
          { department: 'Mechanical Engineering (ME)', percentage: 85, totalStudents: 210 },
          { department: 'Electrical Engineering (EE)', percentage: 82, totalStudents: 180 },
          { department: 'Civil Engineering (CE)', percentage: 79, totalStudents: 150 }
        ]);
      } else {
        setError('Failed to load attendance data. ' + (err.response?.data?.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filter departments based on search
  const filteredSummary = summary.filter(s => 
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Overview</h1>
          <p className="text-gray-500 mt-1">Monitor aggregated student attendance across departments.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search departments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Attendance</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {summary.length > 0 
                ? Math.round(summary.reduce((acc, curr) => acc + curr.percentage, 0) / summary.length) 
                : 0}%
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tracked Departments</p>
            <h3 className="text-2xl font-bold text-gray-900">{summary.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Total Students</th>
                <th className="p-4 font-semibold">Attendance Rate</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500">
                    <BarChart2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No attendance records found.</p>
                  </td>
                </tr>
              ) : (
                filteredSummary.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{s.department}</td>
                    <td className="p-4 text-gray-600">{s.totalStudents || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 w-12">{s.percentage}%</span>
                        <div className="w-full max-w-[120px] bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              s.percentage >= 85 ? 'bg-green-500' : 
                              s.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${s.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        s.percentage >= 85 ? 'bg-green-100 text-green-800' : 
                        s.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.percentage >= 85 ? 'Excellent' : s.percentage >= 75 ? 'Average' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}