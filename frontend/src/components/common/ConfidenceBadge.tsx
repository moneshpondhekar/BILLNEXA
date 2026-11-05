import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, FileSearch } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  sourcePage?: number;
  sourceDocName?: string;
  onPageClick?: (page: number) => void;
  showPercent?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  sourcePage,
  sourceDocName,
  onPageClick,
  showPercent = true
}) => {
  // Normalize to 0-100
  const score = confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);

  let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;
  let label = 'High Confidence';

  if (score < 70) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = AlertCircle;
    label = 'Low Confidence - Review Required';
  } else if (score < 90) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
    label = 'Medium Confidence - Verify';
  }

  return (
    <div className="inline-flex items-center gap-1.5 group relative">
      <span
        title={`${label}: ${score}%`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${colorClass} transition`}
      >
        <Icon size={11} className="shrink-0" />
        {showPercent && <span>{score}%</span>}
      </span>

      {sourcePage && (
        <button
          type="button"
          onClick={() => onPageClick && onPageClick(sourcePage)}
          title={`Click to inspect source page ${sourcePage}${sourceDocName ? ` in ${sourceDocName}` : ''}`}
          className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 px-1 py-0.5 rounded border border-blue-200 font-medium transition cursor-pointer"
        >
          <FileSearch size={10} />
          <span>p.{sourcePage}</span>
        </button>
      )}
    </div>
  );
};

