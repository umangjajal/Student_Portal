import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      <h1 className="text-4xl font-bold mb-4 text-center">
        General Student Portal
      </h1>

      <p className="text-gray-600 text-center max-w-xl mb-8">
        A centralized platform for Admins, Universities, Faculty, and Students
        to manage academics, attendance, exams, and communication.
      </p>

      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>

        <Link
          href="/auth/signup"
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
