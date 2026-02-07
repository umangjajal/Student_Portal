'use client';
import withUniversityAuth from '@/utils/withUniversityAuth';

function UniversityDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">University Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/university/students" className="card">Manage Students</a>
        <a href="/university/faculty" className="card">Manage Faculty</a>
      </div>
    </div>
  );
}

export default withUniversityAuth(UniversityDashboard);
