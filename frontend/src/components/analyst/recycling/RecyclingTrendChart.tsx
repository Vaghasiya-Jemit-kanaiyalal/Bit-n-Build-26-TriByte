import React from 'react';
import type { RecyclingTrendPoint } from '../../../services/recyclingAnalyticsService';

interface RecyclingTrendChartProps {
  data: RecyclingTrendPoint[];
}

export const RecyclingTrendChart: React.FC<RecyclingTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Daily Diversion Rate Trend (%)</h3>
          <p className="text-xs text-slate-500">Percentage of municipal waste diverted from landfills</p>
        </div>
        <span className="text-xs font-mono font-extrabold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
          Avg 48.6% Diversion
        </span>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
        {data.map((item, idx) => {
          const divH = (item.diversionRate - 30) * 6;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="w-full flex items-end justify-center h-36">
                <div
                  style={{ height: `${Math.max(20, divH)}px` }}
                  className="w-5 bg-teal-600 rounded-t-sm group-hover:bg-teal-700 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.diversionRate}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecyclingTrendChart;
