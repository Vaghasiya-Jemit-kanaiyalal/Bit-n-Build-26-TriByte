import React from 'react';
import { X, Route as RouteIcon } from 'lucide-react';
import type { RouteItem, BinStop } from '../../mock/routeData';

interface RouteDetailsDrawerProps {
  route: RouteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectBin?: (stop: BinStop) => void;
}

export const RouteDetailsDrawer: React.FC<RouteDetailsDrawerProps> = ({
  route,
  isOpen,
  onClose,
  onSelectBin,
}) => {
  if (!isOpen || !route) return null;

  const progressPct = Math.round((route.completedStops / route.totalStops) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#e5e7eb] flex flex-col justify-between text-xs text-[#374151]">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-[#738a62]" />
            <h2 className="text-base font-bold text-[#111827] m-0">Route Details &bull; {route.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6b7280] hover:text-[#111827] cursor-pointer border-none bg-transparent"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Header Summary Card */}
          <div className="bg-[#f9fafb] p-3 rounded-lg border border-[#e5e7eb] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#111827]">{route.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  route.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : route.status === 'In Progress'
                    ? 'bg-[#738a62]/15 text-[#738a62]'
                    : route.status === 'At Risk'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {route.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#e5e7eb]">
              <div><span className="text-[#6b7280]">Vehicle:</span> <strong>{route.vehicleId}</strong></div>
              <div><span className="text-[#6b7280]">Driver:</span> <strong>{route.driverName}</strong></div>
              <div><span className="text-[#6b7280]">Zone:</span> <strong>{route.zone}</strong></div>
              <div><span className="text-[#6b7280]">Distance:</span> <strong>{route.totalDistanceKm} km</strong></div>
              <div><span className="text-[#6b7280]">Start Time:</span> <strong>{route.startTime}</strong></div>
              <div><span className="text-[#6b7280]">Est Completion:</span> <strong>{route.estimatedCompletion}</strong></div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-xs">
              <span>Collection Progress</span>
              <span className="text-[#738a62] font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
              <div className="h-full bg-[#738a62] rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#6b7280] font-medium pt-0.5">
              <span>Completed: {route.completedStops} stops</span>
              <span>Remaining: {route.totalStops - route.completedStops} stops</span>
            </div>
          </div>

          {/* STOP SEQUENCE */}
          <div>
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block mb-2">
              STOP SEQUENCE ({route.stops ? route.stops.length : 0} STOPS)
            </span>

            {(!route.stops || route.stops.length === 0) ? (
              <div className="p-4 text-center text-[#9ca3af] bg-[#f9fafb] rounded border border-dashed border-[#d1d5db]">
                No detailed stop manifest available for this route.
              </div>
            ) : (
              <div className="space-y-2">
                {route.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    onClick={() => onSelectBin && onSelectBin(stop)}
                    className="p-2.5 bg-white rounded border border-[#e5e7eb] hover:border-[#738a62] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#f3f4f6] text-[#374151] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#111827]">{stop.binId}</span>
                          <span className="text-[10px] text-[#6b7280]">({stop.wasteType})</span>
                        </div>
                        <span className="text-[11px] text-[#6b7280]">{stop.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          stop.fillLevel >= 85
                            ? 'text-red-600'
                            : stop.fillLevel >= 70
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {stop.fillLevel}%
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          stop.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stop.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1f2937] text-white hover:bg-[#111827] font-semibold rounded cursor-pointer border-none text-xs"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
