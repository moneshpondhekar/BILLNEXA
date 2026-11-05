import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderUp, FileText, CheckCircle2, AlertCircle, Upload, Eye, UserPlus, 
  Trash2, ArrowRight, Layers
} from 'lucide-react';

export const FolderUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFolder, setUploadedFolder] = useState<any>(null);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (incomingFiles: File[]) => {
    setError('');
    const validPdfs: File[] = [];
    const invalidNames: string[] = [];

    incomingFiles.forEach((f) => {
      if (f.name.toLowerCase().endsWith('.pdf')) {
        validPdfs.push(f);
      } else {
        invalidNames.push(f.name);
      }
    });

    if (invalidNames.length > 0) {
      setError(`Rejected non-PDF files: ${invalidNames.join(', ')}. Only PDF documents are permitted.`);
    }

    if (validPdfs.length > 0) {
      setFiles((prev) => [...prev, ...validPdfs]);
      if (!folderName) {
        // Auto-suggest folder name based on first file or date
        const batchSug = `Patient_Batch_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
        setFolderName(batchSug);
      }
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Please provide a folder name.');
      return;
    }
    if (files.length === 0) {
      setError('Please select at least one PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setError('');

    const token = localStorage.getItem('billnexa_token');
    const formData = new FormData();
    formData.append('folder_name', folderName.trim());
    files.forEach((f) => {
      formData.append('files', f);
    });

    try {
      setUploadProgress(60);
      const res = await fetch('/api/folders/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Upload failed');
      }

      setUploadProgress(100);
      const data = await res.json();
      
      // Fetch the created folder details
      const folderRes = await fetch(`/api/folders/${data.folder_id}`);
      const folderData = await folderRes.json();
      setUploadedFolder(folderData);
      setFiles([]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload folder.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderUp size={22} className="text-blue-600" />
            Folder Dump – Ingest Pre-Sorted Documents
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 1 Integration: Import patient batches from your computer. All PDFs are automatically parsed and placed in private storage.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box or Success Details */}
      {!uploadedFolder ? (
        <form onSubmit={handleUploadSubmit} className="space-y-5">
          {/* Folder Details Input */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Folder Name / Batch Identifier
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Patient_Batch_001_Elmhurst"
              className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`bg-white rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Upload size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Drag and drop patient PDF files or folders
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports multiple PDF documents. Batch hierarchies and filenames will be preserved.
                </p>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs">
                  <span>Browse PDF Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Staged Files List */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-600" />
                  Staged Files ({files.length} PDFs ready for upload)
                </h4>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText size={14} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? `Uploading Batch (${uploadProgress}%)...` : 'Confirm & Upload Folder'}
                  {!isUploading && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Upload Confirmation & Folder Details View */
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-900 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Folder Batch Uploaded Successfully</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Folder <b>{uploadedFolder.folder_name}</b> containing {uploadedFolder.total_files} PDF documents has been saved. Each PDF is ready for individual employee assignment.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUploadedFolder(null);
                setFolderName('');
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
            >
              Upload Another Folder
            </button>
          </div>

          {/* Folder Details & Documents Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Folder Name</span>
                  <span className="font-extrabold text-slate-900">{uploadedFolder.folder_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total PDFs</span>
                  <span className="font-bold text-slate-800">{uploadedFolder.total_files} files</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Unassigned</span>
                  <span className="font-bold text-amber-600">{uploadedFolder.unassigned_count}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/assignments')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus size={14} />
                Proceed to Employee Assignment
              </button>
            </div>

            {/* Document Listing Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">PDF File Name</th>
                    <th className="py-2.5 px-4">Pages</th>
                    <th className="py-2.5 px-4">File Size</th>
                    <th className="py-2.5 px-4">Assignment Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {uploadedFolder.documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <FileText size={15} className="text-blue-600 shrink-0" />
                        {doc.original_filename}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{doc.total_pages} pages</td>
                      <td className="py-3 px-4 text-slate-500">
                        {Math.round(doc.file_size_bytes / 1024)} KB
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {doc.assignment_status || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold transition"
                        >
                          Preview PDF
                        </button>
                        <button
                          onClick={() => navigate('/admin/assignments')}
                          className="px-2.5 py-1 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PDF Quick Preview Modal */}
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

