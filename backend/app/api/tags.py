from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.models.schema import get_db, DocumentTag, Document, Profile, ActivityLog
from backend.app.schemas.models import DocumentTagCreateRequest, DocumentTagResponse
from backend.app.services.pdf_processor.pdf_service import pdf_service
from backend.app.core.config import settings
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/tags", tags=["Document Tagging"])

VALID_TAGS = ["AOB", "Bills", "DELIVERY RECEIPT", "INVOICE", "Medical Report", "MISCELLANEOUS", "NF-2"]

@router.get("/{document_id}", response_model=List[DocumentTagResponse])
def get_document_tags(document_id: str, db: Session = Depends(get_db)):
    tags = db.query(DocumentTag).filter(DocumentTag.document_id == document_id).order_by(DocumentTag.start_page.asc()).all()
    return tags

@router.post("/save", response_model=DocumentTagResponse)
def save_document_tag(
    req: DocumentTagCreateRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves a document page range tag AND splits the source PDF into a distinct
    tagged PDF file (e.g. AOB.pdf, Bills.pdf, Medical_Report.pdf) stored on disk.
    """
    # Normalize tag name case-insensitively
    raw_name = req.tag_name.strip()
    matched_tag = next((v for v in VALID_TAGS if v.lower() == raw_name.lower()), None)
    if not matched_tag:
        raise HTTPException(status_code=400, detail=f"Invalid tag name '{req.tag_name}'. Must be one of {VALID_TAGS}")
    
    clean_tag_name = matched_tag
        
    if req.start_page < 1 or req.end_page < req.start_page:
        raise HTTPException(status_code=400, detail=f"Invalid page range: {req.start_page} to {req.end_page}")
        
    doc = db.query(Document).filter(Document.id == req.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if req.end_page > doc.total_pages:
        raise HTTPException(status_code=400, detail=f"End page {req.end_page} exceeds document total pages ({doc.total_pages})")

    abs_src_path = settings.STORAGE_DIR / doc.storage_path
    if not abs_src_path.exists():
        sample_path = settings.BASE_DIR / "sample-data" / "pdfs" / doc.original_filename
        if sample_path.exists():
            abs_src_path = sample_path
        else:
            raise HTTPException(status_code=404, detail="Source PDF file not found")

    # Split PDF and generate tagged output file
    try:
        tagged_storage_path = pdf_service.split_and_save_tagged_pdf(
            source_pdf_path=str(abs_src_path),
            start_page=req.start_page,
            end_page=req.end_page,
            tag_name=clean_tag_name,
            document_id=doc.id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to split PDF: {str(e)}")

    page_count = (req.end_page - req.start_page) + 1
    
    # Check if exact tag range already exists for this document
    existing_tag = db.query(DocumentTag).filter(
        DocumentTag.document_id == doc.id,
        DocumentTag.start_page == req.start_page,
        DocumentTag.end_page == req.end_page
    ).first()

    if existing_tag:
        existing_tag.tag_name = clean_tag_name
        existing_tag.generated_storage_path = tagged_storage_path
        existing_tag.created_by = current_user.id
        db.commit()
        db.refresh(existing_tag)
        return existing_tag

    tag = DocumentTag(
        document_id=doc.id,
        claim_id=req.claim_id,
        tag_name=clean_tag_name,
        start_page=req.start_page,
        end_page=req.end_page,
        page_count=page_count,
        generated_storage_path=tagged_storage_path,
        created_by=current_user.id
    )
    db.add(tag)
    
    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        document_id=doc.id,
        action="Document Tag Saved",
        details=f"Saved tag '{req.tag_name}' for pages {req.start_page}-{req.end_page} ({page_count} pages). Generated split PDF."
    )
    db.add(log)
    db.commit()
    db.refresh(tag)

    return tag

@router.delete("/{tag_id}")
def delete_document_tag(
    tag_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tag = db.query(DocumentTag).filter(DocumentTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
        
    # Delete generated file if exists
    if tag.generated_storage_path:
        fpath = settings.STORAGE_DIR / tag.generated_storage_path
        if fpath.exists():
            try:
                fpath.unlink()
            except Exception:
                pass
                
    db.delete(tag)
    
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        document_id=tag.document_id,
        action="Document Tag Deleted",
        details=f"Deleted tag '{tag.tag_name}' (pages {tag.start_page}-{tag.end_page})."
    )
    db.add(log)
    db.commit()
    return {"message": "Tag deleted successfully", "tag_id": tag_id}

@router.get("/file/{tag_id}")
def get_tagged_pdf_file(tag_id: str, db: Session = Depends(get_db)):
    tag = db.query(DocumentTag).filter(DocumentTag.id == tag_id).first()
    if not tag or not tag.generated_storage_path:
        raise HTTPException(status_code=404, detail="Tagged PDF not found")
        
    abs_path = settings.STORAGE_DIR / tag.generated_storage_path
    if not abs_path.exists():
        raise HTTPException(status_code=404, detail="Physical tagged PDF file not found on disk")
        
    return FileResponse(
        path=str(abs_path),
        media_type="application/pdf",
        filename=Path(abs_path).name
    )

@router.post("/auto-group/{document_id}", response_model=List[DocumentTagResponse])
def auto_group_document_tags(
    document_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cleans up existing tags and automatically applies the intelligence-based
    document tag grouping (NF-2, AOB, Bills, Medical Report, INVOICE, DELIVERY RECEIPT, MISCELLANEOUS).
    """
    from backend.app.services.ai_extraction.extractor import ai_extraction_service

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    abs_src_path = settings.STORAGE_DIR / doc.storage_path
    if not abs_src_path.exists():
        sample_path = settings.BASE_DIR / "sample-data" / "pdfs" / doc.original_filename
        if sample_path.exists():
            abs_src_path = sample_path
        else:
            raise HTTPException(status_code=404, detail="Source PDF file not found")

    # Run extraction to get clean grouped tags
    result = ai_extraction_service.extract_document(str(abs_src_path), doc.original_filename)
    suggested = result.get("suggested_tags", [])

    # Remove existing tags for this document to avoid fragmented duplicates
    old_tags = db.query(DocumentTag).filter(DocumentTag.document_id == doc.id).all()
    for ot in old_tags:
        db.delete(ot)
    db.commit()

    created_tags = []
    for st in suggested:
        tag_name = st["tag"]
        s_page = st["start_page"]
        e_page = st["end_page"]
        p_count = (e_page - s_page) + 1

        try:
            tagged_path = pdf_service.split_and_save_tagged_pdf(
                source_pdf_path=str(abs_src_path),
                start_page=s_page,
                end_page=e_page,
                tag_name=tag_name,
                document_id=doc.id
            )
        except Exception:
            tagged_path = ""

        new_tag = DocumentTag(
            document_id=doc.id,
            tag_name=tag_name,
            start_page=s_page,
            end_page=e_page,
            page_count=p_count,
            generated_storage_path=tagged_path,
            created_by=current_user.id
        )
        db.add(new_tag)
        created_tags.append(new_tag)

    db.commit()
    for ct in created_tags:
        db.refresh(ct)

    return created_tags


