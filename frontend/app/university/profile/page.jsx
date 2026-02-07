'use client';
import { useState } from 'react';
import axios from '@/services/api';

export default function UniversityProfile() {
  const [form, setForm] = useState({});

  const submit = async () => {
    await axios.put('/university/profile', form);
    alert('Profile completed');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">University Profile</h1>

      {['name','place','city','state','country','postalCode'].map((f) => (
        <input
          key={f}
          placeholder={f}
          onChange={(e) => setForm({ ...form, [f]: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
        />
      ))}

      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Profile
      </button>
    </div>
  );
}
