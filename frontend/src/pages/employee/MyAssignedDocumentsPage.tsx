import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, Sparkles, Eye, CheckCircle2, RefreshCw, AlertCircle 
} from 'lucide-react';
import { AssignmentItem } from '../../types';

export const MyAssignedDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/assignments?employee_id=${user.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={22} className="text-blue-600" />
            My Assigned Documents
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assigned patient PDFs allocated for intake, OCR extraction, tagging and claim preparation.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Main Task Table (Strictly adheres to Section 8) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Loading your tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No documents currently assigned to your queue.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition">
                    {/* Column 1: File Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
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

                    {/* Column 2: Status */}
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

                    {/* Column 3: Action */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/employee/document/${task.document_id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Open PDF
                      </button>

                      {task.status !== 'Completed' ? (
                        <button
                          onClick={() => navigate(`/employee/intake/${task.document_id}`)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
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

