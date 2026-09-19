import React, { useEffect } from 'react';
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
  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !route) return null;

  const progressPct = Math.round((route.completedStops / route.totalStops) * 100);

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <RouteIcon className="w-4 h-4 text-[#064e3b]" />
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 m-0">
              Route Manifest Details &bull; {route.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer border-none bg-transparent"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Header Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{route.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  route.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : route.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : route.status === 'At Risk'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {route.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/80">
              <div><span className="text-slate-500">Vehicle:</span> <strong className="text-slate-900">{route.vehicleId}</strong></div>
              <div><span className="text-slate-500">Driver:</span> <strong className="text-slate-900">{route.driverName}</strong></div>
              <div><span className="text-slate-500">Zone:</span> <strong className="text-slate-900">{route.zone}</strong></div>
              <div><span className="text-slate-500">Distance:</span> <strong className="text-slate-900">{route.totalDistanceKm} km</strong></div>
              <div><span className="text-slate-500">Start Time:</span> <strong className="text-slate-900">{route.startTime}</strong></div>
              <div><span className="text-slate-500">Est Completion:</span> <strong className="text-slate-900">{route.estimatedCompletion}</strong></div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-xs">
              <span className="text-slate-700">Collection Progress</span>
              <span className="text-[#064e3b] font-extrabold">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div className="h-full bg-[#047857] rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium pt-0.5">
              <span>Completed: {route.completedStops} stops</span>
              <span>Remaining: {route.totalStops - route.completedStops} stops</span>
            </div>
          </div>

          {/* STOP SEQUENCE */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2 font-mono">
              STOP MANIFEST ({route.stops ? route.stops.length : 0} STOPS)
            </span>

            {(!route.stops || route.stops.length === 0) ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No detailed stop manifest available for this route.
              </div>
            ) : (
              <div className="space-y-2">
                {route.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    onClick={() => onSelectBin && onSelectBin(stop)}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 font-mono">{stop.binId}</span>
                          <span className="text-[10px] text-slate-500">({stop.wasteType})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{stop.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-extrabold ${
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
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#064e3b] text-white hover:bg-[#047857] font-bold rounded-xl cursor-pointer border-none text-xs transition-colors shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
