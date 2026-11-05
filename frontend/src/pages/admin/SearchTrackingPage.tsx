import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, FileText, CheckCircle2, AlertTriangle, Eye, 
  Download, Calendar, RefreshCw, X, ArrowUpDown
} from 'lucide-react';
import { ClaimItem } from '../../types';
import { ClaimDetailsModal } from '../claims/ClaimDetailsModal';

export const SearchTrackingPage: React.FC = () => {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state (Matches MedPro Export Log / Search)
  const [searchQuery, setSearchQuery] = useState('');
  const [claimIdFilter, setClaimIdFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [insurerFilter, setInsurerFilter] = useState('');

  // Selected claim for detail modal
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (claimIdFilter) params.append('claim_id', claimIdFilter);
    if (patientFilter) params.append('patient_name', patientFilter);
    if (statusFilter && statusFilter !== 'All Statuses') params.append('claim_status', statusFilter);
    if (insurerFilter) params.append('insurer', insurerFilter);

    try {
      const res = await fetch(`/api/claims?${params.toString()}`);
      const data = await res.json();
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClaims();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setClaimIdFilter('');
    setPatientFilter('');
    setStatusFilter('All Statuses');
    setInsurerFilter('');
    fetch('/api/claims').then(r => r.json()).then(d => setClaims(d));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Search size={22} className="text-blue-600" />
            Search & Tracking – Claims Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, track and export submitted claims, diagnostic ICDs, CPT procedure codes, and tagged documents.
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <RefreshCw size={13} />
          Refresh Claims
        </button>
      </div>

      {/* Filter Toolbar (MedPro Bills style) */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">General Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by any keyword..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Claim ID</label>
            <input
              type="text"
              value={claimIdFilter}
              onChange={(e) => setClaimIdFilter(e.target.value)}
              placeholder="e.g. CLM-2026-001"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Patient Name</label>
            <input
              type="text"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              placeholder="e.g. Garcia Diaz"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Claim Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending (Draft)</option>
              <option value="Returned">Returned</option>
              <option value="New Case">New Case</option>
              <option value="Issue - 45 Days Crossed">Issue - 45 Days Crossed</option>
              <option value="Issue - Already Billed">Issue - Already Billed</option>
              <option value="Issue - CPT and Charges Missing">Issue - CPT and Charges Missing</option>
              <option value="Issue - ICDs Missing">Issue - ICDs Missing</option>
              <option value="Issue - Reports Missing">Issue - Reports Missing</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-600 block mb-1">Insurer</label>
            <input
              type="text"
              value={insurerFilter}
              onChange={(e) => setInsurerFilter(e.target.value)}
              placeholder="e.g. Progressive"
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Search size={14} />
            Search Database
          </button>
        </div>
      </form>

      {/* 13-Column Claims Database Table (Section 15) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Total Claims Found: {claims.length}
          </span>
          <span className="text-[11px] text-slate-500">
            Click "View Details" to inspect the intake form, split tagged PDFs, and edit records.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">1. Claim ID</th>
                <th className="py-3 px-3">2. Patient Name</th>
                <th className="py-3 px-3">3. File Name</th>
                <th className="py-3 px-3">4. Employee</th>
                <th className="py-3 px-3">5. Insurer</th>
                <th className="py-3 px-3">6. Policy #</th>
                <th className="py-3 px-3">7. Claim #</th>
                <th className="py-3 px-3">8. ICD Codes</th>
                <th className="py-3 px-3">9. CPT Codes</th>
                <th className="py-3 px-3">10. Amount</th>
                <th className="py-3 px-3">11. Status</th>
                <th className="py-3 px-3">12. Submitted Date</th>
                <th className="py-3 px-3 text-right">13. Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    Loading claims database...
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    No claims match your search filters.
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    {/* 1. Claim ID */}
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {c.claim_id_display}
                    </td>

                    {/* 2. Patient Name */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {c.patient_name || '—'}
                    </td>

                    {/* 3. File Name */}
                    <td className="py-3 px-3 text-slate-600 flex items-center gap-1.5">
                      <FileText size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{c.document_filename}</span>
                    </td>

                    {/* 4. Employee */}
                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {c.employee_name}
                    </td>

                    {/* 5. Insurer */}
                    <td className="py-3 px-3 text-slate-800">
                      {c.insurer}
                    </td>

                    {/* 6. Policy # */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {c.policy_number || '—'}
                    </td>

                    {/* 7. Claim # */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {c.claim_number || '—'}
                    </td>

                    {/* 8. ICD Codes */}
                    <td className="py-3 px-3 text-purple-900 font-mono font-semibold">
                      {c.icd_codes_summary || 'None'}
                    </td>

                    {/* 9. CPT Codes */}
                    <td className="py-3 px-3 text-blue-900 font-mono font-semibold">
                      {c.cpt_codes_summary || 'None'}
                    </td>

                    {/* 10. CPT Amount */}
                    <td className="py-3 px-3 font-extrabold text-emerald-700">
                      ${c.total_cpt_amount?.toFixed(2)}
                    </td>

                    {/* 11. Claim Status */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.claim_status === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.claim_status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : c.claim_status.startsWith('Issue')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.claim_status}
                      </span>
                    </td>

                    {/* 12. Submitted Date */}
                    <td className="py-3 px-3 text-slate-500">
                      {c.submitted_at
                        ? new Date(c.submitted_at).toLocaleDateString()
                        : 'Draft'}
                    </td>

                    {/* 13. Action */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedClaimId(c.id)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Details Modal */}
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

