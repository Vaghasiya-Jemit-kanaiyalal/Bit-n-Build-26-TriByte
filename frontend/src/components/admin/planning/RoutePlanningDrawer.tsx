import React, { useEffect } from 'react';
import { X, Route, ArrowRight } from 'lucide-react';
import type { PlanningRoute } from '../../../types/planning';

interface RoutePlanningDrawerProps {
  route: PlanningRoute | null;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const RoutePlanningDrawer: React.FC<RoutePlanningDrawerProps> = ({
  route,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && route) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [route, onClose]);

  if (!route) return null;

  const code = route.routeId || route.routeCode || 'Route';
  const binList = route.binIds || route.stopBinsList || [];
  const stopsCount = route.stopCount || route.stopsCount || binList.length;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Route className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold font-mono text-emerald-400">{code}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Zone: <strong className="text-white">{route.zone}</strong></span>
              <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {route.status}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
            
            {/* Resources */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 block font-medium">Assigned Vehicle</span>
                <span className="font-bold font-mono text-slate-900 text-sm">{route.vehicleId}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 block font-medium">Assigned Driver</span>
                <span className="font-bold text-slate-900 text-sm">{route.driverName}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 border border-slate-200 rounded-xl font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Distance</span>
                <span className="font-bold text-slate-900">{route.distanceKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Est. Duration</span>
                <span className="font-bold text-slate-900">{route.estimatedDuration || route.duration}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Waste Output</span>
                <span className="font-bold text-emerald-700">{route.expectedWasteTons} t</span>
              </div>
            </div>

            {/* Stops Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stop Sequence ({stopsCount} Bins)
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-48 overflow-y-auto p-2">
                {binList.map((binId: string, idx: number) => (
                  <div key={binId} className="flex items-center justify-between py-1.5 px-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-mono font-bold text-[10px] text-slate-700">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-emerald-800">{binId}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">Smart Collection Stop</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2">
            <button
              onClick={() => onNavigate('Routes')}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
            >
              <span>View Route in Execution Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
  );
};
