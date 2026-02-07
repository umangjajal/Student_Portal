'use client';
import { useEffect, useState } from 'react';

export default function StudentFees() {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    // TODO: fetch fees details
    setFees([
      { term: 'Semester 5', amount: 25000, paid: true },
      { term: 'Semester 6', amount: 30000, paid: false }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Fees</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Term</th>
              <th className="p-4 text-left">Amount (₹)</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-4">{f.term}</td>
                <td className="p-4">{f.amount}</td>
                <td className="p-4">
                  {f.paid ? (
                    <span className="text-green-600 font-semibold">
                      Paid
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Pay Now
      </button>
    </div>
  );
}
