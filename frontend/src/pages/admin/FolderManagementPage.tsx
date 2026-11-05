import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Eye, UserPlus, Calendar, Layers, Clock } from 'lucide-react';
import { FolderItem, DocumentItem } from '../../types';

export const FolderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/folders')
      .then(res => res.json())
      .then(data => {
        setFolders(data);
        if (data.length > 0) setSelectedFolder(data[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Folder size={22} className="text-blue-600" />
          Folder Management – Pre-Sorted Documents Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review imported patient batches, check page counts, preview scanned pages, and manage assignments.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading folders...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders List (Left 1 Col) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Batches ({folders.length})
            </h3>
            <div className="space-y-2">
              {folders.map((f) => {
                const isSelected = selectedFolder?.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolder(f)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate font-semibold">{f.folder_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {f.total_files} files
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Assigned: {f.assigned_count}</span>
                      <span>•</span>
                      <span>Unassigned: {f.unassigned_count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Files List for Selected Folder (Right 3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {selectedFolder ? (
              <div>
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{selectedFolder.folder_name}</h2>
                    <span className="text-[11px] text-slate-500">
                      Uploaded by {selectedFolder.uploader_name || 'Admin'} on {new Date(selectedFolder.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                      {selectedFolder.unassigned_count} unassigned
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">PDF File Name</th>
                        <th className="py-2.5 px-4">Pages</th>
                        <th className="py-2.5 px-4">Assignment Status</th>
                        <th className="py-2.5 px-4">Assigned To</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedFolder.documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <FileText size={15} className="text-blue-600 shrink-0" />
                            {doc.original_filename}
                          </td>
                          <td className="py-3 px-4 text-slate-700">{doc.total_pages} pages</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              doc.assignment_status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : doc.assignment_status === 'In Progress'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : doc.assignment_status === 'Assigned'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {doc.assignment_status || 'Unassigned'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-semibold">
                            {doc.assigned_employee_name || '—'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold transition"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => navigate('/admin/assignments')}
                              className="px-2.5 py-1 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition"
                            >
                              {doc.assignment_status === 'Unassigned' ? 'Assign' : 'Manage'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Select a folder to view documents</div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewDoc.original_filename}</h3>
                <span className="text-[11px] text-slate-500">Total {previewDoc.total_pages} pages</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-200/50">
              <img
                src={`/api/documents/${previewDoc.id}/preview?page=1`}
                alt="PDF Preview"
                className="max-h-[60vh] object-contain shadow-md rounded border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

