'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PatientLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any phone number
    setStep('otp');
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any 4-digit OTP
    if (otp.length === 4) {
      // Store phone in localStorage for demo
      localStorage.setItem('patientPhone', phone);
      router.push('/patient');
    } else {
      setError('Please enter a 4-digit OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 mb-2">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl">💝</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Garbha Suraksha</h1>
              <p className="text-gray-600">Mother's Health Portal</p>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {step === 'phone' ? 'Welcome, Mother!' : 'Enter OTP'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {step === 'phone'
              ? 'Enter your registered phone number'
              : `We sent a code to ${phone}`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-lg">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    placeholder="98765 43210"
                    className="w-full px-4 py-4 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </span>
                ) : (
                  'Get OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 4-digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  placeholder="● ● ● ●"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-2xl text-center tracking-[1em] font-mono"
                  maxLength={4}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Login'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-pink-600 py-2 font-medium hover:text-pink-700"
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Demo: Enter any 10-digit phone and 4-digit OTP
            </p>
            <p className="text-xs text-gray-500">
              Example: 9876543210 → OTP: 1234
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <Link
            href="/dashboard/login"
            className="block text-sm text-gray-600 hover:text-pink-600"
          >
            Are you a Doctor or ASHA Worker? →
          </Link>
          <Link href="/" className="block text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
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
      </div>
    </div>
  );
}
