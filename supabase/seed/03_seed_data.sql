-- ========================================================
-- BILL NEXA – Supabase Demo Seed Data
-- ========================================================

-- Insert Demo Profiles with SHA-256 hashed passwords
-- Admin@123 -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- Monesh@123 -> f628a8a48ef2e2c0e86b97893796cb57f68c34ea2775fbf10ea3dbd0320df6d7
-- Chetan@123 -> 44d18721c5f3e30fa275c13f684a0c8b65e998797b5e43a6d71b3eef0be4fca3

INSERT INTO profiles (id, full_name, email, role, password_hash)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@gmail.com', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'),
  ('22222222-2222-2222-2222-222222222222', 'Monesh', 'Monesh@gmail.com', 'employee', 'f628a8a48ef2e2c0e86b97893796cb57f68c34ea2775fbf10ea3dbd0320df6d7'),
  ('33333333-3333-3333-3333-333333333333', 'Chetan', 'Chetan@gmail.com', 'employee', '44d18721c5f3e30fa275c13f684a0c8b65e998797b5e43a6d71b3eef0be4fca3')
ON CONFLICT (email) DO NOTHING;

-- Seed Master ICD-10 Codes
INSERT INTO master_icd (code, description) VALUES
  ('M54.2', 'Cervicalgia (Neck pain)'),
  ('M54.5', 'Low back pain, unspecified'),
  ('S13.4XXA', 'Sprain of ligaments of cervical spine, initial encounter'),
  ('S39.012A', 'Strain of muscle, fascia and tendon of lower back, initial'),
  ('M54.6', 'Pain in thoracic spine'),
  ('M25.511', 'Pain in right shoulder'),
  ('M25.512', 'Pain in left shoulder'),
  ('G43.909', 'Migraine, unspecified, not intractable, without status')
ON CONFLICT (code) DO NOTHING;

-- Seed Master CPT Codes
INSERT INTO master_cpt (code, description, default_amount) VALUES
  ('99203', 'Office/outpatient visit new patient 30-44 min', 175.00),
  ('98941', 'Chiropractic manipulative treatment; 3-4 regions', 85.00),
  ('97012', 'Application of a modality; mechanical traction', 45.00),
  ('97110', 'Therapeutic exercises to develop strength and endurance', 65.00),
  ('97140', 'Manual therapy techniques (e.g. mobilization/manipulation)', 70.00),
  ('99213', 'Office/outpatient visit established patient 20-29 min', 110.00)
ON CONFLICT (code) DO NOTHING;

-- Seed Master Insurers
INSERT INTO master_insurers (id, name, phone, address) VALUES
  ('ins-001', 'Progressive Casualty', '(800) 627-4581', 'PO Box 94739, Cleveland, OH 44101'),
  ('ins-002', 'GEICO General Insurance', '(800) 841-3000', 'One GEICO Plaza, Washington, DC 20076'),
  ('ins-003', 'State Farm Mutual Auto', '(800) 782-8332', 'One State Farm Plaza, Bloomington, IL 61710'),
  ('ins-004', 'Allstate Fire & Casualty', '(800) 255-7828', 'PO Box 660598, Dallas, TX 75266'),
  ('ins-005', 'Travelers Indemnity', '(800) 252-4633', 'One Tower Square, Hartford, CT 06183')
ON CONFLICT (id) DO NOTHING;

-- Seed Master Providers
INSERT INTO master_providers (id, name, npi, specialty) VALUES
  ('prv-001', 'Dr. Kai Garcia Diaz, D.C.', '1892019482', 'Chiropractic Medicine'),
  ('prv-002', 'Dr. Elena Rostova, M.D.', '1928374650', 'Physical Medicine & Rehabilitation'),
  ('prv-003', 'Dr. Marcus Vance, D.O.', '1728394051', 'Orthopedic Surgery')
ON CONFLICT (id) DO NOTHING;

