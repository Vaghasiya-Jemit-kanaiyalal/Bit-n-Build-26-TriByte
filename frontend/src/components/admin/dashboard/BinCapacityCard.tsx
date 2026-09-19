import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import type { BinCapacityDistribution } from '../../../types/dashboard';

interface BinCapacityCardProps {
  distribution: BinCapacityDistribution;
  onNavigateTab: (tab: string) => void;
}

export const BinCapacityCard: React.FC<BinCapacityCardProps> = ({ distribution, onNavigateTab }) => {
  return (
    <div
      onClick={() => onNavigateTab('Bin Management')}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Bin Capacity Overview</h3>
        </div>
        <span className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
          View Bins <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Distribution Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Capacity Status Distribution</span>
          <span className="font-mono text-slate-900">248 Total Bins</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: '73.4%' }} className="h-full bg-emerald-500" title="Normal 182" />
          <div style={{ width: '16.1%' }} className="h-full bg-amber-500" title="Warning 40" />
          <div style={{ width: '5.6%' }} className="h-full bg-red-600" title="Critical 14" />
          <div style={{ width: '4.9%' }} className="h-full bg-slate-400" title="Offline 12" />
        </div>
      </div>

      {/* Grid Legend & Metrics */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal</span>
          </span>
          <span className="font-bold text-slate-900">{distribution.normalCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Warning</span>
          </span>
          <span className="font-bold text-slate-900">{distribution.warningCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-red-50/70 rounded-xl border border-red-100">
          <span className="flex items-center gap-1.5 text-red-900">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="font-bold">Critical</span>
          </span>
          <span className="font-extrabold text-red-700">{distribution.criticalCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Offline</span>
          </span>
          <span className="font-bold text-slate-900">{distribution.offlineCount}</span>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Average Fill Level: <strong className="text-slate-900 font-mono">{distribution.averageFillPercentage}%</strong></span>
        <span>Highest Zone: <strong className="text-emerald-800">{distribution.highestFillZone}</strong></span>
      </div>
    </div>
  );
};
