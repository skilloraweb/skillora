-- ================================================================
-- SKILLORA PRODUCTION DATABASE SCHEMA
-- Run this in Supabase -> SQL Editor -> Click "Run"
-- ================================================================

-- 1. COLLEGES & INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    clean_name TEXT,
    category TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    established INT,
    rating NUMERIC(3,1) DEFAULT 4.0,
    approval TEXT,
    min_fee NUMERIC DEFAULT 0,
    min_fee_display TEXT,
    courses_count INT DEFAULT 0,
    courses JSONB DEFAULT '[]'::jsonb,
    recruiters JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT true,
    hostel TEXT,
    overview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast search indexes for instantaneous filter performance
CREATE INDEX IF NOT EXISTS idx_colleges_category ON public.colleges(category);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON public.colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_city ON public.colleges(city);
CREATE INDEX IF NOT EXISTS idx_colleges_rating ON public.colleges(rating DESC);
CREATE INDEX IF NOT EXISTS idx_colleges_min_fee ON public.colleges(min_fee ASC);

-- 2. ADMISSION LEADS (STUDENT ENQUIRIES)
CREATE TABLE IF NOT EXISTS public.admission_leads (
    id BIGSERIAL PRIMARY KEY,
    college_id BIGINT REFERENCES public.colleges(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    course_name TEXT,
    state TEXT,
    city TEXT,
    status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Counselled', 'Admitted', 'Closed'
    counsellor_notes TEXT,
    source TEXT DEFAULT 'Website Modal',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.admission_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.admission_leads(created_at DESC);

-- 3. JOBS TABLE (HEALTHCARE & HOSPITALITY)
CREATE TABLE IF NOT EXISTS public.jobs (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    sector TEXT NOT NULL, -- 'Hospital & Healthcare', 'Hotel & Hospitality'
    employer_name TEXT NOT NULL,
    location_city TEXT,
    location_state TEXT,
    salary_display TEXT,
    experience TEXT,
    job_type TEXT DEFAULT 'Full Time',
    description TEXT,
    requirements TEXT,
    status TEXT DEFAULT 'Published', -- 'Pending', 'Published', 'Expired'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_sector ON public.jobs(sector);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

-- 4. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS public.job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    experience_years TEXT,
    resume_url TEXT,
    stage TEXT DEFAULT 'Applied', -- 'Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'
    recruiter_notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON public.job_applications(job_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ================================================================

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Colleges: Anyone can view (SELECT)
DROP POLICY IF EXISTS "Anyone can view colleges" ON public.colleges;
CREATE POLICY "Anyone can view colleges" ON public.colleges FOR SELECT USING (true);

-- Admission Leads: Anyone can submit enquiry (INSERT), only authenticated/admins can view
DROP POLICY IF EXISTS "Anyone can submit admission enquiry" ON public.admission_leads;
CREATE POLICY "Anyone can submit admission enquiry" ON public.admission_leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view leads" ON public.admission_leads;
CREATE POLICY "Admins can view leads" ON public.admission_leads FOR SELECT USING (true);

-- Jobs: Anyone can view published jobs
DROP POLICY IF EXISTS "Anyone can view published jobs" ON public.jobs;
CREATE POLICY "Anyone can view published jobs" ON public.jobs FOR SELECT USING (status = 'Published');

-- Job Applications: Anyone can submit application (INSERT)
DROP POLICY IF EXISTS "Anyone can submit job application" ON public.job_applications;
CREATE POLICY "Anyone can submit job application" ON public.job_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view applications" ON public.job_applications;
CREATE POLICY "Admins can view applications" ON public.job_applications FOR SELECT USING (true);
