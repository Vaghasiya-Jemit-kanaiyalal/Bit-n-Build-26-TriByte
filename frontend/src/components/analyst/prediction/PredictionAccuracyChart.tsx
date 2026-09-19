import React from 'react';
import type { PredictionAccuracyPoint } from '../../../services/predictionAnalyticsService';

interface PredictionAccuracyChartProps {
  data: PredictionAccuracyPoint[];
}

export const PredictionAccuracyChart: React.FC<PredictionAccuracyChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Prediction Accuracy Trend</h3>
          <p className="text-xs text-slate-500">Weekly model accuracy & confidence levels %</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-purple-600">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Accuracy Rate
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Confidence
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
        {data.map((item, idx) => {
          const accHeight = (item.accuracy - 80) * 4; // scale
          const confHeight = (item.confidence - 80) * 4;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                <div
                  style={{ height: `${Math.max(20, accHeight)}px` }}
                  className="w-3.5 bg-purple-600 rounded-t-sm group-hover:bg-purple-700 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.accuracy}%
                  </span>
                </div>
                <div
                  style={{ height: `${Math.max(16, confHeight)}px` }}
                  className="w-3.5 bg-indigo-400 rounded-t-sm group-hover:bg-indigo-500 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.confidence}%
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

export default PredictionAccuracyChart;
