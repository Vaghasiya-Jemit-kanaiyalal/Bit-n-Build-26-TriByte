import React from 'react';
import { Weight } from 'lucide-react';
import type { CollectionPerformanceSummary } from '../../../types/dashboard';

interface CollectionPerformanceCardProps {
  performance: CollectionPerformanceSummary;
  onNavigateTab: (tab: string) => void;
}

export const CollectionPerformanceCard: React.FC<CollectionPerformanceCardProps> = ({
  performance,
  onNavigateTab,
}) => {
  return (
    <div
      onClick={() => onNavigateTab('Analytics')}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Weight className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Today's Collection Performance</h3>
        </div>
        <span className="text-xs font-bold text-emerald-800 font-mono">
          {performance.collectedTons} t / {performance.plannedTons} t ({performance.completionPercentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${performance.completionPercentage}%` }}
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>{performance.collectedTons} t Collected</span>
          <span>{performance.remainingTons} t Remaining</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-semibold">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Planned Stops</span>
          <span className="font-mono font-extrabold text-slate-900 mt-0.5">{performance.plannedStops}</span>
        </div>

        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-emerald-800">Completed Stops</span>
          <span className="font-mono font-extrabold text-emerald-900 mt-0.5">{performance.completedStops}</span>
        </div>

        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Stop Time</span>
          <span className="font-mono font-extrabold text-slate-900 mt-0.5">{performance.avgCollectionTimeMinutes} min</span>
        </div>

        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">On-Time Rate</span>
          <span className="font-mono font-extrabold text-emerald-700 mt-0.5">{performance.onTimeCollectionPercentage}%</span>
        </div>
      </div>
    </div>
  );
};
