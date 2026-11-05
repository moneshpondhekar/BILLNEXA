import sys
import hashlib
import datetime
import shutil
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from backend.app.models.schema import (
    init_db, SessionLocal, Profile, Folder, Document, Assignment, Claim,
    PatientDetail, PatientAddress, ContactDetail, InsuredDetail, InsuranceDetail,
    IcdRecord, CptRecord, DocumentTag, MasterICD, MasterCPT, MasterInsurer, MasterProvider,
    ActivityLog
)
from backend.app.services.pdf_processor.pdf_service import pdf_service
from backend.app.core.config import settings

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Check if admin already exists
    if db.query(Profile).filter_by(email="admin@gmail.com").first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding initial users and master tables...")
    admin = Profile(
        id="11111111-1111-1111-1111-111111111111",
        full_name="System Administrator",
        email="admin@gmail.com",
        role="admin",
        password_hash=hash_pw("Admin@123")
    )
    monesh = Profile(
        id="22222222-2222-2222-2222-222222222222",
        full_name="Monesh",
        email="Monesh@gmail.com",
        role="employee",
        password_hash=hash_pw("Monesh@123")
    )
    chetan = Profile(
        id="33333333-3333-3333-3333-333333333333",
        full_name="Chetan",
        email="Chetan@gmail.com",
        role="employee",
        password_hash=hash_pw("Chetan@123")
    )
    db.add_all([admin, monesh, chetan])
    db.commit()

    # Master ICD
    icd_list = [
        MasterICD(code="M54.2", description="Cervicalgia (Neck pain)"),
        MasterICD(code="M54.5", description="Low back pain, unspecified"),
        MasterICD(code="S13.4XXA", description="Sprain of ligaments of cervical spine, initial encounter"),
        MasterICD(code="S39.012A", description="Strain of muscle, fascia and tendon of lower back, initial"),
        MasterICD(code="M54.6", description="Pain in thoracic spine"),
        MasterICD(code="M25.511", description="Pain in right shoulder"),
        MasterICD(code="M25.512", description="Pain in left shoulder"),
        MasterICD(code="G43.909", description="Migraine, unspecified, not intractable, without status")
    ]
    db.add_all(icd_list)

    # Master CPT
    cpt_list = [
        MasterCPT(code="99203", description="Office/outpatient visit new patient 30-44 min", default_amount=175.00),
        MasterCPT(code="98941", description="Chiropractic manipulative treatment; 3-4 regions", default_amount=85.00),
        MasterCPT(code="97012", description="Application of a modality; mechanical traction", default_amount=45.00),
        MasterCPT(code="97110", description="Therapeutic exercises to develop strength and endurance", default_amount=65.00),
        MasterCPT(code="97140", description="Manual therapy techniques (e.g. mobilization/manipulation)", default_amount=70.00),
        MasterCPT(code="99213", description="Office/outpatient visit established patient 20-29 min", default_amount=110.00)
    ]
    db.add_all(cpt_list)

    # Master Insurers
    insurers_list = [
        MasterInsurer(id="ins-001", name="Progressive Casualty", phone="(800) 627-4581", address="PO Box 94739, Cleveland, OH 44101"),
        MasterInsurer(id="ins-002", name="GEICO General Insurance", phone="(800) 841-3000", address="One GEICO Plaza, Washington, DC 20076"),
        MasterInsurer(id="ins-003", name="State Farm Mutual Auto", phone="(800) 782-8332", address="One State Farm Plaza, Bloomington, IL 61710"),
        MasterInsurer(id="ins-004", name="Allstate Fire & Casualty", phone="(800) 255-7828", address="PO Box 660598, Dallas, TX 75266"),
        MasterInsurer(id="ins-005", name="Travelers Indemnity", phone="(800) 252-4633", address="One Tower Square, Hartford, CT 06183")
    ]
    db.add_all(insurers_list)

    # Master Providers
    providers_list = [
        MasterProvider(id="prv-001", name="Dr. Kai Garcia Diaz, D.C.", npi="1892019482", specialty="Chiropractic Medicine"),
        MasterProvider(id="prv-002", name="Dr. Elena Rostova, M.D.", npi="1928374650", specialty="Physical Medicine & Rehabilitation"),
        MasterProvider(id="prv-003", name="Dr. Marcus Vance, D.O.", npi="1728394051", specialty="Orthopedic Surgery")
    ]
    db.add_all(providers_list)
    db.commit()

    # Pre-sorted Folder 1
    folder1 = Folder(
        id="fld-001",
        folder_name="Patient_Batch_001_Elmhurst",
        uploaded_by=admin.id,
        total_files=2,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    # Pre-sorted Folder 2
    folder2 = Folder(
        id="fld-002",
        folder_name="Patient_Batch_002_Queens",
        uploaded_by=admin.id,
        total_files=2,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
    )
    db.add_all([folder1, folder2])
    db.commit()

    # Documents
    doc1_path = str(settings.ORIGINAL_DOCS_DIR / "Patient_001.pdf")
    doc2_path = str(settings.ORIGINAL_DOCS_DIR / "Patient_002.pdf")
    doc3_path = str(settings.ORIGINAL_DOCS_DIR / "Patient_003.pdf")
    doc4_path = str(settings.ORIGINAL_DOCS_DIR / "Patient_004.pdf")

    d1 = Document(
        id="doc-001",
        folder_id=folder1.id,
        original_filename="Patient_001.pdf",
        storage_path="original-documents/Patient_001.pdf",
        file_size_bytes=Path(doc1_path).stat().st_size if Path(doc1_path).exists() else 10240,
        total_pages=12,
        uploaded_by=admin.id
    )
    d2 = Document(
        id="doc-002",
        folder_id=folder1.id,
        original_filename="Patient_002.pdf",
        storage_path="original-documents/Patient_002.pdf",
        file_size_bytes=Path(doc2_path).stat().st_size if Path(doc2_path).exists() else 8192,
        total_pages=8,
        uploaded_by=admin.id
    )
    d3 = Document(
        id="doc-003",
        folder_id=folder2.id,
        original_filename="Patient_003.pdf",
        storage_path="original-documents/Patient_003.pdf",
        file_size_bytes=Path(doc3_path).stat().st_size if Path(doc3_path).exists() else 6144,
        total_pages=6,
        uploaded_by=admin.id
    )
    d4 = Document(
        id="doc-004",
        folder_id=folder2.id,
        original_filename="Patient_004.pdf",
        storage_path="original-documents/Patient_004.pdf",
        file_size_bytes=Path(doc4_path).stat().st_size if Path(doc4_path).exists() else 5120,
        total_pages=5,
        uploaded_by=admin.id
    )
    db.add_all([d1, d2, d3, d4])
    db.commit()

    # Assignment 1: Patient_001.pdf -> Monesh (Assigned - Ready for Step 4-9 Demo!)
    asg1 = Assignment(
        id="asg-001",
        document_id=d1.id,
        employee_id=monesh.id,
        assigned_by=admin.id,
        priority="High",
        status="Assigned",
        instructions="Please verify handwritten ICD codes and complete page tagging for No-Fault submission."
    )
    # Assignment 2: Patient_002.pdf -> Chetan (In Progress)
    asg2 = Assignment(
        id="asg-002",
        document_id=d2.id,
        employee_id=chetan.id,
        assigned_by=admin.id,
        priority="Normal",
        status="In Progress",
        instructions="Review physical medicine CPT units."
    )
    # Assignment 3: Patient_003.pdf -> Monesh (Completed Claim)
    asg3 = Assignment(
        id="asg-003",
        document_id=d3.id,
        employee_id=monesh.id,
        assigned_by=admin.id,
        priority="Normal",
        status="Completed",
        instructions="Standard processing."
    )
    # Note: doc-004 remains Unassigned so Admin can assign it to someone in Step 3!

    db.add_all([asg1, asg2, asg3])
    db.commit()

    # Create completed claim for Assignment 3 (Samantha Miller)
    claim1 = Claim(
        id="clm-001",
        claim_id_display="CLM-2026-001",
        assignment_id=asg3.id,
        employee_id=monesh.id,
        document_id=d3.id,
        patient_name="Samantha Miller",
        claim_number="CLM-9912044-SF",
        policy_number="SF-482910-2026",
        insurer="State Farm Mutual Auto",
        claim_status="Submitted",
        status_reason="All medical records and AOB verified. Ready for insurance adjudication.",
        total_cpt_amount=220.00,
        submitted_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
    )
    db.add(claim1)
    db.commit()

    # Add patient detail for claim1
    p_det = PatientDetail(
        claim_id=claim1.id,
        initial="Ms",
        first_name="Samantha",
        last_name="Miller",
        ssn="***-**-9204",
        dob="22-03-1991",
        gender="Female"
    )
    p_addr = PatientAddress(
        claim_id=claim1.id,
        address1="142 Atlantic Ave, Suite 3",
        zip="11201",
        state="NY",
        county="Kings",
        city="Brooklyn",
        address_type="Home"
    )
    p_cont = ContactDetail(
        claim_id=claim1.id,
        contact_type="Mobile",
        contact_number="(347) 912-4029"
    )
    ins_det = InsuranceDetail(
        claim_id=claim1.id,
        insurer="State Farm Mutual Auto",
        policy_number="SF-482910-2026",
        claim_number="CLM-9912044-SF",
        date_of_accident="05-09-2026",
        total_bills_found=2,
        total_bill_amount=220.00
    )
    icd1 = IcdRecord(
        claim_id=claim1.id,
        treating_provider="Dr. Marcus Vance, D.O.",
        signing_provider="Dr. Marcus Vance, D.O.",
        icd_code="M54.2",
        icd_description="Cervicalgia (Neck pain)",
        source_page=2,
        confidence=0.95
    )
    cpt1 = CptRecord(
        claim_id=claim1.id,
        serving_address="Brooklyn Spine & Joint - 142 Atlantic Ave",
        cpt_code="99203",
        cpt_amount=175.00,
        cpt_description="Office/outpatient visit new patient 30-44 min",
        dos_start="10-09-2026",
        dos_end="10-09-2026",
        source_page=3,
        confidence=0.95
    )
    cpt2 = CptRecord(
        claim_id=claim1.id,
        serving_address="Brooklyn Spine & Joint - 142 Atlantic Ave",
        cpt_code="97012",
        cpt_amount=45.00,
        cpt_description="Application of a modality; mechanical traction",
        dos_start="12-09-2026",
        dos_end="12-09-2026",
        source_page=4,
        confidence=0.88
    )
    
    # Generate split tagged PDFs for claim 1
    tag_path1 = pdf_service.split_and_save_tagged_pdf(doc3_path, 1, 2, "NF-2", d3.id)
    tag_path2 = pdf_service.split_and_save_tagged_pdf(doc3_path, 3, 4, "Bills", d3.id)
    tag_path3 = pdf_service.split_and_save_tagged_pdf(doc3_path, 5, 6, "Medical Report", d3.id)
    
    tag1 = DocumentTag(
        document_id=d3.id,
        claim_id=claim1.id,
        tag_name="NF-2",
        start_page=1,
        end_page=2,
        page_count=2,
        generated_storage_path=tag_path1,
        created_by=monesh.id
    )
    tag2 = DocumentTag(
        document_id=d3.id,
        claim_id=claim1.id,
        tag_name="Bills",
        start_page=3,
        end_page=4,
        page_count=2,
        generated_storage_path=tag_path2,
        created_by=monesh.id
    )
    tag3 = DocumentTag(
        document_id=d3.id,
        claim_id=claim1.id,
        tag_name="Medical Report",
        start_page=5,
        end_page=6,
        page_count=2,
        generated_storage_path=tag_path3,
        created_by=monesh.id
    )

    # Activity logs
    act1 = ActivityLog(user_id=admin.id, user_name="System Administrator", action="Document Assigned", details="Assigned Patient_001.pdf to Monesh with High Priority.")
    act2 = ActivityLog(user_id=monesh.id, user_name="Monesh", claim_id=claim1.id, document_id=d3.id, action="Claim Submitted", details="Claim CLM-2026-001 submitted with 1 ICD and 2 CPT records ($220.00).")

    db.add_all([p_det, p_addr, p_cont, ins_det, icd1, cpt1, cpt2, tag1, tag2, tag3, act1, act2])
    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
