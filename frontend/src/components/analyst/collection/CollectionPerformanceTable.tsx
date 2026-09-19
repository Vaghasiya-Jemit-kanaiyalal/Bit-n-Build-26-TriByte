import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type {
  CollectionPerformanceItem,
  BottleneckSummaryItem,
} from '../../../services/collectionAnalyticsService';

interface CollectionPerformanceTableProps {
  list: CollectionPerformanceItem[];
  bottlenecks: BottleneckSummaryItem[];
}

export const CollectionPerformanceTable: React.FC<CollectionPerformanceTableProps> = ({
  list,
  bottlenecks,
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Performance Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Zone Collection SLA Performance</h3>
            <p className="text-xs text-slate-500">Planned vs completed pickup counts and stop turnaround times</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{list.length} Sectors Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-2">Zone / Sector</th>
                <th className="pb-3 px-2 text-right">Planned Stops</th>
                <th className="pb-3 px-2 text-right">Completed Stops</th>
                <th className="pb-3 px-2 text-right">On-Time Rate</th>
                <th className="pb-3 px-2 text-right">Avg Stop Duration</th>
                <th className="pb-3 px-2 text-right">Delay Incidents</th>
                <th className="pb-3 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item) => {
                const statusBadge =
                  item.status === 'EXCELLENT' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> EXCELLENT
                    </span>
                  ) : item.status === 'STABLE' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock className="w-3 h-3" /> STABLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3 h-3" /> DELAYED
                    </span>
                  );

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-900">{item.zone}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-600">{item.plannedStops}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{item.completedStops}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{item.onTimeRate}%</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-600">{item.avgStopMinutes} min</td>
                    <td className="py-3 px-2 text-right font-mono text-amber-600 font-bold">{item.delayIncidents}</td>
                    <td className="py-3 px-2 text-center">{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delay / Bottleneck Summary */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Active Collection Bottlenecks & Delays</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bottlenecks.map((bot) => (
            <div key={bot.id} className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{bot.location}</span>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  +{bot.avgDelayMinutes} MIN DELAY
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{bot.cause}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPerformanceTable;
