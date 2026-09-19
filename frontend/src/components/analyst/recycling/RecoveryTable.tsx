import React from 'react';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import type { RecoveryCategoryItem } from '../../../services/recyclingAnalyticsService';

interface RecoveryTableProps {
  categories: RecoveryCategoryItem[];
}

export const RecoveryTable: React.FC<RecoveryTableProps> = ({ categories }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Waste Recovery & Purity by Material Stream</h3>
          <p className="text-xs text-slate-500">Volume, recovery rates, contamination triggers, and carbon offset per stream</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{categories.length} Material Streams</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-2">Material Stream</th>
              <th className="pb-3 px-2 text-right">Volume (Tons)</th>
              <th className="pb-3 px-2 text-right">Recovery Purity %</th>
              <th className="pb-3 px-2 text-right">Contamination %</th>
              <th className="pb-3 px-2 text-right">CO₂ Saved (Tons)</th>
              <th className="pb-3 px-2 text-center">Stream Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((item) => {
              const statusBadge =
                item.status === 'HIGH_RECOVERY' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> HIGH RECOVERY
                  </span>
                ) : item.status === 'MODERATE' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    MODERATE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> CONTAMINATED
                  </span>
                );

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900">{item.category}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{item.volumeTons} Tons</td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-600 font-bold">{item.recoveryRate}%</td>
                  <td className="py-3 px-2 text-right font-mono text-amber-600 font-bold">{item.contaminationRate}%</td>
                  <td className="py-3 px-2 text-right font-mono text-teal-600 font-bold">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-500" />
                      {item.co2SavedTons}t
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">{statusBadge}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecoveryTable;
