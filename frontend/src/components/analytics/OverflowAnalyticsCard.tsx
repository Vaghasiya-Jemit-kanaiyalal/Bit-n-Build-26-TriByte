import React from 'react';
import { ArrowUpRight, MapPin, Trash2 } from 'lucide-react';
import type { DailyOverflowPoint } from '../../mock/analyticsMockData';

interface OverflowAnalyticsCardProps {
  overflowTrend: DailyOverflowPoint[];
  onNavigateToBins?: () => void;
}

export const OverflowAnalyticsCard: React.FC<OverflowAnalyticsCardProps> = ({
  overflowTrend,
  onNavigateToBins,
}) => {

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Bin Overflow Analytics</h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              INCIDENT PREVENTATIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Overflow frequency, early prediction warnings and high-fill bin containment
          </p>
        </div>

        {onNavigateToBins && (
          <button
            onClick={onNavigateToBins}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Bin Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
            Total Overflows
          </span>
          <span className="text-xl font-black font-mono text-amber-900">42</span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">↓ -14.3% vs prev</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            AI Predicted
          </span>
          <span className="text-xl font-black font-mono text-slate-900">31</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">73.8% forecast rate</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Unpredicted
          </span>
          <span className="text-xl font-black font-mono text-slate-900">11</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Sudden surges</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Fill Before Pickup
          </span>
          <span className="text-xl font-black font-mono text-slate-900">82%</span>
          <span className="text-[10px] text-[#047857] font-bold block mt-0.5">Optimal threshold</span>
        </div>
      </div>

      {/* Daily Overflow Bar Visual */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>7-Day Overflow Events (Predicted vs Actual)</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
              <span>Predicted</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
              <span>Actual</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-24 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          {overflowTrend.map((pt, idx) => (
            <div key={idx} className="flex flex-col items-center justify-end h-full group">
              <div className="flex items-end space-x-1 w-full justify-center">
                <div
                  className="w-2.5 bg-amber-400 rounded-t-xs transition-all"
                  style={{ height: `${(pt.predicted / 8) * 100}%` }}
                  title={`Predicted: ${pt.predicted}`}
                />
                <div
                  className="w-2.5 bg-red-600 rounded-t-xs transition-all"
                  style={{ height: `${(pt.actual / 8) * 100}%` }}
                  title={`Actual: ${pt.actual}`}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1.5">{pt.date.replace('Sep ', '')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Affected Spot Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Most Affected Zone</span>
            <strong className="text-slate-900 font-bold">Industrial Zone (9 Events)</strong>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
          <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Most Affected Bin</span>
            <strong className="text-slate-900 font-mono font-bold">BIN-1087 (Central Market)</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OverflowAnalyticsCard;
