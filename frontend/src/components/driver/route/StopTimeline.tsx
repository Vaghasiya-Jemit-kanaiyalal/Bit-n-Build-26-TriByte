import { CheckCircle2, Circle, FastForward, MapPin, Eye } from 'lucide-react';
import type { DriverRouteStop } from '../../../types/driver';

interface StopTimelineProps {
  stops: DriverRouteStop[];
  selectedStopId?: string;
  onSelectStop: (stop: DriverRouteStop) => void;
  onViewBinDetails: (stop: DriverRouteStop) => void;
}

export const StopTimeline: React.FC<StopTimelineProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  onViewBinDetails,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <h3 className="text-base font-extrabold text-slate-900 mb-4">
        Ordered Route Stop Timeline
      </h3>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {stops.map((stop) => {
          const isSelected = selectedStopId === stop.id;
          const isCurrent = stop.status === 'CURRENT' || stop.status === 'COLLECTING';
          const isCompleted = stop.status === 'COMPLETED';
          const isSkipped = stop.status === 'SKIPPED';
          const isCritical = stop.priority === 'CRITICAL' || stop.fillLevel >= 90;

          return (
            <div
              key={stop.id}
              onClick={() => onSelectStop(stop)}
              className={`relative flex items-start justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                  : isCurrent
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : isCompleted
                  ? 'bg-white border-slate-200 opacity-80'
                  : isSkipped
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {/* Timeline Marker Icon */}
              <div className="absolute -left-6 top-3 -translate-x-1/2 bg-white rounded-full p-0.5 z-10">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
                ) : isSkipped ? (
                  <FastForward className="w-5 h-5 text-amber-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {/* Stop Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold text-slate-400">
                    #{stop.sequence.toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">{stop.binId}</span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-800 animate-pulse">
                      Current Stop
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[11px] font-medium text-slate-500">
                      Collected {stop.collectedAt || '10:15 AM'}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{stop.location}</span>
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                  <span>Category: <strong className="text-slate-800">{stop.wasteType}</strong></span>
                  <span>&bull;</span>
                  <span>Est: <strong className="text-slate-800 font-mono">{stop.estimatedWasteKg} kg</strong></span>
                </div>
              </div>

              {/* Right Status */}
              <div className="text-right shrink-0 flex flex-col items-end justify-between">
                <span className={`text-base font-extrabold font-mono ${isCritical ? 'text-red-700' : 'text-slate-900'}`}>
                  {stop.fillLevel}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewBinDetails(stop);
                  }}
                  className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StopTimeline;
