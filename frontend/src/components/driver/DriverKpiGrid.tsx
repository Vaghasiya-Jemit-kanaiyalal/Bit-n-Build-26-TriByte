import React from 'react';
import { MapPin, CheckCircle2, Clock, Scale, TrendingUp } from 'lucide-react';
import type { DriverRoute } from '../../types/driver';

interface DriverKpiGridProps {
  route: DriverRoute;
}

export const DriverKpiGrid: React.FC<DriverKpiGridProps> = ({ route }) => {
  const {
    totalStops,
    completedStops,
    remainingStops,
    totalCollectedTons,
    progressPct,
  } = route;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Today's Stops */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Today's Stops</span>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{totalStops}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center justify-between">
            <span className="text-emerald-700 font-bold">{completedStops} completed</span>
            <span className="text-amber-700">{remainingStops} remaining</span>
          </div>
        </div>
      </div>

      {/* 2. Completed */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Completed</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono tracking-tight">{completedStops}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Pickups cleared & logged
          </div>
        </div>
      </div>

      {/* 3. Remaining */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Remaining</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono tracking-tight">{remainingStops}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Stops left on route
          </div>
        </div>
      </div>

      {/* 4. Collected Waste */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Collected Waste</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {totalCollectedTons} <span className="text-sm font-normal text-slate-500">t</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Total tonnage in vehicle
          </div>
        </div>
      </div>

      {/* 5. Route Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Route Progress</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-purple-800 font-mono tracking-tight">{progressPct}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverKpiGrid;
