import React, { useState, useEffect } from 'react';
import { 
  X, FileText, CheckCircle2, Tag, Clock, Edit3, Save, Eye, 
  Building2, UserCheck, ShieldCheck, Stethoscope, FileCheck2
} from 'lucide-react';

interface ClaimDetailsModalProps {
  claimId: string;
  isOpen: boolean;
  onClose: () => void;
  onClaimUpdated?: () => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claimId,
  isOpen,
  onClose,
  onClaimUpdated
}) => {
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [previewTagUrl, setPreviewTagUrl] = useState<string | null>(null);

  // Editable fields
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientLastName, setPatientLastName] = useState('');
  const [insurer, setInsurer] = useState('');
  const [policyNum, setPolicyNum] = useState('');
  const [claimNum, setClaimNum] = useState('');
  const [statusVal, setStatusVal] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !claimId) return;
    setLoading(true);
    fetch(`/api/claims/${claimId}`)
      .then(res => res.json())
      .then(data => {
        setClaim(data);
        setPatientFirstName(data.patient?.first_name || '');
        setPatientLastName(data.patient?.last_name || '');
        setInsurer(data.insurance?.insurer || '');
        setPolicyNum(data.insurance?.policy_number || '');
        setClaimNum(data.insurance?.claim_number || '');
        setStatusVal(data.claim_status || 'New Case');
        setStatusReason(data.status_reason || '');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [claimId, isOpen]);

  const handleSaveChanges = async () => {
    if (!claim) return;
    setSaving(true);
    const token = localStorage.getItem('billnexa_token');

    // Build update payload
    const payload = {
      document_id: claim.document_id,
      assignment_id: claim.assignment_id,
      patient: {
        ...claim.patient,
        first_name: patientFirstName,
        last_name: patientLastName
      },
      address: claim.address,
      contact: claim.contact,
      insured: claim.insured,
      insurance: {
        ...claim.insurance,
        insurer,
        policy_number: policyNum,
        claim_number: claimNum
      },
      icd_records: claim.icd_records,
      cpt_records: claim.cpt_records,
      claim_status: statusVal,
      status_reason: statusReason,
      is_draft: statusVal === 'Pending'
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
      if (!res.ok) throw new Error('Update failed');
      setIsEditing(false);
      if (onClaimUpdated) onClaimUpdated();
      alert('Claim updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update claim');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              <FileText size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {claim?.claim_id_display || 'Claim Details'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {claim?.claim_status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Assigned Employee: {claim?.employee_name} • Document: {claim?.document_filename}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Edit3 size={13} />
                Edit Claim
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Save size={13} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading claim records...</div>
          ) : (
            <>
              {/* SECTION A: Patient & Insurance Information */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <UserCheck size={14} className="text-blue-600" />
                  A. Patient & Insurance Details
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Patient Name</span>
                    {isEditing ? (
                      <div className="flex gap-1 mt-0.5">
                        <input
                          type="text"
                          value={patientFirstName}
                          onChange={(e) => setPatientFirstName(e.target.value)}
                          className="w-1/2 p-1 border rounded text-xs"
                        />
                        <input
                          type="text"
                          value={patientLastName}
                          onChange={(e) => setPatientLastName(e.target.value)}
                          className="w-1/2 p-1 border rounded text-xs"
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-slate-900">
                        {claim.patient?.first_name} {claim.patient?.last_name}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">DOB / Gender</span>
                    <span className="font-medium text-slate-800">
                      {claim.patient?.dob} ({claim.patient?.gender})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">SSN</span>
                    <span className="font-mono text-slate-800">{claim.patient?.ssn}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Contact Phone</span>
                    <span className="font-medium text-slate-800">{claim.contact?.contact_number}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Insurer</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={insurer}
                        onChange={(e) => setInsurer(e.target.value)}
                        className="w-full p-1 border rounded text-xs mt-0.5"
                      />
                    ) : (
                      <span className="font-bold text-blue-900">{claim.insurance?.insurer}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Policy #</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={policyNum}
                        onChange={(e) => setPolicyNum(e.target.value)}
                        className="w-full p-1 border rounded text-xs mt-0.5 font-mono"
                      />
                    ) : (
                      <span className="font-mono text-slate-800">{claim.insurance?.policy_number}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Claim #</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={claimNum}
                        onChange={(e) => setClaimNum(e.target.value)}
                        className="w-full p-1 border rounded text-xs mt-0.5 font-mono"
                      />
                    ) : (
                      <span className="font-mono text-slate-800">{claim.insurance?.claim_number}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">Date of Accident</span>
                    <span className="font-medium text-slate-800">{claim.insurance?.date_of_accident}</span>
                  </div>
                </div>
              </div>

              {/* SECTION C & D: ICD & CPT Records */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ICD Records */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Stethoscope size={14} className="text-purple-600" />
                    ICD Diagnostic Records ({claim.icd_records?.length || 0})
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    {claim.icd_records?.map((icd: any, idx: number) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-purple-900 font-mono mr-2">{icd.icd_code}</span>
                          <span className="text-slate-700">{icd.icd_description}</span>
                          <div className="text-[10px] text-slate-600">Provider: {icd.treating_provider}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {Math.round(icd.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CPT Records */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <FileCheck2 size={14} className="text-blue-600" />
                    CPT Procedures & Amounts ({claim.cpt_records?.length || 0})
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs">
                    {claim.cpt_records?.map((cpt: any, idx: number) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-900 font-mono">{cpt.cpt_code}</span>
                            <span className="font-extrabold text-emerald-700">${cpt.cpt_amount?.toFixed(2)}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] truncate max-w-xs">{cpt.cpt_description}</p>
                          <span className="text-[10px] text-slate-600">DOS: {cpt.dos_start}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          {Math.round(cpt.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION E: Tagged Documents Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Tag size={14} className="text-blue-600" />
                  E. Tagged Documents ({claim.tagged_documents?.length || 0} split files)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Document Tag</th>
                        <th className="p-2">Page Range</th>
                        <th className="p-2">Page Count</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {claim.tagged_documents?.map((tag: any) => (
                        <tr key={tag.id} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText size={14} className="text-blue-600" />
                            {tag.tag_name}
                          </td>
                          <td className="p-2 font-mono text-slate-700">
                            Pages {tag.start_page} – {tag.end_page}
                          </td>
                          <td className="p-2 text-slate-600">{tag.page_count} pages</td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => setPreviewTagUrl(`/api/tags/file/${tag.id}`)}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded transition inline-flex items-center gap-1"
                            >
                              <Eye size={12} />
                              Preview Split PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION F: Activity Audit Trail */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Clock size={14} className="text-blue-600" />
                  F. Activity History & Submission Audit Trail
                </h4>
                <div className="space-y-2 text-xs">
                  {claim.activity_logs?.map((act: any) => (
                    <div key={act.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 mr-2">{act.user_name}</span>
                        <span className="font-semibold text-blue-600 mr-2">[{act.action}]</span>
                        <span className="text-slate-600">{act.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 shrink-0">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Split PDF Viewer Nested Modal */}
      {previewTagUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-xs">Previewing Split Tagged PDF</span>
              <button
                onClick={() => setPreviewTagUrl(null)}
                className="text-slate-300 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 p-2 bg-slate-900">
              <iframe
                src={previewTagUrl}
                className="w-full h-[65vh] border-0 rounded bg-white"
                title="Split Tagged PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

