import React, { useState } from 'react';
import type { ClassificationTrendPoint } from '../../../types/classification';
import { TrendingUp } from 'lucide-react';

interface ClassificationTrendChartProps {
  trendData?: ClassificationTrendPoint[];
}

const DEFAULT_TREND_DATA: ClassificationTrendPoint[] = [
  { date: 'Mon', totalTons: 1.1, recyclableTons: 0.68, nonRecyclableTons: 0.42, plasticTons: 0.28, paperTons: 0.20, organicTons: 0.35 },
  { date: 'Tue', totalTons: 1.3, recyclableTons: 0.81, nonRecyclableTons: 0.49, plasticTons: 0.33, paperTons: 0.24, organicTons: 0.40 },
  { date: 'Wed', totalTons: 1.2, recyclableTons: 0.74, nonRecyclableTons: 0.46, plasticTons: 0.30, paperTons: 0.22, organicTons: 0.37 },
  { date: 'Thu', totalTons: 1.4, recyclableTons: 0.86, nonRecyclableTons: 0.54, plasticTons: 0.35, paperTons: 0.26, organicTons: 0.44 },
  { date: 'Fri', totalTons: 1.25, recyclableTons: 0.77, nonRecyclableTons: 0.48, plasticTons: 0.31, paperTons: 0.23, organicTons: 0.39 },
  { date: 'Sat', totalTons: 1.15, recyclableTons: 0.71, nonRecyclableTons: 0.44, plasticTons: 0.29, paperTons: 0.21, organicTons: 0.36 },
  { date: 'Sun', totalTons: 1.0, recyclableTons: 0.61, nonRecyclableTons: 0.39, plasticTons: 0.24, paperTons: 0.18, organicTons: 0.31 },
];

export const ClassificationTrendChart: React.FC<ClassificationTrendChartProps> = ({ trendData }) => {
  const [activeMetric, setActiveMetric] = useState<'total' | 'recyclable' | 'nonRecyclable'>('total');

  const dataToRender = trendData && trendData.length > 0 ? trendData : DEFAULT_TREND_DATA;
  const maxVal = Math.max(...dataToRender.map((d) => d.totalTons)) || 1.5;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Waste Classification Trend</h3>
        </div>

        {/* Metric Toggle Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveMetric('total')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer border-none ${
              activeMetric === 'total'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            Total Classified
          </button>
          <button
            onClick={() => setActiveMetric('recyclable')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer border-none ${
              activeMetric === 'recyclable'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            Recyclable
          </button>
          <button
            onClick={() => setActiveMetric('nonRecyclable')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer border-none ${
              activeMetric === 'nonRecyclable'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            Non-Recyclable
          </button>
        </div>
      </div>

      {/* Bar Graphic Canvas */}
      <div className="pt-2">
        <div className="h-48 w-full flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
          {dataToRender.map((pt) => {
            const heightVal =
              activeMetric === 'total'
                ? pt.totalTons
                : activeMetric === 'recyclable'
                ? pt.recyclableTons
                : pt.nonRecyclableTons;

            const heightPct = Math.round((heightVal / maxVal) * 100);

            const barColor =
              activeMetric === 'total'
                ? 'bg-[#047857]'
                : activeMetric === 'recyclable'
                ? 'bg-blue-600'
                : 'bg-amber-600';

            return (
              <div key={pt.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono p-1.5 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                  <p className="font-bold">{pt.date}</p>
                  <p>Total: {pt.totalTons}t</p>
                  <p className="text-blue-300">Recyclable: {pt.recyclableTons}t</p>
                  <p className="text-amber-300">Non-Recycled: {pt.nonRecyclableTons}t</p>
                </div>

                {/* Stacked / Single Bar */}
                <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end justify-center overflow-hidden">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full ${barColor} transition-all duration-300 rounded-t-md hover:opacity-90`}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 font-mono">{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono">
        <span>Daily Peak: <strong className="text-slate-900">1.4 Tons (Thu)</strong></span>
        <span>Daily Average: <strong className="text-slate-900">1.2 Tons/day</strong></span>
      </div>
    </div>
  );
};
