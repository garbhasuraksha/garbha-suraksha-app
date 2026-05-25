# Quick Start - 3 Steps to Launch

## ✅ Step 1: Storage Setup (Choose One)

### Option A: Supabase Storage (2 minutes - EASIEST)
1. Go to https://supabase.com/dashboard
2. Click **Storage** → **New bucket**
3. Name: `doctor-documents`, Public: **OFF**
4. Done!

### Option B: AWS S3 (10 minutes)
See [AWS-S3-SETUP.md](./AWS-S3-SETUP.md) for detailed guide.

---

## ✅ Step 2: Add Sample Doctors (30 seconds)

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO doctors (
  name, email, phone, specialization, medical_license_number,
  medical_council, registration_year, hospital_affiliation,
  years_experience, status, village_coverage, verified_at
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
);
```

---

## ✅ Step 3: Enable Google OAuth (5 minutes - OPTIONAL)

1. **Google Cloud Console**:
   - Go to https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID & Secret

2. **Supabase Dashboard**:
   - Authentication → Providers
   - Enable **Google**
   - Paste Client ID & Secret
   - Save

---

## 🚀 You're Ready!

Start the app:
```bash
npm run dev
```

### Test Features:

1. **Doctor Registration**: http://localhost:3000/dashboard/register
   - Try "Sign up with Google" (if enabled)
   - Or fill the form manually

2. **Admin Verification**: http://localhost:3000/dashboard/doctors/verify
   - Login as admin
   - Review pending applications

3. **Patient Portal**: http://localhost:3000/patient
   - Click "Add Today's Health Reading"
   - Enter vitals and save

4. **View Doctors Dashboard**: http://localhost:3000/dashboard
   - Login with admin credentials
   - See Dr. Priya and Dr. Rajesh

---

## 📚 Full Documentation

- **Setup Guide**: [SETUP-GUIDE.md](./SETUP-GUIDE.md) - Complete feature docs
- **AWS S3**: [AWS-S3-SETUP.md](./AWS-S3-SETUP.md) - AWS integration guide

---

## Default Test Credentials

**Admin**:
- Create via Supabase Auth or use existing admin account

**Patients**:
- Use patient login flow at `/patient/login`

**Doctors**:
- Register at `/dashboard/register`
- Or login with Google OAuth

---

## Need Help?

Check the documentation files or the inline code comments.

Happy building! 💝
