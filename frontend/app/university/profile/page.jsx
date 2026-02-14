'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Edit3, 
  Save, 
  X,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function UniversityProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // Matches the backend GET route
      const response = await api.get('/university/profile');
      const data = response.data?.data || response.data;
      setProfile(data);
      setFormData(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg('');
      
      // Matches the backend PUT route
      const response = await api.put('/university/profile', formData);
      const data = response.data?.data || response.data;
      
      setProfile(data);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. ' + (err.response?.data?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading university profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">University Profile</h1>
          <p className="text-gray-500 mt-2">Manage your institution's public information and settings.</p>
        </div>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile); // Reset form data
                  setError(null);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle size={20} className="flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Security */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center text-5xl font-bold mb-4 uppercase">
              {profile?.name ? profile.name.charAt(0) : 'U'}
            </div>
            <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{profile?.name || 'University Name'}</h2>
            <p className="text-gray-500 text-sm mt-1">{profile?.approved ? 'Verified Institution' : 'Pending Verification'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="text-blue-600" size={20} />
              Security
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Need to update your admin credentials? Securely reset your password here.
            </p>
            <Link 
              href="/university/password-reset"
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-medium transition-colors"
            >
              <Lock size={18} /> Change Password
            </Link>
          </div>
        </div>

        {/* Right Column: Forms & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <Building2 className="text-blue-600" size={22}/>
              General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">University Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Mail size={16}/> Email Address</label>
                <p className="text-gray-500 bg-gray-100 px-4 py-2.5 rounded-lg cursor-not-allowed">
                  {formData.email || 'Not set'}
                </p>
                {isEditing && <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Phone size={16}/> Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Globe size={16}/> Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                    placeholder="https://www.example.edu"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-blue-600 bg-blue-50 px-4 py-2.5 rounded-lg border border-transparent">
                    {profile?.website ? (
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {profile.website}
                      </a>
                    ) : 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" size={22}/>
              Location Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address / Place</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="place"
                    value={formData.place || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.place || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.city || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State / Province</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.state || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.country || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-transparent">{profile?.postalCode || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}