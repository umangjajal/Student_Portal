'use client';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/admin/universities" className="card">Manage Universities</a>
        <a href="/admin/analytics" className="card">Analytics</a>
      </div>
    </div>
  );
}
