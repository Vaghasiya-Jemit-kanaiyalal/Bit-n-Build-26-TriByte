import React from 'react';
import type { PredictionHistoryItem } from '../../../types/prediction';

interface PredictedVsActualChartProps {
  history: PredictionHistoryItem[];
}

export const PredictedVsActualChart: React.FC<PredictedVsActualChartProps> = ({ history }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Predicted vs Actual Fill Comparison</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Validation outcome across historical predictions.</p>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Error within demonstration tolerance
        </span>
      </div>

      {/* Grid Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.slice(0, 6).map((item) => {
          const diff = Math.abs(item.predictedFill - item.actualFill);
          return (
            <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">{item.binCode}</span>
                <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Predicted: <strong className="text-emerald-700 font-mono">{item.predictedFill}%</strong></span>
                <span>Actual: <strong className="text-slate-900 font-mono">{item.actualFill}%</strong></span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/80">
                <span className="text-slate-500">Variance: <strong>{diff}%</strong></span>
                <span className={`font-bold uppercase ${item.outcome === 'MATCHED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {item.outcome}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
