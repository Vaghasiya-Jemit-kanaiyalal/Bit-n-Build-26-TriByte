import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ConfidenceDistributionItem } from '../../../types/prediction';

interface ConfidenceDistributionProps {
  distribution: ConfidenceDistributionItem[];
  lowConfidenceCount: number;
}

export const ConfidenceDistribution: React.FC<ConfidenceDistributionProps> = ({
  distribution,
  lowConfidenceCount,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Forecast Confidence Score Breakdown</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Statistical distribution of prediction confidence ratings across all active bins.</p>
        </div>
        {lowConfidenceCount > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{lowConfidenceCount} predictions need review</span>
          </span>
        )}
      </div>

      {/* Distribution Stacked Bar */}
      <div className="space-y-3">
        {distribution.map((item, idx) => {
          let barColor = 'bg-emerald-600';
          if (item.rating === 'MEDIUM') barColor = 'bg-amber-500';
          else if (item.rating === 'LOW') barColor = 'bg-red-500';

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.rating === 'HIGH' ? '#10b981' : item.rating === 'MEDIUM' ? '#f59e0b' : '#ef4444' }} />
                  <span>{item.rangeLabel}</span>
                </span>
                <span className="font-mono text-slate-900">{item.count} bins ({item.percentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
