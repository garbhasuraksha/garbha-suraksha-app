# Garbha Suraksha - Project Context & Handoff

## Project Overview
**Garbha Suraksha** - A maternal healthcare platform for rural India enabling:
- Remote health monitoring for pregnant mothers
- Teleconsultation with doctors
- ASHA worker integration for community health
- Early risk detection

## Repository Structure

```
~/Repos/Garbha-Raksha/
├── garbha-suraksha-landing/    # Marketing website
│   └── Deployed: https://garbhasuraksha.com
│
├── garbha-suraksha-app/        # Dashboard + Patient Portal (Next.js)
│   └── Deployed: https://app.garbhasuraksha.com
│
└── garbha-raksha-core/         # FastAPI Backend (NOT DEPLOYED YET)
    └── Ready for: Railway/Render deployment
```

## GitHub Repos
- https://github.com/garbhasuraksha/garbha-suraksha-landing
- https://github.com/garbhasuraksha/garbha-suraksha-app
- https://github.com/garbhasuraksha/garbha-raksha-core

## Supabase Configuration
- **Project ID:** hnlljiscqaolhmtjvhry
- **URL:** https://hnlljiscqaolhmtjvhry.supabase.co
- **Region:** Northeast Asia (Tokyo)
- **Dashboard:** https://supabase.com/dashboard/project/hnlljiscqaolhmtjvhry

### Supabase Users Created
| Role | Email | Password |
|------|-------|----------|
| Admin | akshayhazari@garbhasuraksha.com | 74132@okH |
| Admin | romio.maurya@garbhasuraksha.com | Romio@123 |
| Doctor | doctor@garbhasuraksha.com | Romio@123 |
| ASHA | asha@garbhasuraksha.com | Romio@123 |
| Patient | patient@garbhasuraksha.com | Romio@123 |

### Database Tables Needed (SQL to run in Supabase)
```sql
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  pregnancy_week INTEGER NOT NULL CHECK (pregnancy_week >= 1 AND pregnancy_week <= 42),
  village TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  assigned_doctor TEXT NOT NULL,
  phone TEXT NOT NULL,
  last_checkup DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vitals table
CREATE TABLE IF NOT EXISTS vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  bp_systolic INTEGER NOT NULL,
  bp_diastolic INTEGER NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  hemoglobin DECIMAL(4,2),
  sugar_level INTEGER,
  notes TEXT,
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  zoom_link TEXT,
  notes TEXT,
  prescription TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for MVP - tighten later)
CREATE POLICY "Allow all on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all on vitals" ON vitals FOR ALL USING (true);
CREATE POLICY "Allow all on consultations" ON consultations FOR ALL USING (true);
```

## Environment Variables

### garbha-suraksha-app/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://hnlljiscqaolhmtjvhry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubGxqaXNjcWFvbGhtdGp2aHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTcyMDgsImV4cCI6MjA5NDczMzIwOH0.m2o-YVzUGyX96oHpCcweGD6MaAPg9HkDn_K24u9pMH8
```

### garbha-raksha-core/.env (create from .env.example)
```
SUPABASE_URL=https://hnlljiscqaolhmtjvhry.supabase.co
SUPABASE_KEY=<anon key above>
SUPABASE_SERVICE_KEY=<service role key from Supabase>
```

## What's Built & Working

### Landing Page (garbhasuraksha.com)
- Hero section with branding
- How it works
- Impact section
- Footer with portal links
- Mobile responsive

### App (app.garbhasuraksha.com)
- Home page with Patient/Provider login options
- Glowing container UI
- Logo integrated

### Dashboard (/dashboard)
- Login with role selection (Doctor/ASHA/Admin)
- Real Supabase authentication
- Admin view with 3 tabs: Patients | Doctors | Settings
- Patients table with Assigned Doctor column (admin only)
- Stats cards (Total Patients, High Risk, Due This Week, etc.)
- Search and filter functionality
- Logout button

### Patient Portal (/patient)
- OTP-based login flow (demo mode)
- Patient dashboard with pregnancy journey
- Health summary cards
- Vitals history display
- Appointments view

### FastAPI Backend (garbha-raksha-core)
- Patient CRUD endpoints
- Vitals endpoints
- Supabase integration
- CORS configured
- NOT DEPLOYED YET

## What's NOT Working / TODO

### Priority 1: Database Setup
- [ ] Run SQL scripts in Supabase to create tables
- [ ] Verify tables exist in Supabase Table Editor

### Priority 2: Patient Onboarding
- [ ] Build patient registration form
- [ ] Save to Supabase patients table
- [ ] Link patient to authenticated user

### Priority 3: Daily Vitals Form
- [ ] Create Add Vitals form in dashboard
- [ ] Fields: BP, Sugar, Hemoglobin, Weight, Notes
- [ ] Save to Supabase vitals table
- [ ] Update patient's last_checkup date

### Priority 4: Remove Static Data
- [ ] Dashboard currently uses hardcoded sample patients
- [ ] Replace with real Supabase queries
- [ ] Patient portal uses sample data too

### Priority 5: Backend Deployment (Optional)
- [ ] Deploy FastAPI to Railway or Render
- [ ] Set up api.garbhasuraksha.com subdomain
- [ ] Update frontend to use API instead of direct Supabase

## Tech Stack
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** Vercel (frontend), Cloudflare (DNS)
- **Icons:** Lucide React

## Key Files to Know

### Frontend App
- `app/page.tsx` - Home page with login options
- `app/dashboard/page.tsx` - Main dashboard (Doctor/Admin view)
- `app/dashboard/login/page.tsx` - Login with role selection
- `app/dashboard/patients/new/page.tsx` - Add patient form
- `app/dashboard/patients/[id]/page.tsx` - Patient detail view
- `app/patient/page.tsx` - Patient portal
- `app/patient/login/page.tsx` - Patient OTP login
- `lib/supabase.ts` - Supabase client & types

### Backend API
- `app/main.py` - FastAPI app entry
- `app/api/patients.py` - Patient endpoints
- `app/api/vitals.py` - Vitals endpoints
- `app/core/config.py` - Settings
- `app/core/database.py` - Supabase client

## Commands

```bash
# Run frontend locally
cd ~/Repos/Garbha-Raksha/garbha-suraksha-app
npm run dev
# Opens at http://localhost:3000

# Run backend locally
cd ~/Repos/Garbha-Raksha/garbha-raksha-core
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Opens at http://localhost:8000/docs

# Deploy frontend (auto via Vercel on git push)
cd ~/Repos/Garbha-Raksha/garbha-suraksha-app
git add -A && git commit -m "message" && git push
```

## Next Conversation Prompt

Copy this to start fresh:

```
I'm working on Garbha Suraksha maternal healthcare app.

Context file: ~/Repos/Garbha-Raksha/PROJECT-CONTEXT.md

Immediate tasks:
1. Run SQL to create tables in Supabase (SQL in context file)
2. Build patient onboarding form that saves to Supabase
3. Build daily vitals form for ASHA workers to record readings
4. Replace static sample data with real Supabase queries

App repo: ~/Repos/Garbha-Raksha/garbha-suraksha-app
Supabase URL: https://hnlljiscqaolhmtjvhry.supabase.co
```

## Contact
- Email: hello@garbhasuraksha.com
- Admins: akshayhazari@garbhasuraksha.com, romio.maurya@garbhasuraksha.com
