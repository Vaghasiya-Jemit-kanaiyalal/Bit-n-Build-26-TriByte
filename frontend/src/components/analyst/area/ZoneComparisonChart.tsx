import React from 'react';
import type { ZoneItem } from '../../../services/areaAnalysisService';

interface ZoneComparisonChartProps {
  zones: ZoneItem[];
  onSelectZone: (zone: ZoneItem) => void;
}

export const ZoneComparisonChart: React.FC<ZoneComparisonChartProps> = ({ zones, onSelectZone }) => {
  const maxWaste = Math.max(...zones.map((z) => z.totalWasteTons), 70);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Zone Mass Generation & Recycling Comparison</h3>
          <p className="text-xs text-slate-500">Tonnage generated and recycling recovery rate per municipal sector</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Waste (Tons)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Recycling %
          </span>
        </div>
      </div>

      <div className="h-52 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
        {zones.map((item) => {
          const wasteH = (item.totalWasteTons / maxWaste) * 150;
          const recH = (item.recyclingRate / 100) * 150;

          return (
            <div
              key={item.id}
              onClick={() => onSelectZone(item)}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
            >
              <div className="w-full flex items-end justify-center gap-1.5 h-40">
                <div
                  style={{ height: `${wasteH}px` }}
                  className="w-4 bg-slate-700 rounded-t-sm group-hover:bg-slate-900 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.totalWasteTons}t
                  </span>
                </div>
                <div
                  style={{ height: `${recH}px` }}
                  className="w-4 bg-emerald-600 rounded-t-sm group-hover:bg-emerald-700 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap transition-opacity z-10">
                    {item.recyclingRate}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 truncate max-w-[64px]">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ZoneComparisonChart;
