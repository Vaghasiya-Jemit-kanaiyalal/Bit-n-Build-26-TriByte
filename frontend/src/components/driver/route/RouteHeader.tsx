import { Play, Pause, CheckCircle2, Truck, Compass, Clock } from 'lucide-react';
import type { DriverRoute } from '../../../types/driver';

interface RouteHeaderProps {
  route: DriverRoute;
  onStartRoute: () => void;
  onPauseRoute: () => void;
  onResumeRoute: () => void;
  onCompleteRoute: () => void;
}

export const RouteHeader: React.FC<RouteHeaderProps> = ({
  route,
  onStartRoute,
  onPauseRoute,
  onResumeRoute,
  onCompleteRoute,
}) => {
  const {
    id,
    name,
    zone,
    status,
    vehicleCode,
    totalStops,
    completedStops,
    remainingStops,
    totalDistanceKm,
    estimatedRemainingMin,
    startTime,
    elapsedTime,
  } = route;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Route Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {id}
          </span>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
            {zone}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${
            status === 'IN_PROGRESS'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : status === 'PAUSED'
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : status === 'COMPLETED'
              ? 'bg-purple-100 text-purple-900 border-purple-300'
              : 'bg-blue-100 text-blue-900 border-blue-300'
          }`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          {name}
        </h2>

        {/* Quick Strip */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-600 font-semibold mt-2">
          <span className="flex items-center gap-1 font-mono">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> {vehicleCode}
          </span>
          <span>&bull;</span>
          <span>Stops: <strong>{completedStops}/{totalStops}</strong> ({remainingStops} left)</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 font-mono">
            <Compass className="w-3.5 h-3.5 text-slate-400" /> {totalDistanceKm} km ({estimatedRemainingMin} min est)
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Started: {startTime || '9:02 AM'} ({elapsedTime})
          </span>
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {status === 'PLANNED' && (
          <button
            onClick={onStartRoute}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer border-none shadow-xs transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Route</span>
          </button>
        )}

        {status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={onPauseRoute}
              className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-amber-200 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Route</span>
            </button>
            <button
              onClick={onCompleteRoute}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer border-none shadow-xs transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Route</span>
            </button>
          </>
        )}

        {status === 'PAUSED' && (
          <>
            <button
              onClick={onResumeRoute}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer border-none shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Route</span>
            </button>
            <button
              onClick={onCompleteRoute}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>End Route</span>
            </button>
          </>
        )}

        {status === 'COMPLETED' && (
          <div className="px-4 py-2 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-700" />
            <span>Route Finished</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteHeader;
