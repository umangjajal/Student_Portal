'use client';
import { useEffect, useState } from 'react';
import { Users, GraduationCap, ClipboardCheck, Bell } from 'lucide-react';
import Link from 'next/link';

export default function UniversityDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    notices: 0
  });

  useEffect(() => {
    // TODO: fetch university dashboard stats
    setStats({
      students: 1240,
      faculty: 86,
      courses: 42,
      notices: 6
    });
  }, []);

  const cards = [
    { label: 'Students', value: stats.students, icon: Users, link: '/university/students' },
    { label: 'Faculty', value: stats.faculty, icon: GraduationCap, link: '/university/faculty' },
    { label: 'Courses', value: stats.courses, icon: ClipboardCheck, link: '#' },
    { label: 'Active Notices', value: stats.notices, icon: Bell, link: '/university/notices' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">University Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <Link key={i} href={c.link || '#'}>
            <div className="bg-white rounded-2xl shadow p-6 flex justify-between hover:shadow-lg transition cursor-pointer">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <h2 className="text-2xl font-bold">{c.value}</h2>
              </div>
              <c.icon className="w-10 h-10 text-blue-600" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-600">
          Manage students, faculty, attendance, courses, and notices from here.
        </p>
      </div>
    </div>
  );
}
