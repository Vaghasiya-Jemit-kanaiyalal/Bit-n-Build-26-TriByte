import { MapPin, Navigation, Eye, PackageCheck, Compass } from 'lucide-react';
import type { DriverRouteStop } from '../../types/driver';

interface NextCollectionCardProps {
  stop: DriverRouteStop | null;
  onNavigateStop: (stop: DriverRouteStop) => void;
  onViewBinDetails: (stop: DriverRouteStop) => void;
  onCollectBin: (stop: DriverRouteStop) => void;
}

export const NextCollectionCard: React.FC<NextCollectionCardProps> = ({
  stop,
  onNavigateStop,
  onViewBinDetails,
  onCollectBin,
}) => {
  if (!stop) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
          <PackageCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">All Pickups Completed</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Great job! There are no remaining collection stops for this route.
        </p>
      </div>
    );
  }

  const isCritical = stop.priority === 'CRITICAL' || stop.fillLevel >= 90;

  return (
    <div className={`rounded-2xl p-5 shadow-sm border flex flex-col justify-between transition-all ${
      isCritical
        ? 'bg-gradient-to-br from-red-500/5 via-white to-amber-500/5 border-red-300 ring-2 ring-red-500/20'
        : 'bg-white border-slate-200'
    }`}>
      <div>
        {/* Banner Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              NEXT COLLECTION
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
            isCritical
              ? 'bg-red-100 text-red-900 border-red-300'
              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}>
            {stop.priority} PRIORITY
          </span>
        </div>

        {/* Bin ID & Location */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold font-mono text-slate-900">{stop.binId}</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Stop #{stop.sequence}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{stop.location}</span>
            </p>
          </div>

          {/* Fill Level Pill */}
          <div className="text-right">
            <div className={`text-xl font-extrabold font-mono ${isCritical ? 'text-red-700' : 'text-slate-900'}`}>
              {stop.fillLevel}%
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Fill Level</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200/80 p-3 rounded-xl mb-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Waste Type</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5">{stop.wasteType}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Est. Weight</span>
            <span className="font-bold text-slate-900 font-mono block mt-0.5">{stop.estimatedWasteKg} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Distance / ETA</span>
            <span className="font-bold text-slate-900 font-mono flex items-center gap-1 mt-0.5">
              <Compass className="w-3 h-3 text-slate-500" /> {stop.distanceKm} km ({stop.estimatedArrivalMin} min)
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onNavigateStop(stop)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Navigate</span>
        </button>

        <button
          onClick={() => onViewBinDetails(stop)}
          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-slate-600" />
          <span>View Bin</span>
        </button>

        <button
          onClick={() => onCollectBin(stop)}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-none transition-all"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Mark Collected</span>
        </button>
      </div>
    </div>
  );
};

export default NextCollectionCard;
