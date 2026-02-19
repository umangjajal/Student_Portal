'use client';
import { useEffect, useState } from 'react';
import { CreditCard, QrCode, Copy, Check, AlertCircle } from 'lucide-react';

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [copied, setCopied] = useState(false);

  // University/Admin configured UPI details
  const UPI_CONFIG = {
    upiId: 'umangjajal@oksbi', // From the image you shared
    payeeName: 'Student Portal Fees',
    bankName: 'Bank of Baroda',
    bankAccount: '1368', // From the image
  };

  // QR Code data - In production, this would be generated from UPI string
  // Format: upi://pay?pa=umangjajal@oksbi&pn=Student%20Portal&am=AMOUNT&tr=TRANSACTION_ID
  const generateUPIString = (amount) => {
    const transactionId = `SP-${Date.now()}`;
    return `upi://pay?pa=${UPI_CONFIG.upiId}&pn=StudentPortal&am=${amount}&tr=${transactionId}`;
  };

  // In real app, you'd generate QR code using a library like qrcode.react
  const generateQRCode = (amount) => {
    // Placeholder: In production, integrate qrcode library
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generateUPIString(amount))}`;
  };

  useEffect(() => {
    // Mock fees data - in production, fetch from API
    setFees([
      { _id: '1', term: 'Semester 5', amount: 25000, paid: true, dueDate: '2024-01-30' },
      { _id: '2', term: 'Semester 6', amount: 30000, paid: false, dueDate: '2024-02-28' },
      { _id: '3', term: 'Hostel (Monthly)', amount: 5000, paid: false, dueDate: '2024-02-15' }
    ]);
  }, []);

  const totalDue = fees
    .filter(f => !f.paid)
    .reduce((sum, f) => sum + f.amount, 0);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_CONFIG.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💳 Fee & Payments</h1>
        <p className="text-gray-600">Manage your fees and make payments securely</p>
      </div>

      {/* Total Due Card */}
      {totalDue > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-2">Total Amount Due</p>
              <p className="text-5xl font-bold">₹{totalDue.toLocaleString()}</p>
            </div>
            <AlertCircle size={64} className="opacity-20" />
          </div>
        </div>
      )}

      {/* Fees Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700">Term/Description</th>
              <th className="p-4 text-left font-semibold text-gray-700">Amount (₹)</th>
              <th className="p-4 text-left font-semibold text-gray-700">Due Date</th>
              <th className="p-4 text-left font-semibold text-gray-700">Status</th>
              <th className="p-4 text-center font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, idx) => (
              <tr key={fee._id || idx} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{fee.term}</td>
                <td className="p-4 font-semibold text-gray-900">₹{fee.amount.toLocaleString()}</td>
                <td className="p-4 text-gray-700">
                  {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                </td>
                <td className="p-4">
                  {fee.paid ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                      ✓ Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                      ⚠ Pending
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {!fee.paid && (
                    <button
                      onClick={() => {
                        setSelectedFee(fee);
                        setShowPaymentModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UPI Payment Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600">
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="text-blue-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
            <p className="text-gray-600">Secure UPI Payment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* UPI Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <QrCode size={24} className="text-blue-600" />
              UPI Payment Details
            </h3>

            <div className="space-y-4">
              {/* UPI ID */}
              <div>
                <label className="text-sm font-semibold text-gray-600">UPI ID</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={UPI_CONFIG.upiId}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg font-mono text-gray-900 font-semibold"
                  />
                  <button
                    onClick={copyUPI}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* Payee Name */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Payee Name</label>
                <input
                  type="text"
                  value={UPI_CONFIG.payeeName}
                  readOnly
                  className="w-full mt-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-semibold"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Bank</label>
                <input
                  type="text"
                  value={UPI_CONFIG.bankName}
                  readOnly
                  className="w-full mt-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-semibold"
                />
              </div>

              {/* Account Info */}
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Account Reference</p>
                <p className="text-lg font-mono text-blue-900 font-bold">{UPI_CONFIG.bankAccount}</p>
              </div>
            </div>
          </div>

          {/* QR Code Area */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Scan to Pay</h3>
              {selectedFee ? (
                <>
                  <img
                    src={generateQRCode(selectedFee.amount)}
                    alt="UPI QR Code"
                    className="w-64 h-64 border-4 border-purple-300 rounded-xl shadow-lg"
                  />
                  <p className="text-center mt-4 font-semibold text-gray-900">
                    Amount: ₹{selectedFee.amount.toLocaleString()}
                  </p>
                  <p className="text-center text-sm text-gray-600 mt-1">
                    {selectedFee.term}
                  </p>
                </>
              ) : (
                <div className="w-64 h-64 bg-white rounded-xl border-4 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Select a fee to pay</p>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mt-6 space-y-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Open in UPI App
              </button>
              <p className="text-xs text-center text-gray-600">
                Supported apps: Google Pay, PhonePe, Paytm, BHIM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-2">📋 Payment Instructions</h3>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>• Scan the QR code or enter the UPI ID: {UPI_CONFIG.upiId}</li>
          <li>• Enter the amount to be paid</li>
          <li>• Complete the payment and save the transaction reference</li>
          <li>• The fee status will update automatically within 24 hours</li>
        </ul>
      </div>
    </div>
  );
}
