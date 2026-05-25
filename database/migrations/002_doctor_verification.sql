-- Migration: Add doctor verification fields
-- Run this in Supabase SQL Editor

-- Add new columns to doctors table for verification workflow
ALTER TABLE doctors
ADD COLUMN IF NOT EXISTS medical_council TEXT,
ADD COLUMN IF NOT EXISTS registration_year INTEGER,
ADD COLUMN IF NOT EXISTS degree_document_url TEXT,
ADD COLUMN IF NOT EXISTS registration_document_url TEXT,
ADD COLUMN IF NOT EXISTS government_id_url TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS digilocker_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS digilocker_data JSONB;

-- Add 'needs_info' to status enum if using enum type
-- If status is TEXT, this is not needed
-- ALTER TYPE doctor_status ADD VALUE IF NOT EXISTS 'needs_info';

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);

-- Create storage bucket for doctor documents (run via Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('doctor-documents', 'doctor-documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policy: Only authenticated users can upload to their own folder
-- Run in Supabase Dashboard > Storage > Policies

/*
-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'doctor-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'doctor-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can view all documents (you'll need an admin check)
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'doctor-documents'
);
*/

-- Sample data for testing (optional)
-- INSERT INTO doctors (name, email, phone, specialization, medical_license_number, medical_council, registration_year, years_experience, status)
-- VALUES
-- ('Dr. Test Pending', 'test.pending@example.com', '+91 12345 67890', 'General Medicine', 'TEST-001', 'Karnataka Medical Council', 2020, 3, 'pending'),
-- ('Dr. Test Verified', 'test.verified@example.com', '+91 12345 67891', 'Obstetrics & Gynecology', 'TEST-002', 'Karnataka Medical Council', 2018, 5, 'verified');
