import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { PredictionPerformanceItem } from '../../../services/predictionAnalyticsService';

interface PredictionPerformanceTableProps {
  list: PredictionPerformanceItem[];
}

export const PredictionPerformanceTable: React.FC<PredictionPerformanceTableProps> = ({ list }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Model Performance & Calibration Summary</h3>
          <p className="text-xs text-slate-500">Forecasting engine versions, sector accuracy rates, and error variances</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{list.length} Models Active</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-2">Sector / Location</th>
              <th className="pb-3 px-2">Model Name & Version</th>
              <th className="pb-3 px-2 text-right">Accuracy Rate</th>
              <th className="pb-3 px-2 text-right">Error (MAE %)</th>
              <th className="pb-3 px-2 text-right">Telemetry Samples</th>
              <th className="pb-3 px-2 text-center">Status</th>
              <th className="pb-3 px-2 text-right">Last Calibration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((item) => {
              const statusBadge =
                item.status === 'OPTIMAL' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> OPTIMAL
                  </span>
                ) : item.status === 'CALIBRATING' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    <RefreshCw className="w-3 h-3 animate-spin" /> CALIBRATING
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> RETRAIN
                  </span>
                );

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900">{item.sector}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 block">{item.modelName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.modelVersion}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">{item.accuracyRate}%</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-600">±{item.mae}%</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-600">{item.sampleCount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">{statusBadge}</td>
                  <td className="py-3 px-2 text-right text-slate-500 font-medium">{item.lastUpdated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionPerformanceTable;
