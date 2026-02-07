'use client';
import { useEffect, useState } from 'react';

export default function FacultyClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    // TODO: fetch faculty classes
    setClasses([
      { id: 1, name: 'Computer Networks', semester: '6th' },
      { id: 2, name: 'Operating Systems', semester: '5th' },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Class Name</th>
              <th className="p-4 text-left">Semester</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-t">
                <td className="p-4">{cls.name}</td>
                <td className="p-4">{cls.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
