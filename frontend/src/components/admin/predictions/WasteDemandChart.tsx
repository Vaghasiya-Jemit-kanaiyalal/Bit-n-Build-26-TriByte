import React, { useState } from 'react';
import { Weight } from 'lucide-react';
import type { WasteDemandForecastPoint } from '../../../types/prediction';

interface WasteDemandChartProps {
  points: WasteDemandForecastPoint[];
}

export const WasteDemandChart: React.FC<WasteDemandChartProps> = ({ points }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const maxVal = 12; // tons

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 m-0">Expected Waste Generation & Collection Demand</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Historical generation vs predicted waste volume across days of the week.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer border-none ${
                viewMode === 'daily' ? 'bg-[#064e3b] text-white' : 'text-slate-600 bg-transparent'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer border-none ${
                viewMode === 'weekly' ? 'bg-[#064e3b] text-white' : 'text-slate-600 bg-transparent'
              }`}
            >
              Weekly Total
            </button>
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="relative w-full h-56 bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-end justify-between gap-2">
        {points.map((p, idx) => {
          const genHeight = (p.generatedWaste / maxVal) * 100;
          const predHeight = (p.predictedWaste / maxVal) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1.5 h-44">
                {/* Generated Waste Bar */}
                <div
                  style={{ height: `${genHeight}%` }}
                  className="w-1/2 bg-slate-800 rounded-t-md hover:bg-slate-900 transition-all relative"
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Gen: {p.generatedWaste}t
                  </div>
                </div>

                {/* Predicted Waste Bar */}
                <div
                  style={{ height: `${predHeight}%` }}
                  className="w-1/2 bg-emerald-600 rounded-t-md hover:bg-emerald-500 transition-all relative"
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-emerald-950 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Pred: {p.predictedWaste}t
                  </div>
                </div>
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-bold text-slate-600">{p.periodLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-slate-800" />
          <span>Historical Generated Waste (Tons)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-emerald-600" />
          <span>Predicted Waste Demand (Tons)</span>
        </div>
        <span className="text-[10px] text-slate-400">All values simulated</span>
      </div>
    </div>
  );
};
