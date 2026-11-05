import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  ExternalLink, Sparkles, Folder
} from 'lucide-react';
import { AssignmentItem } from '../../types';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    total_assigned: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    returned: 0
  });
  const [tasks, setTasks] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Fetch stats
    fetch(`/api/stats?employee_id=${user.id}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    // Fetch employee assignments
    fetch(`/api/assignments?employee_id=${user.id}`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome & AI Automation Quick Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
            EMPLOYEE WORKSPACE • INTAKE & CLAIMS
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            You have <b>{stats.pending + stats.in_progress} active document(s)</b> requiring intake processing and verification.
          </p>
        </div>

        <Link
          to="/employee/tasks"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <FileText size={15} />
          View All Tasks
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Assigned</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_assigned}</p>
          <span className="text-[10px] text-blue-600 font-medium">All assigned tasks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Pending Tasks</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</p>
          <span className="text-[10px] text-amber-600 font-medium">Not started</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">In Progress</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.in_progress}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Drafting & Review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Completed</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Claims Submitted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-600 block">Returned</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.returned}</p>
          <span className="text-[10px] text-rose-600 font-medium">Correction queue</span>
        </div>
      </div>

      {/* Active Tasks Table - Mandatory Format */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            My Active Intake Tasks
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Click Complete Task to launch the 2-Panel AI Intake Bills Workspace
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 text-xs">
                    No documents currently assigned.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {task.document_filename}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Folder: {task.folder_name} • {task.total_pages} pages • {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : task.status === 'In Progress'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {task.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Open PDF dedicated preview */}
                      <button
                        onClick={() => navigate(`/employee/document/${task.document_id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Open PDF
                      </button>

                      {/* Complete Task / Continue Processing or View Claim */}
                      {task.status !== 'Completed' ? (
                        <button
                          onClick={() => navigate(`/employee/intake/${task.document_id}`)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Sparkles size={13} className="text-amber-300" />
                          {task.status === 'In Progress' ? 'Continue Processing' : 'Complete Task'}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/employee/search`)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                        >
                          View Claim
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

