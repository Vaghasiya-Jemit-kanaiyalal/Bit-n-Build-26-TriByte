import { Route as RouteIcon, ArrowRight, Play, MapPin, Truck, Compass } from 'lucide-react';
import type { DriverRoute } from '../../types/driver';

interface CurrentRouteCardProps {
  route: DriverRoute;
  driverName: string;
  onNavigateToRoute: () => void;
  onStartRoute: () => void;
}

export const CurrentRouteCard: React.FC<CurrentRouteCardProps> = ({
  route,
  driverName,
  onNavigateToRoute,
  onStartRoute,
}) => {
  const isStarted = route.status === 'IN_PROGRESS' || route.status === 'PAUSED' || route.status === 'COMPLETED';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header Badge & Title */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <RouteIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  {route.id}
                </span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {route.zone}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 leading-tight">
                {route.name}
              </h3>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shrink-0 ${
            route.status === 'IN_PROGRESS'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : route.status === 'PAUSED'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : route.status === 'COMPLETED'
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            {route.status === 'IN_PROGRESS'
              ? 'In Progress'
              : route.status === 'PAUSED'
              ? 'Paused'
              : route.status === 'COMPLETED'
              ? 'Completed'
              : 'Route Ready'}
          </span>
        </div>

        {/* Start Route Banner if NOT started */}
        {!isStarted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-emerald-950">
            <h4 className="font-bold text-sm mb-1">Route Ready to Begin</h4>
            <p className="text-xs text-emerald-800 mb-3">
              {route.totalStops} scheduled stops • {route.totalDistanceKm} km estimated distance. Click start to activate live field navigation.
            </p>
            <button
              onClick={onStartRoute}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs border-none"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Route Execution</span>
            </button>
          </div>
        ) : (
          /* Active Route Details */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Vehicle</span>
              <span className="font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" /> {route.vehicleCode}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Assigned Driver</span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{driverName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Stops Overview</span>
              <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {route.completedStops} / {route.totalStops}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Distance & ETA</span>
              <span className="font-bold text-slate-900 font-mono mt-0.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" /> {route.totalDistanceKm} km ({route.estimatedRemainingMin} min)
              </span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Overall Completion Progress</span>
            <span className="font-mono text-emerald-800">{route.progressPct}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-700 rounded-full transition-all duration-500"
              style={{ width: `${route.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
        <button
          onClick={onNavigateToRoute}
          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs border-none"
        >
          <span>{isStarted ? 'Continue Route' : 'View Full Route'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNavigateToRoute}
          className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200 transition-all"
        >
          Route Details
        </button>
      </div>
    </div>
  );
};

export default CurrentRouteCard;
