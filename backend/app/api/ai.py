import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.models.schema import get_db, Document, Assignment, Profile, ActivityLog
from backend.app.services.ai_extraction.extractor import ai_extraction_service
from backend.app.core.config import settings
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Document Intelligence"])

@router.post("/extract/{document_id}")
def trigger_ai_extraction(
    document_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes the multi-stage AI extraction process for the assigned document.
    Extracts printed and handwritten data, calculates confidence, creates provenance.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    abs_path = settings.STORAGE_DIR / doc.storage_path
    if not abs_path.exists():
        sample_path = settings.BASE_DIR / "sample-data" / "pdfs" / doc.original_filename
        if sample_path.exists():
            abs_path = sample_path
        else:
            raise HTTPException(status_code=404, detail="Source PDF file not found on storage")

    # Update assignment status to 'In Progress' if currently 'Assigned'
    asg = db.query(Assignment).filter(Assignment.document_id == doc.id).first()
    if asg and asg.status == "Assigned":
        asg.status = "In Progress"
        db.commit()

    # Run extraction
    extraction_output = ai_extraction_service.extract_document(str(abs_path), doc.original_filename)

    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        document_id=doc.id,
        action="AI Extraction Completed",
        details=f"Extracted {extraction_output['summary']['total_fields']} fields, {extraction_output['summary']['icd_records_count']} ICDs, {extraction_output['summary']['cpt_records_count']} CPTs for {doc.original_filename}."
    )
    db.add(log)
    db.commit()

    return extraction_output

