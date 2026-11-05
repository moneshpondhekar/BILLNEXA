import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Eye, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { ClaimItem } from '../../types';
import { ClaimDetailsModal } from '../claims/ClaimDetailsModal';

export const SavedClaimsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const fetchClaims = () => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/claims?employee_id=${user.id}`)
      .then(r => r.json())
      .then(d => setClaims(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={22} className="text-blue-600" />
          My Saved Claims & Drafts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View previously saved drafts and submitted claims. Click "View / Edit" to inspect details or make updates.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Source PDF</th>
                <th className="py-3 px-4">Insurer</th>
                <th className="py-3 px-4">CPT Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading claims...</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No claims created yet. Open an assigned document to start processing.
                  </td>
                </tr>
              ) : (
                claims.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {c.claim_id_display}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.patient_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.document_filename}</td>
                    <td className="py-3.5 px-4 text-slate-800">{c.insurer}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                      ${c.total_cpt_amount?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.claim_status === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.claim_status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.claim_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : 'Draft'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {c.document_id && (
                        <button
                          onClick={() => navigate(`/employee/intake/${c.document_id}`)}
                          className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Workspace
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedClaimId(c.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClaimId && (
        <ClaimDetailsModal
          claimId={selectedClaimId}
          isOpen={!!selectedClaimId}
          onClose={() => setSelectedClaimId(null)}
          onClaimUpdated={fetchClaims}
        />
      )}
    </div>
  );
};

