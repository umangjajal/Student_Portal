'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Calendar, User, BookOpen, BarChart3 } from 'lucide-react';

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/student/attendance');
      
      if (res.data) {
        setStudentInfo(res.data.student);
        setStatistics(res.data.statistics);
        setRecords(res.data.records || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Attendance Records</h1>
        <p className="text-gray-600">Your class attendance and participation tracking</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Student Info Card */}
      {studentInfo && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-blue-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{studentInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Enrollment</p>
                <p className="font-semibold text-gray-900">{studentInfo.enrollmentNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-semibold text-gray-900">{studentInfo.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-semibold text-gray-900">{studentInfo.year}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Classes</p>
                <p className="text-4xl font-bold">{statistics.total}</p>
              </div>
              <Calendar className="opacity-30" size={48} />
            </div>
          </div>

          {/* Present */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Present</p>
                <p className="text-4xl font-bold">{statistics.present}</p>
              </div>
              <span className="text-5xl opacity-30">✓</span>
            </div>
          </div>

          {/* Absent */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Absent</p>
                <p className="text-4xl font-bold">{statistics.absent}</p>
              </div>
              <span className="text-5xl opacity-30">✗</span>
            </div>
          </div>

          {/* Percentage */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Percentage</p>
                <p className="text-4xl font-bold">{statistics.percentage}%</p>
              </div>
              <span className="text-5xl opacity-30">%</span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No attendance records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Faculty</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Department</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${
                        record.status === 'PRESENT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status === 'PRESENT' ? '✓ Present' : '✗ Absent'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      {record.facultyId?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-700">
                      {record.facultyId?.department || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
