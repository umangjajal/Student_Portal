'use client';
import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    // TODO: API integration
    setAnalytics([
      { label: 'Attendance Updates', count: 1200 },
      { label: 'Exams Published', count: 85 },
      { label: 'Notifications Sent', count: 4300 },
      { label: 'Logins Today', count: 980 },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="text-3xl font-bold text-blue-600">
              {item.count}
            </h2>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Insights</h2>
        <p className="text-gray-600">
          These analytics help admins track engagement, platform growth,
          and academic activity in real time.
        </p>
      </div>
    </div>
  );
}
