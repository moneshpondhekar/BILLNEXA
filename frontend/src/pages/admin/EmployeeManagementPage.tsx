import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldCheck, Mail, Calendar, FileText } from 'lucide-react';
import { User } from '../../types';

export const EmployeeManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/users').then(r => r.json()),
      fetch('/api/assignments').then(r => r.json())
    ]).then(([users, asgs]) => {
      setEmployees(users.filter((u: User) => u.role === 'employee'));
      setAssignments(asgs);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users size={22} className="text-blue-600" />
          Employee Staff Management & Workload
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor assigned caseloads, document processing throughput and assignment distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {employees.map(emp => {
          const empAsgs = assignments.filter(a => a.employee_id === emp.id);
          const completed = empAsgs.filter(a => a.status === 'Completed').length;
          const inProgress = empAsgs.filter(a => a.status === 'In Progress' || a.status === 'Assigned').length;

          return (
            <div key={emp.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {emp.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{emp.full_name}</h3>
                  <p className="text-xs text-slate-500">{emp.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Claims Processing Specialist
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Assigned</span>
                  <span className="font-extrabold text-slate-900 text-base">{empAsgs.length}</span>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <span className="text-[10px] text-indigo-700 font-bold uppercase block">In Progress</span>
                  <span className="font-extrabold text-indigo-900 text-base">{inProgress}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Completed</span>
                  <span className="font-extrabold text-emerald-900 text-base">{completed}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-2">Recent Allocated Tasks:</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {empAsgs.map(a => (
                    <div key={a.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                      <span className="font-medium text-slate-800 truncate">{a.document_filename}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white font-bold border border-slate-200">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

