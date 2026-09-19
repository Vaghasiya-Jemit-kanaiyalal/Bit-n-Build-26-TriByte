import React from 'react';
import { PackageCheck, Clock, Scale, Timer, CalendarCheck } from 'lucide-react';
import type { DriverRoute } from '../../types/driver';

interface RouteProgressCardProps {
  route: DriverRoute;
}

export const RouteProgressCard: React.FC<RouteProgressCardProps> = ({ route }) => {
  const {
    completedStops,
    totalStops,
    progressPct,
    totalCollectedTons,
    estimatedRemainingTons,
    averageStopTimeMin,
    estimatedCompletionTime,
  } = route;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-extrabold text-slate-900">Today's Collection Progress</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
            {completedStops} / {totalStops} Stops ({progressPct}%)
          </span>
        </div>

        {/* Big Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-emerald-700 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Collected Tonnage</span>
            </div>
            <div className="text-base font-extrabold text-slate-900 font-mono">
              {totalCollectedTons} <span className="text-xs font-normal text-slate-500">t</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Logged in vehicle</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Est. Remaining Tonnage</span>
            </div>
            <div className="text-base font-extrabold text-slate-900 font-mono">
              {estimatedRemainingTons} <span className="text-xs font-normal text-slate-500">t</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Remaining on route</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <Timer className="w-3.5 h-3.5 text-blue-600" />
              <span>Avg. Stop Duration</span>
            </div>
            <div className="text-base font-extrabold text-slate-900 font-mono">
              {averageStopTimeMin} <span className="text-xs font-normal text-slate-500">min</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Per bin pickup</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Est. Route Completion</span>
            </div>
            <div className="text-base font-extrabold text-purple-900 font-mono">
              {estimatedCompletionTime}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Estimated arrival</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteProgressCard;
