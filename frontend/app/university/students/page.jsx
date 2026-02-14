'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  Download, 
  Upload,
  Search,
  Users,
  KeyRound,
  X
} from 'lucide-react';

export default function StudentPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copiedCred, setCopiedCred] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    department: '',
    year: ''
  });

  const [credentials, setCredentials] = useState(null);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/university/students');
      // Safe array parsing
      const data = res.data?.data || res.data;
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      // ✅ Fixed Route to match backend
      const res = await api.post('/university/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

      alert('✅ Students imported successfully! Credentials CSV downloaded.');
      setCsvFile(null);
      fetchStudents();
      setTimeout(() => setShowBulkUpload(false), 2000);

    } catch (err) {
      alert('Failed to upload CSV. Ensure columns are: name, department, year.');
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  // Create or Update student
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department || !form.year) {
      alert('All fields required');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // UPDATE
        await api.put(`/university/students/${editingId}`, form);
        alert('Student updated successfully');
        setEditingId(null);
        setForm({ name: '', department: '', year: '' });
        setShowForm(false);
      } else {
        // CREATE
        const res = await api.post('/university/students', form);
        setCredentials(res.data.credentials);
        setForm({ name: '', department: '', year: '' });
      }
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await api.delete(`/university/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  // Reset Student Password
  const handleResetPassword = async (id) => {
    if (!window.confirm("Reset password for this student? This will invalidate their old login.")) return;
    try {
      // ✅ Correct Backend Route
      const res = await api.put(`/university/students/${id}/reset-password`);
      setCredentials({
        enrollmentNo: res.data.studentData.enrollmentNo || res.data.studentData.loginId,
        password: res.data.studentData.newPassword
      });
      setShowForm(true); 
      setEditingId(null); 
    } catch (err) {
      alert('Failed to reset password');
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
    setCredentials(null);
  };

  // Export all student credentials as CSV
  const exportAllCredentials = async () => {
    try {
      // ✅ Fixed Route to match backend
      const res = await api.get('/university/students/export-credentials', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all-student-credentials-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Ensure there are students to export.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCred(text);
    setTimeout(() => setCopiedCred(null), 2000);
  };

  // Filter for Search
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-500 mt-1">View and manage enrolled students for your university.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', department: '', year: '' });
              setCredentials(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            {showForm && !editingId ? <X size={18} /> : <Edit2 size={18} />}
            {showForm && !editingId ? 'Close Form' : 'Add Student'}
          </button>
          
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Upload size={18} /> Bulk Upload
          </button>
          
          <button
            onClick={exportAllCredentials}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* BULK UPLOAD PANEL */}
      {showBulkUpload && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 mb-6 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Bulk Upload Students</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={downloadTemplate}
              className="text-blue-600 text-sm hover:underline flex items-center gap-1 w-fit"
            >
              <Download size={16} /> Download CSV Template
            </button>
            
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
              />
              <button
                onClick={handleBulkUpload}
                disabled={!csvFile || bulkLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 min-w-[120px]"
              >
                {bulkLoading ? 'Processing...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT / CREDENTIALS FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 mb-8 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              {credentials ? 'Credentials Generated' : editingId ? 'Edit Student Details' : 'Add New Student'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* CREDENTIALS BOX */}
          {credentials ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl animate-pulse-once">
              <p className="text-green-800 font-medium mb-4">
                Successfully generated credentials. Please copy them now, they won't be shown again!
              </p>
              <div className="grid gap-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                  <span className="text-sm font-semibold text-gray-600">Enrollment No:</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 text-lg">{credentials.enrollmentNo}</span>
                    <button onClick={() => copyToClipboard(credentials.enrollmentNo)} className="text-gray-400 hover:text-blue-600 p-1">
                      {copiedCred === credentials.enrollmentNo ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                  <span className="text-sm font-semibold text-gray-600">Password:</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 text-lg">{credentials.password}</span>
                    <button onClick={() => copyToClipboard(credentials.password)} className="text-gray-400 hover:text-blue-600 p-1">
                      {copiedCred === credentials.password ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setCredentials(null); setShowForm(false); }}
                className="mt-6 w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* INPUT FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? 'Processing...' : editingId ? 'Update Student Details' : 'Create Student Record'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, enrollment no, or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && students.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            Loading student records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-900">No students found.</p>
            <p className="text-sm mt-1">Adjust your search or add a new student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Enrollment No</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Department</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Year</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{student.name}</td>
                    <td className="p-4 text-blue-600 font-mono text-sm">{student.enrollmentNo}</td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {student.department || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{student.year || '-'}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {/* Edit Button */}
                        <button 
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit Details"
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        {/* Reset Password Button */}
                        <button 
                          onClick={() => handleResetPassword(student._id)}
                          className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                          title="Reset Password"
                        >
                          <KeyRound size={18} />
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(student._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete Student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}