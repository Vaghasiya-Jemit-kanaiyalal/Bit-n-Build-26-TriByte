import React from 'react';
import { ArrowUpRight, Recycle } from 'lucide-react';
import type { WasteCompositionItem } from '../../mock/analyticsMockData';

interface WasteCompositionChartProps {
  composition: WasteCompositionItem[];
  onNavigateToClassification?: () => void;
}

export const WasteCompositionChart: React.FC<WasteCompositionChartProps> = ({
  composition,
  onNavigateToClassification,
}) => {
  const totalTons = Math.round(composition.reduce((sum, item) => sum + item.tonsPerDay, 0) * 10) / 10;
  const recyclablePercent = Math.round(
    composition.filter(c => c.isRecyclable).reduce((sum, item) => sum + item.percentage, 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Waste Composition Breakdown</h3>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              AI CLASSIFIED
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Material composition detected by vision AI smart camera sensors
          </p>
        </div>

        {onNavigateToClassification && (
          <button
            onClick={onNavigateToClassification}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Classification</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Grid: Donut + Legend */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* SVG Donut Graphic */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
            {composition.map((item, idx) => {
              // Calculate stroke dasharray for donut segments
              const prevSum = composition.slice(0, idx).reduce((sum, i) => sum + i.percentage, 0);
              const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
              const strokeDashoffset = -prevSum;

              return (
                <circle
                  key={item.category}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-80"
                />
              );
            })}
          </svg>

          {/* Center Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 font-mono">{totalTons}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tons / Day</span>
          </div>
        </div>

        {/* Categories Breakdown List */}
        <div className="md:col-span-7 space-y-2 text-xs">
          {composition.map((item) => (
            <div key={item.category} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-bold text-slate-800 truncate">{item.category}</span>
                {item.isRecyclable && (
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                    Recyclable
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 font-mono shrink-0 text-right">
                <span className="text-slate-500">{item.tonsPerDay} t/day</span>
                <strong className="text-slate-900 w-10 text-right">{item.percentage}%</strong>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Recyclables Recovability Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-semibold">
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-emerald-900">
            <Recycle className="w-4 h-4 text-emerald-600" />
            <span>Recyclable Material</span>
          </div>
          <strong className="text-emerald-950 font-mono text-sm">{recyclablePercent}%</strong>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-slate-700">Non-Recyclable Waste</span>
          <strong className="text-slate-900 font-mono text-sm">{100 - recyclablePercent}%</strong>
        </div>
      </div>

    </div>
  );
};

export default WasteCompositionChart;
