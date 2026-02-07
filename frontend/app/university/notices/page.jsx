'use client';
import { useEffect, useState } from 'react';

export default function UniversityNotices() {
  const [notices, setNotices] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    // TODO: fetch notices
    setNotices([
      { id: 1, message: 'Mid-sem exams start next week' },
      { id: 2, message: 'Holiday on Friday' }
    ]);
  }, []);

  const addNotice = () => {
    if (!text) return;
    setNotices([...notices, { id: Date.now(), message: text }]);
    setText('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Notices</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a notice..."
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-600 outline-none"
        />
        <button
          onClick={addNotice}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Publish Notice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <ul className="space-y-3">
          {notices.map((n) => (
            <li key={n.id} className="border-b pb-2">
              {n.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
