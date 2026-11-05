import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderUp, Users, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, Layers, ShieldCheck, Activity, Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    total_folders: 2,
    total_documents: 4,
    total_assigned: 3,
    unassigned_documents: 1,
    pending_assignments: 2,
    completed_claims: 1,
    claims_requiring_review: 0
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch('/api/activity-logs?limit=8')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner: Automation Status */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                PROPOSED AUTOMATION BLUEPRINT
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 size={10} /> SYSTEM ACTIVE
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Bill Nexa – Claims Automation Platform
            </h1>
            <p className="text-xs text-blue-200 max-w-2xl mt-1">
              End-to-end integration for MedPro Bills: Pre-sorted patient folders, individual document assignment, 
              handwriting-capable AI intake extraction, and automated PDF page tagging.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/upload"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <FolderUp size={14} />
              Upload Folder
            </Link>
            <Link
              to="/admin/assignments"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Users size={14} />
              Assign Docs
            </Link>
          </div>
        </div>

        {/* Workflow Overview Visualizer */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
            <span className="text-[10px] text-blue-300 font-bold block">MODULE 1 (PREPROCESSED)</span>
            <span className="font-semibold text-white">Folder Dump & Ingestion</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Ready for Employee Allocation</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
            <span className="text-[10px] text-indigo-300 font-bold block">ASSIGNMENT STAGE</span>
            <span className="font-semibold text-white">Individual PDF Assignment</span>
            <span className="text-[10px] text-blue-200 block mt-0.5">Assigned to Monesh & Chetan</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
            <span className="text-[10px] text-purple-300 font-bold block">MODULE 2 (CORE AI)</span>
            <span className="font-semibold text-white">AI Intake Auto-Fill</span>
            <span className="text-[10px] text-purple-200 block mt-0.5">ICD, CPT, Tags & Provenance</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
            <span className="text-[10px] text-emerald-300 font-bold block">FINAL VERIFICATION</span>
            <span className="font-semibold text-white">Human Review & Submit</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Search & Export Log Tracking</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Folders</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_folders}</p>
          <span className="text-[10px] text-blue-600 font-medium">Pre-sorted batches</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Total PDFs</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_documents}</p>
          <span className="text-[10px] text-slate-600 font-medium">{stats.unassigned_documents} unassigned</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Assigned</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.total_assigned}</p>
          <span className="text-[10px] text-blue-600 font-medium">Allocated to staff</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Pending Work</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending_assignments}</p>
          <span className="text-[10px] text-amber-600 font-medium">In progress queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Completed</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed_claims}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Submitted claims</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Exceptions</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.claims_requiring_review}</p>
          <span className="text-[10px] text-rose-600 font-medium">Returned / Issues</span>
        </div>
      </div>

      {/* Main Content Grid: Workflow & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step-by-Step Flow */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Operational Workflow Sequence</span>
            <span className="text-xs font-normal text-slate-600">MedPro Bills Two-Module Integration</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Pre-Sorted Document Folders Ingestion</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Admin imports patient batches directly from computer. Preserves original folder names and PDF file metadata in private storage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Individual PDF Employee Assignment</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Admin allocates specific PDF cases individually to Monesh or Chetan with custom priority and processing instructions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">AI Intake Bills Auto-Fill & Document Tagging</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vision AI extracts printed and handwritten data (Patient, Insurer, ICD, CPT) and suggests page tags (AOB, Bills, NF-2).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/70">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Employee Verification & Claim Submission</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Employee reviews confidence scores, verifies fields, saves tagged split PDFs, and submits the claim to the search database.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recent System Activity Logs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity size={16} className="text-blue-600" />
              Live Audit Trail
            </span>
            <Link to="/admin/activity" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </h2>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{act.user_name}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock size={10} />
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="font-semibold text-blue-600 text-[11px] mt-0.5">{act.action}</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{act.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

