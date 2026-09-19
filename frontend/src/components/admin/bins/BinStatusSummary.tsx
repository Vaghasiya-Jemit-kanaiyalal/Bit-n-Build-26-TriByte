import React from 'react';
import type { BinStatus, BinKpiSummary } from '../../../types/bin';

interface BinStatusSummaryProps {
  currentStatus: BinStatus | 'All';
  summary: BinKpiSummary;
  onSelectStatus: (status: BinStatus | 'All') => void;
}

export const BinStatusSummary: React.FC<BinStatusSummaryProps> = ({
  currentStatus,
  summary,
  onSelectStatus,
}) => {
  const items: { label: string; status: BinStatus | 'All'; count: number; activeBg: string; activeText: string }[] = [
    { label: 'ALL', status: 'All', count: summary.totalBins, activeBg: 'bg-slate-900 border-slate-900', activeText: 'text-white' },
    { label: 'NORMAL', status: 'Normal', count: summary.totalBins - summary.needingCollection - summary.offlineBins - summary.maintenanceBins, activeBg: 'bg-emerald-700 border-emerald-700', activeText: 'text-white' },
    { label: 'WARNING', status: 'Warning', count: summary.needingCollection - summary.criticalBins, activeBg: 'bg-amber-600 border-amber-600', activeText: 'text-white' },
    { label: 'CRITICAL', status: 'Critical', count: summary.criticalBins, activeBg: 'bg-red-600 border-red-600', activeText: 'text-white' },
    { label: 'OFFLINE', status: 'Offline', count: summary.offlineBins, activeBg: 'bg-slate-700 border-slate-700', activeText: 'text-white' },
    { label: 'MAINTENANCE', status: 'Maintenance', count: summary.maintenanceBins, activeBg: 'bg-purple-700 border-purple-700', activeText: 'text-white' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
        QUICK FILTERS:
      </span>

      {items.map((item) => {
        const isActive = currentStatus === item.status;
        return (
          <button
            key={item.label}
            onClick={() => onSelectStatus(item.status)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isActive
                ? `${item.activeBg} ${item.activeText} shadow-xs`
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
