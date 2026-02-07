'use client';
import { useEffect, useState } from 'react';
import { CalendarCheck, FileText, IndianRupee } from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    attendance: 0,
    exams: 0,
    feesDue: 0
  });

  useEffect(() => {
    // TODO: fetch student dashboard stats
    setStats({
      attendance: 92,
      exams: 4,
      feesDue: 15000
    });
  }, []);

  const cards = [
    { label: 'Attendance %', value: `${stats.attendance}%`, icon: CalendarCheck },
    { label: 'Upcoming Exams', value: stats.exams, icon: FileText },
    { label: 'Fees Due (₹)', value: stats.feesDue, icon: IndianRupee }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow p-6 flex justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <h2 className="text-2xl font-bold">{card.value}</h2>
            </div>
            <card.icon className="w-10 h-10 text-blue-600" />
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Announcements</h2>
        <p className="text-gray-600">
          Check exams, notices, and updates from your university here.
        </p>
      </div>
    </div>
  );
}
