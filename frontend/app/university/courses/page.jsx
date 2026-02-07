'use client';
import { useEffect, useState } from 'react';

export default function UniversityCourses() {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    // TODO: fetch courses
    setCourses([
      { id: 1, name: 'Computer Networks' },
      { id: 2, name: 'Operating Systems' }
    ]);
  }, []);

  const addCourse = () => {
    if (!courseName) return;
    setCourses([...courses, { id: Date.now(), name: courseName }]);
    setCourseName('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex gap-4">
          <input
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Course name"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
          <button
            onClick={addCourse}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Course
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Course Name</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-4">{c.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
