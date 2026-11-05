import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.models.schema import get_db, Document, Assignment, Profile
from backend.app.schemas.models import DocumentResponse
from backend.app.core.config import settings
from backend.app.services.pdf_processor.pdf_service import pdf_service
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def get_documents(
    folder_id: Optional[str] = None,
    unassigned_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if folder_id:
        query = query.filter(Document.folder_id == folder_id)
        
    docs = query.order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        asg = db.query(Assignment).filter(Assignment.document_id == d.id).first()
        if unassigned_only and asg:
            continue
            
        results.append(DocumentResponse(
            id=d.id,
            folder_id=d.folder_id,
            folder_name=d.folder.folder_name if d.folder else "Default Batch",
            original_filename=d.original_filename,
            storage_path=d.storage_path,
            file_size_bytes=d.file_size_bytes,
            total_pages=d.total_pages,
            uploaded_by=d.uploaded_by,
            created_at=d.created_at,
            assignment_status=asg.status if asg else "Unassigned",
            assigned_employee_name=asg.employee.full_name if asg and asg.employee else None,
            assigned_employee_id=asg.employee_id if asg else None
        ))
    return results

@router.get("/{document_id}")
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    asg = db.query(Assignment).filter(Assignment.document_id == doc.id).first()
    return {
        "id": doc.id,
        "folder_id": doc.folder_id,
        "folder_name": doc.folder.folder_name if doc.folder else "Batch",
        "original_filename": doc.original_filename,
        "storage_path": doc.storage_path,
        "file_size_bytes": doc.file_size_bytes,
        "total_pages": doc.total_pages,
        "uploaded_by": doc.uploaded_by,
        "created_at": doc.created_at,
        "assignment_status": asg.status if asg else "Unassigned",
        "assignment_id": asg.id if asg else None,
        "assigned_employee_name": asg.employee.full_name if asg and asg.employee else None,
        "assigned_employee_id": asg.employee_id if asg else None,
        "priority": asg.priority if asg else "Normal",
        "instructions": asg.instructions if asg else ""
    }

@router.get("/{document_id}/file")
def get_document_file(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    abs_path = settings.STORAGE_DIR / doc.storage_path
    if not abs_path.exists():
        # Fallback to sample-data if storage path not found
        sample_path = settings.BASE_DIR / "sample-data" / "pdfs" / doc.original_filename
        if sample_path.exists():
            abs_path = sample_path
        else:
            raise HTTPException(status_code=404, detail="Physical PDF file not found on disk")
            
    return FileResponse(
        path=str(abs_path),
        media_type="application/pdf",
        filename=doc.original_filename
    )

@router.get("/{document_id}/preview")
def get_document_preview_page(document_id: str, page: int = 1, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    abs_path = settings.STORAGE_DIR / doc.storage_path
    if not abs_path.exists():
        sample_path = settings.BASE_DIR / "sample-data" / "pdfs" / doc.original_filename
        if sample_path.exists():
            abs_path = sample_path
        else:
            raise HTTPException(status_code=404, detail="Physical PDF file not found on disk")
            
    try:
        png_bytes = pdf_service.render_page_image(str(abs_path), page_number=page, zoom=1.5)
        return Response(content=png_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to render PDF page: {str(e)}")

