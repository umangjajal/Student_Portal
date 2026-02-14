'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { BookOpen, Plus, Trash2, Search, AlertCircle, BookMarked } from 'lucide-react';

export default function UniversityCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState(''); // Added course code for realism
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get('/university/courses');
      const data = res.data?.data || res.data;
      setCourses(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      
      // Temporary Development Fallback
      if (err.response?.status === 404) {
        console.warn("API route not found, using placeholder data for UI development.");
        setCourses([
          { _id: '1', name: 'Computer Networks', code: 'CS-401', status: 'Active' },
          { _id: '2', name: 'Operating Systems', code: 'CS-302', status: 'Active' },
          { _id: '3', name: 'Data Structures and Algorithms', code: 'CS-201', status: 'Active' }
        ]);
      } else {
        setError('Failed to load courses. ' + (err.response?.data?.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Add Course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    try {
      setSubmitLoading(true);
      setError(null);

      // Call API
      const res = await api.post('/university/courses', { 
        name: courseName.trim(),
        code: courseCode.trim() || `CRS-${Math.floor(1000 + Math.random() * 9000)}`
      });

      const newCourse = res.data?.data || res.data;
      
      // Update UI
      setCourses([...courses, newCourse]);
      setCourseName('');
      setCourseCode('');
      
    } catch (err) {
      console.error("Failed to add course:", err);
      
      // Temporary Fallback (If backend route doesn't exist yet)
      if (err.response?.status === 404) {
        const mockCourse = {
          _id: Date.now().toString(),
          name: courseName.trim(),
          code: courseCode.trim() || `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Active'
        };
        setCourses([...courses, mockCourse]);
        setCourseName('');
        setCourseCode('');
      } else {
        setError('Failed to add course. ' + (err.response?.data?.message || ''));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      // Optimistic UI update
      setCourses(courses.filter(c => c._id !== id));
      await api.delete(`/university/courses/${id}`);
    } catch (err) {
      console.error("Failed to delete course:", err);
      // Revert if API fails (unless it's just our 404 mock environment)
      if (err.response?.status !== 404) {
        fetchCourses(); 
        alert("Failed to delete course.");
      }
    }
  };

  // Filter for Search
  const filteredCourses = courses.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-500 mt-1">Add and manage curriculum courses for your university.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Course Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-600" size={20} />
          Add New Course
        </h2>
        <form onSubmit={handleAddCourse} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Course Name (e.g., Artificial Intelligence)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow"
            />
          </div>
          <div className="w-full md:w-48">
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="Course Code (Optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-shadow"
            />
          </div>
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
          >
            {submitLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={18} />
                <span>Add Course</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-semibold w-16 text-center">#</th>
                <th className="p-4 font-semibold">Course Code</th>
                <th className="p-4 font-semibold">Course Name</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <BookMarked className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No courses found. Add your first course above.</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c, index) => (
                  <tr key={c._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                    <td className="p-4 font-mono text-sm text-gray-500">{c.code || 'N/A'}</td>
                    <td className="p-4 font-medium text-gray-900">{c.name}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteCourse(c._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex justify-center items-center"
                        title="Delete Course"
                      >
                        <Trash2 size={18} />
                      </button>
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