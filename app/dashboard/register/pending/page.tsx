'use client';

import Link from 'next/link';
import { Clock, Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function RegistrationPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>

          <p className="text-gray-600 mb-8">
            Thank you for registering with Garbha Suraksha. Your application is now under review.
          </p>

          {/* Status Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Verification Pending</span>
            </div>
            <p className="text-sm text-yellow-700">
              Our team will verify your credentials within <strong>2-3 business days</strong>.
            </p>
          </div>

          {/* What's Next */}
          <div className="text-left space-y-4 mb-8">
            <h2 className="font-semibold text-gray-900">What happens next?</h2>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-600 text-sm font-medium">1</span>
              </div>
              <p className="text-sm text-gray-600">
                Our verification team will review your documents and credentials
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-600 text-sm font-medium">2</span>
              </div>
              <p className="text-sm text-gray-600">
                You'll receive an email notification once verified
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-600 text-sm font-medium">3</span>
              </div>
              <p className="text-sm text-gray-600">
                After approval, you can log in and start seeing patients
              </p>
            </div>
          </div>

          {/* Email Notification */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Mail className="w-4 h-4" />
            <span>Check your email for updates</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/dashboard/login"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-medium"
            >
              Go to Login
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/"
              className="block w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Support */}
        <p className="text-sm text-gray-500 mt-6">
          Questions? Contact us at{' '}
          <a href="mailto:support@garbhasuraksha.com" className="text-pink-600 hover:text-pink-700">
            support@garbhasuraksha.com
          </a>
        </p>
      </div>
    </div>
  );
}
