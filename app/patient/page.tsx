'use client';

import { useState, useEffect } from 'react';
import { supabase, Patient, Vital, Consultation } from '@/lib/supabase';
import {
  Home,
  Activity,
  Calendar,
  User,
  Bell,
  Phone,
  Video,
  Heart,
  Baby,
  AlertCircle,
  ChevronRight,
  Droplets,
  Gauge
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientPortal() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'vitals' | 'appointments' | 'profile'>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if logged in
    const phone = localStorage.getItem('patientPhone');
    if (!phone) {
      router.push('/patient/login');
      return;
    }
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // For demo, use sample data
      const samplePatient: Patient = {
        id: '1',
        name: 'Priya Sharma',
        age: 26,
        pregnancy_week: 24,
        village: 'Rampur',
        risk_level: 'low',
        assigned_doctor: 'Dr. Anjali Mehta',
        phone: '+91 98765 43210',
        created_at: new Date().toISOString(),
        last_checkup: '2026-05-15'
      };

      const sampleVitals: Vital[] = [
        {
          id: '1',
          patient_id: '1',
          bp_systolic: 118,
          bp_diastolic: 76,
          weight: 62,
          hemoglobin: 11.5,
          sugar_level: 92,
          notes: 'All readings normal',
          recorded_by: 'ASHA Meera',
          created_at: '2026-05-15T10:30:00Z'
        },
        {
          id: '2',
          patient_id: '1',
          bp_systolic: 120,
          bp_diastolic: 78,
          weight: 61.5,
          hemoglobin: 11.2,
          sugar_level: 95,
          notes: '',
          recorded_by: 'ASHA Meera',
          created_at: '2026-05-10T14:20:00Z'
        }
      ];

      const sampleConsultations: Consultation[] = [
        {
          id: '1',
          patient_id: '1',
          doctor_id: 'doc1',
          scheduled_at: '2026-05-20T15:00:00Z',
          status: 'scheduled',
          zoom_link: 'https://zoom.us/j/1234567890',
          notes: '',
          created_at: '2026-05-15T10:00:00Z'
        }
      ];

      setPatient(samplePatient);
      setVitals(sampleVitals);
      setConsultations(sampleConsultations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return { name: '1st Trimester', progress: (week / 13) * 33 };
    if (week <= 27) return { name: '2nd Trimester', progress: 33 + ((week - 13) / 14) * 33 };
    return { name: '3rd Trimester', progress: 66 + ((week - 27) / 13) * 34 };
  };

  const handleLogout = () => {
    localStorage.removeItem('patientPhone');
    router.push('/patient/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load patient data</p>
          <Link href="/patient/login" className="text-pink-600 font-medium">
            Try logging in again
          </Link>
        </div>
      </div>
    );
  }

  const trimesterInfo = getTrimester(patient.pregnancy_week);
  const latestVital = vitals[0];
  const upcomingConsultation = consultations.find(c => c.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💝</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Hello, {patient.name.split(' ')[0]}!</h1>
              <p className="text-xs text-gray-600">Week {patient.pregnancy_week} of your journey</p>
            </div>
          </div>
          <button className="relative p-2">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Pregnancy Progress */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Your Pregnancy Journey</h2>
                <Baby className="w-6 h-6 text-pink-500" />
              </div>

              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-pink-500 mb-1">Week {patient.pregnancy_week}</div>
                <p className="text-gray-600">{trimesterInfo.name}</p>
              </div>

              <div className="relative h-4 bg-pink-100 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(patient.pregnancy_week / 40) * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-pink-500 rounded-full shadow"
                  style={{ left: `calc(${(patient.pregnancy_week / 40) * 100}% - 8px)` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Week 1</span>
                <span>Week 40</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{40 - patient.pregnancy_week}</p>
                  <p className="text-xs text-gray-600">Weeks to go</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Aug 15</p>
                  <p className="text-xs text-gray-600">Due Date</p>
                </div>
              </div>
            </div>

            {/* Quick Health Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Latest Health Check</h2>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  All Normal
                </span>
              </div>

              {latestVital && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <span className="text-sm text-gray-600">Blood Pressure</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestVital.bp_systolic}/{latestVital.bp_diastolic}
                    </p>
                    <p className="text-xs text-gray-500">mmHg</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Blood Sugar</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestVital.sugar_level}
                    </p>
                    <p className="text-xs text-gray-500">mg/dL</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Hemoglobin</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestVital.hemoglobin}
                    </p>
                    <p className="text-xs text-gray-500">g/dL</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">Weight</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {latestVital.weight}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                Last checked: {latestVital ? new Date(latestVital.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                }) : 'Not recorded'}
              </p>
            </div>

            {/* Upcoming Appointment */}
            {upcomingConsultation && (
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Upcoming Consultation</span>
                </div>
                <p className="text-2xl font-bold mb-1">
                  {new Date(upcomingConsultation.scheduled_at).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
                <p className="text-pink-100 mb-4">
                  {new Date(upcomingConsultation.scheduled_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} with {patient.assigned_doctor}
                </p>
                <a
                  href={upcomingConsultation.zoom_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
                >
                  <Video className="w-5 h-5" />
                  Join Video Call
                </a>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`tel:${patient.assigned_doctor === 'Dr. Anjali Mehta' ? '+919876500001' : '+919876500002'}`}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:border-pink-200 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-medium text-gray-900 text-sm">Call Doctor</span>
              </a>

              <Link
                href="/patient/emergency"
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:border-red-200 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="font-medium text-gray-900 text-sm">Emergency</span>
              </Link>
            </div>

            {/* Daily Tip */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-sm font-medium text-blue-900 mb-1">💡 Today's Tip</p>
              <p className="text-blue-800">
                Week {patient.pregnancy_week}: Your baby is about the size of an ear of corn!
                Remember to drink plenty of water and get adequate rest.
              </p>
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Health Records</h2>

            {vitals.map((vital) => (
              <div key={vital.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(vital.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Recorded by {vital.recorded_by}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Normal
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Blood Pressure</p>
                    <p className="font-semibold">{vital.bp_systolic}/{vital.bp_diastolic} mmHg</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Blood Sugar</p>
                    <p className="font-semibold">{vital.sugar_level} mg/dL</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Hemoglobin</p>
                    <p className="font-semibold">{vital.hemoglobin} g/dL</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="font-semibold">{vital.weight} kg</p>
                  </div>
                </div>

                {vital.notes && (
                  <p className="mt-3 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                    📝 {vital.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Appointments</h2>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-200">
              <div className="flex items-center gap-2 text-pink-600 text-sm font-medium mb-3">
                <Calendar className="w-4 h-4" />
                UPCOMING
              </div>
              <p className="text-xl font-bold text-gray-900 mb-1">
                Tuesday, 20 May 2026
              </p>
              <p className="text-gray-600 mb-4">3:00 PM - Video Consultation</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{patient.assigned_doctor}</p>
                  <p className="text-sm text-gray-500">Gynecologist</p>
                </div>
              </div>
              <a
                href="https://zoom.us/j/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
              >
                <Video className="w-5 h-5" />
                Join Video Call
              </a>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-3">
                <Calendar className="w-4 h-4" />
                PAST
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">
                Saturday, 10 May 2026
              </p>
              <p className="text-gray-600 mb-3">10:00 AM - Video Consultation</p>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ Completed - All vitals normal. Continue prenatal vitamins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👩</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">{patient.village}</p>
              <p className="text-sm text-gray-500 mt-1">{patient.phone}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              <div className="p-4 flex justify-between items-center">
                <span className="text-gray-600">Age</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-gray-600">Pregnancy Week</span>
                <span className="font-medium">Week {patient.pregnancy_week}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-gray-600">Doctor</span>
                <span className="font-medium">{patient.assigned_doctor}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-gray-600">Risk Level</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  patient.risk_level === 'low' ? 'bg-green-100 text-green-700' :
                  patient.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {patient.risk_level.charAt(0).toUpperCase() + patient.risk_level.slice(1)}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              activeTab === 'home' ? 'text-pink-600 bg-pink-50' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              activeTab === 'vitals' ? 'text-pink-600 bg-pink-50' : 'text-gray-500'
            }`}
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Vitals</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              activeTab === 'appointments' ? 'text-pink-600 bg-pink-50' : 'text-gray-500'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Visits</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              activeTab === 'profile' ? 'text-pink-600 bg-pink-50' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
