# Bill Nexa – Live Demonstration Walkthrough Guide
## Two-Module AI Document Processing & Claims Automation Platform

This guide provides the exact script and step-by-step workflow for presenting Bill Nexa to leadership and claims operational teams currently using MedPro Bills.

---

## Demo Credentials Quick-Reference

| Role | Name | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@gmail.com` | `Admin@123` | Folder Upload, Assignment, Search & Live Tracking |
| **Employee 1** | Monesh | `Monesh@gmail.com` | `Monesh@123` | Intake Bills Workspace, AI Auto-Fill, Page Tagging |
| **Employee 2** | Chetan | `Chetan@gmail.com` | `Chetan@123` | Intake Processing, Claims Verification |

> **Tip:** You can switch between demo accounts instantly using the **Demo Role Switcher pills** in the top navigation bar.

---

## 11-Step End-to-End Demonstration Scenario

### STEP 1 – Admin Login & Operational Dashboard
1. Open `http://127.0.0.1:8000/login`.
2. Click the **Admin** quick-select card or enter `admin@gmail.com` / `Admin@123`.
3. Highlight the **Two-Module Architecture Visualizer**:
   - **Module 1 (Preprocessed):** Ingestion & patient batch organization ready.
   - **Module 2 (Core AI):** Intake Bills automation active.
4. Review the 6 KPI cards: Total Folders, Total Documents, Total Assigned, Pending, Completed Claims, and Exceptions.

---

### STEP 2 – Ingest Pre-Sorted Patient Folder (Module 1 Hand-Off)
1. In the top navbar, click **Folder Dump** (`/admin/upload`).
2. Point out that incoming client documents have already been sorted into patient folders.
3. Drag & drop `sample-data/folders/Patient_Batch_001_Elmhurst` or enter a batch name:
   `Patient_Batch_001_Elmhurst` and select `Patient_001.pdf` and `Patient_002.pdf`.
4. Click **Confirm & Upload Folder**.
5. Observe the parsed documents table showing:
   - PDF filename
   - Total page counts (e.g. 12 pages)
   - Unassigned status badge
   - **Preview PDF** button allowing inspection prior to allocation.

---

### STEP 3 – Individual PDF Employee Assignment
1. Click **Assignment** (`/admin/assignments`).
2. Demonstrate that documents are **never mass-assigned automatically**:
   - Select Folder: `Patient_Batch_001_Elmhurst`
   - Select PDF Document: `Patient_001.pdf`
   - Select Employee: `Monesh` (`Monesh@gmail.com`)
   - Priority: `High Priority (Expedited)`
   - Instructions: `Verify handwritten clinical notes on page 6.`
3. Click **Assign Document**.
4. Confirm that the assignment count updates immediately and appears in the assignment history table.

---

### STEP 4 – Employee Login (Monesh)
1. Click **Monesh** on the top role switcher pill or log out and log in with `Monesh@gmail.com` / `Monesh@123`.
2. The system automatically redirects to `/employee/dashboard`.
3. Click **My Assigned Documents** (`/employee/tasks`).
4. Notice the clean, mandatory 3-column table:
   `| File Name | Status | Action |`
5. Show that `Patient_001.pdf` is present with status `Assigned`.

---

### STEP 5 – Open PDF Preview
1. Click **Open PDF** next to `Patient_001.pdf`.
2. Shows the high-resolution scanned document in an authenticated viewer.
3. Demonstrate:
   - Page navigation (Page 1 to Page 12)
   - Zoom in/out
   - Rotation 90°
   - Emphasize that there is **no public file URL or exposed download button** to protect health data.

---

### STEP 6 – Launch AI Intake Bills Workspace & Auto-Fill
1. Click **Process in Intake Bills** or return to tasks and click **Complete Task**.
2. This launches the **Two-Panel Desktop Workspace** (46% Left Form / 54% Right PDF Viewer).
3. Click the prominent purple **"AI Extract & Auto-Fill"** button in the top toolbar.
4. Watch the **10-Stage Document Intelligence Modal** execute in real time:
   1. Reading PDF document structure
   2. Rendering high-resolution scanned pages
   3. Performing OCR & handwriting recognition
   4. Identifying patient demographic details
   5. Extracting insurance & policy information
   6. Identifying ICD-10 diagnostic codes
   7. Identifying CPT codes, amounts & DOS
   8. Detecting document tags & page ranges
   9. Validating extracted fields against master tables
   10. Populating the Intake Bills form draft
