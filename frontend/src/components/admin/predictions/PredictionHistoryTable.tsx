import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { PredictionHistoryItem } from '../../../types/prediction';

interface PredictionHistoryTableProps {
  history: PredictionHistoryItem[];
}

export const PredictionHistoryTable: React.FC<PredictionHistoryTableProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = history.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex items-center w-full sm:w-80">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search History ID, Bin ID, Zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 border border-transparent rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-colors"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">{filtered.length} Historical Records</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Record ID</th>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4">Bin ID</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Current Fill</th>
              <th className="py-3 px-4">Predicted Fill</th>
              <th className="py-3 px-4">Actual Fill</th>
              <th className="py-3 px-4">Error %</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map((item) => {
              let outcomeBadge = 'bg-emerald-100 text-emerald-800 font-bold';
              if (item.outcome === 'MISSED') outcomeBadge = 'bg-red-100 text-red-800 font-extrabold';
              else if (item.outcome === 'PARTIAL') outcomeBadge = 'bg-amber-100 text-amber-800 font-bold';

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.date} {item.time}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.binCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.zone}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.currentFill}%</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">{item.predictedFill}%</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">{item.actualFill}%</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.errorPercentage}%</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{item.confidence}%</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${outcomeBadge}`}>
                      {item.outcome}
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
