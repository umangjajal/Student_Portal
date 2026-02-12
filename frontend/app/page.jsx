import Link from "next/link";
import { CheckCircle, Users, BookOpen, BarChart3, Clock, Shield } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Multi-Role Management",
      description: "Seamlessly manage students, faculty, universities, and admins in one platform"
    },
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description: "Track courses, assignments, exams, and academic progress in real-time"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights into attendance, performance, and academic trends"
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Instant notifications for announcements, events, and important updates"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control"
    },
    {
      icon: CheckCircle,
      title: "Easy Integration",
      description: "Seamlessly integrate with your existing university infrastructure"
    }
  ];

  const stats = [
    { number: "500+", label: "Institutions" },
    { number: "50K+", label: "Active Students" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const useCases = [
    {
      role: "Students",
      benefits: ["View grades and attendance", "Submit assignments online", "Check exam schedules", "Communicate with faculty"],
      color: "from-blue-500 to-blue-600"
    },
    {
      role: "Faculty",
      benefits: ["Manage classes and grades", "Track student attendance", "Create and assign work", "Monitor academic progress"],
      color: "from-purple-500 to-purple-600"
    },
    {
      role: "Universities",
      benefits: ["Manage all departments", "Create notifications", "Track analytics", "Generate reports"],
      color: "from-green-500 to-green-600"
    },
    {
      role: "Admins",
      benefits: ["System administration", "User management", "Access control", "System monitoring"],
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                    🚀 Modern Education Platform
                  </span>
                  <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Revolutionize Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Education</span>
                  </h2>
                </div>
                <p className="text-xl text-gray-600">
                  Empower students, faculty, and administrators with an all-in-one platform designed for modern education. Streamline academic management, boost engagement, and transform the way institutions operate.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/auth/signup"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105 font-semibold"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="#features"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Learn More
                  </Link>
                </div>
                <div className="flex items-center gap-8 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">500+</div>
                    <p className="text-gray-600">Active Institutions</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">50K+</div>
                    <p className="text-gray-600">Active Users</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pink-600">99.9%</div>
                    <p className="text-gray-600">Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Illustration Placeholder */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl h-96 flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-xl font-semibold">Educational Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to modernize education</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition border border-gray-200"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Everyone</h2>
            <p className="text-xl text-gray-600">Designed with all stakeholders in mind</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${useCase.color} rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition`}
              >
                <h3 className="text-2xl font-bold mb-6">{useCase.role}</h3>
                <ul className="space-y-3">
                  {useCase.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account as student, faculty, or university" },
              { step: "2", title: "Setup", desc: "Configure your profile and preferences" },
              { step: "3", title: "Connect", desc: "Connect with your institution or students" },
              { step: "4", title: "Explore", desc: "Start using all the powerful features" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full border-t-2 border-dashed border-blue-300 -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Education?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of institutions already using our platform to deliver better education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">SP</span>
                </div>
                <h3 className="text-white font-bold">Student Portal</h3>
              </div>
              <p className="text-sm">Modern education management platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 General Student Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
