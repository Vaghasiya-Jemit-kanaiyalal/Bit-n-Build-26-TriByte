import React from 'react';
import type { RecyclingTrendPoint } from '../../../services/recyclingAnalyticsService';

interface RecyclableWasteChartProps {
  data: RecyclingTrendPoint[];
}

export const RecyclableWasteChart: React.FC<RecyclableWasteChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recyclable vs Non-Recyclable Mass (Tons)</h3>
          <p className="text-xs text-slate-500">Daily tonnage breakdown of recyclable recovery vs landfill waste</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-teal-600">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Recyclable
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Non-Recyclable
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
        {data.map((item, idx) => {
          const recH = (item.recyclable / 30) * 140;
          const nonRecH = (item.nonRecyclable / 30) * 140;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                <div
                  style={{ height: `${recH}px` }}
                  className="w-3.5 bg-teal-600 rounded-t-sm group-hover:bg-teal-700 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.recyclable}t
                  </span>
                </div>
                <div
                  style={{ height: `${nonRecH}px` }}
                  className="w-3.5 bg-slate-400 rounded-t-sm group-hover:bg-slate-500 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.nonRecyclable}t
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

export default RecyclableWasteChart;
