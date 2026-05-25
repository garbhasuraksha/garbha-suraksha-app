'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/google-auth';
import Link from 'next/link';
import { Stethoscope, Shield } from 'lucide-react';

type Role = 'doctor' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'doctor' as Role, label: 'Doctor', icon: Stethoscope, color: 'pink' },
    { id: 'admin' as Role, label: 'Admin', icon: Shield, color: 'purple' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store user info
      if (data.user) {
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('userEmail', data.user.email || '');
        localStorage.setItem('userId', data.user.id);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      // User will be redirected to Google, then back to dashboard
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
            <img src="/logo.png" alt="Garbha Suraksha" className="w-20 h-20 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Garbha Suraksha</h1>
              <p className="text-gray-600">Healthcare Portal</p>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Login as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedRole === 'doctor'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm font-medium">Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => { console.log('Admin clicked'); setSelectedRole('admin'); }}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button (Doctors only) */}
          {selectedRole === 'doctor' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Sign in with Google'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={
                  selectedRole === 'doctor' ? 'doctor@example.com' : 'admin@example.com'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                selectedRole === 'doctor'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                `Sign In as ${roles.find(r => r.id === selectedRole)?.label}`
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              New doctor?{' '}
              <Link href="/dashboard/register" className="text-pink-600 hover:text-pink-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <Link
            href="/patient/login"
            className="block text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Are you a Patient? Login here →
          </Link>
          <Link href="/" className="block text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
// Force redeploy Sat May 23 21:25:18 IST 2026
