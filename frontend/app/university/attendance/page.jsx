'use client';
import { useEffect, useState } from 'react';

export default function UniversityAttendance() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    // TODO: fetch attendance summary
    setSummary([
      { department: 'CSE', percentage: 91 },
      { department: 'IT', percentage: 88 }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance Overview</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{s.department}</td>
                <td className="p-4 font-semibold">{s.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
