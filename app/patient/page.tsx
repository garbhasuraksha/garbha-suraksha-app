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
  Droplets,
  Gauge,
  Plus,
  X,
  Check,
  TrendingUp,
  Thermometer,
  Scale
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
  const [showAddVitals, setShowAddVitals] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalForm, setVitalForm] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    weight: '',
    sugar_level: '',
    temperature: '',
    pulse_rate: '',
    notes: ''
  });

  useEffect(() => {
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
          temperature: 98.4,
          pulse_rate: 78,
          notes: 'Feeling good today',
          recorded_by: 'Self',
          created_at: '2026-05-25T08:30:00Z'
        },
        {
          id: '2',
          patient_id: '1',
          bp_systolic: 120,
          bp_diastolic: 78,
          weight: 61.5,
          hemoglobin: 11.2,
          sugar_level: 95,
          temperature: 98.6,
          pulse_rate: 80,
          notes: '',
          recorded_by: 'ASHA Meera',
          created_at: '2026-05-20T14:20:00Z'
        },
        {
          id: '3',
          patient_id: '1',
          bp_systolic: 116,
          bp_diastolic: 74,
          weight: 61,
          hemoglobin: 11.5,
          sugar_level: 90,
          notes: '',
          recorded_by: 'Self',
          created_at: '2026-05-15T09:00:00Z'
        }
      ];

      const sampleConsultations: Consultation[] = [
        {
          id: '1',
          patient_id: '1',
          doctor_id: 'doc1',
          scheduled_at: '2026-05-28T15:00:00Z',
          consultation_type: 'video',
          status: 'scheduled',
          meeting_link: 'https://zoom.us/j/1234567890',
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

  const handleSaveVitals = async () => {
    if (!patient) return;

    setSavingVitals(true);

    try {
      const newVital: Vital = {
        id: Date.now().toString(),
        patient_id: patient.id,
        bp_systolic: parseInt(vitalForm.bp_systolic) || 0,
        bp_diastolic: parseInt(vitalForm.bp_diastolic) || 0,
        weight: parseFloat(vitalForm.weight) || 0,
        sugar_level: parseInt(vitalForm.sugar_level) || undefined,
        temperature: parseFloat(vitalForm.temperature) || undefined,
        pulse_rate: parseInt(vitalForm.pulse_rate) || undefined,
        notes: vitalForm.notes,
        recorded_by: 'Self',
        created_at: new Date().toISOString()
      };

      // In production, save to Supabase:
      // await supabase.from('vitals').insert(newVital);

      setVitals([newVital, ...vitals]);
      setShowAddVitals(false);
      setVitalForm({
        bp_systolic: '',
        bp_diastolic: '',
        weight: '',
        sugar_level: '',
        temperature: '',
        pulse_rate: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving vitals:', error);
    } finally {
      setSavingVitals(false);
    }
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return { name: '1st Trimester', progress: (week / 13) * 33 };
    if (week <= 27) return { name: '2nd Trimester', progress: 33 + ((week - 13) / 14) * 33 };
    return { name: '3rd Trimester', progress: 66 + ((week - 27) / 13) * 34 };
  };

  const getVitalStatus = (vital: Vital) => {
    if (vital.bp_systolic > 140 || vital.bp_diastolic > 90) return { status: 'high', label: 'Needs Attention', color: 'red' };
    if (vital.bp_systolic > 130 || vital.bp_diastolic > 85) return { status: 'elevated', label: 'Elevated', color: 'yellow' };
    return { status: 'normal', label: 'Normal', color: 'green' };
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
          <p className="text-gray-600 text-lg">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-lg">Unable to load patient data</p>
          <Link href="/patient/login" className="text-pink-600 font-medium text-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-28">
      {/* Header - Larger */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">💝</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hello, {patient.name.split(' ')[0]}!</h1>
              <p className="text-base text-gray-600">Week {patient.pregnancy_week} of your journey</p>
            </div>
          </div>
          <button className="relative p-3 bg-gray-100 rounded-xl">
            <Bell className="w-7 h-7 text-gray-600" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Pregnancy Progress - Larger */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-pink-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Pregnancy Journey</h2>
                <Baby className="w-8 h-8 text-pink-500" />
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-pink-500 mb-2">Week {patient.pregnancy_week}</div>
                <p className="text-lg text-gray-600">{trimesterInfo.name}</p>
              </div>

              <div className="relative h-6 bg-pink-100 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${(patient.pregnancy_week / 40) * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-3 border-pink-500 rounded-full shadow-lg"
                  style={{ left: `calc(${(patient.pregnancy_week / 40) * 100}% - 12px)` }}
                />
              </div>

              <div className="flex justify-between text-base text-gray-500">
                <span>Week 1</span>
                <span>Week 40</span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 text-center">
                <div className="bg-pink-50 rounded-2xl p-4">
                  <p className="text-4xl font-bold text-pink-600">{40 - patient.pregnancy_week}</p>
                  <p className="text-base text-gray-600 mt-1">Weeks to go</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-4xl font-bold text-blue-600">Aug 15</p>
                  <p className="text-base text-gray-600 mt-1">Due Date</p>
                </div>
              </div>
            </div>

            {/* Quick Health Summary - Larger */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-pink-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Latest Health Check</h2>
                {latestVital && (
                  <span className={`text-base px-4 py-2 rounded-full font-medium ${
                    getVitalStatus(latestVital).color === 'green' ? 'bg-green-100 text-green-700' :
                    getVitalStatus(latestVital).color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {getVitalStatus(latestVital).label}
                  </span>
                )}
              </div>

              {latestVital && (
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-7 h-7 text-pink-500" />
                      <span className="text-base text-gray-600">Blood Pressure</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {latestVital.bp_systolic}/{latestVital.bp_diastolic}
                    </p>
                    <p className="text-base text-gray-500 mt-1">mmHg</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Droplets className="w-7 h-7 text-blue-500" />
                      <span className="text-base text-gray-600">Blood Sugar</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {latestVital.sugar_level || '--'}
                    </p>
                    <p className="text-base text-gray-500 mt-1">mg/dL</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Scale className="w-7 h-7 text-green-500" />
                      <span className="text-base text-gray-600">Weight</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {latestVital.weight}
                    </p>
                    <p className="text-base text-gray-500 mt-1">kg</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="w-7 h-7 text-purple-500" />
                      <span className="text-base text-gray-600">Pulse Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {latestVital.pulse_rate || '--'}
                    </p>
                    <p className="text-base text-gray-500 mt-1">bpm</p>
                  </div>
                </div>
              )}

              <p className="text-base text-gray-500 mt-5 text-center">
                Last recorded: {latestVital ? new Date(latestVital.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Not recorded'}
              </p>
            </div>

            {/* Add Health Reading Button - Prominent */}
            <button
              onClick={() => setShowAddVitals(true)}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg flex items-center justify-center gap-4 hover:from-pink-600 hover:to-pink-700 transition-all active:scale-[0.98]"
            >
              <Plus className="w-8 h-8" />
              <span className="text-xl font-semibold">Add Today's Health Reading</span>
            </button>

            {/* Upcoming Appointment */}
            {upcomingConsultation && (
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-7 h-7" />
                  <span className="text-lg font-medium">Upcoming Consultation</span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  {new Date(upcomingConsultation.scheduled_at).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
                <p className="text-pink-100 text-lg mb-6">
                  {new Date(upcomingConsultation.scheduled_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} with {patient.assigned_doctor}
                </p>
                <a
                  href={upcomingConsultation.meeting_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-pink-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-pink-50 transition-colors shadow-lg"
                >
                  <Video className="w-7 h-7" />
                  Join Video Call
                </a>
              </div>
            )}

            {/* Quick Actions - Larger */}
            <div className="grid grid-cols-2 gap-5">
              <a
                href={`tel:${patient.assigned_doctor === 'Dr. Anjali Mehta' ? '+919876500001' : '+919876500002'}`}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center gap-4 hover:border-green-200 transition-colors active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <span className="font-semibold text-gray-900 text-lg">Call Doctor</span>
              </a>

              <Link
                href="/patient/emergency"
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col items-center gap-4 hover:border-red-200 transition-colors active:scale-[0.98]"
              >
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <span className="font-semibold text-gray-900 text-lg">Emergency</span>
              </Link>
            </div>

            {/* Daily Tip - Larger */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-lg font-semibold text-blue-900 mb-2">💡 Today's Tip</p>
              <p className="text-blue-800 text-lg leading-relaxed">
                Week {patient.pregnancy_week}: Your baby is about the size of an ear of corn!
                Remember to drink plenty of water and get adequate rest.
              </p>
            </div>
          </div>
        )}

        {/* Vitals Tab - Enhanced */}
        {activeTab === 'vitals' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Your Health Records</h2>
              <button
                onClick={() => setShowAddVitals(true)}
                className="flex items-center gap-2 bg-pink-500 text-white px-5 py-3 rounded-xl font-medium hover:bg-pink-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New
              </button>
            </div>

            {/* Trend Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-5 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-gray-900">Your Trend</span>
              </div>
              <p className="text-gray-600">Your vitals have been stable over the past 2 weeks. Keep up the good work!</p>
            </div>

            {vitals.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Records Yet</h3>
                <p className="text-gray-600 mb-6">Start tracking your daily health readings</p>
                <button
                  onClick={() => setShowAddVitals(true)}
                  className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-xl font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Reading
                </button>
              </div>
            ) : (
              vitals.map((vital) => {
                const vitalStatus = getVitalStatus(vital);
                return (
                  <div key={vital.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(vital.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-base text-gray-500">
                          {new Date(vital.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {vital.recorded_by}
                        </p>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                        vitalStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                        vitalStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vitalStatus.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Blood Pressure</p>
                        <p className="text-xl font-bold">{vital.bp_systolic}/{vital.bp_diastolic} <span className="text-sm font-normal text-gray-500">mmHg</span></p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Weight</p>
                        <p className="text-xl font-bold">{vital.weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
                      </div>
                      {vital.sugar_level && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 mb-1">Blood Sugar</p>
                          <p className="text-xl font-bold">{vital.sugar_level} <span className="text-sm font-normal text-gray-500">mg/dL</span></p>
                        </div>
                      )}
                      {vital.pulse_rate && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 mb-1">Pulse Rate</p>
                          <p className="text-xl font-bold">{vital.pulse_rate} <span className="text-sm font-normal text-gray-500">bpm</span></p>
                        </div>
                      )}
                      {vital.temperature && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 mb-1">Temperature</p>
                          <p className="text-xl font-bold">{vital.temperature} <span className="text-sm font-normal text-gray-500">°F</span></p>
                        </div>
                      )}
                    </div>

                    {vital.notes && (
                      <div className="mt-4 bg-blue-50 rounded-xl p-4">
                        <p className="text-base text-blue-800">📝 {vital.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Appointments Tab - Larger */}
        {activeTab === 'appointments' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Appointments</h2>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200">
              <div className="flex items-center gap-2 text-pink-600 text-base font-medium mb-4">
                <Calendar className="w-5 h-5" />
                UPCOMING
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                Wednesday, 28 May 2026
              </p>
              <p className="text-lg text-gray-600 mb-5">3:00 PM - Video Consultation</p>
              <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{patient.assigned_doctor}</p>
                  <p className="text-base text-gray-500">Gynecologist</p>
                </div>
              </div>
              <a
                href="https://zoom.us/j/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-pink-500 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                <Video className="w-7 h-7" />
                Join Video Call
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-base font-medium mb-4">
                <Calendar className="w-5 h-5" />
                PAST
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">
                Saturday, 10 May 2026
              </p>
              <p className="text-lg text-gray-600 mb-4">10:00 AM - Video Consultation</p>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-base text-green-800">
                  ✓ Completed - All vitals normal. Continue prenatal vitamins.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab - Larger */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <span className="text-5xl">👩</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-lg text-gray-600">{patient.village}</p>
              <p className="text-base text-gray-500 mt-2">{patient.phone}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 divide-y divide-gray-100">
              <div className="p-5 flex justify-between items-center">
                <span className="text-lg text-gray-600">Age</span>
                <span className="text-lg font-semibold">{patient.age} years</span>
              </div>
              <div className="p-5 flex justify-between items-center">
                <span className="text-lg text-gray-600">Pregnancy Week</span>
                <span className="text-lg font-semibold">Week {patient.pregnancy_week}</span>
              </div>
              <div className="p-5 flex justify-between items-center">
                <span className="text-lg text-gray-600">Doctor</span>
                <span className="text-lg font-semibold">{patient.assigned_doctor}</span>
              </div>
              <div className="p-5 flex justify-between items-center">
                <span className="text-lg text-gray-600">Risk Level</span>
                <span className={`px-4 py-2 rounded-full text-base font-semibold ${
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
              className="w-full bg-gray-100 text-gray-700 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </main>

      {/* Add Vitals Modal */}
      {showAddVitals && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Health Reading</h3>
              <button
                onClick={() => setShowAddVitals(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Blood Pressure */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Blood Pressure <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={vitalForm.bp_systolic}
                      onChange={(e) => setVitalForm({...vitalForm, bp_systolic: e.target.value})}
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Upper (90-140)</p>
                  </div>
                  <span className="text-2xl text-gray-400">/</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={vitalForm.bp_diastolic}
                      onChange={(e) => setVitalForm({...vitalForm, bp_diastolic: e.target.value})}
                      className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Lower (60-90)</p>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 62.5"
                  value={vitalForm.weight}
                  onChange={(e) => setVitalForm({...vitalForm, weight: e.target.value})}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Blood Sugar */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 95 (fasting)"
                  value={vitalForm.sugar_level}
                  onChange={(e) => setVitalForm({...vitalForm, sugar_level: e.target.value})}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Pulse Rate */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Pulse Rate (bpm)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 75"
                  value={vitalForm.pulse_rate}
                  onChange={(e) => setVitalForm({...vitalForm, pulse_rate: e.target.value})}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 98.6"
                  value={vitalForm.temperature}
                  onChange={(e) => setVitalForm({...vitalForm, temperature: e.target.value})}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  How are you feeling?
                </label>
                <textarea
                  placeholder="Any symptoms, concerns, or notes..."
                  value={vitalForm.notes}
                  onChange={(e) => setVitalForm({...vitalForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              {/* Warning for high BP */}
              {(parseInt(vitalForm.bp_systolic) > 140 || parseInt(vitalForm.bp_diastolic) > 90) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">High Blood Pressure Detected</p>
                    <p className="text-sm text-red-700 mt-1">
                      Please contact your doctor or ASHA worker immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSaveVitals}
                disabled={savingVitals || !vitalForm.bp_systolic || !vitalForm.bp_diastolic || !vitalForm.weight}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-5 rounded-xl text-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {savingVitals ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    Save Reading
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Larger */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'vitals', icon: Activity, label: 'Vitals' },
            { id: 'appointments', icon: Calendar, label: 'Visits' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-3 px-5 rounded-2xl transition-all ${
                activeTab === tab.id ? 'text-pink-600 bg-pink-50' : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-7 h-7" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
