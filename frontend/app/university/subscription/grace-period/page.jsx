'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import {
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Upload,
  Download,
  TrendingUp,
  Mail,
  Calendar,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function GracePeriodDashboard() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', rollNumber: '' });
  const [csvFile, setCsvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [progress, setProgress] = useState({
    studentProgress: 0,
    facultyProgress: 0,
    paymentStatus: 'PENDING'
  });

  useEffect(() => {
    fetchGracePeriodData();
    const interval = setInterval(fetchGracePeriodData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchGracePeriodData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription/status/grace-period');
      setSubscription(res.data.subscription);
      setProgress({
        studentProgress: res.data.userCounts.studentCount,
        facultyProgress: res.data.userCounts.facultyCount,
        paymentStatus: res.data.subscription.paymentStatus
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load grace period data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/student/create', studentForm);
      setImportSuccess('Student added successfully!');
      setStudentForm({ name: '', email: '', rollNumber: '' });
      setTimeout(() => {
        setShowAddStudentModal(false);
        setImportSuccess('');
        fetchGracePeriodData();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImportCSV = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await api.post('/csv/import-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportSuccess(`Successfully imported ${res.data.importedCount} students!`);
      setCsvFile(null);
      setTimeout(() => {
        setShowBulkImportModal(false);
        setImportSuccess('');
        fetchGracePeriodData();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading grace period dashboard...</p>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.gracePeriodDaysRemaining === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/university/subscription" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-2">
            ← Back to Subscription
          </Link>
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-200 text-lg">You are not in the grace period.</p>
            <p className="text-red-300 text-sm mt-2">Your subscription is either not yet accepted or already finalized.</p>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = subscription.gracePeriodDaysRemaining;
  const isUrgent = daysRemaining <= 2;
  const totalCharge = progress.studentProgress * 500 + progress.facultyProgress * 300; // Example rates

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/university/subscription" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
            ← Back to Subscription
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            ⏳ Grace Period Dashboard
          </h1>
          <p className="text-slate-300">Complete your setup and payment within the grace period</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Critical Alert - Last Days */}
        {isUrgent && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl border border-red-400/50 shadow-lg">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🚨 URGENT: {daysRemaining} Day{daysRemaining !== 1 ? 's' : ''} Remaining!</h3>
                <p className="text-white/90 mb-4">
                  Your grace period expires on <strong>{new Date(subscription.gracePeriodEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. Complete all tasks immediately.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-white/80">Deadline Date</p>
                    <p className="font-bold text-white">{new Date(subscription.gracePeriodEndDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-white/80">Amount Due</p>
                    <p className="font-bold text-white">₹{totalCharge.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-white/80">Status</p>
                    <p className="font-bold text-white">{subscription.paymentStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Grace Period Countdown */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl p-6 border shadow-lg ${
              isUrgent
                ? 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50'
                : 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/50'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <Clock className={`w-8 h-8 ${isUrgent ? 'text-orange-400' : 'text-blue-400'}`} />
                <h2 className="text-xl font-bold text-white">Time Remaining</h2>
              </div>

              <div className="text-center py-6">
                <div className={`text-6xl font-bold mb-2 ${isUrgent ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {daysRemaining}
                </div>
                <p className="text-slate-300 text-lg">Day{daysRemaining !== 1 ? 's' : ''}</p>
              </div>

              <div className="space-y-3 mt-6 pt-6 border-t border-slate-600">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Grace Period End</span>
                  <span className="text-white font-semibold">
                    {new Date(subscription.gracePeriodEndDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-blue-300 font-semibold">{subscription.planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className="px-3 py-1 bg-green-500/30 text-green-300 rounded-full text-xs font-semibold">
                    GRACE PERIOD
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-slate-600">
                <p className="text-xs text-slate-400 mb-3">Overall Progress</p>
                <div className="space-y-3">
                  {/* Users Added */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Users Added</span>
                      <span className="text-cyan-400 font-bold">{progress.studentProgress + progress.facultyProgress}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{width: '45%'}}></div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Payment Status</span>
                      <span className={`font-bold ${progress.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {progress.paymentStatus}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${progress.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: progress.paymentStatus === 'PAID' ? '100%' : '20%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Checklist */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <Target className="w-8 h-8 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Setup Checklist</h2>
              </div>

              <div className="space-y-4">
                {/* Task 1: Add Students */}
                <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-slate-500 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        progress.studentProgress > 0 ? 'bg-green-500' : 'bg-slate-600'
                      }`}>
                        {progress.studentProgress > 0 && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Add Students</h3>
                        <p className="text-slate-400 text-sm">{progress.studentProgress} students added</p>
                      </div>
                    </div>
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex gap-2 ml-9">
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                    >
                      Add Single
                    </button>
                    <button
                      onClick={() => setShowBulkImportModal(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition"
                    >
                      Bulk Import
                    </button>
                  </div>
                </div>

                {/* Task 2: Add Faculty */}
                <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-slate-500 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        progress.facultyProgress > 0 ? 'bg-green-500' : 'bg-slate-600'
                      }`}>
                        {progress.facultyProgress > 0 && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Add Faculty</h3>
                        <p className="text-slate-400 text-sm">{progress.facultyProgress} faculty members added</p>
                      </div>
                    </div>
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-9">
                    <Link href="/university/faculty" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition inline-block">
                      Manage Faculty
                    </Link>
                  </div>
                </div>

                {/* Task 3: Make Payment */}
                <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-slate-500 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        progress.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-slate-600'
                      }`}>
                        {progress.paymentStatus === 'PAID' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Complete Payment</h3>
                        <p className="text-slate-400 text-sm">Amount due: ₹{totalCharge.toLocaleString()}</p>
                      </div>
                    </div>
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="ml-9">
                    <Link href="/university/subscription" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition inline-block">
                      Go to Payment
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Students</p>
            <p className="text-3xl font-bold text-blue-400">{progress.studentProgress}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-green-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Faculty</p>
            <p className="text-3xl font-bold text-green-400">{progress.facultyProgress}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-purple-400">{progress.studentProgress + progress.facultyProgress}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-yellow-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Amount Due</p>
            <p className="text-3xl font-bold text-yellow-400">₹{totalCharge.toLocaleString()}</p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Grace Period:</strong> You have {daysRemaining} days to add all students/faculty and complete payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Real-time Calculation:</strong> Your monthly charges are automatically calculated based on total enrolled users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Deadline:</strong> Payment must be completed by {new Date(subscription.gracePeriodEndDate).toLocaleDateString()}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Overdue Status:</strong> After the deadline, your subscription will be marked as OVERDUE if payment is not completed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>Support:</strong> Contact our support team if you have any questions or need an extension</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
            <div className="bg-blue-600 -m-px rounded-t-2xl p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add Student</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-white hover:opacity-80 text-2xl"
              >
                ✕
              </button>
            </div>

            {importSuccess && (
              <div className="m-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                {importSuccess}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Student Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Roll Number</label>
                <input
                  type="text"
                  value={studentForm.rollNumber}
                  onChange={(e) => setStudentForm({...studentForm, rollNumber: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="A12345"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-2 rounded-lg transition"
                >
                  {submitting ? 'Adding...' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
            <div className="bg-cyan-600 -m-px rounded-t-2xl p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Bulk Import Students</h3>
              <button
                onClick={() => setShowBulkImportModal(false)}
                className="text-white hover:opacity-80 text-2xl"
              >
                ✕
              </button>
            </div>

            {importSuccess && (
              <div className="m-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                {importSuccess}
              </div>
            )}

            <form onSubmit={handleBulkImportCSV} className="p-6 space-y-4">
              <div className="bg-slate-700/50 border border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <label className="cursor-pointer">
                  <p className="text-white font-semibold mb-1">Click to select CSV file</p>
                  <p className="text-sm text-slate-400 mb-4">or drag and drop</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {csvFile && (
                  <p className="text-cyan-400 text-sm font-semibold">{csvFile.name}</p>
                )}
              </div>

              <div>
                <a href="/STUDENT_CSV_TEMPLATE.csv" download className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </a>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !csvFile}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-bold py-2 rounded-lg transition"
                >
                  {submitting ? 'Importing...' : 'Import'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
