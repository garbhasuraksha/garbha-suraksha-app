'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signUpWithGoogle, getGoogleUserInfo } from '@/lib/google-auth';
import { uploadDocument } from '@/lib/storage';
import Link from 'next/link';
import {
  Stethoscope,
  User,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  // Step 2: Credentials
  registrationNumber: string;
  registrationYear: string;
  medicalCouncil: string;
  specialization: string;

  // Step 3: Documents
  degreeDocument: File | null;
  registrationDocument: File | null;
  governmentId: File | null;

  // Step 4: Profile
  hospitalAffiliation: string;
  yearsExperience: string;
  villageCoverage: string;
  profilePhoto: File | null;
}

const MEDICAL_COUNCILS = [
  'National Medical Commission (NMC)',
  'Andhra Pradesh Medical Council',
  'Arunachal Pradesh Medical Council',
  'Assam Medical Council',
  'Bihar Medical Council',
  'Chhattisgarh Medical Council',
  'Delhi Medical Council',
  'Goa Medical Council',
  'Gujarat Medical Council',
  'Haryana Medical Council',
  'Himachal Pradesh Medical Council',
  'Jharkhand Medical Council',
  'Karnataka Medical Council',
  'Kerala Medical Council',
  'Madhya Pradesh Medical Council',
  'Maharashtra Medical Council',
  'Manipur Medical Council',
  'Meghalaya Medical Council',
  'Mizoram Medical Council',
  'Nagaland Medical Council',
  'Odisha Medical Council',
  'Punjab Medical Council',
  'Rajasthan Medical Council',
  'Sikkim Medical Council',
  'Tamil Nadu Medical Council',
  'Telangana Medical Council',
  'Tripura Medical Council',
  'Uttar Pradesh Medical Council',
  'Uttarakhand Medical Council',
  'West Bengal Medical Council',
];

const SPECIALIZATIONS = [
  'Obstetrics & Gynecology',
  'General Medicine',
  'Family Medicine',
  'Community Medicine',
  'Pediatrics',
  'Internal Medicine',
  'Other',
];

