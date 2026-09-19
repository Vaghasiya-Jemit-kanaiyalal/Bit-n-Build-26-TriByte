import React, { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import type { FillForecastBin } from '../../../types/prediction';

interface OverflowRiskTableProps {
  bins: FillForecastBin[];
  onSelectBin: (bin: FillForecastBin) => void;
  onAddToPlan: (bin: FillForecastBin) => void;
}

export const OverflowRiskTable: React.FC<OverflowRiskTableProps> = ({
  bins,
  onSelectBin,
  onAddToPlan,
}) => {
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');

  const filtered = bins.filter((b) => {
    if (riskFilter !== 'All' && b.risk !== riskFilter) return false;
    if (zoneFilter !== 'All' && b.zone !== zoneFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header Filters Toolbar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900 m-0">Priority Overflow Risk Queue</h3>

        <div className="flex items-center gap-2">
          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Zones</option>
            <option value="Central">Central</option>
            <option value="Residential">Residential</option>
            <option value="South">South</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Bin ID</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Current Fill</th>
              <th className="py-3 px-4">Predicted (24h)</th>
              <th className="py-3 px-4">Time to Overflow</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4 text-right">Recommended Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map((bin, idx) => {
              let riskBadge = 'bg-emerald-100 text-emerald-800';
              if (bin.risk === 'CRITICAL') riskBadge = 'bg-red-100 text-red-800 font-extrabold';
              else if (bin.risk === 'HIGH') riskBadge = 'bg-amber-100 text-amber-800 font-bold';

              return (
                <tr key={bin.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{bin.binCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{bin.zone}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{bin.currentFill}%</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-800">{bin.predicted24h}%</td>
                  <td className="py-3 px-4 font-bold text-red-600">{bin.timeToOverflow}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{bin.confidence}%</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${riskBadge}`}>
                      {bin.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectBin(bin)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-xs"
                      >
                        View Prediction
                      </button>
                      <button
                        onClick={() => onAddToPlan(bin)}
                        className="px-2.5 py-1 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-xs font-bold cursor-pointer border-none flex items-center gap-1 shadow-xs"
                      >
                        <CalendarCheck className="w-3 h-3" />
                        <span>Add to Plan</span>
                      </button>
                    </div>
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
