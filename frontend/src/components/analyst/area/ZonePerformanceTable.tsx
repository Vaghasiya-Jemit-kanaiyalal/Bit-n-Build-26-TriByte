import React from 'react';
import { Eye, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import type { ZoneItem } from '../../../services/areaAnalysisService';

interface ZonePerformanceTableProps {
  zones: ZoneItem[];
  onSelectZone: (zone: ZoneItem) => void;
}

export const ZonePerformanceTable: React.FC<ZonePerformanceTableProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sector Performance Breakdown</h3>
          <p className="text-xs text-slate-500">Detailed breakdown of total waste, efficiency, and overflow metrics per zone</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{zones.length} Sectors Registered</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-2">Zone Name</th>
              <th className="pb-3 px-2 text-right">Total Waste</th>
              <th className="pb-3 px-2 text-right">Efficiency</th>
              <th className="pb-3 px-2 text-right">Recycling Rate</th>
              <th className="pb-3 px-2 text-right">Overflow Rate</th>
              <th className="pb-3 px-2 text-center">Status</th>
              <th className="pb-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map((item) => {
              const statusBadge =
                item.status === 'OPTIMAL' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> OPTIMAL
                  </span>
                ) : item.status === 'MODERATE' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    MODERATE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> CRITICAL
                  </span>
                );

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900">{item.name} Zone</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{item.totalWasteTons} Tons</td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-600 font-bold">{item.collectionEfficiency}%</td>
                  <td className="py-3 px-2 text-right font-mono text-blue-600 font-bold">{item.recyclingRate}%</td>
                  <td className="py-3 px-2 text-right font-mono text-amber-600 font-bold">{item.overflowRate}%</td>
                  <td className="py-3 px-2 text-center">{statusBadge}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectZone(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all cursor-pointer border-none text-[11px]"
                    >
                      <Eye className="w-3 h-3" /> Details
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZonePerformanceTable;
