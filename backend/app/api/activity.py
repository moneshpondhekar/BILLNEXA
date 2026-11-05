from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.models.schema import get_db, ActivityLog
from backend.app.schemas.models import ActivityLogResponse

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])

@router.get("", response_model=List[ActivityLogResponse])
def get_activity_logs(
    user_id: Optional[str] = None,
    claim_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLog)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if claim_id:
        query = query.filter(ActivityLog.claim_id == claim_id)
        
    logs = query.order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return [
        ActivityLogResponse(
            id=l.id,
            user_name=l.user_name,
            action=l.action,
            details=l.details,
            created_at=l.created_at
        ) for l in logs
    ]

