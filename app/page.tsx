'use client';

import Link from 'next/link';
import { Stethoscope, User, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-100 ring-4 ring-pink-200/50 ring-offset-4 ring-offset-pink-50">
        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="Garbha Suraksha"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Garbha Suraksha</h1>
          <p className="text-gray-600">Smart Maternal Care Companion</p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          <Link
            href="/patient/login"
            className="block bg-white rounded-2xl p-6 shadow-lg border border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">I'm a Patient</h2>
                <p className="text-gray-600 text-sm">View your health data & appointments</p>
              </div>
              <span className="text-pink-500 text-2xl">→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/login"
            className="block bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Healthcare Provider</h2>
                <p className="text-gray-600 text-sm">Doctor or Admin</p>
              </div>
              <span className="text-blue-500 text-2xl">→</span>
            </div>
          </Link>
        </div>

        {/* Emergency */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-800 font-medium mb-2">Emergency?</p>
          <a
            href="tel:108"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors"
          >
            📞 Call 108 (Ambulance)
          </a>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="https://garbhasuraksha.com"
            className="text-sm text-gray-500 hover:text-pink-600"
          >
            ← Back to Main Website
          </a>
        </div>
      </div>
    </div>
  );
}
