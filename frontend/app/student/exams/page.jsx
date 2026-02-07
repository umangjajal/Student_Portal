'use client';
import { useEffect, useState } from 'react';

export default function StudentExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    // TODO: fetch exam schedule
    setExams([
      { subject: 'Operating Systems', date: '2024-03-10' },
      { subject: 'Computer Networks', date: '2024-03-14' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Exams</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Subject</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-4">{exam.subject}</td>
                <td className="p-4">{exam.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
