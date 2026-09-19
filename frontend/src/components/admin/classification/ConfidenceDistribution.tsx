import React from 'react';
import type { ConfidenceBucket } from '../../../types/classification';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ConfidenceDistributionProps {
  distribution: ConfidenceBucket[];
}

export const ConfidenceDistribution: React.FC<ConfidenceDistributionProps> = ({ distribution }) => {
  const maxCount = Math.max(...distribution.map((d) => d.count)) || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Classification Confidence Distribution</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> HIGH (&ge;90%)
          </span>
          <span className="flex items-center gap-1 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> MEDIUM (70–89%)
          </span>
          <span className="flex items-center gap-1 text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500" /> LOW (&lt;70%)
          </span>
        </div>
      </div>

      {/* Histogram bars */}
      <div className="space-y-3">
        {distribution.map((bucket) => {
          const widthPct = Math.max(Math.round((bucket.count / maxCount) * 100), 4);

          const barColor =
            bucket.level === 'HIGH'
              ? 'bg-emerald-500'
              : bucket.level === 'MEDIUM'
              ? 'bg-blue-500'
              : 'bg-red-500';

          const textColor =
            bucket.level === 'HIGH'
              ? 'text-emerald-800'
              : bucket.level === 'MEDIUM'
              ? 'text-blue-800'
              : 'text-red-800';

          return (
            <div key={bucket.range} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className={`font-bold ${textColor}`}>{bucket.range}</span>
                  <span className="text-[10px] text-slate-400">({bucket.level} CONFIDENCE)</span>
                </span>
                <span>
                  <strong className="text-slate-900 font-bold">{bucket.count.toLocaleString()}</strong> items (
                  {bucket.percentage}%)
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${widthPct}%` }}
                  className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Threshold note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Minimum Automated Review Threshold: <strong className="font-mono text-slate-900">70.0% Confidence</strong></span>
        <span className="text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> 97.4% Passed Threshold
        </span>
      </div>
    </div>
  );
};