5. Observe the completion summary showing total fields (21), high-confidence (18), review required (3), ICDs identified (3), and CPTs (3).
6. Click **Continue to Form**.

---

### STEP 7 – Employee Verification & Confidence Scores
1. Review the populated form fields:
   - **Section A:** Patient Garcia Diaz, masked SSN (`***-**-1995`), DOB `03-06-1995`, Gender Female.
   - **Matching Patient Check:** Shows candidate record with "Match Record" action.
   - **Section B:** Address 90-46 Corona Avenue, Elmhurst NY 11373.
   - **Section C:** Contact (631) 438-2678.
   - **Section D:** Insured details automatically synced via `<<- Insured details same as Patient`.
   - **Section E:** Progressive Casualty, Policy #924786101, Claim #CLM-2015-PROG, DOA 06-11-2026.
   - **Historical Summary:** 3 prior bills found totaling $495.00.
   - **Section F (ICD):** M54.2 Cervicalgia (96%), S13.4XXA Cervical Sprain (88%), M54.5 Low Back Pain (68% - Low confidence handwriting flagged for review).
   - **Section G (CPT):** 99203 ($175.00), 98941 ($85.00), 97012 ($45.00).
2. Click the **p.6** or **p.4** source reference on any confidence badge.
   - Notice the right panel immediately jumps to that exact source page in the PDF!

---

### STEP 8 – Document Page Tagging & Automated PDF Splitting
1. Look at the top tagging bar on the right panel:
   - `From:` 1
   - `To:` 2
   - `Select Tag:` NF-2
   - Click the green **Save (Floppy icon)** button.
2. The system **actually extracts pages 1–2 using PyMuPDF and creates a split PDF** in `storage/tagged-documents/`!
3. Repeat for:
   - `AOB` (Page 3 to 3)
   - `Bills` (Page 4 to 5)
   - `Medical Report` (Page 6 to 8)
4. Show the **Saved Tags mini-strip** with page references and the **Eye icon** to preview the generated split PDF.
5. Notice that tagged pages on the thumbnail strip now have green indicators!

---

### STEP 9 – Save Draft & Submit Claim
1. In Section H:
   - Select Claim Status: **Submitted** (or choose an Issue status like `Issue - 45 Days Crossed` with an explanatory reason).
   - Status Reason: `Verified against original scanned intake and AOB.`
2. Click **Submit Claim to Database**.
3. A success confirmation appears and automatically transitions to the Search & Tracking interface.

---

### STEP 10 – Search & Tracking Claims Database
1. Open **Search & Tracking** (`/employee/search` or `/admin/search`).
2. Show the **13-column database table** matching the MedPro Export Log:
   `| Claim ID | Patient Name | File Name | Employee | Insurer | Policy # | Claim # | ICD Codes | CPT Codes | Amount | Status | Submitted Date | Action |`
3. Click **View Details** on `CLM-2026-002`:
   - Full claim modal opens showing all patient details, ICDs, CPTs, tagged documents, and the activity history log.
   - Click **Edit Claim**, change a field (e.g., patient phone), and click **Save Changes**.
   - Show that the record updates directly in the database without creating duplicate claims.

---

### STEP 11 – Admin Verification & Final Review
1. Switch to **Admin** role via the top navbar.
2. Click **Claims Overview** (`/admin/claims`).
3. Point out that Monesh's submitted claim `CLM-2026-002` is now visible across the organization.
4. Click **Activity Log** (`/admin/activity`) to demonstrate the complete regulatory audit trail.

---

## Key Talking Points for MedPro Leadership

1. **Seamless Familiarity:** The layout, dropdown options, and form sections match MedPro Bills, so staff need zero retraining.
2. **Human-in-the-Loop:** AI assists by pre-filling and flagging uncertain handwriting; the employee retains final review and submission responsibility.
3. **Traceability:** Every single extracted value links back to its exact PDF source page and confidence score.
4. **Physical Splitting:** Tagged pages are genuinely extracted into stand-alone PDFs ready for insurer submission.
5. **Private Storage:** Short-lived authenticated delivery with zero public exposure of sensitive patient records.

