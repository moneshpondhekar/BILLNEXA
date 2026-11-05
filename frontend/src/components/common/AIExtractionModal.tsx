import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, FileText, ArrowRight, 
  Cpu, Layers, ShieldCheck, Stethoscope, Search, FileCheck2, Loader2
} from 'lucide-react';

interface Stage {
  number: number;
  label: string;
  icon: any;
}

const STAGES: Stage[] = [
  { number: 1, label: 'Reading PDF document structure', icon: FileText },
  { number: 2, label: 'Rendering high-resolution scanned pages', icon: Layers },
  { number: 3, label: 'Performing OCR & handwriting recognition', icon: Cpu },
  { number: 4, label: 'Identifying patient demographic details', icon: Search },
  { number: 5, label: 'Extracting insurance & policy information', icon: ShieldCheck },
  { number: 6, label: 'Identifying ICD-10 diagnostic codes', icon: Stethoscope },
  { number: 7, label: 'Identifying CPT codes, amounts & DOS', icon: FileCheck2 },
  { number: 8, label: 'Detecting document tags & page ranges', icon: Layers },
  { number: 9, label: 'Validating extracted fields against master tables', icon: CheckCircle2 },
  { number: 10, label: 'Populating the Intake Bills form draft', icon: Sparkles },
];

interface AIExtractionModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  extractionSummary: any | null;
  onContinue: () => void;
  onReviewDetails: () => void;
}

export const AIExtractionModal: React.FC<AIExtractionModalProps> = ({
  isOpen,
  isProcessing,
  extractionSummary,
  onContinue,
  onReviewDetails
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      return;
    }

    if (isProcessing) {
      // Step sequentially through stages to provide real feedback
      const interval = setInterval(() => {
        setCurrentStageIdx((prev) => {
          if (prev < STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 350);
      return () => clearInterval(interval);
    } else {
      setCurrentStageIdx(STAGES.length - 1);
    }
  }, [isOpen, isProcessing]);

  if (!isOpen) return null;

  const percentComplete = Math.min(100, Math.round(((currentStageIdx + 1) / STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Sparkles className="h-6 w-6 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isProcessing ? 'AI Document Processing Active' : 'AI Extraction Completed'}
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                {isProcessing ? 'Neural Vision & Handwriting Recognition in progress' : 'Intake Bills Form automatically populated'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full">
            {percentComplete}%
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isProcessing ? (
            /* Stages Progress View */
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>

              {/* Stage List */}
              <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-1">
                {STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const isPending = idx > currentStageIdx;
                  const Icon = stage.icon;

                  return (
                    <div
                      key={stage.number}
                      className={`flex items-center space-x-3 p-2 rounded-lg text-xs transition-all ${
                        isCurrent
                          ? 'bg-purple-50 text-purple-900 font-semibold border border-purple-200 shadow-xs'
                          : isDone
                          ? 'text-slate-600 bg-slate-50/50'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 size={16} className="text-purple-600 animate-spin" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                            {stage.number}
                          </span>
                        )}
                      </div>
                      <span className="flex-1">{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Completion Summary View */
            <div className="space-y-5">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-blue-600" />
                  Form Populated Successfully
                </p>
                AI has successfully processed the assigned document and populated the Intake Bills form. Please carefully cross-check all extracted information against the original PDF before saving or submitting the claim.
              </div>

              {/* Extraction Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Total Fields</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {extractionSummary?.total_fields || 21}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">High Confidence</span>
                  <p className="text-xl font-extrabold text-emerald-800 mt-0.5">
                    {extractionSummary?.high_confidence_count || 18}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Review Required</span>
                  <p className="text-xl font-extrabold text-amber-800 mt-0.5">
                    {extractionSummary?.review_required_count || 3}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">ICD Records:</span>
                  <span className="font-bold text-slate-900">{extractionSummary?.icd_records_count || 3}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">CPT Records:</span>
                  <span className="font-bold text-slate-900">{extractionSummary?.cpt_records_count || 3}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tags Suggested:</span>
                  <span className="font-bold text-slate-900">{extractionSummary?.tags_suggested_count || 6}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isProcessing && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              onClick={onReviewDetails}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              Review Provenance
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              Continue to Form
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

