
import React from 'react';

interface BinFillIndicatorProps {
  percent: number;
  showLabel?: boolean;
  compact?: boolean;
}

export const BinFillIndicator: React.FC<BinFillIndicatorProps> = ({
  percent,
  showLabel = true,
  compact = false,
}) => {
  // Determine color theme based on thresholds
  let colorClass = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = 'NORMAL';

  if (percent > 90) {
    colorClass = 'bg-red-600';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
    statusText = 'CRITICAL';
  } else if (percent > 75) {
    colorClass = 'bg-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'WARNING';
  } else if (percent > 50) {
    colorClass = 'bg-blue-500';
    badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
    statusText = 'MODERATE';
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Visual Bar Indicator */}
      <div className={`relative bg-slate-200/80 rounded-full overflow-hidden ${compact ? 'w-16 h-2' : 'w-24 h-2.5'}`}>
        <div
          className={`h-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      {/* Numerical Telemetry */}
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
            {percent}%
          </span>
          {!compact && (
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeBg}`}
            >
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
