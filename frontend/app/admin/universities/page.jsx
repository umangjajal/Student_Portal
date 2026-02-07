'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import withAdminAuth from '@/utils/withAdminAuth';

function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);

  const load = async () => {
    const res = await api.get('/admin/universities');
    setUniversities(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await api.put(`/admin/universities/${id}/approve`);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">University Approvals</h1>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th>Email</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {universities.map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u.approved ? (
                    <span className="text-green-600">Approved</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </td>
                <td>
                  {!u.approved && (
                    <button
                      onClick={() => approve(u._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withAdminAuth(UniversitiesPage);
