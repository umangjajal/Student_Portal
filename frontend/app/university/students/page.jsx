'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Edit2, Copy, Check, Download, Upload } from 'lucide-react';

export default function StudentPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedCred, setCopiedCred] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    department: '',
    year: ''
  });

  const [credentials, setCredentials] = useState(null);

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await api.get('/university/students');
      setStudents(res.data);
    } catch (err) {
      alert('Failed to fetch students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ['name', 'department', 'year'];
    const templateData = [
      headers,
      ['John Doe', 'Computer Science', '1st'],
      ['Jane Smith', 'Mechanical', '2nd'],
      ['Bob Johnson', 'Electrical', '3rd']
    ];
    
    const csv = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_template.csv';
    link.click();
  };

  // Handle bulk CSV upload
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setBulkLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/university/students/bulk/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob' // Important: handle as blob for CSV file
      });

      // Create blob and download CSV file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student-credentials-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      alert('✅ Students imported successfully! Credentials CSV downloaded.');
      
      setCsvFile(null);
      fetchStudents();
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowBulkUpload(false);
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setBulkLoading(false);
    }
  };

  // Create student
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department || !form.year) {
      alert('All fields required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/university/students', form);
      setCredentials(res.data.credentials);
      setForm({ name: '', department: '', year: '' });
      fetchStudents();
      setTimeout(() => setShowForm(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  // Update student
  const handleUpdate = async (id) => {
    if (!form.name || !form.department || !form.year) {
      alert('All fields required');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/university/students/${id}`, form);
      alert('Student updated successfully');
      setEditingId(null);
      setForm({ name: '', department: '', year: '' });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await api.delete(`/university/students/${id}`);
      alert('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  // Edit student
  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      department: student.department,
      year: student.year
    });
    setShowForm(true);
  };

  // Export all student credentials as CSV
  const exportAllCredentials = async () => {
    try {
      const res = await api.get('/university/students/export/credentials', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student-credentials-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export credentials');
    }
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
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', department: '', year: '' });
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            + Add Student
          </button>
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Upload size={18} /> Bulk Upload
          </button>
          <button
            onClick={exportAllCredentials}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Download size={18} /> Export Credentials
          </button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-green-200">
          <h2 className="text-xl font-bold mb-4">📤 Bulk Upload Students (CSV)</h2>

          <div className="space-y-4">
            {/* Template Download */}
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
            >
              <Download size={18} /> Download CSV Template
            </button>

            {/* CSV File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
                id="csv-input"
              />
              <label htmlFor="csv-input" className="cursor-pointer">
                <p className="text-gray-600 mb-2">
                  {csvFile ? `✅ Selected: ${csvFile.name}` : 'Click to select CSV file or drag and drop'}
                </p>
                <p className="text-sm text-gray-400">CSV must have: name, department, year</p>
              </label>
            </div>

            {/* Upload Button */}
            <div className="flex gap-2">
              <button
                onClick={handleBulkUpload}
                disabled={bulkLoading || !csvFile}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {bulkLoading ? 'Processing...' : 'Upload & Import'}
              </button>
              <button
                onClick={() => setShowBulkUpload(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Upload Results */}
          {uploadResults && (
            <div className={`mt-4 p-4 rounded-lg ${uploadResults.summary.failed === 0 ? 'bg-green-50 border border-green-300' : 'bg-yellow-50 border border-yellow-300'}`}>
              <p className="font-bold mb-2">
                ✅ Upload Complete!
              </p>
              <p className="text-sm mb-3">
                Created: <span className="font-bold">{uploadResults.summary.created}</span> | 
                Total: <span className="font-bold">{uploadResults.summary.total}</span>
                {uploadResults.summary.failed > 0 && ` | Failed: ${uploadResults.summary.failed}`}
              </p>

              {/* Student Credentials Table */}
              {uploadResults.students.length > 0 && (
                <div className="mt-3 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Enrollment</th>
                        <th className="p-2 text-left">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResults.students.map((student, idx) => (
                        <tr key={idx} className="border-t text-xs">
                          <td className="p-2">{student.name}</td>
                          <td className="p-2 font-mono">{student.enrollmentNo}</td>
                          <td className="p-2 font-mono">{student.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Errors */}
              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="mt-3 bg-red-50 p-2 rounded text-xs text-red-700 max-h-32 overflow-y-auto">
                  <p className="font-bold mb-1">Errors:</p>
                  {uploadResults.errors.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Student' : 'Create Student'}
          </h2>

          <form onSubmit={(e) => editingId ? handleUpdate(editingId) : handleCreate(e)} className="space-y-4">
            <input
              placeholder="Student Name"
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

            <select
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              required
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>

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
              <p className="font-bold text-green-700 mb-3">✅ Student Created! Share these credentials:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Enrollment No</p>
                    <p className="font-mono font-bold">{credentials.enrollmentNo}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.enrollmentNo)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {copiedCred === credentials.enrollmentNo ? <Check size={18} /> : <Copy size={18} />}
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

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {students.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No students yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Enrollment</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Year</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-semibold">{student.name}</td>
                  <td className="p-4 font-mono text-sm">{student.enrollmentNo}</td>
                  <td className="p-4">{student.department}</td>
                  <td className="p-4">{student.year}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
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
