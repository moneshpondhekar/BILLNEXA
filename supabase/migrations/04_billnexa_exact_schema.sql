-- ==============================================================================
-- BILL NEXA – Complete Supabase PostgreSQL Schema & Security Policies
-- Matches Exact User Specification for MedPro Bills Automation Prototype
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Employees Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    folder_name TEXT NOT NULL DEFAULT '',
    file_size BIGINT DEFAULT 0,
    page_count INTEGER DEFAULT 1,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High')),
    upload_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (upload_status IN ('pending', 'uploaded', 'processed', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Document Assignments Table
CREATE TABLE IF NOT EXISTS public.document_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Completed', 'Pending Review')),
    completed_at TIMESTAMPTZ
);

-- 5. Claims Table (Using comprehensive JSONB schema for medical & billing information)
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    patient_information JSONB NOT NULL DEFAULT '{}'::jsonb,
    address_information JSONB NOT NULL DEFAULT '{}'::jsonb,
    contact_information JSONB NOT NULL DEFAULT '{}'::jsonb,
    insurance_information JSONB NOT NULL DEFAULT '{}'::jsonb,
    insured_information JSONB NOT NULL DEFAULT '{}'::jsonb,
    icd_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    cpt_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    claim_status TEXT NOT NULL DEFAULT 'New Case' CHECK (claim_status IN (
        'Issue - 45 Days Crossed',
        'Issue - Already billed',
        'Issue - Already Billed',
        'Issue - CPT and Charges Missing',
        'Issue - ICDs Missing',
        'Issue - Reports Missing',
        'New Case',
        'Pending',
        'Returned',
        'Submitted'
    )),
    status_reason TEXT DEFAULT '',
    extraction_confidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMPTZ
);

-- 6. Document Page Tags Table (Supports page range tagging and splitting)
CREATE TABLE IF NOT EXISTS public.document_page_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL CHECK (tag_name IN (
        'AOB',
        'Bills',
        'DELIVERY RECEIPT',
        'INVOICE',
        'Medical Report',
        'MISCELLANEOUS',
        'NF-2'
    )),
    start_page INTEGER NOT NULL CHECK (start_page >= 1),
    end_page INTEGER NOT NULL CHECK (end_page >= start_page),
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT DEFAULT '',
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Indexes for High-Concurrency Production Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON public.documents(folder_name);
CREATE INDEX IF NOT EXISTS idx_assignments_doc ON public.document_assignments(document_id);
CREATE INDEX IF NOT EXISTS idx_assignments_emp ON public.document_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.document_assignments(status);
CREATE INDEX IF NOT EXISTS idx_claims_doc ON public.claims(document_id);
CREATE INDEX IF NOT EXISTS idx_claims_emp ON public.claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_page_tags_doc ON public.document_page_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_doc ON public.activity_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);

-- Auto-update updated_at timestamp on claims
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_claims_timestamp ON public.claims;
CREATE TRIGGER set_claims_timestamp
BEFORE UPDATE ON public.claims
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_page_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current authenticated user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Employees Policies
DROP POLICY IF EXISTS "Employees view own or admin views all" ON public.employees;
CREATE POLICY "Employees view own or admin views all"
ON public.employees FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert employees" ON public.employees;
CREATE POLICY "Admin can insert employees"
ON public.employees FOR INSERT
WITH CHECK (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update employees" ON public.employees;
CREATE POLICY "Admin can update employees"
ON public.employees FOR UPDATE
USING (public.is_admin() OR auth.uid() = id);

-- 2. Documents Policies
DROP POLICY IF EXISTS "Admin full access on documents" ON public.documents;
CREATE POLICY "Admin full access on documents"
ON public.documents FOR ALL
USING (public.is_admin());

DROP POLICY IF EXISTS "Employees view assigned documents" ON public.documents;
CREATE POLICY "Employees view assigned documents"
ON public.documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.document_assignments da
    WHERE da.document_id = public.documents.id
      AND da.employee_id = auth.uid()
  )
);

-- 3. Document Assignments Policies
DROP POLICY IF EXISTS "Admin full access on assignments" ON public.document_assignments;
CREATE POLICY "Admin full access on assignments"
ON public.document_assignments FOR ALL
USING (public.is_admin());

DROP POLICY IF EXISTS "Employees view assigned tasks" ON public.document_assignments;
CREATE POLICY "Employees view assigned tasks"
ON public.document_assignments FOR SELECT
USING (employee_id = auth.uid());

DROP POLICY IF EXISTS "Employees update assigned task status" ON public.document_assignments;
CREATE POLICY "Employees update assigned task status"
ON public.document_assignments FOR UPDATE
USING (employee_id = auth.uid());

-- 4. Claims Policies
DROP POLICY IF EXISTS "Admin view all claims" ON public.claims;
CREATE POLICY "Admin view all claims"
ON public.claims FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Employees view assigned claims" ON public.claims;
CREATE POLICY "Employees view assigned claims"
ON public.claims FOR SELECT
USING (employee_id = auth.uid());

DROP POLICY IF EXISTS "Employees create claims" ON public.claims;
CREATE POLICY "Employees create claims"
ON public.claims FOR INSERT
WITH CHECK (employee_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Employees update claims" ON public.claims;
CREATE POLICY "Employees update claims"
ON public.claims FOR UPDATE
USING (employee_id = auth.uid() OR public.is_admin());

-- 5. Document Page Tags Policies
DROP POLICY IF EXISTS "Admin full access on page tags" ON public.document_page_tags;
CREATE POLICY "Admin full access on page tags"
ON public.document_page_tags FOR ALL
USING (public.is_admin());

DROP POLICY IF EXISTS "Employees view tags for assigned documents" ON public.document_page_tags;
CREATE POLICY "Employees view tags for assigned documents"
ON public.document_page_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.document_assignments da
    WHERE da.document_id = public.document_page_tags.document_id
      AND da.employee_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employees insert tags for assigned documents" ON public.document_page_tags;
CREATE POLICY "Employees insert tags for assigned documents"
ON public.document_page_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.document_assignments da
    WHERE da.document_id = public.document_page_tags.document_id
      AND da.employee_id = auth.uid()
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Employees delete tags created by them" ON public.document_page_tags;
CREATE POLICY "Employees delete tags created by them"
ON public.document_page_tags FOR DELETE
USING (created_by = auth.uid() OR public.is_admin());

-- 6. Activity Logs Policies
DROP POLICY IF EXISTS "Admin view all logs" ON public.activity_logs;
CREATE POLICY "Admin view all logs"
ON public.activity_logs FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Employees view own activity logs" ON public.activity_logs;
CREATE POLICY "Employees view own activity logs"
ON public.activity_logs FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users create activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users create activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- Storage Buckets Configuration (Run in Supabase Storage SQL Editor)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('original-documents', 'original-documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tagged-documents', 'tagged-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage access policies
DROP POLICY IF EXISTS "Public or Authenticated Read Original" ON storage.objects;
CREATE POLICY "Public or Authenticated Read Original"
ON storage.objects FOR SELECT
USING (bucket_id IN ('original-documents', 'tagged-documents'));

DROP POLICY IF EXISTS "Authenticated Upload to Original Documents" ON storage.objects;
CREATE POLICY "Authenticated Upload to Original Documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('original-documents', 'tagged-documents'));

