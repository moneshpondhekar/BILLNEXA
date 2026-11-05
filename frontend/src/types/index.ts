export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'employee';
  avatar_url?: string;
}

export interface DocumentItem {
  id: string;
  folder_id: string;
  folder_name?: string;
  original_filename: string;
  storage_path: string;
  file_size_bytes: number;
  total_pages: number;
  uploaded_by: string;
  created_at: string;
  assignment_status?: string;
  assigned_employee_name?: string;
  assigned_employee_id?: string;
}

export interface FolderItem {
  id: string;
  folder_name: string;
  uploaded_by: string;
  uploader_name?: string;
  total_files: number;
  assigned_count: number;
  unassigned_count: number;
  created_at: string;
  documents: DocumentItem[];
}

export interface AssignmentItem {
  id: string;
  document_id: string;
  document_filename: string;
  folder_id: string;
  folder_name: string;
  total_pages: number;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  assigned_by_id: string;
  assigned_by_name: string;
  assigned_at: string;
  priority: 'Normal' | 'High';
  status: 'Unassigned' | 'Assigned' | 'In Progress' | 'Pending Review' | 'Completed';
  instructions?: string;
  claim_id?: string;
  claim_status?: string;
}

export interface IcdRecordItem {
  id?: string;
  treating_provider: string;
  signing_provider: string;
  icd_code: string;
  icd_description: string;
  source_page: number;
  confidence: number;
}

export interface CptRecordItem {
  id?: string;
  serving_address: string;
  cpt_code: string;
  cpt_amount: number;
  cpt_description: string;
  dos_start: string;
  dos_end: string;
  source_page: number;
  confidence: number;
}

export interface DocumentTagItem {
  id: string;
  document_id: string;
  claim_id?: string;
  tag_name: 'AOB' | 'Bills' | 'DELIVERY RECEIPT' | 'INVOICE' | 'Medical Report' | 'MISCELLANEOUS' | 'NF-2';
  start_page: number;
  end_page: number;
  page_count: number;
  generated_storage_path?: string;
  created_by?: string;
  created_at: string;
}

export interface FieldProvenanceItem {
  field: string;
  value: string;
  page: number;
  confidence: number;
}

export interface ClaimItem {
  id: string;
  claim_id_display: string;
  assignment_id?: string;
  document_id?: string;
  document_filename?: string;
  employee_id: string;
  employee_name?: string;
  patient_name: string;
  claim_number: string;
  policy_number: string;
  insurer: string;
  claim_status: string;
  status_reason: string;
  total_cpt_amount: number;
  icd_codes_summary?: string;
  cpt_codes_summary?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogItem {
  id: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}

