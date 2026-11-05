import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sparkles, Save, CheckCircle2, AlertTriangle, ArrowLeft, Plus, 
  Trash2, Eye, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, 
  ChevronDown, ChevronUp, FileText, Tag, Check, X, ShieldAlert,
  Calendar, Building2, UserCheck, AlertCircle, FileSpreadsheet, Lock
} from 'lucide-react';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { AIExtractionModal } from '../../components/common/AIExtractionModal';
import { IcdRecordItem, CptRecordItem, DocumentTagItem, FieldProvenanceItem } from '../../types';

export const IntakeBillsWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // document_id
  const navigate = useNavigate();
  const { user } = useAuth();

  // Document & Assignment Details
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // PDF Viewer State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  // Tagging State
  const [tags, setTags] = useState<DocumentTagItem[]>([]);
  const [tagFromPage, setTagFromPage] = useState<number>(1);
  const [tagToPage, setTagToPage] = useState<number>(1);
  const [selectedTag, setSelectedTag] = useState<string>('NF-2');
  const [tagSaving, setTagSaving] = useState(false);
  const [tagPreviewUrl, setTagPreviewUrl] = useState<string | null>(null);

  // AI Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [extractionSummary, setExtractionSummary] = useState<any>(null);
  const [provenanceMap, setProvenanceMap] = useState<Record<string, FieldProvenanceItem>>({});

  // Form State: Section A - Patient
  const [initial, setInitial] = useState('Mr');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ssn, setSsn] = useState('');
  const [showSsn, setShowSsn] = useState(false);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [matchingPatients, setMatchingPatients] = useState<any[]>([]);
  const [patientConfirmed, setPatientConfirmed] = useState(false);

  // Form State: Section B - Address
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [zip, setZip] = useState('');
  const [stateVal, setStateVal] = useState('NY');
  const [county, setCounty] = useState('Queens');
  const [city, setCity] = useState('');
  const [addressType, setAddressType] = useState('Home');

  // Form State: Section C - Contact
  const [contactType, setContactType] = useState('Mobile');
  const [contactNumber, setContactNumber] = useState('');
  const [extension, setExtension] = useState('');

  // Form State: Section D - Insured Information
  const [insuredExpanded, setInsuredExpanded] = useState(false);
  const [sameAsPatient, setSameAsPatient] = useState(true);
  const [insuredInitial, setInsuredInitial] = useState('Mr');
  const [insuredFirstName, setInsuredFirstName] = useState('');
  const [insuredLastName, setInsuredLastName] = useState('');
  const [insuredSsn, setInsuredSsn] = useState('');
  const [insuredDob, setInsuredDob] = useState('');
  const [insuredGender, setInsuredGender] = useState('Male');
  const [insuredAddress1, setInsuredAddress1] = useState('');
  const [insuredZip, setInsuredZip] = useState('');
  const [insuredCity, setInsuredCity] = useState('');
  const [insuredState, setInsuredState] = useState('NY');
  const [caseReference, setCaseReference] = useState('');

  // Form State: Section E - Insurance Information
  const [insurer, setInsurer] = useState('Progressive Casualty');
  const [policyNumber, setPolicyNumber] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [dateOfAccident, setDateOfAccident] = useState('');
  const [historicalSummary, setHistoricalSummary] = useState<any>({
    total_bills_found: 0,
    total_bill_amount: 0.0,
    first_dos: '',
    last_dos: '',
    last_intake_date: ''
  });

  // Form State: Section F - ICD Records
  const [icdRecords, setIcdRecords] = useState<IcdRecordItem[]>([]);

  // Form State: Section G - CPT Records
  const [cptRecords, setCptRecords] = useState<CptRecordItem[]>([]);

  // Form State: Section H - Claim Status & Reason
  const [claimStatus, setClaimStatus] = useState<string>('New Case');
  const [statusReason, setStatusReason] = useState<string>('');

  // Masters
  const [masterIcds, setMasterIcds] = useState<any[]>([]);
  const [masterCpts, setMasterCpts] = useState<any[]>([]);
  const [masterInsurers, setMasterInsurers] = useState<any[]>([]);
  const [masterProviders, setMasterProviders] = useState<any[]>([]);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch document, masters, tags, and existing claim
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/documents/${id}`).then(r => r.json()),
      fetch(`/api/tags/${id}`).then(r => r.json()),
      fetch('/api/masters/icd').then(r => r.json()),
      fetch('/api/masters/cpt').then(r => r.json()),
      fetch('/api/masters/insurers').then(r => r.json()),
      fetch('/api/masters/providers').then(r => r.json()),
      fetch(`/api/claims/by-document/${id}`).then(r => r.json())
    ]).then(([docData, tagsData, icds, cpts, insurers, providers, claimData]) => {
      setDoc(docData);
      setTags(tagsData);
      setMasterIcds(icds);
      setMasterCpts(cpts);
      setMasterInsurers(insurers);
      setMasterProviders(providers);

      // If document already has saved claim data, populate it
      if (claimData) {
        setInitial(claimData.patient.initial || 'Mr');
        setFirstName(claimData.patient.first_name || '');
        setLastName(claimData.patient.last_name || '');
        setSsn(claimData.patient.ssn || '');
        setDob(claimData.patient.dob || '');
        setGender(claimData.patient.gender || 'Male');

        setAddress1(claimData.address.address1 || '');
        setAddress2(claimData.address.address2 || '');
        setZip(claimData.address.zip || '');
        setStateVal(claimData.address.state || 'NY');
        setCounty(claimData.address.county || 'Queens');
        setCity(claimData.address.city || '');
        setAddressType(claimData.address.address_type || 'Home');

        setContactType(claimData.contact.contact_type || 'Mobile');
        setContactNumber(claimData.contact.contact_number || '');
        setExtension(claimData.contact.extension || '');

        setInsurer(claimData.insurance.insurer || 'Progressive Casualty');
        setPolicyNumber(claimData.insurance.policy_number || '');
        setClaimNumber(claimData.insurance.claim_number || '');
        setDateOfAccident(claimData.insurance.date_of_accident || '');
        setHistoricalSummary(claimData.insurance.historical_summary || {});

        setIcdRecords(claimData.icd_records || []);
        setCptRecords(claimData.cpt_records || []);

        setClaimStatus(claimData.claim_status || 'New Case');
        setStatusReason(claimData.status_reason || '');
      } else {
        // Initialize with default ICD and CPT row
        setIcdRecords([
          {
            treating_provider: 'Dr. Kai Garcia Diaz, D.C.',
            signing_provider: 'Dr. Kai Garcia Diaz, D.C.',
            icd_code: 'M54.2',
            icd_description: 'Cervicalgia (Neck pain)',
            source_page: 6,
            confidence: 0.95
          }
        ]);
        setCptRecords([
          {
            serving_address: 'Y and W Chiropractic - 90-46 Corona Ave, Elmhurst NY',
            cpt_code: '99203',
            cpt_amount: 175.00,
            cpt_description: 'Office/outpatient visit new patient 30-44 min',
            dos_start: '08-11-2026',
            dos_end: '08-11-2026',
            source_page: 4,
            confidence: 0.95
          }
        ]);
      }
    }).catch(err => {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load document details' });
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  // Handle "Same as Patient" toggle
  const handleSameAsPatientChange = (checked: boolean) => {
    setSameAsPatient(checked);
    if (checked) {
      setInsuredInitial(initial);
      setInsuredFirstName(firstName);
      setInsuredLastName(lastName);
      setInsuredSsn(ssn);
      setInsuredDob(dob);
      setInsuredGender(gender);
      setInsuredAddress1(address1);
      setInsuredZip(zip);
      setInsuredCity(city);
      setInsuredState(stateVal);
      setCaseReference(`CASE-#${doc?.total_pages || 12}015`);
    }
  };

  // AI Extraction Trigger
  const handleAIExtract = async () => {
    if (!id) return;
    setIsExtracting(true);
    setShowExtractionModal(true);

    const token = localStorage.getItem('billnexa_token');
    try {
      const res = await fetch(`/api/ai/extract/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('AI extraction service failed');
      const data = await res.json();

      setExtractionSummary(data.summary);

      // Store provenance map
      const pMap: Record<string, FieldProvenanceItem> = {};
      data.provenance.forEach((p: any) => {
        pMap[p.field] = p;
      });
      setProvenanceMap(pMap);

      // Populate Section A
      setInitial(data.patient.initial || 'Mr');
      setFirstName(data.patient.first_name || '');
      setLastName(data.patient.last_name || '');
      setSsn(data.patient.ssn || '');
      setDob(data.patient.dob || '');
      setGender(data.patient.gender || 'Male');
      if (data.patient.candidate_matches) {
        setMatchingPatients(data.patient.candidate_matches);
      }

      // Populate Section B
      setAddress1(data.address.address1 || '');
      setAddress2(data.address.address2 || '');
      setZip(data.address.zip || '');
      setStateVal(data.address.state || 'NY');
      setCounty(data.address.county || 'Queens');
      setCity(data.address.city || '');
      setAddressType(data.address.address_type || 'Home');

      // Populate Section C
      setContactType(data.contact.contact_type || 'Mobile');
      setContactNumber(data.contact.contact_number || '');
      setExtension(data.contact.extension || '');

      // Populate Section D
      setSameAsPatient(true);
      setInsuredInitial(data.patient.initial || 'Mr');
      setInsuredFirstName(data.patient.first_name || '');
      setInsuredLastName(data.patient.last_name || '');
      setInsuredSsn(data.patient.ssn || '');
      setInsuredDob(data.patient.dob || '');
      setInsuredGender(data.patient.gender || 'Male');
      setInsuredAddress1(data.address.address1 || '');
      setInsuredZip(data.address.zip || '');
      setInsuredCity(data.address.city || '');
      setInsuredState(data.address.state || 'NY');
      setCaseReference(data.insured.case_reference || 'CASE-#2015');

      // Populate Section E
      setInsurer(data.insurance.insurer || 'Progressive Casualty');
      setPolicyNumber(data.insurance.policy_number || '');
      setClaimNumber(data.insurance.claim_number || '');
      setDateOfAccident(data.insurance.date_of_accident || '');
      setHistoricalSummary(data.insurance.historical_summary || {});

      // Populate Section F & G
      setIcdRecords(data.icd_records || []);
      setCptRecords(data.cpt_records || []);

      // Auto-apply document tag groupings across all sections
      if (data.suggested_tags && data.suggested_tags.length > 0) {
        try {
          const groupRes = await fetch(`/api/tags/auto-group/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          if (groupRes.ok) {
            const freshTags = await groupRes.json();
            setTags(freshTags);
          } else {
            const tData = await fetch(`/api/tags/${id}`).then(r => r.json());
            setTags(tData);
          }
        } catch {
          fetch(`/api/tags/${id}`).then(r => r.json()).then(tData => setTags(tData));
        }
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'AI extraction failed' });
    } finally {
      setIsExtracting(false);
    }
  };

  // 1-Click Auto-Group All Document Tags
  const handleAutoGroupTags = async () => {
    if (!id) return;
    setTagSaving(true);
    const token = localStorage.getItem('billnexa_token');
    try {
      const res = await fetch(`/api/tags/auto-group/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to auto-group tags');
      const freshTags = await res.json();
      setTags(freshTags);
      setToast({
        type: 'success',
        message: `Successfully grouped ${freshTags.length} document tag sections (NF-2, AOB, Bills, Medical Report, etc.)!`
      });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Auto-grouping failed' });
    } finally {
      setTagSaving(false);
    }
  };

  // Tag Color Styling Helper
  const getTagBadgeStyle = (tagName: string) => {
    switch (tagName) {
      case 'NF-2':
        return 'bg-blue-900/70 border-blue-400/60 text-blue-200';
      case 'AOB':
        return 'bg-indigo-900/70 border-indigo-400/60 text-indigo-200';
      case 'Bills':
        return 'bg-emerald-900/70 border-emerald-400/60 text-emerald-200';
      case 'Medical Report':
        return 'bg-purple-900/70 border-purple-400/60 text-purple-200';
      case 'INVOICE':
        return 'bg-amber-900/70 border-amber-400/60 text-amber-200';
      case 'DELIVERY RECEIPT':
        return 'bg-cyan-900/70 border-cyan-400/60 text-cyan-200';
      default:
        return 'bg-slate-700/80 border-slate-500/60 text-slate-200';
    }
  };

  // Tag Saving
  const handleSaveTag = async () => {
    if (!id) return;
    if (tagFromPage < 1 || tagToPage < tagFromPage || tagToPage > (doc?.total_pages || 1)) {
      setToast({ type: 'error', message: 'Invalid page range selected.' });
      return;
    }

    setTagSaving(true);
    const token = localStorage.getItem('billnexa_token');
    try {
      const res = await fetch('/api/tags/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: id,
          tag_name: selectedTag,
          start_page: Number(tagFromPage),
          end_page: Number(tagToPage)
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to save tag');
      }

      const newTag = await res.json();
      setTags(prev => {
        // Replace if same range or append
        const filtered = prev.filter(t => !(t.start_page === newTag.start_page && t.end_page === newTag.end_page));
        return [...filtered, newTag].sort((a, b) => a.start_page - b.start_page);
      });
      setToast({
        type: 'success',
        message: `Tag "${selectedTag}" (p.${tagFromPage}-${tagToPage}) saved & split PDF generated!`
      });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to save tag' });
    } finally {
      setTagSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const token = localStorage.getItem('billnexa_token');
    try {
      await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTags(prev => prev.filter(t => t.id !== tagId));
      setToast({ type: 'success', message: 'Tag removed successfully' });
    } catch (err: any) {
      setToast({ type: 'error', message: 'Failed to delete tag' });
    }
  };

  // Add ICD Row
  const handleAddIcd = () => {
    setIcdRecords(prev => [
      ...prev,
      {
        treating_provider: masterProviders[0]?.name || 'Dr. Kai Garcia Diaz, D.C.',
        signing_provider: masterProviders[0]?.name || 'Dr. Kai Garcia Diaz, D.C.',
        icd_code: masterIcds[0]?.code || 'M54.2',
        icd_description: masterIcds[0]?.description || 'Cervicalgia (Neck pain)',
        source_page: currentPage,
        confidence: 0.95
      }
    ]);
  };

  // Update ICD Row
  const handleIcdChange = (idx: number, field: string, val: any) => {
    setIcdRecords(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      // If description changes, auto-map code
      if (field === 'icd_description') {
        const matched = masterIcds.find(m => m.description === val);
        if (matched) updated[idx].icd_code = matched.code;
      }
      return updated;
    });
  };

  const handleDeleteIcd = (idx: number) => {
    setIcdRecords(prev => prev.filter((_, i) => i !== idx));
  };

  // Add CPT Row
  const handleAddCpt = () => {
    setCptRecords(prev => [
      ...prev,
      {
        serving_address: 'Y and W Chiropractic - 90-46 Corona Ave, Elmhurst NY',
        cpt_code: masterCpts[0]?.code || '99203',
        cpt_amount: masterCpts[0]?.default_amount || 175.0,
        cpt_description: masterCpts[0]?.description || 'Office/outpatient visit new patient 30-44 min',
        dos_start: '08-11-2026',
        dos_end: '08-11-2026',
        source_page: currentPage,
        confidence: 0.95
      }
    ]);
  };

  const handleCptChange = (idx: number, field: string, val: any) => {
    setCptRecords(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      if (field === 'cpt_code') {
        const matched = masterCpts.find(m => m.code === val);
        if (matched) {
          updated[idx].cpt_description = matched.description;
          updated[idx].cpt_amount = matched.default_amount;
        }
      }
      return updated;
    });
  };

  const handleDeleteCpt = (idx: number) => {
    setCptRecords(prev => prev.filter((_, i) => i !== idx));
  };

  // Save Draft or Submit Claim
  const handleSaveClaim = async (isDraft: boolean) => {
    if (!firstName.trim() || !lastName.trim()) {
      setToast({ type: 'error', message: 'Patient First and Last Name are required.' });
      return;
    }
    if (!isDraft && !claimStatus) {
      setToast({ type: 'error', message: 'Please select a Claim Status before submitting.' });
      return;
    }
    if (!isDraft && claimStatus.startsWith('Issue') && !statusReason.trim()) {
      setToast({ type: 'error', message: 'Status Reason explanation is required for Issue statuses.' });
      return;
    }

    const token = localStorage.getItem('billnexa_token');
    const payload = {
      document_id: id,
      assignment_id: doc?.assignment_id,
      patient: {
        initial,
        first_name: firstName,
        last_name: lastName,
        ssn,
        dob,
        gender
      },
      address: {
        address1,
        address2,
        zip,
        state: stateVal,
        county,
        city,
        address_type: addressType
      },
      contact: {
        contact_type: contactType,
        contact_number: contactNumber,
        extension
      },
      insured: {
        same_as_patient: sameAsPatient,
        initial: insuredInitial,
        first_name: insuredFirstName,
        last_name: insuredLastName,
        ssn: insuredSsn,
        dob: insuredDob,
        gender: insuredGender,
        address1: insuredAddress1,
        zip: insuredZip,
        city: insuredCity,
        state: insuredState,
        case_reference: caseReference
      },
      insurance: {
        insurer,
        policy_number: policyNumber,
        claim_number: claimNumber,
        date_of_accident: dateOfAccident,
        total_bills_found: historicalSummary.total_bills_found || 0,
        total_bill_amount: historicalSummary.total_bill_amount || 0.0
      },
      icd_records: icdRecords,
      cpt_records: cptRecords,
      claim_status: claimStatus,
      status_reason: statusReason,
      is_draft: isDraft
    };

    try {
      const res = await fetch('/api/claims/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Save failed');
      }

      const data = await res.json();
      setToast({
        type: 'success',
        message: isDraft
          ? `Draft saved for ${data.claim_id_display}. Task remains in progress.`
          : `Claim ${data.claim_id_display} submitted successfully!`
      });

      if (!isDraft) {
        // Redirect after short delay
        setTimeout(() => {
          navigate('/employee/search');
        }, 1200);
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error saving claim' });
    }
  };

  // Jump right panel PDF viewer to page
  const jumpToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (doc?.total_pages || 1)) {
      setCurrentPage(pageNum);
    }
  };

  const totalPages = doc?.total_pages || 12;

  // Tag options matching MedPro Screenshot
  const tagOptions = [
    'AOB',
    'Bills',
    'DELIVERY RECEIPT',
    'INVOICE',
    'Medical Report',
    'MISCELLANEOUS',
    'NF-2'
  ];

  // Claim Status options matching MedPro Screenshots
  const claimStatusOptions = [
    'Issue - 45 Days Crossed',
    'Issue - Already Billed',
    'Issue - CPT and Charges Missing',
    'Issue - ICDs Missing',
    'Issue - Reports Missing',
    'New Case',
    'Pending',
    'Returned',
    'Submitted'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-100 overflow-hidden select-none">
      {/* Sticky Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/employee/tasks')}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
            title="Back to Task List"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-900">{doc?.original_filename || 'Patient_001.pdf'}</span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                CASE #2015
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {doc?.assignment_status || 'In Progress'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Assigned Employee: {user?.full_name} • Priority: {doc?.priority || 'High'}
            </span>
          </div>
        </div>

        {/* AI Extraction Primary Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAIExtract}
            disabled={isExtracting}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer transition hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            <Sparkles size={14} className="text-amber-300 animate-spin-slow" />
            <span>AI Extract & Auto-Fill</span>
          </button>

          <button
            onClick={() => handleSaveClaim(true)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Save size={13} />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSaveClaim(false)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span>Submit Claim</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-16 right-4 z-50 p-3 rounded-lg text-xs font-semibold shadow-lg border flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Main Two-Panel Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANEL (~46%): Complete Intake Bills Form */}
        {/* ========================================================= */}
        <div className="w-[46%] h-full overflow-y-auto bg-slate-50 border-r border-slate-200 p-4 space-y-4">
          {/* SECTION A: Patient Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                SECTION A – PATIENT INFORMATION
              </h3>
              {provenanceMap['first_name'] && (
                <ConfidenceBadge
                  confidence={provenanceMap['first_name'].confidence}
                  sourcePage={provenanceMap['first_name'].page}
                  onPageClick={jumpToPage}
                />
              )}
            </div>

            <div className="grid grid-cols-6 gap-2 text-xs">
              {/* Initial */}
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Initial</label>
                <select
                  value={initial}
                  onChange={(e) => setInitial(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              {/* First Name */}
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div className="col-span-3">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* SSN with Masking Toggle */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-bold text-slate-600">SSN</label>
                  <button
                    type="button"
                    onClick={() => setShowSsn(!showSsn)}
                    className="text-[9px] text-blue-600 hover:underline font-semibold"
                  >
                    {showSsn ? 'Mask' : 'Show'}
                  </button>
                </div>
                <input
                  type={showSsn ? 'text' : 'password'}
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  placeholder="***-**-****"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                />
              </div>

              {/* DOB */}
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">DOB (dd-mm-yyyy)</label>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="dd-mm-yyyy"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs"
                />
              </div>

              {/* Gender */}
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Patient Matching Section */}
            {matchingPatients.length > 0 && (
              <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                    <UserCheck size={13} className="text-blue-600" />
                    Matching Patient Check
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    1 Candidate Found
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left bg-white rounded border border-blue-100 text-[11px]">
                    <thead className="bg-blue-100/50 text-blue-900 font-bold">
                      <tr>
                        <th className="p-1.5">Patient Name</th>
                        <th className="p-1.5">DOB</th>
                        <th className="p-1.5">SSN#</th>
                        <th className="p-1.5">City</th>
                        <th className="p-1.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchingPatients.map((m, i) => (
                        <tr key={i} className="border-t border-blue-50">
                          <td className="p-1.5 font-bold text-slate-900">{m.patient_name}</td>
                          <td className="p-1.5 text-slate-600">{m.dob}</td>
                          <td className="p-1.5 font-mono text-slate-600">{m.ssn}</td>
                          <td className="p-1.5 text-slate-600">{m.city}</td>
                          <td className="p-1.5 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPatientConfirmed(true);
                                setToast({ type: 'success', message: 'Matched with existing patient record!' });
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                patientConfirmed ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {patientConfirmed ? '✓ Confirmed' : 'Match Record'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: Address */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              SECTION B – ADDRESS
            </h3>

            <div className="grid grid-cols-6 gap-2 text-xs">
              <div className="col-span-4">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Address 1</label>
                <input
                  type="text"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="Street Address"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Address 2</label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt, Suite, Bldg"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="ZIP"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">State</label>
                <select
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                >
                  <option value="NY">NY - New York</option>
                  <option value="NJ">NJ - New Jersey</option>
                  <option value="CT">CT - Connecticut</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">County</label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="County"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs"
                />
              </div>

              <div className="col-span-4">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Type</label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                >
                  <option value="Home">Home</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION C: Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              SECTION C – CONTACT DETAILS
            </h3>

            <div className="grid grid-cols-6 gap-2 text-xs">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Contact Type</label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                </select>
              </div>

              <div className="col-span-3">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="(xxx) xxx-xxxx"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Extn</label>
                <input
                  type="text"
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  placeholder="Ext"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION D: Insured Information (Expandable) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                SECTION D – INSURED INFORMATION
              </h3>
              <button
                type="button"
                onClick={() => setInsuredExpanded(!insuredExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                {insuredExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {insuredExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {/* Same As Patient Checkbox */}
            <div className="flex items-center space-x-2 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
              <input
                type="checkbox"
                id="sameAsPatient"
                checked={sameAsPatient}
                onChange={(e) => handleSameAsPatientChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="sameAsPatient" className="text-xs font-bold text-blue-950 cursor-pointer select-none">
                &lt;&lt;- Insured details same as Patient
              </label>
            </div>

            {insuredExpanded && (
              <div className="grid grid-cols-6 gap-2 text-xs pt-2 animate-in fade-in duration-150">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Initial</label>
                  <input
                    type="text"
                    value={insuredInitial}
                    onChange={(e) => setInsuredInitial(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">First Name</label>
                  <input
                    type="text"
                    value={insuredFirstName}
                    onChange={(e) => setInsuredFirstName(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Last Name</label>
                  <input
                    type="text"
                    value={insuredLastName}
                    onChange={(e) => setInsuredLastName(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Case Reference</label>
                  <input
                    type="text"
                    value={caseReference}
                    onChange={(e) => setCaseReference(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Insured SSN</label>
                  <input
                    type="text"
                    value={insuredSsn}
                    onChange={(e) => setInsuredSsn(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION E: Insurance Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                SECTION E – INSURANCE INFORMATION
              </h3>
              {provenanceMap['insurer'] && (
                <ConfidenceBadge
                  confidence={provenanceMap['insurer'].confidence}
                  sourcePage={provenanceMap['insurer'].page}
                  onPageClick={jumpToPage}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Select Insurer</label>
                <select
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs font-semibold text-slate-800"
                >
                  {masterInsurers.map(ins => (
                    <option key={ins.id} value={ins.name}>{ins.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Policy Number</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="Policy #"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Claim Number</label>
                <input
                  type="text"
                  value={claimNumber}
                  onChange={(e) => setClaimNumber(e.target.value)}
                  placeholder="Claim #"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Date of Accident (DOA)</label>
                <input
                  type="text"
                  value={dateOfAccident}
                  onChange={(e) => setDateOfAccident(e.target.value)}
                  placeholder="dd-mm-yyyy"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs"
                />
              </div>
            </div>

            {/* Historical Bills Summary */}
            {historicalSummary.total_bills_found > 0 && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] grid grid-cols-3 gap-2 text-slate-700">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Bills Found</span>
                  <span className="font-bold text-slate-900">{historicalSummary.total_bills_found} bills</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Amount</span>
                  <span className="font-bold text-emerald-700">${historicalSummary.total_bill_amount?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Last Intake Date</span>
                  <span className="font-bold text-slate-900">{historicalSummary.last_intake_date}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION F: ICD Code */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                SECTION F – ICD CODE ({icdRecords.length} records)
              </h3>
              <button
                type="button"
                onClick={handleAddIcd}
                className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded flex items-center gap-1 transition"
              >
                <Plus size={12} /> Add ICD
              </button>
            </div>

            <div className="space-y-3">
              {icdRecords.map((icd, idx) => (
                <div key={idx} className="p-3 bg-purple-50/30 border border-purple-100 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-900">Diagnosis #{idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      <ConfidenceBadge
                        confidence={icd.confidence}
                        sourcePage={icd.source_page}
                        onPageClick={jumpToPage}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteIcd(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Treating Provider</label>
                      <select
                        value={icd.treating_provider}
                        onChange={(e) => handleIcdChange(idx, 'treating_provider', e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-xs bg-white"
                      >
                        {masterProviders.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signing Provider</label>
                      <select
                        value={icd.signing_provider}
                        onChange={(e) => handleIcdChange(idx, 'signing_provider', e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-xs bg-white"
                      >
                        {masterProviders.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 grid grid-cols-4 gap-2">
                      <div className="col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ICD Description</label>
                        <select
                          value={icd.icd_description}
                          onChange={(e) => handleIcdChange(idx, 'icd_description', e.target.value)}
                          className="w-full border border-slate-300 rounded p-1 text-xs bg-white font-medium"
                        >
                          {masterIcds.map(m => (
                            <option key={m.code} value={m.description}>{m.description}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-purple-900 block mb-0.5">ICD Code</label>
                        <input
                          type="text"
                          value={icd.icd_code}
                          onChange={(e) => handleIcdChange(idx, 'icd_code', e.target.value)}
                          className="w-full border border-purple-300 bg-purple-50 text-purple-950 font-bold rounded p-1 text-xs text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION G: CPT Code */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                SECTION G – CPT CODE ({cptRecords.length} records)
              </h3>
              <button
                type="button"
                onClick={handleAddCpt}
                className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 transition"
              >
                <Plus size={12} /> Add CPT
              </button>
            </div>

            <div className="space-y-3">
              {cptRecords.map((cpt, idx) => (
                <div key={idx} className="p-3 bg-blue-50/20 border border-blue-100 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-900">Procedure #{idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      <ConfidenceBadge
                        confidence={cpt.confidence}
                        sourcePage={cpt.source_page}
                        onPageClick={jumpToPage}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteCpt(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Serving Address</label>
                      <input
                        type="text"
                        value={cpt.serving_address}
                        onChange={(e) => handleCptChange(idx, 'serving_address', e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-xs bg-white"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">CPT Code</label>
                      <select
                        value={cpt.cpt_code}
                        onChange={(e) => handleCptChange(idx, 'cpt_code', e.target.value)}
                        className="w-full border border-blue-300 rounded p-1 text-xs font-mono font-bold text-blue-900 bg-white"
                      >
                        {masterCpts.map(c => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Amount ($)</label>
                      <input
                        type="number"
                        value={cpt.cpt_amount}
                        onChange={(e) => handleCptChange(idx, 'cpt_amount', parseFloat(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded p-1 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">DOS Start</label>
                      <input
                        type="text"
                        value={cpt.dos_start}
                        onChange={(e) => handleCptChange(idx, 'dos_start', e.target.value)}
                        placeholder="dd-mm-yyyy"
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">DOS End</label>
                      <input
                        type="text"
                        value={cpt.dos_end}
                        onChange={(e) => handleCptChange(idx, 'dos_end', e.target.value)}
                        placeholder="dd-mm-yyyy"
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                      />
                    </div>

                    <div className="col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Procedure Description</label>
                      <input
                        type="text"
                        value={cpt.cpt_description}
                        onChange={(e) => handleCptChange(idx, 'cpt_description', e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-xs bg-white text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION H: Claim Status & Status Reason */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              SECTION H – CLAIM STATUS & REASON
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Claim Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={claimStatus}
                  onChange={(e) => setClaimStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {claimStatusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Status Reason / Reviewer Notes
                  {claimStatus.startsWith('Issue') && <span className="text-rose-500"> (Required for Issues)</span>}
                </label>
                <textarea
                  rows={2}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Provide detailed clinical or administrative justification..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleSaveClaim(true)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveClaim(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  Submit Claim to Database
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL (~54%): PDF Viewer & Document Page Tagging */}
        {/* ========================================================= */}
        <div className="w-[54%] h-full flex flex-col bg-slate-900 border-l border-slate-700 overflow-hidden">
          {/* MedPro Page Tagging Toolbar (Matches Screenshot 5.jpeg) */}
          <div className="bg-slate-800 border-b border-slate-700 px-3 py-2 flex items-center justify-between text-white select-none shrink-0">
            {/* Tagging Inputs */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="p-1 rounded bg-slate-700 text-blue-400 font-bold">
                <Plus size={14} />
              </span>

              <div className="flex items-center space-x-1">
                <span className="text-[11px] text-slate-400">From</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={tagFromPage}
                  onChange={(e) => setTagFromPage(parseInt(e.target.value) || 1)}
                  className="w-12 px-1.5 py-1 text-center bg-slate-900 border border-slate-600 rounded text-xs font-mono font-bold text-white"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-[11px] text-slate-400">To</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={tagToPage}
                  onChange={(e) => setTagToPage(parseInt(e.target.value) || 1)}
                  className="w-12 px-1.5 py-1 text-center bg-slate-900 border border-slate-600 rounded text-xs font-mono font-bold text-white"
                />
              </div>

              {/* Tag Dropdown */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-blue-200 font-bold px-2 py-1 rounded text-xs focus:ring-1 focus:ring-blue-500"
              >
                {tagOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Green Save Tag Button (Floppy icon) */}
              <button
                type="button"
                onClick={handleSaveTag}
                disabled={tagSaving}
                title="Save Tag & Split PDF"
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
              </button>

              {/* 1-Click Auto-Group All Tags */}
              <button
                type="button"
                onClick={handleAutoGroupTags}
                disabled={tagSaving}
                title="Automatically detect and group all document tags (NF-2, AOB, Bills, Medical Report, etc.)"
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={12} className="text-amber-300" />
                <span>Auto-Group</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTagFromPage(currentPage);
                  setTagToPage(currentPage);
                }}
                title="Reset tag range to current page"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Viewer Zoom & Navigation Controls */}
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1 bg-slate-700/60 px-2 py-0.5 rounded border border-slate-600">
                <button onClick={() => setZoom(z => Math.max(60, z - 15))} className="p-1 hover:text-blue-300">
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(200, z + 15))} className="p-1 hover:text-blue-300">
                  <ZoomIn size={13} />
                </button>
                <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-1 hover:text-blue-300 border-l border-slate-600 pl-1.5">
                  <RotateCw size={13} />
                </button>
              </div>

              <div className="flex items-center space-x-1 bg-slate-700/60 px-2 py-0.5 rounded border border-slate-600 font-semibold">
                <button onClick={() => jumpToPage(currentPage - 1)} disabled={currentPage <= 1} className="p-1 disabled:opacity-30">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px]">{currentPage}/{totalPages}</span>
                <button onClick={() => jumpToPage(currentPage + 1)} disabled={currentPage >= totalPages} className="p-1 disabled:opacity-30">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Tagged Documents Mini-Strip */}
          <div className="bg-slate-800/95 px-3 py-1.5 border-b border-slate-700 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Tag size={10} /> Saved Tags ({tags.length}):
            </span>
            {tags.length === 0 ? (
              <span className="text-[10px] text-slate-500 italic">No tags saved yet. Click "Auto-Group" or set From/To and click Save.</span>
            ) : (
              tags.map((t) => (
                <div
                  key={t.id}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border shrink-0 font-medium ${getTagBadgeStyle(t.tag_name)}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      jumpToPage(t.start_page);
                      setTagFromPage(t.start_page);
                      setTagToPage(t.end_page);
                      setSelectedTag(t.tag_name);
                    }}
                    title={`Click to view ${t.tag_name} (pages ${t.start_page}-${t.end_page})`}
                    className="hover:underline font-bold cursor-pointer"
                  >
                    {t.tag_name} (p.{t.start_page}-{t.end_page})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTagPreviewUrl(`/api/tags/file/${t.id}`)}
                    title="Preview split PDF file"
                    className="opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    <Eye size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(t.id)}
                    title="Delete tag"
                    className="opacity-70 hover:opacity-100 hover:text-rose-400 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Main High-Resolution Scanned Document Canvas */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-slate-950/90">
            {loading ? (
              <div className="text-slate-400 text-xs py-20">Loading document pages...</div>
            ) : (
              <div
                className="transition-all duration-150 origin-top bg-white rounded shadow-2xl overflow-hidden"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  maxWidth: '750px'
                }}
              >
                <img
                  src={`/api/documents/${id}/preview?page=${currentPage}`}
                  alt={`Document Page ${currentPage}`}
                  className="w-full h-auto block select-none pointer-events-none"
                />
              </div>
            )}
          </div>

          {/* Bottom Thumbnails Strip with Tagged Markers */}
          <div className="bg-slate-800 border-t border-slate-700 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0">Pages:</span>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pNum = i + 1;
              const isCurr = pNum === currentPage;
              const hasTag = tags.find(t => pNum >= t.start_page && pNum <= t.end_page);

              return (
                <button
                  key={pNum}
                  onClick={() => jumpToPage(pNum)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 transition relative ${
                    isCurr
                      ? 'bg-blue-600 text-white ring-1 ring-white/50'
                      : hasTag
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                      : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  p.{pNum}
                  {hasTag && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Stage AI Extraction Modal */}
      <AIExtractionModal
        isOpen={showExtractionModal}
        isProcessing={isExtracting}
        extractionSummary={extractionSummary}
        onContinue={() => setShowExtractionModal(false)}
        onReviewDetails={() => {
          setShowExtractionModal(false);
          setInsuredExpanded(true);
        }}
      />

      {/* Tagged Split PDF Preview Modal */}
      {tagPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-2">
                <Tag size={14} className="text-blue-400" />
                Tagged Split Document Preview
              </span>
              <button
                onClick={() => setTagPreviewUrl(null)}
                className="text-slate-300 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 p-2 bg-slate-900">
              <iframe
                src={tagPreviewUrl}
                className="w-full h-[65vh] border-0 rounded bg-white"
                title="Split PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

