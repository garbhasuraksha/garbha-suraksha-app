'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/google-auth';
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle('/patient');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
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
            <>
              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 mb-6"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or use phone number</span>
                </div>
              </div>

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
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <Link
            href="/dashboard/login"
            className="block text-sm text-gray-600 hover:text-pink-600"
          >
            Are you a Healthcare Provider? →
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
