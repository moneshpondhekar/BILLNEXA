import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, 
  Sparkles, FileText, Shield, Maximize2
} from 'lucide-react';

export const DocumentViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/documents/${id}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const totalPages = doc?.total_pages || 1;

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleZoomIn = () => setZoom(z => Math.min(200, z + 20));
  const handleZoomOut = () => setZoom(z => Math.max(60, z - 20));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
      {/* Top Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between text-white select-none">
        {/* Left: Back & Doc Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/employee/tasks')}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
            title="Back to Task List"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <FileText size={15} className="text-blue-400" />
              {doc?.original_filename || 'Document Preview'}
            </h2>
            <span className="text-[10px] text-slate-400">
              Protected Document View • Authenticated Session Only
            </span>
          </div>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center space-x-2 bg-slate-700/60 px-3 py-1 rounded-lg border border-slate-600/50 text-xs">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="p-1 hover:text-blue-300 disabled:opacity-30 disabled:hover:text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="p-1 hover:text-blue-300 disabled:opacity-30 disabled:hover:text-white transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Controls & Action */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-700/60 px-2 py-1 rounded-lg border border-slate-600/50">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-blue-300 transition"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono px-1">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-blue-300 transition"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={handleRotate}
              className="p-1 hover:text-blue-300 ml-1 border-l border-slate-600 pl-2 transition"
              title="Rotate 90deg"
            >
              <RotateCw size={15} />
            </button>
          </div>

          <button
            onClick={() => navigate(`/employee/intake/${id}`)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-300" />
            Process in Intake Bills
          </button>
        </div>
      </div>

      {/* Main Page Canvas / Scanned Viewer */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-950/80">
        {loading ? (
          <div className="text-slate-400 text-xs py-20">Loading document pages...</div>
        ) : (
          <div
            className="transition-all duration-150 origin-top bg-white rounded shadow-2xl overflow-hidden"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              maxWidth: '850px'
            }}
          >
            <img
              src={`/api/documents/${id}/preview?page=${currentPage}`}
              alt={`Page ${currentPage}`}
              className="w-full h-auto block select-none pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Pages:</span>
        {Array.from({ length: totalPages }).map((_, i) => {
          const pNum = i + 1;
          const isCurr = pNum === currentPage;
          return (
            <button
              key={pNum}
              onClick={() => setCurrentPage(pNum)}
              className={`px-2.5 py-1 rounded text-xs font-semibold shrink-0 transition ${
                isCurr
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              p.{pNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

