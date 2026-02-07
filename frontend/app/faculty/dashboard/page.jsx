'use client';
import { useEffect, useState } from 'react';
import { Users, ClipboardList, CalendarCheck } from 'lucide-react';

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
  });

  useEffect(() => {
    // TODO: fetch faculty dashboard stats
    setStats({
      classes: 5,
      students: 180,
      assignments: 24,
    });
  }, []);

  const cards = [
    { title: 'Classes', value: stats.classes, icon: Users },
    { title: 'Students', value: stats.students, icon: CalendarCheck },
    { title: 'Assignments', value: stats.assignments, icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Faculty Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow p-6 flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <h2 className="text-2xl font-bold">{card.value}</h2>
            </div>
            <card.icon className="w-10 h-10 text-blue-600" />
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Quick Info</h2>
        <p className="text-gray-600">
          Manage your classes, mark attendance, and assign coursework from this
          dashboard.
        </p>
      </div>
    </div>
  );
}
