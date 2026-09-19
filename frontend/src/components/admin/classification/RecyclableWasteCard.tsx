import React from 'react';
import { Recycle, Info } from 'lucide-react';

export const RecyclableWasteCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Recycle className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Recycling & Material Recovery Analysis</h3>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
          Material Recovery Metric
        </span>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
          <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block mb-1">
            Recyclable Waste
          </span>
          <span className="text-2xl font-extrabold text-blue-900 font-mono leading-none">
            61.8%
          </span>
          <span className="text-[11px] text-blue-700 font-bold block mt-1">
            5.2 Tons Estimated
          </span>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
            Non-Recyclable
          </span>
          <span className="text-2xl font-extrabold text-amber-900 font-mono leading-none">
            38.2%
          </span>
          <span className="text-[11px] text-amber-700 font-bold block mt-1">
            3.2 Tons Disposal
          </span>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
            Potentially Recoverable
          </span>
          <span className="text-2xl font-extrabold text-emerald-900 font-mono leading-none">
            14.6%
          </span>
          <span className="text-[11px] text-emerald-700 font-bold block mt-1">
            1.23 Tons Extra Boost
          </span>
        </div>
      </div>

      {/* Horizontal Stacked Bar Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Recyclable Material Composition (5.2t total)</span>
          <span className="text-blue-600 font-mono">100% of Recyclable Stream</span>
        </div>

        <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
          <div
            style={{ width: '40.4%' }}
            className="bg-blue-500 hover:opacity-90 transition-all cursor-pointer"
            title="Plastic: 2.1t (40.4% of recyclable)"
          />
          <div
            style={{ width: '28.8%' }}
            className="bg-amber-500 hover:opacity-90 transition-all cursor-pointer"
            title="Paper: 1.5t (28.8% of recyclable)"
          />
          <div
            style={{ width: '17.3%' }}
            className="bg-slate-500 hover:opacity-90 transition-all cursor-pointer"
            title="Metal: 0.9t (17.3% of recyclable)"
          />
          <div
            style={{ width: '13.5%' }}
            className="bg-purple-500 hover:opacity-90 transition-all cursor-pointer"
            title="Glass: 0.7t (13.5% of recyclable)"
          />
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-semibold text-slate-700">Plastic</span>
            </div>
            <span className="font-mono font-bold text-slate-900">2.1 t</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-700">Paper</span>
            </div>
            <span className="font-mono font-bold text-slate-900">1.5 t</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="font-semibold text-slate-700">Metal</span>
            </div>
            <span className="font-mono font-bold text-slate-900">0.9 t</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="font-semibold text-slate-700">Glass</span>
            </div>
            <span className="font-mono font-bold text-slate-900">0.7 t</span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Recyclability estimates are based on simulated classification data and may differ from actual material recovery rates.
        </span>
      </div>
    </div>
  );
};
