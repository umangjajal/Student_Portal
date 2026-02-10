'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Edit2, Copy, Check } from 'lucide-react';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedCred, setCopiedCred] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    department: '',
    experience: ''
  });

  const [credentials, setCredentials] = useState(null);

  // Fetch faculty
  const fetchFaculty = async () => {
    try {
      const res = await api.get('/university/faculty');
      setFaculty(res.data);
    } catch (err) {
      alert('Failed to fetch faculty');
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Create faculty
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department) {
      alert('Name and department are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/university/faculty', form);
      setCredentials(res.data.credentials);
      setForm({ name: '', department: '', experience: '' });
      fetchFaculty();
      setTimeout(() => setShowForm(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create faculty');
    } finally {
      setLoading(false);
    }
  };

  // Update faculty
  const handleUpdate = async (id) => {
    if (!form.name || !form.department) {
      alert('Name and department are required');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/university/faculty/${id}`, form);
      alert('Faculty updated successfully');
      setEditingId(null);
      setForm({ name: '', department: '', experience: '' });
      fetchFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update faculty');
    } finally {
      setLoading(false);
    }
  };

  // Delete faculty
  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await api.delete(`/university/faculty/${id}`);
      alert('Faculty deleted successfully');
      fetchFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete faculty');
    }
  };

  // Edit faculty
  const handleEdit = (fac) => {
    setEditingId(fac._id);
    setForm({
      name: fac.name,
      department: fac.department,
      experience: fac.experience || ''
    });
    setShowForm(true);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCred(text);
    setTimeout(() => setCopiedCred(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Faculty</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ name: '', department: '', experience: '' });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Faculty
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Faculty' : 'Create Faculty'}
          </h2>

          <form onSubmit={(e) => editingId ? handleUpdate(editingId) : handleCreate(e)} className="space-y-4">
            <input
              placeholder="Faculty Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              required
            />

            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Civil">Civil</option>
              <option value="Electronics">Electronics</option>
            </select>

            <input
              type="number"
              placeholder="Years of Experience (Optional)"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Credentials Display */}
          {credentials && (
            <div className="mt-4 bg-green-50 border border-green-300 p-4 rounded-lg">
              <p className="font-bold text-green-700 mb-3">✅ Faculty Created! Share these credentials:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Faculty ID</p>
                    <p className="font-mono font-bold">{credentials.facultyId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.facultyId)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedCred === credentials.facultyId ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Password</p>
                    <p className="font-mono font-bold">{credentials.password}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.password)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedCred === credentials.password ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {faculty.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No faculty yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Faculty ID</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Experience</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((fac) => (
                <tr key={fac._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-semibold">{fac.name}</td>
                  <td className="p-4 font-mono text-sm">{fac.facultyId}</td>
                  <td className="p-4">{fac.department}</td>
                  <td className="p-4">{fac.experience || '-'} years</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(fac)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(fac._id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
