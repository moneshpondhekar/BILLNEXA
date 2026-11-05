from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.models.schema import get_db, MasterICD, MasterCPT, MasterInsurer, MasterProvider

router = APIRouter(prefix="/masters", tags=["Master Tables"])

@router.get("/icd")
def get_icd_codes(db: Session = Depends(get_db)):
    codes = db.query(MasterICD).all()
    return [{"code": c.code, "description": c.description} for c in codes]

@router.get("/cpt")
def get_cpt_codes(db: Session = Depends(get_db)):
    codes = db.query(MasterCPT).all()
    return [{"code": c.code, "description": c.description, "default_amount": c.default_amount} for c in codes]

@router.get("/insurers")
def get_insurers(db: Session = Depends(get_db)):
    insurers = db.query(MasterInsurer).all()
    return [{"id": i.id, "name": i.name, "phone": i.phone, "address": i.address} for i in insurers]

@router.get("/providers")
def get_providers(db: Session = Depends(get_db)):
    providers = db.query(MasterProvider).all()
    return [{"id": p.id, "name": p.name, "npi": p.npi, "specialty": p.specialty} for p in providers]

