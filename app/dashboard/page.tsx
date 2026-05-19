'use client';

import { useState, useEffect } from 'react';
import { supabase, Patient } from '@/lib/supabase';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Plus,
  Search,
  Video,
  FileText,
  Phone,
  Stethoscope,
  Settings,
  LogOut,
  UserCog
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  patients_count: number;
  status: 'active' | 'inactive';
}

export default function Dashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userRole, setUserRole] = useState<string>('doctor');
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors' | 'settings'>('patients');
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    dueThisWeek: 0,
    consultationsToday: 0,
    totalDoctors: 0,
    totalAshaWorkers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'doctor';
    const email = localStorage.getItem('userEmail') || '';
    setUserRole(role);
    setUserEmail(email);
    fetchPatients();
    if (role === 'admin') {
      fetchDoctors();
    }
  }, []);

  const fetchDoctors = async () => {
    // Sample doctors data
    const sampleDoctors: Doctor[] = [
      { id: '1', name: 'Dr. Anjali Mehta', email: 'anjali@garbhasuraksha.com', specialization: 'Gynecologist', patients_count: 24, status: 'active' },
      { id: '2', name: 'Dr. Rajesh Kumar', email: 'rajesh@garbhasuraksha.com', specialization: 'Obstetrician', patients_count: 18, status: 'active' },
      { id: '3', name: 'Dr. Priya Sharma', email: 'priya@garbhasuraksha.com', specialization: 'Gynecologist', patients_count: 12, status: 'active' },
    ];
    setDoctors(sampleDoctors);
    setStats(prev => ({ ...prev, totalDoctors: 3, totalAshaWorkers: 8 }));
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const patientData = data || [];
      setPatients(patientData);
      setStats(prev => ({
        ...prev,
        total: patientData.length,
        highRisk: patientData.filter((p: Patient) => p.risk_level === 'high').length,
        dueThisWeek: patientData.filter((p: Patient) => p.pregnancy_week >= 37).length,
        consultationsToday: 2
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      const samplePatients: Patient[] = [
        { id: '1', name: 'Priya Sharma', age: 26, pregnancy_week: 24, village: 'Rampur', risk_level: 'low', assigned_doctor: 'Dr. Anjali Mehta', phone: '+91 98765 43210', created_at: new Date().toISOString(), last_checkup: '2026-05-15' },
        { id: '2', name: 'Sunita Devi', age: 32, pregnancy_week: 16, village: 'Shivpur', risk_level: 'high', assigned_doctor: 'Dr. Anjali Mehta', phone: '+91 98765 43211', created_at: new Date().toISOString(), last_checkup: '2026-05-10' },
        { id: '3', name: 'Meera Patel', age: 28, pregnancy_week: 32, village: 'Laxmipur', risk_level: 'medium', assigned_doctor: 'Dr. Rajesh Kumar', phone: '+91 98765 43212', created_at: new Date().toISOString(), last_checkup: '2026-05-12' },
        { id: '4', name: 'Kavita Singh', age: 24, pregnancy_week: 38, village: 'Rampur', risk_level: 'low', assigned_doctor: 'Dr. Anjali Mehta', phone: '+91 98765 43213', created_at: new Date().toISOString(), last_checkup: '2026-05-17' }
      ];
      setPatients(samplePatients);
      setStats(prev => ({ ...prev, total: 4, highRisk: 1, dueThisWeek: 1, consultationsToday: 2 }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/dashboard/login');
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRisk === 'all' || patient.risk_level === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskDot = (risk: string) => {
    switch (risk) { case 'high': return 'bg-red-500'; case 'medium': return 'bg-yellow-500'; case 'low': return 'bg-green-500'; default: return 'bg-gray-500'; }
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return '1st Trimester';
    if (week <= 27) return '2nd Trimester';
    return '3rd Trimester';
  };

  const isAdmin = userRole === 'admin';
  const displayName = isAdmin ? 'Admin' : userRole === 'asha' ? 'ASHA Worker' : 'Dr. Anjali Mehta';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Garbha Suraksha" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Garbha Suraksha</h1>
                <p className="text-sm text-gray-600">{isAdmin ? 'Admin Dashboard' : 'Care Dashboard'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900"><span className="text-2xl">🔔</span></button>
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <div className={`w-8 h-8 ${isAdmin ? 'bg-purple-500' : 'bg-pink-500'} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                  {isAdmin ? 'A' : 'AM'}
                </div>
                <span className="text-sm font-medium">{displayName}</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Tabs */}
        {isAdmin && (
          <div className="mb-6 flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100 w-fit">
            <button onClick={() => setActiveTab('patients')} className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'patients' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Users className="w-4 h-4 inline mr-2" />Patients
            </button>
            <button onClick={() => setActiveTab('doctors')} className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'doctors' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Stethoscope className="w-4 h-4 inline mr-2" />Doctors
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Settings className="w-4 h-4 inline mr-2" />Settings
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 gap-6 mb-8 ${isAdmin ? 'md:grid-cols-6' : 'md:grid-cols-4'}`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Patients</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.highRisk}</span>
            </div>
            <p className="text-gray-600 text-sm">High Risk</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.dueThisWeek}</span>
            </div>
            <p className="text-gray-600 text-sm">Due This Week</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Video className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.consultationsToday}</span>
            </div>
            <p className="text-gray-600 text-sm">Consultations Today</p>
          </div>
          {isAdmin && (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Stethoscope className="w-8 h-8 text-pink-500" />
                  <span className="text-3xl font-bold text-gray-900">{stats.totalDoctors}</span>
                </div>
                <p className="text-gray-600 text-sm">Doctors</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <UserCog className="w-8 h-8 text-indigo-500" />
                  <span className="text-3xl font-bold text-gray-900">{stats.totalAshaWorkers}</span>
                </div>
                <p className="text-gray-600 text-sm">ASHA Workers</p>
              </div>
            </>
          )}
        </div>

        {/* Doctors Tab (Admin Only) */}
        {isAdmin && activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Registered Doctors</h2>
              <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />Add Doctor
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Doctor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Specialization</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patients</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doctor.name}</p>
                          <p className="text-sm text-gray-500">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{doctor.specialization}</td>
                    <td className="px-6 py-4 text-gray-900">{doctor.patients_count} patients</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings Tab (Admin Only) */}
        {isAdmin && activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">System Settings</h2>
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="font-medium text-gray-900 mb-2">Notification Settings</h3>
                <p className="text-sm text-gray-500 mb-4">Configure alerts for high-risk patients</p>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-pink-600" />
                  <span>Email alerts for high-risk patients</span>
                </label>
              </div>
              <div className="border-b pb-6">
                <h3 className="font-medium text-gray-900 mb-2">Data Export</h3>
                <p className="text-sm text-gray-500 mb-4">Export patient data for reporting</p>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Export to CSV</button>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {(activeTab === 'patients' || !isAdmin) && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search patients by name or village..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="all">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                  <Link href="/dashboard/patients/new" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-5 h-5" />Add Patient
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pregnancy</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Level</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Village</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Checkup</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div></td></tr>
                    ) : filteredPatients.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No patients found.</td></tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${getRiskDot(patient.risk_level)}`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-sm text-gray-500">{patient.age} years</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">Week {patient.pregnancy_week}</p>
                            <p className="text-sm text-gray-500">{getTrimester(patient.pregnancy_week)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.risk_level)}`}>{patient.risk_level.toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{patient.village}</td>
                          <td className="px-6 py-4 text-gray-900">{patient.last_checkup ? new Date(patient.last_checkup).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link href={`/dashboard/patients/${patient.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><FileText className="w-5 h-5" /></Link>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Consult"><Video className="w-5 h-5" /></button>
                              <a href={`tel:${patient.phone}`} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Call"><Phone className="w-5 h-5" /></a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
