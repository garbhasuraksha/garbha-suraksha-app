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
  Filter,
  Video,
  FileText,
  Phone
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    dueThisWeek: 0,
    consultationsToday: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

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

      // Calculate stats
      setStats({
        total: patientData.length,
        highRisk: patientData.filter((p: Patient) => p.risk_level === 'high').length,
        dueThisWeek: patientData.filter((p: Patient) => p.pregnancy_week >= 37).length,
        consultationsToday: 0 // TODO: Calculate from consultations table
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Use sample data for demo
      const samplePatients: Patient[] = [
        {
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
        },
        {
          id: '2',
          name: 'Sunita Devi',
          age: 32,
          pregnancy_week: 16,
          village: 'Shivpur',
          risk_level: 'high',
          assigned_doctor: 'Dr. Anjali Mehta',
          phone: '+91 98765 43211',
          created_at: new Date().toISOString(),
          last_checkup: '2026-05-10'
        },
        {
          id: '3',
          name: 'Meera Patel',
          age: 28,
          pregnancy_week: 32,
          village: 'Laxmipur',
          risk_level: 'medium',
          assigned_doctor: 'Dr. Rajesh Kumar',
          phone: '+91 98765 43212',
          created_at: new Date().toISOString(),
          last_checkup: '2026-05-12'
        },
        {
          id: '4',
          name: 'Kavita Singh',
          age: 24,
          pregnancy_week: 38,
          village: 'Rampur',
          risk_level: 'low',
          assigned_doctor: 'Dr. Anjali Mehta',
          phone: '+91 98765 43213',
          created_at: new Date().toISOString(),
          last_checkup: '2026-05-17'
        }
      ];
      setPatients(samplePatients);
      setStats({
        total: 4,
        highRisk: 1,
        dueThisWeek: 1,
        consultationsToday: 2
      });
    } finally {
      setLoading(false);
    }
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
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return '1st Trimester';
    if (week <= 27) return '2nd Trimester';
    return '3rd Trimester';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">💝</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Garbha Suraksha</h1>
                <p className="text-sm text-gray-600">Care Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Calendar className="w-6 h-6" />
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <span className="text-2xl">🔔</span>
              </button>
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  AM
                </div>
                <span className="text-sm font-medium">Dr. Anjali Mehta</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
              <Link
                href="/dashboard/patients/new"
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Patient
              </Link>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pregnancy
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Village
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Checkup
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No patients found. Add your first patient to get started.
                    </td>
                  </tr>
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
                        <div>
                          <p className="font-medium text-gray-900">Week {patient.pregnancy_week}</p>
                          <p className="text-sm text-gray-500">{getTrimester(patient.pregnancy_week)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.risk_level)}`}>
                          {patient.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{patient.village}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {patient.last_checkup
                            ? new Date(patient.last_checkup).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })
                            : 'Not recorded'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/patients/${patient.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FileText className="w-5 h-5" />
                          </Link>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Start Consultation"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                          <a
                            href={`tel:${patient.phone}`}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Call Patient"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
