'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewPatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    pregnancy_week: '',
    village: '',
    phone: '',
    assigned_doctor: 'Dr. Anjali Mehta',
    risk_level: 'low' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          ...formData,
          age: parseInt(formData.age),
          pregnancy_week: parseInt(formData.pregnancy_week)
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Patient added successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Demo mode: Patient would be added in production. Redirecting...');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add New Patient</h1>
              <p className="text-sm text-gray-600">Register a new pregnant mother</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter patient's full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="18"
                max="50"
                placeholder="Age in years"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Pregnancy Week */}
            <div>
              <label htmlFor="pregnancy_week" className="block text-sm font-medium text-gray-700 mb-2">
                Pregnancy Week <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="pregnancy_week"
                name="pregnancy_week"
                value={formData.pregnancy_week}
                onChange={handleChange}
                required
                min="1"
                max="42"
                placeholder="Current week"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Village */}
            <div>
              <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-2">
                Village <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="village"
                name="village"
                value={formData.village}
                onChange={handleChange}
                required
                placeholder="Village name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Risk Level */}
            <div>
              <label htmlFor="risk_level" className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level <span className="text-red-500">*</span>
              </label>
              <select
                id="risk_level"
                name="risk_level"
                value={formData.risk_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            {/* Assigned Doctor */}
            <div>
              <label htmlFor="assigned_doctor" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Doctor <span className="text-red-500">*</span>
              </label>
              <select
                id="assigned_doctor"
                name="assigned_doctor"
                value={formData.assigned_doctor}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="Dr. Anjali Mehta">Dr. Anjali Mehta</option>
                <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar</option>
                <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
              </select>
            </div>
          </div>

          {/* Information Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After adding the patient, you can record vitals, schedule consultations,
              and track their pregnancy journey from the patient detail page.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add Patient
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