export default function DoctorRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    registrationYear: '',
    medicalCouncil: '',
    specialization: '',
    degreeDocument: null,
    registrationDocument: null,
    governmentId: null,
    hospitalAffiliation: '',
    yearsExperience: '',
    villageCoverage: '',
    profilePhoto: null,
  });

  // Check if user came from Google OAuth
  useEffect(() => {
    const oauth = searchParams.get('oauth');
    const email = searchParams.get('email');

    if (oauth === 'google') {
      setIsGoogleAuth(true);
      // Pre-fill email from Google
      if (email) {
        setFormData(prev => ({ ...prev, email }));
      }
      // Load full Google profile
      loadGoogleProfile();
    }
  }, [searchParams]);

  const loadGoogleProfile = async () => {
    const userInfo = await getGoogleUserInfo();
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        name: userInfo.name || prev.name,
        email: userInfo.email || prev.email,
      }));
      // Skip to step 2 (credentials) since basic info is from Google
      setStep(2);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signUpWithGoogle();
      // User will be redirected to Google, then back to this page
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Credentials', icon: FileText },
    { number: 3, title: 'Documents', icon: Upload },
    { number: 4, title: 'Profile', icon: Stethoscope },
  ];

  const updateFormData = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        return true;
      case 2:
        if (!formData.registrationNumber || !formData.registrationYear || !formData.medicalCouncil || !formData.specialization) {
          setError('Please fill in all credential details');
          return false;
        }
        return true;
      case 3:
        if (!formData.degreeDocument || !formData.registrationDocument || !formData.governmentId) {
          setError('Please upload all required documents');
          return false;
        }
        return true;
      case 4:
        if (!formData.yearsExperience) {
          setError('Please enter years of experience');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4) as Step);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
    setError('');
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    return await uploadDocument(file, path);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // 2. Upload documents
      const [degreeUrl, registrationUrl, govIdUrl, photoUrl] = await Promise.all([
        formData.degreeDocument ? uploadFile(formData.degreeDocument, `${authData.user.id}/degree`) : null,
        formData.registrationDocument ? uploadFile(formData.registrationDocument, `${authData.user.id}/registration`) : null,
        formData.governmentId ? uploadFile(formData.governmentId, `${authData.user.id}/govt-id`) : null,
        formData.profilePhoto ? uploadFile(formData.profilePhoto, `${authData.user.id}/photo`) : null,
      ]);

      // 3. Create doctor profile
      const { error: profileError } = await supabase
        .from('doctors')
        .insert({
          user_id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          medical_license_number: formData.registrationNumber,
          medical_council: formData.medicalCouncil,
          registration_year: parseInt(formData.registrationYear),
          hospital_affiliation: formData.hospitalAffiliation || null,
          years_experience: parseInt(formData.yearsExperience),
          village_coverage: formData.villageCoverage ? formData.villageCoverage.split(',').map(v => v.trim()) : [],
          status: 'pending',
          degree_document_url: degreeUrl,
          registration_document_url: registrationUrl,
          government_id_url: govIdUrl,
          profile_photo_url: photoUrl,
        });

      if (profileError) throw profileError;

      // Success - redirect to pending page
      router.push('/dashboard/register/pending');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({
    label,
    field,
    accept = '.pdf,.jpg,.jpeg,.png',
    required = true
  }: {
    label: string;
    field: keyof FormData;
    accept?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={(e) => updateFormData(field, e.target.files?.[0] || null)}
          className="hidden"
          id={field}
        />
        <label
          htmlFor={field}
          className={`flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            formData[field]
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
          }`}
        >
          {formData[field] ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>{(formData[field] as File).name}</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">Click to upload</span>
            </>
          )}
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max 5MB)</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 mb-4">
            <img src="/logo.png" alt="Garbha Suraksha" className="w-16 h-16 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Doctor Registration</h1>
          </Link>
          <p className="text-gray-600">Join our network of maternal healthcare providers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s.number
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${step >= s.number ? 'text-pink-600 font-medium' : 'text-gray-500'}`}>
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-20 h-1 mx-2 rounded ${step > s.number ? 'bg-pink-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

              {/* Google Sign-Up Button */}
              {!isGoogleAuth && (
                <>
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                      <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Dr. Full Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="doctor@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Medical Credentials</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Council Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                  placeholder="e.g., KMC-12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">As shown on your registration certificate</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Council <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.medicalCouncil}
                  onChange={(e) => updateFormData('medicalCouncil', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select Medical Council</option>
                  {MEDICAL_COUNCILS.map((council) => (
                    <option key={council} value={council}>{council}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Registration <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.registrationYear}
                  onChange={(e) => updateFormData('registrationYear', e.target.value)}
                  placeholder="e.g., 2018"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => updateFormData('specialization', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Documents</h2>
              <p className="text-sm text-gray-600 mb-6">
                Please upload clear, legible copies of the following documents for verification.
              </p>

              <FileUploadField
                label="Medical Degree Certificate (MBBS/MD)"
                field="degreeDocument"
              />

              <FileUploadField
                label="Medical Council Registration Certificate"
                field="registrationDocument"
              />

              <FileUploadField
                label="Government ID (Aadhaar/PAN/Passport)"
                field="governmentId"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All documents will be securely stored and used only for verification purposes.
                  Your information is protected under our privacy policy.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Profile */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>

              <FileUploadField
                label="Profile Photo"
                field="profilePhoto"
                accept=".jpg,.jpeg,.png"
                required={false}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic Affiliation
                </label>
                <input
                  type="text"
                  value={formData.hospitalAffiliation}
                  onChange={(e) => updateFormData('hospitalAffiliation', e.target.value)}
                  placeholder="e.g., District Hospital, Bangalore"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => updateFormData('yearsExperience', e.target.value)}
                  placeholder="e.g., 5"
                  min="0"
                  max="60"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Villages/Areas You Can Cover
                </label>
                <input
                  type="text"
                  value={formData.villageCoverage}
                  onChange={(e) => updateFormData('villageCoverage', e.target.value)}
                  placeholder="e.g., Anekal, Jigani, Bommasandra"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated list of villages or areas</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-yellow-800">
                  <strong>Verification Process:</strong> After submission, our team will verify your credentials
                  within 2-3 business days. You'll receive an email once your account is approved.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <Link
                href="/dashboard/login"
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-medium"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/dashboard/login" className="text-pink-600 hover:text-pink-700 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
