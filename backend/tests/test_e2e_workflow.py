import sys
import subprocess
import time
import requests
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("\n=======================================================", flush=True)
    print("STARTING BILL NEXA REAL-SERVER END-TO-END DEMO TEST SUITE", flush=True)
    print("=======================================================", flush=True)

    # 1. Health check
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print(f"[PASS] Backend server healthy: {res.json()}", flush=True)

    # 2. STEP 1: Admin Login
    print("\n--- STEP 1: Admin Login ---", flush=True)
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@gmail.com", "password": "Admin@123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    admin_token = admin_data["access_token"]
    print(f"[PASS] Admin logged in successfully as {admin_data['user']['full_name']} (Role: {admin_data['user']['role']})", flush=True)

    # 3. Check Admin Stats
    stats_res = requests.get(f"{BASE_URL}/api/stats")
    assert stats_res.status_code == 200
    print(f"[PASS] Admin Dashboard stats: {stats_res.json()}", flush=True)

    # 4. STEP 2: Upload Pre-Sorted Folder
    print("\n--- STEP 2: Upload Pre-Sorted Folder ---", flush=True)
    sample_pdf_path = ROOT_DIR / "sample-data" / "pdfs" / "Patient_001.pdf"
    assert sample_pdf_path.exists(), "Sample PDF not found"
    
    with open(sample_pdf_path, "rb") as f:
        pdf_bytes = f.read()

    upload_res = requests.post(
        f"{BASE_URL}/api/folders/upload",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={"folder_name": "Patient_Batch_004_Automation_Demo"},
        files=[("files", ("Patient_005.pdf", pdf_bytes, "application/pdf"))]
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    folder_data = upload_res.json()
    folder_id = folder_data["folder_id"]
    print(f"[PASS] Pre-sorted folder uploaded: '{folder_data['folder_name']}' (ID: {folder_id})", flush=True)

    # Fetch folder details and documents
    f_details = requests.get(f"{BASE_URL}/api/folders/{folder_id}").json()
    assert len(f_details["documents"]) > 0
    new_doc = f_details["documents"][0]
    new_doc_id = new_doc["id"]
    print(f"[PASS] Document saved in folder: {new_doc['original_filename']} ({new_doc['total_pages']} pages)", flush=True)

    # 5. STEP 3: Assign PDF to Monesh
    print("\n--- STEP 3: Assign PDF to Employee Monesh ---", flush=True)
    users = requests.get(f"{BASE_URL}/api/auth/users").json()
    monesh = next(u for u in users if "monesh" in u["email"].lower())
    
    asg_res = requests.post(
        f"{BASE_URL}/api/assignments/assign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "folder_id": folder_id,
            "document_id": new_doc_id,
            "employee_id": monesh["id"],
            "priority": "High",
            "instructions": "Verify handwritten clinical notes on page 6."
        }
    )
    assert asg_res.status_code == 200, f"Assignment failed: {asg_res.text}"
    asg_data = asg_res.json()
    print(f"[PASS] Document assigned to {asg_data['employee_name']} with {asg_data['priority']} priority.", flush=True)

    # 6. STEP 4: Employee Login (Monesh)
    print("\n--- STEP 4: Employee Login (Monesh) ---", flush=True)
    emp_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "Monesh@gmail.com", "password": "Monesh@123"})
    assert emp_res.status_code == 200
    emp_token = emp_res.json()["access_token"]
    print(f"[PASS] Monesh logged in successfully (Token granted)", flush=True)

    # Check assigned tasks for Monesh
    my_tasks = requests.get(f"{BASE_URL}/api/assignments?employee_id={monesh['id']}").json()
    assigned_filenames = [t["document_filename"] for t in my_tasks]
    assert new_doc["original_filename"] in assigned_filenames
    print(f"[PASS] Monesh's task list contains {len(my_tasks)} assigned tasks, including '{new_doc['original_filename']}'", flush=True)

    # 7. STEP 5: Open PDF / Preview
    print("\n--- STEP 5: Open PDF / Render Scanned Page ---", flush=True)
    prev_res = requests.get(f"{BASE_URL}/api/documents/{new_doc_id}/preview?page=1")
    assert prev_res.status_code == 200
    assert prev_res.headers["content-type"] == "image/png"
    print(f"[PASS] Page 1 rendered as PNG image ({len(prev_res.content)} bytes)", flush=True)

    # 8. STEP 6: AI Extraction & Auto-Fill
    print("\n--- STEP 6: AI Document Extraction ---", flush=True)
    ai_res = requests.post(
        f"{BASE_URL}/api/ai/extract/{new_doc_id}",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert ai_res.status_code == 200, f"AI extraction failed: {ai_res.text}"
    ai_data = ai_res.json()
    print(f"[PASS] AI extracted {ai_data['summary']['total_fields']} fields, {ai_data['summary']['icd_records_count']} ICDs, {ai_data['summary']['cpt_records_count']} CPTs", flush=True)
    print(f"  Patient: {ai_data['patient']['first_name']} {ai_data['patient']['last_name']}, DOB: {ai_data['patient']['dob']}", flush=True)
    print(f"  Insurer: {ai_data['insurance']['insurer']}, Policy: {ai_data['insurance']['policy_number']}", flush=True)

    # 9. STEP 7: Save Page Tag & PDF Page Splitting
    print("\n--- STEP 7: Document Page Tagging & PDF Splitting ---", flush=True)
    tag_res = requests.post(
        f"{BASE_URL}/api/tags/save",
        headers={"Authorization": f"Bearer {emp_token}"},
        json={
            "document_id": new_doc_id,
            "tag_name": "NF-2",
            "start_page": 1,
            "end_page": 2
        }
    )
    assert tag_res.status_code == 200, f"Tag save failed: {tag_res.text}"
    tag_data = tag_res.json()
    split_path = ROOT_DIR / "storage" / tag_data["generated_storage_path"]
    assert split_path.exists(), f"Split tagged PDF was not created: {split_path}"
    print(f"[PASS] Page Tag '{tag_data['tag_name']}' saved for pages 1-2. Split PDF created on disk ({split_path.stat().st_size} bytes)", flush=True)

    # 10. STEP 8: Save Claim (Submit)
    print("\n--- STEP 8: Submit Claim ---", flush=True)
    submit_payload = {
        "document_id": new_doc_id,
        "assignment_id": asg_data["id"],
        "patient": ai_data["patient"],
        "address": ai_data["address"],
        "contact": ai_data["contact"],
        "insured": ai_data["insured"],
        "insurance": ai_data["insurance"],
        "icd_records": ai_data["icd_records"],
        "cpt_records": ai_data["cpt_records"],
        "claim_status": "Submitted",
        "status_reason": "Verified against scanned intake form and AOB. All charges cross-referenced.",
        "is_draft": False
    }
    claim_res = requests.post(
        f"{BASE_URL}/api/claims/save",
        headers={"Authorization": f"Bearer {emp_token}"},
        json=submit_payload
    )
    assert claim_res.status_code == 200, f"Claim submission failed: {claim_res.text}"
    claim_result = claim_res.json()
    claim_id_disp = claim_result["claim_id_display"]
    print(f"[PASS] Claim submitted successfully: {claim_id_disp} for patient {claim_result['patient_name']}", flush=True)

    # 11. STEP 9: Search & Tracking Database Query
    print("\n--- STEP 9: Search & Tracking Query ---", flush=True)
    search_res = requests.get(f"{BASE_URL}/api/claims?claim_id={claim_id_disp}")
    assert search_res.status_code == 200
    claims_list = search_res.json()
    assert len(claims_list) == 1
    found_claim = claims_list[0]
    print(f"[PASS] Claim found in Search & Tracking database:", flush=True)
    print(f"  ID: {found_claim['claim_id_display']} | Patient: {found_claim['patient_name']} | Employee: {found_claim['employee_name']}", flush=True)
    print(f"  Insurer: {found_claim['insurer']} | ICDs: {found_claim['icd_codes_summary']} | Amount: ${found_claim['total_cpt_amount']}", flush=True)

    # 12. STEP 10: Admin Verification
    print("\n--- STEP 10: Admin Claims Overview Verification ---", flush=True)
    admin_claims = requests.get(f"{BASE_URL}/api/claims").json()
    submitted_claims = [c for c in admin_claims if c["claim_id_display"] == claim_id_disp]
    assert len(submitted_claims) == 1
    assert submitted_claims[0]["claim_status"] == "Submitted"
    print(f"[PASS] Admin Claims Overview reflects submitted claim {claim_id_disp} by Monesh.", flush=True)

    # 13. Test Frontend SPA Serving
    print("\n--- STEP 11: Frontend SPA Serving Verification ---", flush=True)
    spa_res = requests.get(f"{BASE_URL}/login")
    assert spa_res.status_code == 200
    assert "Bill Nexa" in spa_res.text or "<div id=\"root\">" in spa_res.text
    print(f"[PASS] Frontend React Single Page App served directly from FastAPI at http://127.0.0.1:8000", flush=True)

    print("\n=======================================================", flush=True)
    print("ALL 11 END-TO-END DEMO TEST SCENARIOS PASSED WITH 100% SUCCESS!", flush=True)
    print("=======================================================\n", flush=True)

if __name__ == "__main__":
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"])
    try:
        time.sleep(3)
        run_tests()
    finally:
        proc.terminate()
