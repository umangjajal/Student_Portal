'use client';
import { useState } from 'react';
import api from '@/services/api';
import withUniversityAuth from '@/utils/withUniversityAuth';

function FacultyPage() {
  const [form, setForm] = useState({});
  const [creds, setCreds] = useState(null);

  const submit = async () => {
    const res = await api.post('/university/faculty', form);
    setCreds(res.data.credentials);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Create Faculty</h1>

      {['name','department'].map(f => (
        <input
          key={f}
          placeholder={f}
          onChange={e => setForm({...form, [f]: e.target.value})}
          className="input"
        />
      ))}

      <button onClick={submit} className="btn-primary">Generate</button>

      {creds && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <p><b>Faculty ID:</b> {creds.facultyId}</p>
          <p><b>Password:</b> {creds.password}</p>
        </div>
      )}
    </div>
  );
}

export default withUniversityAuth(FacultyPage);
