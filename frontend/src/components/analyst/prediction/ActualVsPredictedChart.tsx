import React from 'react';
import type { ActualVsPredictedPoint } from '../../../services/predictionAnalyticsService';

interface ActualVsPredictedChartProps {
  data: ActualVsPredictedPoint[];
}

export const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.actual, d.predicted]), 300);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Actual vs Predicted Waste (Tons)</h3>
          <p className="text-xs text-slate-500">Comparison of actual generation mass vs predicted model output</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Actual Mass
          </span>
          <span className="flex items-center gap-1.5 text-blue-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Predicted Mass
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
        {data.map((item, idx) => {
          const actualH = (item.actual / maxVal) * 140;
          const predH = (item.predicted / maxVal) * 140;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                <div
                  style={{ height: `${actualH}px` }}
                  className="w-3.5 bg-emerald-600 rounded-t-sm group-hover:bg-emerald-700 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.actual}t
                  </span>
                </div>
                <div
                  style={{ height: `${predH}px` }}
                  className="w-3.5 bg-blue-500 rounded-t-sm group-hover:bg-blue-600 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.predicted}t
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

export default ActualVsPredictedChart;
