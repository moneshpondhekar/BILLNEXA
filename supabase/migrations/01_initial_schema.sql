-- ========================================================
-- BILL NEXA – Supabase PostgreSQL Initial Schema
-- AI-Powered Document Processing & Claims Automation
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Auth integration)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Folders Table
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_name TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    total_files INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 1,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High')),
    status TEXT DEFAULT 'Assigned' CHECK (status IN ('Unassigned', 'Assigned', 'In Progress', 'Pending Review', 'Completed')),
    instructions TEXT
);

-- 5. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id_display TEXT UNIQUE NOT NULL,
    assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    patient_name TEXT DEFAULT '',
    claim_number TEXT DEFAULT '',
    policy_number TEXT DEFAULT '',
    insurer TEXT DEFAULT '',
    claim_status TEXT DEFAULT 'New Case' CHECK (claim_status IN (
        'Issue - 45 Days Crossed',
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
    extraction_status TEXT DEFAULT 'pending',
    total_cpt_amount NUMERIC(12,2) DEFAULT 0.00,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Patient Details Table
CREATE TABLE IF NOT EXISTS patient_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    initial TEXT DEFAULT 'Mr',
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    ssn TEXT DEFAULT '',
    dob TEXT DEFAULT '',
    gender TEXT DEFAULT 'Male'
);

-- 7. Patient Addresses Table
CREATE TABLE IF NOT EXISTS patient_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    address1 TEXT DEFAULT '',
    address2 TEXT DEFAULT '',
    zip TEXT DEFAULT '',
    state TEXT DEFAULT 'NY',
    county TEXT DEFAULT 'Queens',
    city TEXT DEFAULT 'New York',
    address_type TEXT DEFAULT 'Home'
);

-- 8. Contact Details Table
CREATE TABLE IF NOT EXISTS contact_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    contact_type TEXT DEFAULT 'Mobile',
    contact_number TEXT DEFAULT '',
    extension TEXT DEFAULT ''
);

-- 9. Insured Details Table
CREATE TABLE IF NOT EXISTS insured_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    same_as_patient BOOLEAN DEFAULT TRUE,
    insured_data_json JSONB DEFAULT '{}'::jsonb
);

-- 10. Insurance Details Table
CREATE TABLE IF NOT EXISTS insurance_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    insurer TEXT DEFAULT '',
    policy_number TEXT DEFAULT '',
    claim_number TEXT DEFAULT '',
    date_of_accident TEXT DEFAULT '',
    total_bills_found INTEGER DEFAULT 0,
    total_bill_amount NUMERIC(12,2) DEFAULT 0.00,
    first_dos TEXT DEFAULT '',
    last_dos TEXT DEFAULT '',
    last_intake_date TEXT DEFAULT ''
);

-- 11. ICD Records Table
CREATE TABLE IF NOT EXISTS icd_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    treating_provider TEXT DEFAULT '',
    signing_provider TEXT DEFAULT '',
    icd_code TEXT DEFAULT '',
    icd_description TEXT DEFAULT '',
    source_page INTEGER DEFAULT 1,
    confidence NUMERIC(4,3) DEFAULT 0.950
);

-- 12. CPT Records Table
CREATE TABLE IF NOT EXISTS cpt_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    serving_address TEXT DEFAULT '',
    cpt_code TEXT DEFAULT '',
    cpt_amount NUMERIC(10,2) DEFAULT 0.00,
    cpt_description TEXT DEFAULT '',
    dos_start TEXT DEFAULT '',
    dos_end TEXT DEFAULT '',
    source_page INTEGER DEFAULT 1,
    confidence NUMERIC(4,3) DEFAULT 0.950
);

-- 13. Document Tags Table
CREATE TABLE IF NOT EXISTS document_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
    tag_name TEXT NOT NULL CHECK (tag_name IN ('AOB', 'Bills', 'DELIVERY RECEIPT', 'INVOICE', 'Medical Report', 'MISCELLANEOUS', 'NF-2')),
    start_page INTEGER NOT NULL,
    end_page INTEGER NOT NULL,
    page_count INTEGER DEFAULT 1,
    generated_storage_path TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Extraction Results Table
CREATE TABLE IF NOT EXISTS extraction_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    raw_extraction_json JSONB DEFAULT '{}'::jsonb,
    validation_results JSONB DEFAULT '{}'::jsonb,
    extraction_model TEXT DEFAULT 'demo-vision-model',
    extraction_status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Field Provenance Table
CREATE TABLE IF NOT EXISTS field_provenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    extracted_value TEXT DEFAULT '',
    source_document_id UUID,
    source_page INTEGER DEFAULT 1,
    confidence NUMERIC(4,3) DEFAULT 0.950,
    employee_corrected BOOLEAN DEFAULT FALSE,
    final_value TEXT DEFAULT ''
);

-- 16. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT DEFAULT 'System',
    claim_id UUID,
    document_id UUID,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_document ON assignments(document_id);
CREATE INDEX IF NOT EXISTS idx_claims_employee ON claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_document_tags_doc ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_activity_claim ON activity_logs(claim_id);

