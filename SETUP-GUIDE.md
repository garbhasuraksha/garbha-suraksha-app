# Garbha Suraksha Setup Guide

## Quick Start

### 1. Database Setup ✅ (Already Done)

You've already run the migration SQL. To verify:

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM doctors;
```

If you want to add the sample doctor records:

```sql
-- Insert 2 sample verified doctors
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
)
ON CONFLICT (email) DO NOTHING;
```

---

### 2. Storage Bucket Setup

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **Storage** → **New Bucket**
2. Name: `doctor-documents`
3. **Public**: No (keep private)
4. Click **Create Bucket**

**Option B: Via SQL**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-documents', 'doctor-documents', false)
ON CONFLICT (id) DO NOTHING;
```

---

### 3. Google OAuth Setup (For "Sign in with Google")

#### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
7. Copy the **Client ID** and **Client Secret**

#### Step 2: Enable in Supabase
1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** in the provider list
3. Toggle **Enable**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

That's it! The "Sign in with Google" button will now work.

---

### 4. Environment Variables

Make sure `.env.local` has:

```env
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://hnlljiscqaolhmtjvhry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: DigiLocker (if you want document verification)
NEXT_PUBLIC_DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=
NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/digilocker/callback
```

---

## Features Implemented

### ✅ Doctor Onboarding
- Multi-step registration form
- Document upload (degree, registration cert, ID)
- Medical council registration verification
- Status: `pending` → `verified` / `rejected` / `needs_info`

### ✅ Admin Verification Dashboard
- `/dashboard/doctors/verify`
- Review pending applications
- View uploaded documents
- Direct links to State Medical Council websites
- Approve / Request Info / Reject with reason

### ✅ Google OAuth Integration
- "Sign in with Google" on login page
- "Sign up with Google" on registration page
- Auto-fills name and email from Google profile
- Seamless account creation

### ✅ Patient Portal Enhancements
- **Add daily health readings** via modal form
- Blood pressure, weight, sugar, pulse, temperature
- Larger UI for mobile (text-lg, bigger buttons)
- Vitals trend summary
- Status indicators (Normal/Elevated/High)
- Auto-warning for high BP

### ✅ DigiLocker Integration (Setup Required)
- `/lib/digilocker.ts` helper functions
- OAuth callback handler
- Fetches verified documents from user's DigiLocker
- **Requires**: Registration at [partners.digitallocker.gov.in](https://partners.digitallocker.gov.in/)

---

## Testing the Features

### Test Doctor Registration
1. Navigate to `/dashboard/register`
2. Click **"Continue with Google"** or fill form manually
3. Complete all 4 steps
4. You'll see the pending confirmation page

### Test Admin Verification
1. Login as admin at `/dashboard/login`
2. Go to **Doctors** tab
3. Click **"Verify Applications"**
4. Select a pending doctor
5. Review documents, click verification link for medical council
6. Approve or Reject

### Test Patient Portal
1. Login at `/patient/login`
2. On home screen, click **"Add Today's Health Reading"**
3. Fill in vitals (BP, weight, etc.)
4. Click **"Save Reading"**
5. Go to **Vitals** tab to see all readings

---

## What's Next

### Immediate Priorities
1. ✅ Add 2 sample doctor records (SQL above)
2. ✅ Create storage bucket
3. ⏳ Enable Google OAuth (5 min setup)

### Future Enhancements
1. **Email notifications** when doctor status changes
2. **SMS alerts** for high-risk vitals
3. **Real-time chat** between patient and doctor
4. **Appointment scheduling** system
5. **Analytics dashboard** for admins
6. **Mobile app** (React Native)

---

## Troubleshooting

### "Storage bucket not found"
→ Create the `doctor-documents` bucket in Supabase Storage

### "Google sign-in not working"
→ Check that redirect URI in Google Cloud matches Supabase project URL exactly

### "Doctor not redirecting after Google sign-in"
→ Check `/app/auth/callback/route.ts` logs in browser console

### "Vitals not saving"
→ Currently using sample data. Connect to real Supabase in production:
```typescript
// In app/patient/page.tsx, replace sample data with:
const { data, error } = await supabase
  .from('vitals')
  .insert(newVital);
```

---

## Architecture Overview

```
/app
├── dashboard/
│   ├── login/           # Doctor/Admin login with Google OAuth
│   ├── register/        # Multi-step doctor registration
│   ├── doctors/verify/  # Admin verification dashboard
│   └── page.tsx         # Main dashboard
├── patient/
│   ├── login/           # Patient login
│   └── page.tsx         # Patient portal with vitals entry
├── auth/callback/       # OAuth callback handler
└── api/
    └── digilocker/      # DigiLocker integration

/lib
├── supabase.ts          # Database client & types
├── google-auth.ts       # Google OAuth helpers
└── digilocker.ts        # DigiLocker integration

/database
├── migrations/
│   └── 002_doctor_verification.sql  # Already run
└── complete-setup.sql   # All-in-one setup script
```

---

## Support

Questions? Check:
- **Documentation**: This file
- **Code comments**: Inline explanations
- **Supabase Docs**: https://supabase.com/docs
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

Happy building! 🚀
