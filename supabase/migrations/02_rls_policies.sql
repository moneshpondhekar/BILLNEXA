-- ========================================================
-- BILL NEXA – Supabase Row Level Security (RLS) Policies
-- ========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Users can view profile"
ON profiles FOR SELECT
USING (auth.uid() = id OR is_admin());

-- 2. Folders & Documents: Admins have full access; employees can view documents assigned to them
CREATE POLICY "Admins full access to folders"
ON folders FOR ALL
USING (is_admin());

CREATE POLICY "Employees can view folders of assigned docs"
ON folders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM documents d
        JOIN assignments a ON a.document_id = d.id
        WHERE d.folder_id = folders.id AND a.employee_id = auth.uid()
    )
    OR is_admin()
);

CREATE POLICY "Admins full access to documents"
ON documents FOR ALL
USING (is_admin());

CREATE POLICY "Employees view assigned documents"
ON documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM assignments
        WHERE assignments.document_id = documents.id AND assignments.employee_id = auth.uid()
    )
    OR is_admin()
);

-- 3. Assignments: Admins full access; Employees view and update their own assigned tasks
CREATE POLICY "Admins full access to assignments"
ON assignments FOR ALL
USING (is_admin());

CREATE POLICY "Employees view own assignments"
ON assignments FOR SELECT
USING (employee_id = auth.uid() OR is_admin());

CREATE POLICY "Employees update own assignment status"
ON assignments FOR UPDATE
USING (employee_id = auth.uid() OR is_admin());

-- 4. Claims: Admins view all; Employees view, create, edit own claims
CREATE POLICY "Admins view all claims"
ON claims FOR SELECT
USING (is_admin());

CREATE POLICY "Employees view own claims"
ON claims FOR SELECT
USING (employee_id = auth.uid() OR is_admin());

CREATE POLICY "Employees create and update own claims"
ON claims FOR INSERT
WITH CHECK (employee_id = auth.uid() OR is_admin());

CREATE POLICY "Employees modify own claims"
ON claims FOR UPDATE
USING (employee_id = auth.uid() OR is_admin());

-- 5. Document Tags: Assigned employee or admin can insert/view
CREATE POLICY "Tags access policy"
ON document_tags FOR ALL
USING (
    created_by = auth.uid() OR is_admin() OR
    EXISTS (
        SELECT 1 FROM assignments
        WHERE assignments.document_id = document_tags.document_id AND assignments.employee_id = auth.uid()
    )
);

-- 6. Storage Buckets (RLS for Supabase Storage)
-- insert into storage.buckets (id, name, public) values ('original-documents', 'original-documents', false);
-- insert into storage.buckets (id, name, public) values ('tagged-documents', 'tagged-documents', false);

