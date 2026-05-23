'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Patient, Vital, Consultation } from '@/lib/supabase';
import {
  ArrowLeft,
  Phone,
  Video,
  Calendar,
  Activity,
  AlertCircle,
  TrendingUp,
  User,
  MapPin,
  Clock,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function PatientDetail() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeTab, setActiveTab] = useState<'vitals' | 'consultations' | 'history'>('vitals');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [params.id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);

      // Fetch patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (patientError) throw patientError;

      // Use sample data for demo
      const samplePatient: Patient = {
        id: params.id as string,
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
          patient_id: params.id as string,
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
          patient_id: params.id as string,
          bp_systolic: 120,
          bp_diastolic: 78,
          weight: 61.5,
          hemoglobin: 11.2,
          sugar_level: 95,
          notes: 'Slight increase in BP, monitoring',
          recorded_by: 'ASHA Meera',
          created_at: '2026-05-10T14:20:00Z'
        }
      ];

      const sampleConsultations: Consultation[] = [
        {
          id: '1',
          patient_id: params.id as string,
          doctor_id: 'doc1',
          scheduled_at: '2026-05-20T15:00:00Z',
          consultation_type: 'video',
          status: 'scheduled',
          meeting_link: 'https://zoom.us/j/1234567890',
          notes: '',
          created_at: '2026-05-15T10:00:00Z'
        },
        {
          id: '2',
          patient_id: params.id as string,
          doctor_id: 'doc1',
          scheduled_at: '2026-05-10T10:00:00Z',
          consultation_type: 'video',
          status: 'completed',
          notes: 'Routine checkup. All vitals normal. Continue prenatal vitamins.',
          prescription: 'Folic acid 5mg - Once daily\nIron supplement - Once daily',
          follow_up_date: '2026-05-24',
          created_at: '2026-05-05T10:00:00Z'
        }
      ];

      setPatient(samplePatient);
      setVitals(sampleVitals);
      setConsultations(sampleConsultations);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return '1st Trimester';
    if (week <= 27) return '2nd Trimester';
    return '3rd Trimester';
  };

  const getVitalStatus = (type: string, value: number) => {
    if (type === 'bp_systolic') {
      if (value < 90 || value > 140) return 'text-red-600';
      if (value > 120) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (type === 'bp_diastolic') {
      if (value < 60 || value > 90) return 'text-red-600';
      if (value > 80) return 'text-yellow-600';
      return 'text-green-600';
    }
    if (type === 'sugar') {
      if (value > 140 || value < 70) return 'text-red-600';
      if (value > 120) return 'text-yellow-600';
      return 'text-green-600';
    }
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Patient not found</p>
          <Link
            href="/dashboard"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Details</h1>
                <p className="text-sm text-gray-600">{patient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${patient.phone}`}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2">
                <Video className="w-4 h-4" />
                Start Consult
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Overview Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-semibold text-gray-900">{patient.name}</p>
                <p className="text-sm text-gray-500">{patient.age} years</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pregnancy</p>
                <p className="font-semibold text-gray-900">Week {patient.pregnancy_week}</p>
                <p className="text-sm text-gray-500">{getTrimester(patient.pregnancy_week)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getRiskColor(patient.risk_level)}`}>
                  {patient.risk_level.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{patient.village}</p>
                <p className="text-sm text-gray-500">{patient.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'vitals'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Vitals
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'consultations'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Video className="w-4 h-4 inline mr-2" />
              Consultations
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'vitals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Vitals</h3>
                <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Reading
                </button>
              </div>

              <div className="space-y-4">
                {vitals.map((vital) => (
                  <div key={vital.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {new Date(vital.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <span className="text-sm text-gray-500">By {vital.recorded_by}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Blood Pressure</p>
                        <p className={`text-lg font-semibold ${getVitalStatus('bp_systolic', vital.bp_systolic)}`}>
                          {vital.bp_systolic}/{vital.bp_diastolic}
                        </p>
                        <p className="text-xs text-gray-500">mmHg</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Sugar Level</p>
                        <p className={`text-lg font-semibold ${getVitalStatus('sugar', vital.sugar_level || 0)}`}>
                          {vital.sugar_level}
                        </p>
                        <p className="text-xs text-gray-500">mg/dL</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Hemoglobin</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {vital.hemoglobin}
                        </p>
                        <p className="text-xs text-gray-500">g/dL</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Weight</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {vital.weight}
                        </p>
                        <p className="text-xs text-gray-500">kg</p>
                      </div>
                    </div>

                    {vital.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{vital.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Consultations</h3>
                <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule Consult
                </button>
              </div>

              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-pink-500" />
                          <span className="font-semibold text-gray-900">
                            {new Date(consultation.scheduled_at).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            consultation.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : consultation.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {consultation.status.toUpperCase()}
                        </span>
                      </div>
                      {consultation.status === 'scheduled' && consultation.meeting_link && (
                        <a
                          href={consultation.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Join Meeting
                        </a>
                      )}
                    </div>

                    {consultation.notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{consultation.notes}</p>
                      </div>
                    )}

                    {consultation.prescription && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-blue-900 mb-2">Prescription:</p>
                        <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans">
                          {consultation.prescription}
                        </pre>
                      </div>
                    )}

                    {consultation.follow_up_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        Follow-up: {new Date(consultation.follow_up_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Medical History</h3>
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No medical history recorded yet</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
