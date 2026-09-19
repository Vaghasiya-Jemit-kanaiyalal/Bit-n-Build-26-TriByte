import React from 'react';
import { Truck, Clock } from 'lucide-react';
import type { CollectionDemandBreakdown } from '../../../types/prediction';

interface CollectionDemandChartProps {
  demand: CollectionDemandBreakdown;
}

export const CollectionDemandChart: React.FC<CollectionDemandChartProps> = ({ demand }) => {
  const maxBins = 20;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 m-0">Predicted Collection Demand Horizon</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Hourly bin collection requirements and peak workload window.
          </p>
        </div>

        {/* Peak Callout Badge */}
        <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-700 shrink-0" />
          <div className="flex flex-col text-[11px]">
            <span className="font-extrabold text-blue-950">Peak: {demand.peakPeriodLabel}</span>
            <span className="text-blue-700 font-semibold">
              {demand.peakPeriodPriorityBins} priority bins &bull; {demand.peakPeriodExpectedWaste}t waste
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Bar Chart */}
      <div className="relative w-full h-48 bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-end justify-between gap-3">
        {demand.hourlyDemand.map((item, idx) => {
          const height = (item.binsCount / maxBins) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="w-full flex items-end justify-center h-36">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full max-w-[36px] bg-blue-600 rounded-t-md hover:bg-blue-700 transition-all relative flex items-center justify-center text-white text-[10px] font-bold"
                >
                  {item.binsCount}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.hour}: {item.binsCount} bins ({item.priorityCount} priority)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-1.5">{item.hour}</span>
            </div>
          );
        })}
      </div>

      {/* Horizon Summary Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Today</span>
          <span className="font-mono font-extrabold text-slate-900 text-base">{demand.todayBins} Bins</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Next 24h</span>
          <span className="font-mono font-extrabold text-blue-700 text-base">{demand.next24hBins} Bins</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Next 48h</span>
          <span className="font-mono font-extrabold text-slate-900 text-base">{demand.next48hBins} Bins</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Next 7 Days</span>
          <span className="font-mono font-extrabold text-slate-900 text-base">{demand.next7dBins} Bins</span>
        </div>
      </div>
    </div>
  );
};
