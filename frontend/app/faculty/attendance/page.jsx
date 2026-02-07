'use client';
import { useEffect, useState } from 'react';

export default function FacultyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: fetch students attendance list
    setAttendance([
      { id: 1, name: 'Rahul Sharma', status: 'PRESENT' },
      { id: 2, name: 'Anjali Patel', status: 'ABSENT' },
    ]);
  }, []);

  const markAttendance = (id, status) => {
    setAttendance((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status } : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Student Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="p-4">{student.name}</td>
                <td className="p-4">
                  <span
                    className={`font-semibold ${
                      student.status === 'PRESENT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => markAttendance(student.id, 'PRESENT')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'ABSENT')}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Absent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        disabled={loading}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Attendance
      </button>
    </div>
  );
}
