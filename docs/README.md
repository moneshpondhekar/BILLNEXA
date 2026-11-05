# Bill Nexa – AI-Powered Document Processing & Claims Automation Platform

Bill Nexa is a healthcare intake and medical claims automation demonstration prototype designed to integrate alongside **MedPro Bills**.

It introduces a modern, high-efficiency AI document intelligence layer that reads scanned PDFs, extracts printed and handwritten clinical and demographic information, populates intake claim forms with source-page provenance, and automatically splits and tags documents for claim submission.

---

## Architecture Overview

```text
Incoming Bulk PDFs
       │
       ▼
[MODULE 1: Document Preprocessing & Folder Organization]
  • Patient Identification & Boundary Segmentation
  • Pre-sorted Patient Folders Generation
       │
       ▼
[BILL NEXA PLATFORM / MEDPRO BILLS INTEGRATION]
  1. Folder Dump & Document Ingestion
  2. Individual PDF Employee Assignment (Monesh, Chetan)
  3. Authenticated PDF Viewer & Page Navigation
  4. AI Extract & Auto-Fill (10-Stage Intelligence Pipeline)
  5. Confidence Scoring & Source-Page Provenance (High / Med / Low)
  6. PDF Page Range Tagging & Automated Page Splitting (PyMuPDF)
  7. Human-in-the-Loop Verification & Claim Submission
  8. Search & Tracking Claims Database (13 Columns + Export Log)
```

---

## Core Capabilities

- **Accurate MedPro Layout:** Matches the existing MedPro Bills patient, address, contact, insured, insurance, multiple ICD, multiple CPT, and claim status sections.
- **Two-Panel Workspace:** Desktop-first 46% / 54% split layout with independent scrolling and live synchronization.
- **AI Document Intelligence:** Scans multi-page PDFs, extracts structured demographic data, clinical impressions, diagnostic ICD-10 codes, procedure CPT codes, and service dates.
- **Confidence Scoring & Provenance:** Color-coded badges (Green ≥90%, Orange 70–89%, Red <70%) with clickable source page jumps.
- **Automated PDF Page Splitting:** Tagging pages (AOB, Bills, Delivery Receipt, Invoice, Medical Report, Miscellaneous, NF-2) splits the source PDF into individual PDF files stored in private storage.
- **Role-Based Access Control:** Separate workflows for Administrators and Claims Processing Employees (Monesh, Chetan).
- **Search & Tracking Database:** 13-column search and export table with comprehensive filters, detail views, and in-place editing.
- **Dual Database Architecture:** Out-of-the-box local persistence with complete Supabase PostgreSQL migrations and RLS policies included.

---

## Quick Start

```bash
# 1. Start the platform (serves both React UI and FastAPI API on port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# 2. Run automated 11-step end-to-end test suite
python backend/tests/test_e2e_workflow.py
```

Open **`http://127.0.0.1:8000`** in your browser.

---

## Demo Accounts

- **Admin:** `admin@gmail.com` / `Admin@123`
- **Employee 1 (Monesh):** `Monesh@gmail.com` / `Monesh@123`
- **Employee 2 (Chetan):** `Chetan@gmail.com` / `Chetan@123`

