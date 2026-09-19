import { Route as RouteIcon } from 'lucide-react';
import type { DriverRoute } from '../../../types/driver';

interface RouteSummaryProps {
  route: DriverRoute;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({ route }) => {
  const {
    totalStops,
    completedStops,
    skippedStops,
    remainingStops,
    totalCollectedTons,
    totalDistanceKm,
    elapsedTime,
    averageStopTimeMin,
    progressPct,
  } = route;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-extrabold text-slate-900">Route Execution Summary</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
            {progressPct}% Complete
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Stops</span>
            <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">{totalStops}</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Completed</span>
            <span className="text-base font-extrabold text-emerald-900 font-mono mt-0.5 block">{completedStops}</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
            <span className="text-[10px] text-amber-800 font-semibold block uppercase">Skipped</span>
            <span className="text-base font-extrabold text-amber-900 font-mono mt-0.5 block">{skippedStops}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Remaining</span>
            <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">{remainingStops}</span>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <span className="text-[10px] text-blue-800 font-semibold block uppercase">Tonnage Collected</span>
            <span className="text-base font-extrabold text-blue-900 font-mono mt-0.5 block">{totalCollectedTons} t</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Route Distance</span>
            <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">{totalDistanceKm} km</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Elapsed Time</span>
            <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">{elapsedTime}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg. Stop Time</span>
            <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">{averageStopTimeMin} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSummary;
