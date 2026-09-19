import React from 'react';
import { X, Route as RouteIcon } from 'lucide-react';
import type { ActiveRouteItem } from '../../../types/dashboard';

interface RouteDetailsDrawerProps {
  route: ActiveRouteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const RouteDetailsDrawer: React.FC<RouteDetailsDrawerProps> = ({
  route,
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
              <RouteIcon className="w-4 h-4 text-purple-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{route.routeCode}</span>
              <span className="text-xs text-slate-500 font-medium">{route.vehicleCode} &bull; {route.driverName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Stop Progress</span>
              <span className="text-2xl font-mono font-extrabold text-purple-700">
                {route.completedStops} / {route.totalStops} Stops
              </span>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-md">
              {route.completionPercentage}% Done
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Estimated Duration:</span>
              <span className="font-bold text-slate-900">{route.estimatedDuration}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Total Distance:</span>
              <span className="font-bold text-slate-900">{route.distanceKm} km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Status:</span>
              <span className="font-bold text-blue-700">{route.status}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('Route');
            }}
            className="w-full py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <RouteIcon className="w-4 h-4" />
            <span>View Full Route Execution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
