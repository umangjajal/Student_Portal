'use client';
import { useState } from 'react';

export default function AdminPricing() {
  const [price, setPrice] = useState(100);

  const updatePrice = () => {
    // TODO: API call
    alert(`Price updated to ₹${price} per student/year`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Pricing Control</h1>

      <div className="bg-white rounded-2xl shadow p-6 max-w-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price per Student (Yearly)
        </label>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          onClick={updatePrice}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Update Pricing
        </button>
      </div>

      <p className="mt-6 text-gray-600 max-w-xl">
        This pricing is applied per student per year for all universities
        registered on the platform.
      </p>
    </div>
  );
}
