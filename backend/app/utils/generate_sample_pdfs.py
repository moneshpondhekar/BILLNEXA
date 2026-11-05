import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

def create_sample_medical_pdf(filename: str, patient_name: str, case_no: str, insurer: str, total_pages: int = 12):
    Path(filename).parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=10,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )
    
    handwritten_style = ParagraphStyle(
        'Handwritten',
        parent=styles['Normal'],
        fontSize=11,
        leading=15,
        fontName='Helvetica-Oblique',
        textColor=colors.HexColor('#1e3a8a')
    )
    
    story = []
    
    # PAGE 1: NF-2 (Application for Motor Vehicle No-Fault Benefits)
    story.append(Paragraph("NEW YORK MOTOR VEHICLE NO-FAULT INSURANCE LAW", title_style))
    story.append(Paragraph("<b>APPLICATION FOR MOTOR VEHICLE NO-FAULT BENEFITS (FORM NF-2)</b>", h2_style))
    story.append(Paragraph(f"<b>CASE REFERENCE:</b> #{case_no} &nbsp;&nbsp;|&nbsp;&nbsp; <b>DATE OF ACCIDENT:</b> 06/11/2026", body_style))
    story.append(Spacer(1, 15))
    
    nf2_data = [
        ["NAME OF INSURER:", insurer, "POLICY NUMBER:", "924786101"],
        ["CLAIM NUMBER:", f"CLM-{case_no}-PROG", "DATE OF NOTICE:", "08/11/2026"],
        ["APPLICANT NAME:", patient_name, "DATE OF BIRTH:", "03/06/1995"],
        ["SOCIAL SECURITY #:", "***-**-1995", "GENDER:", "Female"],
        ["RESIDENCE ADDRESS:", "90-46 Corona Avenue, Elmhurst, NY 11373", "TELEPHONE:", "(631) 438-2678"],
        ["ACCIDENT LOCATION:", "Queens Blvd & 55th Ave, Elmhurst, NY", "TIME OF ACCIDENT:", "09:45 AM"],
        ["BRIEF DESCRIPTION:", "Struck from rear while stopped at traffic light.", "VEHICLE OPERATOR:", patient_name]
    ]
    t1 = Table(nf2_data, colWidths=[130, 160, 120, 120])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t1)
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>ANY PERSON WHO KNOWINGLY AND WITH INTENT TO DEFRAUD ANY INSURANCE COMPANY OR OTHER PERSON FILES AN APPLICATION FOR INSURANCE OR STATEMENT OF CLAIM CONTAINING ANY MATERIALLY FALSE INFORMATION... COMMITS A FRAUDULENT INSURANCE ACT.</b>", ParagraphStyle('warn', parent=body_style, fontSize=8, textColor=colors.HexColor('#64748b'))))
    story.append(Spacer(1, 30))
    story.append(Paragraph(f"Applicant Signature: <i><u>{patient_name}</u></i> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: <u>08/11/2026</u>", body_style))
    
    if total_pages > 1:
        story.append(PageBreak())
        # PAGE 2: NF-2 Supplemental Employment & Loss of Earnings
        story.append(Paragraph("APPLICATION FOR NO-FAULT BENEFITS - PART II", title_style))
        story.append(Paragraph("<b>VERIFICATION OF EMPLOYMENT AND LOSS OF EARNINGS</b>", h2_style))
        story.append(Paragraph("Employer Name: Metro Logistics Services Corp.<br/>Address: 34-10 Northern Blvd, LIC, NY 11101<br/>Occupation: Administrative Coordinator<br/>Average Weekly Wage: $950.00<br/>Date Disability Began: 07/11/2026", body_style))
        story.append(Spacer(1, 30))
        story.append(Paragraph("Employer Representative: <i>Johnathan Sterling, HR Director</i>", handwritten_style))
    
    if total_pages > 2:
        story.append(PageBreak())
        # PAGE 3: ASSIGNMENT OF BENEFITS (AOB)
        story.append(Paragraph("ASSIGNMENT OF BENEFITS FORM (AOB)", title_style))
        story.append(Paragraph("<b>Y AND W CHIROPRACTIC, P.C.</b>", h2_style))
        story.append(Paragraph("90-46 Corona Avenue, Elmhurst, NY 11373 &nbsp;|&nbsp; Tel: (347) 229-9167", body_style))
        story.append(Spacer(1, 15))
        story.append(Paragraph(
            "I, the undersigned patient, hereby assign and transfer to Y and W Chiropractic, P.C., all rights, "
            "title, and interest in and to medical expense benefits payable to me under the policy of insurance "
            "with Progressive Casualty for professional healthcare services rendered.",
            body_style
        ))
        story.append(Spacer(1, 40))
        story.append(Paragraph(f"Patient Signature: <i><u>{patient_name}</u></i> &nbsp;&nbsp;&nbsp;&nbsp; Date: <u>08/11/2026</u>", body_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph("Assignee / Provider Signature: <i><u>Dr. Kai Garcia Diaz, D.C.</u></i> &nbsp;&nbsp;&nbsp;&nbsp; Date: <u>08/11/2026</u>", body_style))

    if total_pages > 3:
        story.append(PageBreak())
        # PAGE 4: HEALTH INSURANCE CLAIM / CMS-1500 / BILLS
        story.append(Paragraph("HEALTH INSURANCE CLAIM FORM - CMS-1500 (BILLS)", title_style))
        story.append(Paragraph(f"<b>PATIENT:</b> {patient_name} &nbsp;&nbsp;|&nbsp;&nbsp; <b>INSURER:</b> {insurer}", h2_style))
        story.append(Spacer(1, 10))
        
        cpt_table_data = [
            ["DOS", "POS", "CPT/HCPCS", "MODIFIER", "DESCRIPTION", "CHARGES", "DAYS/UNITS"],
            ["08/11/2026", "11", "99203", "", "Office/outpatient visit new patient 30-44 min", "$175.00", "1"],
            ["08/11/2026", "11", "98941", "", "Chiropractic manipulative treatment; 3-4 regions", "$85.00", "1"],
            ["10/11/2026", "11", "97012", "", "Application of a modality; mechanical traction", "$45.00", "1"],
            ["10/11/2026", "11", "98941", "", "Chiropractic manipulative treatment; 3-4 regions", "$85.00", "1"],
            ["12/11/2026", "11", "97110", "", "Therapeutic exercises to develop strength", "$65.00", "1"],
            ["TOTAL CHARGES", "", "", "", "", "$455.00", ""]
        ]
        t2 = Table(cpt_table_data, colWidths=[65, 35, 75, 55, 180, 60, 60])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('ALIGN', (5,1), (5,-1), 'RIGHT'),
        ]))
        story.append(t2)
        story.append(Spacer(1, 20))
        story.append(Paragraph("<b>Serving Facility:</b> Y and W Chiropractic - 90-46 Corona Avenue, Elmhurst, NY 11373", body_style))

    if total_pages > 4:
        story.append(PageBreak())
        # PAGE 5: BILLS / ITEMIZATION CONTINUATION
        story.append(Paragraph("ITEMIZED STATEMENT OF SERVICES - CHIROPRACTIC BILLS", title_style))
        story.append(Paragraph("<b>DETAILED ENCOUNTER BILLING LOG</b>", h2_style))
        story.append(Paragraph("Detailed log of physical medicine modalities administered per treatment plan approved by treating provider.", body_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph("Prior Balance: $0.00 &nbsp;|&nbsp; Current Billed: $455.00 &nbsp;|&nbsp; Insurer Payments: $0.00 &nbsp;|&nbsp; Balance Due: $455.00", body_style))

    if total_pages > 5:
        story.append(PageBreak())
        # PAGE 6: MEDICAL REPORT - INITIAL CHIROPRACTIC EVALUATION
        story.append(Paragraph("MEDICAL REPORT - INITIAL EXAMINATION", title_style))
        story.append(Paragraph("<b>Y AND W CHIROPRACTIC, P.C.</b>", h2_style))
        story.append(Paragraph(f"<b>PATIENT:</b> {patient_name} &nbsp;&nbsp;|&nbsp;&nbsp; <b>EXAM DATE:</b> 08/11/2026", body_style))
        story.append(Paragraph("<b>CHIEF COMPLAINT:</b> Patient reports severe neck pain radiating to shoulders and constant lower back stiffness following MVA on 06/11/2026.", body_style))
        story.append(Spacer(1, 15))
        story.append(Paragraph("<b>CLINICAL FINDINGS & DIAGNOSTIC CODES (HANDWRITTEN CLINICAL IMPRESSIONS):</b>", h2_style))
        story.append(Paragraph("<i>Primary Diagnosis: <b>M54.2 - Cervicalgia (Severe neck pain)</b> [Confidence: 96%]</i>", handwritten_style))
        story.append(Paragraph("<i>Secondary Diagnosis: <b>S13.4XXA - Sprain of ligaments of cervical spine, initial</b> [Confidence: 88%]</i>", handwritten_style))
        story.append(Paragraph("<i>Tertiary Diagnosis: <b>M54.5 - Low back pain, unspecified lumbar region</b> [Confidence: 68% - Low confidence handwriting]</i>", handwritten_style))
        story.append(Spacer(1, 25))
        story.append(Paragraph("Treating Physician: <u>Dr. Kai Garcia Diaz, D.C.</u> &nbsp;&nbsp; NPI: <u>1892019482</u>", body_style))

    if total_pages > 6:
        story.append(PageBreak())
        # PAGE 7: MEDICAL REPORT - RANGE OF MOTION & ORTHOPEDIC TESTS
        story.append(Paragraph("MEDICAL REPORT - RANGE OF MOTION & OBJECTIVE TESTING", title_style))
        story.append(Paragraph("Cervical Spine ROM: Flexion 30/50 deg, Extension 20/60 deg, Left Rotation 45/80 deg.<br/>Lumbar Spine ROM: Flexion 40/90 deg with acute paraspinous guarding.<br/>Kemp's Test: Positive bilaterally. Straight Leg Raise: Positive at 45 degrees on right.", body_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph("Doctor's Handwritten Note: <i>Patient shows marked muscle spasms in upper trapezius. Recommended conservative spinal manipulation and mechanical traction 3x weekly for 6 weeks.</i>", handwritten_style))

    if total_pages > 7:
        story.append(PageBreak())
        # PAGE 8: MEDICAL REPORT - TREATMENT PLAN & PROGNOSIS
        story.append(Paragraph("MEDICAL REPORT - PROGNOSIS & CAUSAL RELATIONSHIP", title_style))
        story.append(Paragraph("In my professional medical opinion, the accident of 06/11/2026 is the competent producing cause of the injuries sustained and documented herein. Prognosis is guarded.", body_style))
        story.append(Spacer(1, 40))
        story.append(Paragraph("Signing Provider: <i>Dr. Kai Garcia Diaz, D.C.</i>", handwritten_style))

    if total_pages > 8:
        story.append(PageBreak())
        # PAGE 9: INVOICE
        story.append(Paragraph("INVOICE - MEDICAL RECORDS & ADMINISTRATIVE PROCESSING", title_style))
        story.append(Paragraph("<b>INVOICE # INV-2026-9042</b>", h2_style))
        story.append(Paragraph(f"Billed To: {insurer} Claims Dept<br/>Regarding Patient: {patient_name} (Case #{case_no})<br/>Item: Certified Copy of Medical Records & Digital Case Transfer<br/>Amount: $65.00 &nbsp;|&nbsp; Terms: Net 30", body_style))

    if total_pages > 9:
        story.append(PageBreak())
        # PAGE 10: DELIVERY RECEIPT
        story.append(Paragraph("DELIVERY RECEIPT & PROOF OF SERVICE", title_style))
        story.append(Paragraph("<b>CERTIFIED COURIER SERVICE ACKNOWLEDGMENT</b>", h2_style))
        story.append(Paragraph("Tracking Number: NY-EXP-90821-DEL<br/>Delivered To: Progressive Casualty - Claims Verification Branch<br/>Date Delivered: 14/11/2026 at 11:22 AM<br/>Received By Signature: <i>M. Jenkins (Certified Mail Clerk)</i>", body_style))

    if total_pages > 10:
        story.append(PageBreak())
        # PAGE 11: MISCELLANEOUS
        story.append(Paragraph("MISCELLANEOUS ATTACHMENTS & CORRESPONDENCE", title_style))
        story.append(Paragraph("Notice of No-Fault Insurance Evaluation and Medical Verification Questionnaire.<br/>Form verification code: NF-REV-2026-B.", body_style))

    if total_pages > 11:
        story.append(PageBreak())
        # PAGE 12: POLICE ACCIDENT REPORT SUMMARY
        story.append(Paragraph("POLICE ACCIDENT REPORT - MV-104A TRANSCRIPT", title_style))
        story.append(Paragraph(f"Precinct: 110th Pct, NYPD &nbsp;|&nbsp; Officer Shield #4812<br/>Vehicles Involved: 2 &nbsp;|&nbsp; Driver 1: {patient_name} (Injured)<br/>Collision Type: Rear-End Impact at intersection.", body_style))

    doc.build(story)
    print(f"Generated {filename} ({total_pages} pages)")

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    sample_pdf_dir = base_dir / "sample-data" / "pdfs"
    sample_folders_dir = base_dir / "sample-data" / "folders"
    storage_orig_dir = base_dir / "storage" / "original-documents"
    
    # Generate 4 detailed sample patient PDFs
    patients = [
        ("Patient_001.pdf", "Garcia Diaz", "2015", "Progressive Casualty", 12),
        ("Patient_002.pdf", "Robert Chen", "2016", "GEICO General Insurance", 8),
        ("Patient_003.pdf", "Samantha Miller", "2017", "State Farm Mutual Auto", 6),
        ("Patient_004.pdf", "David Kowalski", "2018", "Allstate Fire & Casualty", 5)
    ]
    
    for fname, pname, case_no, insurer, pages in patients:
        p_path = sample_pdf_dir / fname
        create_sample_medical_pdf(str(p_path), pname, case_no, insurer, pages)
        # Also copy to storage/original-documents
        import shutil
        shutil.copy(str(p_path), str(storage_orig_dir / fname))
        
    # Organize into 3 pre-sorted sample folders for Admin Folder Upload demo
    batch1 = sample_folders_dir / "Patient_Batch_001_Elmhurst"
    batch1.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy(str(sample_pdf_dir / "Patient_001.pdf"), str(batch1 / "Patient_001.pdf"))
    shutil.copy(str(sample_pdf_dir / "Patient_002.pdf"), str(batch1 / "Patient_002.pdf"))

    batch2 = sample_folders_dir / "Patient_Batch_002_Queens"
    batch2.mkdir(parents=True, exist_ok=True)
    shutil.copy(str(sample_pdf_dir / "Patient_003.pdf"), str(batch2 / "Patient_003.pdf"))
    shutil.copy(str(sample_pdf_dir / "Patient_004.pdf"), str(batch2 / "Patient_004.pdf"))

    print("All sample PDFs and folders generated successfully!")

