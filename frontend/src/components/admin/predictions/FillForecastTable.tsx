import React, { useState } from 'react';
import { Search, Eye, Plus, ArrowUpDown } from 'lucide-react';
import type { FillForecastBin } from '../../../types/prediction';

interface FillForecastTableProps {
  bins: FillForecastBin[];
  onSelectBin: (bin: FillForecastBin) => void;
  onAddToPlan: (bin: FillForecastBin) => void;
}

export const FillForecastTable: React.FC<FillForecastTableProps> = ({
  bins,
  onSelectBin,
  onAddToPlan,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'predicted24h' | 'timeToOverflow' | 'currentFill'>('predicted24h');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filtered = bins
    .filter(
      (b) =>
        b.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.zone.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Search & Header Toolbar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex items-center w-full sm:w-80">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Bin ID, Location, Zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-transparent rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold self-end sm:self-auto">
          <span>Showing {filtered.length} Bins</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Bin ID</th>
              <th className="py-3 px-4">Zone / Location</th>
              <th className="py-3 px-4">Current Fill</th>
              <th className="py-3 px-4">Pred 6h</th>
              <th className="py-3 px-4">Pred 12h</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
                onClick={() => {
                  setSortField('predicted24h');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Pred 24h</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Overflow ETA</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map((bin) => {
              let riskBadge = 'bg-emerald-100 text-emerald-800';
              if (bin.risk === 'CRITICAL') riskBadge = 'bg-red-100 text-red-800 font-extrabold';
              else if (bin.risk === 'HIGH') riskBadge = 'bg-amber-100 text-amber-800 font-bold';
              else if (bin.risk === 'MEDIUM') riskBadge = 'bg-yellow-100 text-yellow-800 font-bold';

              return (
                <tr key={bin.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{bin.binCode}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{bin.location}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{bin.zone} Zone &bull; {bin.wasteType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">{bin.currentFill}%</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{bin.predicted6h}%</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{bin.predicted12h}%</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-800">{bin.predicted24h}%</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-red-600">{bin.timeToOverflow}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{bin.predictedOverflowTime}</span>
                    </div>
                  </td>
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
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onAddToPlan(bin)}
                        className="px-2.5 py-1 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-xs font-bold cursor-pointer border-none flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Plan</span>
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
