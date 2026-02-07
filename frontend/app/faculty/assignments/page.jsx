'use client';
import { useEffect, useState } from 'react';

export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // TODO: fetch assignments
    setAssignments([
      { id: 1, title: 'Unit 1 Homework', submissions: 42 },
      { id: 2, title: 'OS Case Study', submissions: 36 },
    ]);
  }, []);

  const addAssignment = () => {
    if (!title) return;
    setAssignments((prev) => [
      ...prev,
      { id: Date.now(), title, submissions: 0 },
    ]);
    setTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Assignments</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Create New Assignment
        </h2>
        <div className="flex gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment title"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
          <button
            onClick={addAssignment}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Submissions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-4">{a.title}</td>
                <td className="p-4">{a.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
