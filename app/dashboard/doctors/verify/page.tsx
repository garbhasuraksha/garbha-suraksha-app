'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Doctor } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  AlertCircle,
  Eye,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  MapPin,
  Shield,
  RefreshCw
} from 'lucide-react';

interface DoctorWithDocs extends Doctor {
  medical_council?: string;
  registration_year?: number;
  degree_document_url?: string;
  registration_document_url?: string;
  government_id_url?: string;
  profile_photo_url?: string;
  rejection_reason?: string;
  verified_by?: string;
}

const STATE_COUNCIL_URLS: Record<string, string> = {
  'National Medical Commission (NMC)': 'https://www.nmc.org.in/information-desk/indian-medical-register/',
  'Karnataka Medical Council': 'https://kmc.karnataka.gov.in/public/doctors',
  'Maharashtra Medical Council': 'https://www.maharashtra.gov.in/mmc',
  'Delhi Medical Council': 'https://www.delhimedicalcouncil.com/RegSearch.aspx',
  'Tamil Nadu Medical Council': 'https://www.tnmedicalcouncil.org/',
  'Kerala Medical Council': 'https://www.travancoremedicines.com/',
  'Andhra Pradesh Medical Council': 'https://apmc.ap.gov.in/',
  'Telangana Medical Council': 'https://tsmc.telangana.gov.in/',
  'Gujarat Medical Council': 'https://gmcgujarat.org/',
  'Rajasthan Medical Council': 'https://rajmedicalcouncil.com/',
  'Uttar Pradesh Medical Council': 'https://www.upmedicalcouncil.org/',
  'West Bengal Medical Council': 'https://wbmc.in/',
  'Punjab Medical Council': 'http://www.punjabmedicalcouncil.in/',
  'Madhya Pradesh Medical Council': 'https://www.mpmedicalcouncil.org/',
};

export default function DoctorVerificationPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorWithDocs[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    loadDoctors();
  }, [filter]);

  const loadDoctors = async () => {
    setLoading(true);
    let query = supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading doctors:', error);
    } else {
      setDoctors(data || []);
    }
    setLoading(false);
  };

  const handleVerify = async (doctor: DoctorWithDocs) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('doctors')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: localStorage.getItem('userEmail'),
      })
      .eq('id', doctor.id);

    if (error) {
      console.error('Verification error:', error);
      alert('Failed to verify doctor');
    } else {
      await loadDoctors();
      setSelectedDoctor(null);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedDoctor || !rejectionReason.trim()) return;

    setActionLoading(true);
    const { error } = await supabase
      .from('doctors')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        verified_by: localStorage.getItem('userEmail'),
      })
      .eq('id', selectedDoctor.id);

    if (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject application');
    } else {
      await loadDoctors();
      setSelectedDoctor(null);
      setShowRejectModal(false);
      setRejectionReason('');
    }
    setActionLoading(false);
  };

  const handleRequestInfo = async (doctor: DoctorWithDocs) => {
    setActionLoading(true);
    const { error } = await supabase
      .from('doctors')
      .update({
        status: 'needs_info',
      })
      .eq('id', doctor.id);

    if (error) {
      console.error('Update error:', error);
    } else {
      await loadDoctors();
      setSelectedDoctor(null);
    }
    setActionLoading(false);
  };

  const getCouncilUrl = (council: string | undefined): string | null => {
    if (!council) return null;
    return STATE_COUNCIL_URLS[council] || null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      case 'needs_info':
        return { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle };
      default:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
    }
  };

  const DocumentViewer = ({ url, label }: { url?: string; label: string }) => (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <Eye className="w-4 h-4" />
          View Document
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-gray-400 text-sm">Not uploaded</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Doctor Verification</h1>
                <p className="text-sm text-gray-600">Review and verify doctor applications</p>
              </div>
            </div>
            <button
              onClick={loadDoctors}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-gray-100 w-fit">
          {[
            { value: 'pending', label: 'Pending', count: doctors.filter(d => d.status === 'pending').length },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'all', label: 'All' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === tab.value
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && filter === 'pending' && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Applications ({doctors.length})</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No {filter === 'all' ? '' : filter} applications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {doctors.map((doctor) => {
                  const status = getStatusBadge(doctor.status);
                  return (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedDoctor?.id === doctor.id ? 'bg-pink-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {doctor.profile_photo_url ? (
                            <img
                              src={doctor.profile_photo_url}
                              alt={doctor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doctor.name}</p>
                          <p className="text-sm text-gray-500 truncate">{doctor.specialization}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                              <status.icon className="w-3 h-3" />
                              {doctor.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Doctor Details */}
          <div className="lg:col-span-2">
            {selectedDoctor ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Doctor Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {selectedDoctor.profile_photo_url ? (
                        <img
                          src={selectedDoctor.profile_photo_url}
                          alt={selectedDoctor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                      <p className="text-gray-600">{selectedDoctor.specialization}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {(() => {
                          const status = getStatusBadge(selectedDoctor.status);
                          return (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                              <status.icon className="w-4 h-4" />
                              {selectedDoctor.status.charAt(0).toUpperCase() + selectedDoctor.status.slice(1)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{selectedDoctor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{selectedDoctor.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Medical Credentials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Registration Number</p>
                        <p className="font-medium">{selectedDoctor.medical_license_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Medical Council</p>
                        <p className="font-medium">{selectedDoctor.medical_council || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registration Year</p>
                        <p className="font-medium">{selectedDoctor.registration_year || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Years of Experience</p>
                        <p className="font-medium">{selectedDoctor.years_experience} years</p>
                      </div>
                    </div>

                    {/* Verify via Council */}
                    {selectedDoctor.medical_council && getCouncilUrl(selectedDoctor.medical_council) && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Verify Registration</p>
                            <p className="text-xs text-blue-700 mb-2">
                              Cross-check registration number on the official council website
                            </p>
                            <a
                              href={getCouncilUrl(selectedDoctor.medical_council)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Open {selectedDoctor.medical_council}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professional Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Professional Details</h3>
                    <div className="space-y-3">
                      {selectedDoctor.hospital_affiliation && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building className="w-4 h-4" />
                          <span className="text-sm">{selectedDoctor.hospital_affiliation}</span>
                        </div>
                      )}
                      {selectedDoctor.village_coverage && selectedDoctor.village_coverage.length > 0 && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span className="text-sm">{selectedDoctor.village_coverage.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Applied on {new Date(selectedDoctor.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <DocumentViewer
                        url={selectedDoctor.degree_document_url}
                        label="Medical Degree Certificate"
                      />
                      <DocumentViewer
                        url={selectedDoctor.registration_document_url}
                        label="Registration Certificate"
                      />
                      <DocumentViewer
                        url={selectedDoctor.government_id_url}
                        label="Government ID"
                      />
                    </div>
                  </div>

                  {/* Rejection Reason (if rejected) */}
                  {selectedDoctor.status === 'rejected' && selectedDoctor.rejection_reason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                      <p className="text-sm text-red-700 mt-1">{selectedDoctor.rejection_reason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedDoctor.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleVerify(selectedDoctor)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestInfo(selectedDoctor)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <AlertCircle className="w-5 h-5" />
                        Request Info
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                <p className="text-gray-500">Click on a doctor from the list to review their application</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection. This will be shared with the applicant.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Registration number could not be verified, documents unclear..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
