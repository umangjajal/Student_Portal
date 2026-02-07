'use client';
import { useEffect, useState } from 'react';

export default function StudentDocuments() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // TODO: fetch documents
    setDocuments([
      { name: 'ID Card', available: true },
      { name: 'Marksheet', available: true },
      { name: 'Bonafide Certificate', available: false }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Documents</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between"
          >
            <h2 className="text-lg font-semibold">{doc.name}</h2>

            {doc.available ? (
              <button className="mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Download
              </button>
            ) : (
              <p className="mt-4 text-red-500 text-sm">
                Not Available
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
