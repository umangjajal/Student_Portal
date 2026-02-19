'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { AlertCircle, Check, Download, Eye } from 'lucide-react';

export default function Invoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/subscription/invoices');
      setInvoices(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      VIEWED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.DRAFT;
  };

  const totalAmount = invoices.reduce((sum, inv) => {
    if (inv.status !== 'PAID') sum += inv.totalAmount;
    return sum;
  }, 0);

  const paidAmount = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📄 Invoices & Billing History</h1>
        <p className="text-gray-600">View and download your billing documents</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Invoices */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Total Invoices</p>
          <p className="text-4xl font-bold text-blue-600">{invoices.length}</p>
        </div>

        {/* Amount Due */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Amount Due</p>
          <p className="text-4xl font-bold text-orange-600">₹{totalAmount.toLocaleString()}</p>
        </div>

        {/* Amount Paid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Amount Paid</p>
          <p className="text-4xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All Invoices</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 text-lg">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Students
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      #{invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.billingPeriod.start).toLocaleDateString('en-IN')} to{' '}
                      {new Date(invoice.billingPeriod.end).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.studentCount}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      ₹{invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-2"
                        title="View invoice details"
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Invoice #{selectedInvoice.invoiceNumber}</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                  <p className="text-lg font-bold text-gray-900">#{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${getStatusColor(
                      selectedInvoice.status
                    )}`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Billing Period</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(selectedInvoice.billingPeriod.start).toLocaleDateString('en-IN')} to{' '}
                    {new Date(selectedInvoice.billingPeriod.end).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Itemization */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Charges</h4>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Students: {selectedInvoice.studentCount}</span>
                    <span className="font-bold text-gray-900">
                      ₹{selectedInvoice.pricePerStudent.toLocaleString()}/student
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-4">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedInvoice.status === 'PAID' && selectedInvoice.paidDate && (
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Check size={24} className="text-green-600" />
                    <p className="font-bold text-green-800">Invoice Paid</p>
                  </div>
                  <p className="text-green-700">
                    Paid on {new Date(selectedInvoice.paidDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    window.print()
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={20} />
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
