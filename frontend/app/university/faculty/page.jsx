'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api'; // Ensure this points to your axios instance
import { 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  KeyRound, // For password reset
  X 
} from 'lucide-react';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // State for copying to clipboard
  const [copiedCred, setCopiedCred] = useState(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    department: '',
    experience: '' 
  });

  // Credential Display State (New User or Reset Password)
  const [credentials, setCredentials] = useState(null);

  /* =========================
       FETCH FACULTY
  ========================= */
  const fetchFaculty = async () => {
    try {
      const res = await api.get('/university/faculty');
      setFaculty(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  /* =========================
       CSV TEMPLATE DOWNLOAD
  ========================= */
  const downloadTemplate = () => {
    const headers = ['name', 'department']; // backend expects strictly these
    const templateData = [
      headers,
      ['Dr. John Smith', 'Computer Science'],
      ['Prof. Jane Doe', 'Mechanical']
    ];

    const csv = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty_template.csv';
    link.click();
  };

  /* =========================
       BULK UPLOAD
  ========================= */
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return alert('Select CSV file');

    setBulkLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      // Matches the backend bulkUploadFaculty function
      const res = await api.post('/university/faculty/bulk/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob' // Important: Backend returns a CSV file
      });

      // Trigger download of the result CSV (with passwords)
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `faculty-credentials-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('✅ Faculty imported successfully! Credentials file downloaded.');
      setCsvFile(null);
      fetchFaculty();
      setShowBulkUpload(false);
    } catch (err) {
      alert('Bulk upload failed. Check console.');
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  /* =========================
       CREATE & UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department) return alert('Name & Department required');

    setLoading(true);
    try {
      if (isEditing) {
        // UPDATE Existing
        await api.put(`/university/faculty/${currentId}`, form);
        alert('Faculty updated successfully');
      } else {
        // CREATE New
        const res = await api.post('/university/faculty', form);
        // Show the generated credentials immediately
        setCredentials(res.data.credentials); 
      }
      
      // Reset Form
      if (!credentials) { 
        // If we created a user, keep the form open to show credentials, otherwise close
        setShowForm(false); 
      }
      setForm({ name: '', department: '', experience: '' });
      setIsEditing(false);
      setCurrentId(null);
      fetchFaculty();

    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
       DELETE
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this faculty member?")) return;
    try {
      await api.delete(`/university/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      alert('Failed to delete faculty');
    }
  };

  /* =========================
       RESET PASSWORD
  ========================= */
  const handleResetPassword = async (id) => {
    if (!window.confirm("Reset password for this user? This will invalidate their old login.")) return;
    try {
      const res = await api.post(`/university/faculty/reset-password/${id}`);
      setCredentials({
        facultyId: res.data.facultyData.systemId || res.data.facultyData.loginId,
        password: res.data.facultyData.newPassword
      });
      setShowForm(true); // Open form area to show the new credentials box
      setIsEditing(false); // Ensure we aren't in edit mode
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  /* =========================
       PREPARE EDIT
  ========================= */
  const handleEditClick = (fac) => {
    setForm({
      name: fac.name,
      department: fac.department,
      experience: fac.experience || ''
    });
    setCurrentId(fac._id);
    setIsEditing(true);
    setShowForm(true);
    setCredentials(null); // Hide old credentials if any
  };

  /* =========================
       EXPORT ALL
  ========================= */
  const exportAllCredentials = async () => {
    try {
      const res = await api.get('/university/faculty/export/credentials', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-faculty-credentials-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCred(text);
    setTimeout(() => setCopiedCred(null), 2000);
  };

  /* =========================
       UI RENDER
  ========================= */
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Faculty</h1>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setIsEditing(false);
              setForm({ name: '', department: '', experience: '' });
              setCredentials(null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            {showForm && !isEditing ? <X size={18} /> : <Edit2 size={18} />} 
            {showForm && !isEditing ? 'Close Form' : 'Add Faculty'}
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Bulk Upload Faculty</h2>
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
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {bulkLoading ? 'Processing...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT / CREDENTIALS FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              {credentials ? 'Credentials Generated' : isEditing ? 'Edit Faculty' : 'Add New Faculty'}
            </h2>
            <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
          </div>

          {/* CREDENTIALS BOX (Shows after Create or Reset Password) */}
          {credentials ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg animate-pulse-once">
              <p className="text-green-800 font-medium mb-3">
                Successfully generated credentials. Copy them now, they won't be shown again.
              </p>
              
              <div className="grid gap-3">
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="text-sm text-gray-500">ID / Username:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-800">{credentials.facultyId}</span>
                    <button onClick={() => copyToClipboard(credentials.facultyId)} className="text-gray-400 hover:text-blue-600">
                      {copiedCred === credentials.facultyId ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="text-sm text-gray-500">Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-800">{credentials.password}</span>
                    <button onClick={() => copyToClipboard(credentials.password)} className="text-gray-400 hover:text-blue-600">
                      {copiedCred === credentials.password ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setCredentials(null); setShowForm(false); }}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Done
              </button>
            </div>
          ) : (
            /* INPUT FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              
              <input
                type="text"
                placeholder="Experience (e.g., 5 years)"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : isEditing ? 'Update Faculty' : 'Create Faculty'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
        {faculty.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <p className="text-lg">No faculty members found.</p>
            <p className="text-sm">Use the "Add Faculty" or "Bulk Upload" button to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Faculty ID</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Department</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-600">Experience</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faculty.map((fac) => (
                  <tr key={fac._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{fac.name}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{fac.facultyId}</td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {fac.department}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{fac.experience || '-'}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {/* Edit Button */}
                        <button 
                          onClick={() => handleEditClick(fac)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                          title="Edit Details"
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        {/* Reset Password Button */}
                        <button 
                          onClick={() => handleResetPassword(fac._id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition"
                          title="Reset Password"
                        >
                          <KeyRound size={18} />
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(fac._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                          title="Delete Faculty"
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
