from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    avatar_url: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Folder & Document Schemas
class DocumentResponse(BaseModel):
    id: str
    folder_id: str
    folder_name: Optional[str] = None
    original_filename: str
    storage_path: str
    file_size_bytes: int
    total_pages: int
    uploaded_by: str
    created_at: datetime.datetime
    assignment_status: Optional[str] = "Unassigned"
    assigned_employee_name: Optional[str] = None
    assigned_employee_id: Optional[str] = None

class FolderResponse(BaseModel):
    id: str
    folder_name: str
    uploaded_by: str
    uploader_name: Optional[str] = None
    total_files: int
    assigned_count: int = 0
    unassigned_count: int = 0
    created_at: datetime.datetime
    documents: List[DocumentResponse] = []

# Assignment Schemas
class AssignmentCreateRequest(BaseModel):
    folder_id: str
    document_id: str
    employee_id: str
    priority: str = "Normal" # Normal | High
    instructions: Optional[str] = None

class AssignmentReassignRequest(BaseModel):
    assignment_id: str
    new_employee_id: str
    priority: Optional[str] = None
    instructions: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: str
    document_id: str
    document_filename: str
    folder_id: str
    folder_name: str
    total_pages: int
    employee_id: str
    employee_name: str
    employee_email: str
    assigned_by_id: str
    assigned_by_name: str
    assigned_at: datetime.datetime
    priority: str
    status: str
    instructions: Optional[str] = None
    claim_id: Optional[str] = None
    claim_status: Optional[str] = None

# Tagging Schemas
class DocumentTagCreateRequest(BaseModel):
    document_id: str
    claim_id: Optional[str] = None
    tag_name: str
    start_page: int
    end_page: int

class DocumentTagResponse(BaseModel):
    id: str
    document_id: str
    claim_id: Optional[str] = None
    tag_name: str
    start_page: int
    end_page: int
    page_count: int
    generated_storage_path: Optional[str] = None
    created_by: str
    created_at: datetime.datetime

# Claims & Forms Schemas
class PatientDetailSchema(BaseModel):
    initial: str = "Mr"
    first_name: str = ""
    last_name: str = ""
    ssn: str = ""
    dob: str = ""
    gender: str = "Male"

class PatientAddressSchema(BaseModel):
    address1: str = ""
    address2: str = ""
    zip: str = ""
    state: str = "NY"
    county: str = "Queens"
    city: str = "New York"
    address_type: str = "Home"

class ContactDetailSchema(BaseModel):
    contact_type: str = "Mobile"
    contact_number: str = ""
    extension: str = ""

class InsuredDetailSchema(BaseModel):
    same_as_patient: bool = True
    initial: Optional[str] = ""
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    ssn: Optional[str] = ""
    dob: Optional[str] = ""
    gender: Optional[str] = ""
    address1: Optional[str] = ""
    address2: Optional[str] = ""
    zip: Optional[str] = ""
    state: Optional[str] = ""
    county: Optional[str] = ""
    city: Optional[str] = ""
    contact_type: Optional[str] = ""
    contact_number: Optional[str] = ""
    extension: Optional[str] = ""
    case_reference: Optional[str] = ""

class InsuranceDetailSchema(BaseModel):
    insurer: str = ""
    policy_number: str = ""
    claim_number: str = ""
    date_of_accident: str = ""
    total_bills_found: int = 0
    total_bill_amount: float = 0.0
    first_dos: str = ""
    last_dos: str = ""
    last_intake_date: str = ""

class IcdRecordSchema(BaseModel):
    id: Optional[str] = None
    treating_provider: str = ""
    signing_provider: str = ""
    icd_code: str = ""
    icd_description: str = ""
    source_page: int = 1
    confidence: float = 0.95

class CptRecordSchema(BaseModel):
    id: Optional[str] = None
    serving_address: str = ""
    cpt_code: str = ""
    cpt_amount: float = 0.0
    cpt_description: str = ""
    dos_start: str = ""
    dos_end: str = ""
    source_page: int = 1
    confidence: float = 0.95

class ClaimSaveRequest(BaseModel):
    assignment_id: Optional[str] = None
    document_id: Optional[str] = None
    patient: PatientDetailSchema
    address: PatientAddressSchema
    contact: ContactDetailSchema
    insured: InsuredDetailSchema
    insurance: InsuranceDetailSchema
    icd_records: List[IcdRecordSchema] = []
    cpt_records: List[CptRecordSchema] = []
    claim_status: str = "New Case"
    status_reason: Optional[str] = ""
    is_draft: bool = False

class ClaimResponse(BaseModel):
    id: str
    claim_id_display: str
    assignment_id: Optional[str] = None
    document_id: Optional[str] = None
    document_filename: Optional[str] = None
    employee_id: str
    employee_name: Optional[str] = None
    patient_name: str
    claim_number: str
    policy_number: str
    insurer: str
    claim_status: str
    status_reason: str
    total_cpt_amount: float
    icd_codes_summary: str = ""
    cpt_codes_summary: str = ""
    submitted_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

class ActivityLogResponse(BaseModel):
    id: str
    user_name: str
    action: str
    details: str
    created_at: datetime.datetime

