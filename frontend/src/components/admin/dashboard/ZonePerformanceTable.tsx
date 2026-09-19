import React, { useState } from 'react';
import { MapPin, ArrowUpDown } from 'lucide-react';
import type { ZonePerformanceItem } from '../../../types/dashboard';

interface ZonePerformanceTableProps {
  zones: ZonePerformanceItem[];
}

export const ZonePerformanceTable: React.FC<ZonePerformanceTableProps> = ({ zones }) => {
  const [sortField, setSortField] = useState<'avgFillPercentage' | 'criticalBinsCount' | 'collectionEfficiencyPercentage'>('avgFillPercentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedZones = [...zones].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#047857]" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Municipal Zone Operational Performance</h3>
        </div>
        <span className="text-xs text-slate-500 font-semibold">{zones.length} Active Zones</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Total Bins</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
                onClick={() => {
                  setSortField('avgFillPercentage');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Avg Fill %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Critical Bins</th>
              <th className="py-3 px-4">Collected Today</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
                onClick={() => {
                  setSortField('collectionEfficiencyPercentage');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Efficiency %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {sortedZones.map((z) => {
              let statusBadge = 'bg-emerald-100 text-emerald-800';
              if (z.status === 'CRITICAL') statusBadge = 'bg-red-100 text-red-800 font-extrabold';
              else if (z.status === 'WARNING') statusBadge = 'bg-amber-100 text-amber-800 font-bold';

              return (
                <tr key={z.zone} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{z.zone} Zone</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{z.totalBins}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{z.avgFillPercentage}%</td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600">{z.criticalBinsCount}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{z.collectedTodayTons} t</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-800">{z.collectionEfficiencyPercentage}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${statusBadge}`}>
                      {z.status}
                    </span>
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
