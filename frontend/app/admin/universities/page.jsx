'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Building2, 
  MapPin, 
  Mail, 
  CheckCircle, 
  Clock, 
  Search,
  ShieldCheck 
} from 'lucide-react';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Universities
  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/universities');
      
      // ✅ CRITICAL FIX: Handle the structured backend response
      // res.data is the Axios response body. 
      // res.data.data is the actual array of universities from our backend update.
      const fetchedData = res.data.data || res.data; 

      // Safety check to ensure it's an array before setting state
      if (Array.isArray(fetchedData)) {
        setUniversities(fetchedData);
      } else {
        setUniversities([]);
        console.error("API did not return an array:", fetchedData);
      }
      
    } catch (err) {
      console.error("Failed to fetch universities:", err);
      setError('Failed to load universities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Approve University
  const handleApprove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to approve ${name}?`)) return;

    try {
      await api.put(`/admin/universities/${id}/approve`);
      // Refresh the list after successful approval
      fetchUniversities();
    } catch (err) {
      console.error("Failed to approve:", err);
      alert(err.response?.data?.message || 'Failed to approve university');
    }
  };

  // Filter for Search
  const filteredUniversities = universities.filter(uni => 
    uni.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Universities</h1>
          <p className="text-gray-500 mt-1">Review and approve university registrations.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search universities..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Universities Grid */}
      {filteredUniversities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No universities found</h3>
          <p className="text-gray-500">There are currently no universities matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ✅ Safe mapping because we ensured filteredUniversities is an array */}
          {filteredUniversities.map((uni) => (
            <div key={uni._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="p-5 border-b border-gray-50 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl uppercase">
                    {uni.name?.charAt(0) || 'U'}
                  </div>
                  {uni.approved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle size={12} /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={uni.name}>
                  {uni.name}
                </h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{uni.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">
                      {[uni.city, uni.state, uni.country].filter(Boolean).join(', ') || 'Location not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer / Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                {!uni.approved ? (
                  <button
                    onClick={() => handleApprove(uni._id, uni.name)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium text-sm"
                  >
                    <ShieldCheck size={16} />
                    Approve University
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 py-2 rounded-lg cursor-not-allowed font-medium text-sm"
                  >
                    <CheckCircle size={16} />
                    Fully Approved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}