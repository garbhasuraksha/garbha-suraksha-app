import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Patient {
  id: string;
  user_id?: string;
  name: string;
  age: number;
  pregnancy_week: number;
  expected_delivery_date?: string;
  village: string;
  address?: string;
  risk_level: 'low' | 'medium' | 'high';
  assigned_doctor_id?: string;
  assigned_doctor: string;
  assigned_asha_id?: string;
  phone: string;
  emergency_contact?: string;
  blood_group?: string;
  medical_history?: string;
  last_checkup?: string;
  next_checkup?: string;
  created_at: string;
}

export interface Vital {
  id: string;
  patient_id: string;
  bp_systolic: number;
  bp_diastolic: number;
  weight: number;
  hemoglobin?: number;
  sugar_level?: number;
  temperature?: number;
  pulse_rate?: number;
  fetal_heart_rate?: number;
  notes?: string;
  recorded_by: string;
  recorded_by_id?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  medical_license_number: string;
  medical_license_document_url?: string;
  hospital_affiliation?: string;
  years_experience: number;
  status: 'pending' | 'verified' | 'rejected';
  village_coverage?: string[];
  verified_at?: string;
  created_at: string;
}

export interface AshaWorker {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  asha_id: string;
  village: string;
  block?: string;
  district?: string;
  state: string;
  status: 'active' | 'inactive';
  patients_assigned: number;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  consultation_type: 'video' | 'audio' | 'in_person';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meeting_link?: string;
  reason?: string;
  notes?: string;
  prescription?: string;
  follow_up_date?: string;
  duration_minutes?: number;
  completed_at?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  alert_type: 'high_bp' | 'low_hemoglobin' | 'high_sugar' | 'missed_checkup' | 'high_risk' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

// Helper functions
export async function getPatients(filters?: {
  risk_level?: string;
  village?: string;
  search?: string;
  assigned_doctor_id?: string;
}) {
  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.risk_level && filters.risk_level !== 'all') {
    query = query.eq('risk_level', filters.risk_level);
  }
  if (filters?.village) {
    query = query.ilike('village', `%${filters.village}%`);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,village.ilike.%${filters.search}%`);
  }
  if (filters?.assigned_doctor_id) {
    query = query.eq('assigned_doctor_id', filters.assigned_doctor_id);
  }

  return query;
}

export async function getDoctors(filters?: {
  status?: string;
  search?: string;
}) {
  let query = supabase
    .from('doctors')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  return query;
}

export async function getAshaWorkers(filters?: {
  status?: string;
  village?: string;
  search?: string;
}) {
  let query = supabase
    .from('asha_workers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.village) {
    query = query.ilike('village', `%${filters.village}%`);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  return query;
}

export async function getConsultations(filters?: {
  patient_id?: string;
  doctor_id?: string;
  status?: string;
}) {
  let query = supabase
    .from('consultations')
    .select('*', { count: 'exact' })
    .order('scheduled_at', { ascending: false });

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }
  if (filters?.doctor_id) {
    query = query.eq('doctor_id', filters.doctor_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  return query;
}

export async function getPatientVitals(patientId: string, limit = 10) {
  return supabase
    .from('vitals')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function getAlerts(filters?: {
  patient_id?: string;
  is_acknowledged?: boolean;
}) {
  let query = supabase
    .from('alerts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.patient_id) {
    query = query.eq('patient_id', filters.patient_id);
  }
  if (filters?.is_acknowledged !== undefined) {
    query = query.eq('is_acknowledged', filters.is_acknowledged);
  }

  return query;
}

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  const [patientsRes, doctorsRes, ashaRes, consultationsRes, alertsRes] = await Promise.all([
    supabase.from('patients').select('id, risk_level, pregnancy_week', { count: 'exact' }),
    supabase.from('doctors').select('id', { count: 'exact' }).eq('status', 'verified'),
    supabase.from('asha_workers').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('consultations').select('id', { count: 'exact' }).eq('status', 'scheduled').gte('scheduled_at', today),
    supabase.from('alerts').select('id', { count: 'exact' }).eq('is_acknowledged', false),
  ]);

  const patients = patientsRes.data || [];

  return {
    totalPatients: patientsRes.count || 0,
    highRiskPatients: patients.filter(p => p.risk_level === 'high').length,
    dueThisWeek: patients.filter(p => p.pregnancy_week >= 37).length,
    totalDoctors: doctorsRes.count || 0,
    totalAshaWorkers: ashaRes.count || 0,
    consultationsToday: consultationsRes.count || 0,
    unacknowledgedAlerts: alertsRes.count || 0,
  };
}
