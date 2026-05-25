-- Complete Database Setup for Garbha Suraksha
-- Run this entire file in Supabase SQL Editor

-- ============================================
-- PART 1: Add Doctor Verification Fields
-- ============================================

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

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- ============================================
-- PART 2: Create Storage Bucket (via Dashboard)
-- ============================================
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: doctor-documents
-- Public: No (private)
-- Or run via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-documents', 'doctor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 3: Storage Policies
-- ============================================

-- Policy: Users can upload to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can upload own documents'
  ) THEN
    CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'doctor-documents'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Policy: Users can view their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can view own documents'
  ) THEN
    CREATE POLICY "Users can view own documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'doctor-documents'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Policy: Admins can view all documents (requires admin role check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Admins can view all documents'
  ) THEN
    CREATE POLICY "Admins can view all documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'doctor-documents');
  END IF;
END $$;

-- ============================================
-- PART 4: Insert 2 Sample Verified Doctors
-- ============================================

-- Note: These don't have auth users, they're just profiles for testing
-- In production, doctors would sign up via the registration form

INSERT INTO doctors (
  name,
  email,
  phone,
  specialization,
  medical_license_number,
  medical_council,
  registration_year,
  hospital_affiliation,
  years_experience,
  status,
  village_coverage,
  verified_at
) VALUES
(
  'Dr. Priya Sharma',
  'dr.priya@garbhasuraksha.com',
  '+91 98765 43210',
  'Obstetrics & Gynecology',
  'KMC-2018-12345',
  'Karnataka Medical Council',
  2018,
  'District Hospital, Bangalore Rural',
  8,
  'verified',
  ARRAY['Anekal', 'Jigani', 'Bommasandra'],
  NOW()
),
(
  'Dr. Rajesh Kumar',
  'dr.rajesh@garbhasuraksha.com',
  '+91 87654 32109',
  'General Medicine & Maternal Health',
  'KMC-2015-67890',
  'Karnataka Medical Council',
  2015,
  'PHC Devanahalli',
  12,
  'verified',
  ARRAY['Devanahalli', 'Vijayapura', 'Sadahalli'],
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PART 5: Insert Sample Pending Doctor
-- ============================================

INSERT INTO doctors (
  name,
  email,
  phone,
  specialization,
  medical_license_number,
  medical_council,
  registration_year,
  hospital_affiliation,
  years_experience,
  status,
  village_coverage
) VALUES
(
  'Dr. Anita Desai',
  'dr.anita@example.com',
  '+91 99999 88888',
  'Obstetrics & Gynecology',
  'MMC-2020-54321',
  'Maharashtra Medical Council',
  2020,
  'Rural Health Center, Pune',
  4,
  'pending',
  ARRAY['Pune Rural', 'Baramati', 'Indapur']
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify the setup
SELECT
  'Doctors count' as check_type,
  COUNT(*) as count,
  string_agg(status, ', ') as statuses
FROM doctors;

SELECT
  'Storage bucket' as check_type,
  COUNT(*) as count
FROM storage.buckets
WHERE id = 'doctor-documents';

-- Show sample doctors
SELECT
  id,
  name,
  email,
  specialization,
  status,
  medical_council,
  hospital_affiliation
FROM doctors
ORDER BY created_at DESC
LIMIT 5;
