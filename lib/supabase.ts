import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only create client if we have real credentials
const hasValidCredentials =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  !supabaseUrl.includes('your_supabase_url_here') &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here');

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder');

export const isSupabaseConfigured = hasValidCredentials;

// Database types
export interface Patient {
  id: string;
  name: string;
  age: number;
  pregnancy_week: number;
  village: string;
  risk_level: 'low' | 'medium' | 'high';
  assigned_doctor: string;
  phone: string;
  created_at: string;
  last_checkup?: string;
}

export interface Vital {
  id: string;
  patient_id: string;
  bp_systolic: number;
  bp_diastolic: number;
  weight: number;
  hemoglobin?: number;
  sugar_level?: number;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  zoom_link?: string;
  notes?: string;
  prescription?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'asha' | 'admin';
  phone: string;
  created_at: string;
}
