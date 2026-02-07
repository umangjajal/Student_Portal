'use client';
import { useEffect, useState } from 'react';

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    // TODO: fetch attendance records
    setRecords([
      { date: '2024-02-01', status: 'PRESENT' },
      { date: '2024-02-02', status: 'ABSENT' },
      { date: '2024-02-03', status: 'PRESENT' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{r.date}</td>
                <td className="p-4">
                  <span
                    className={`font-semibold ${
                      r.status === 'PRESENT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
