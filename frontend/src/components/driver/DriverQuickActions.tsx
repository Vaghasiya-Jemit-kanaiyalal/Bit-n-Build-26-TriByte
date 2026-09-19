import React from 'react';
import { Route as RouteIcon, Navigation, AlertTriangle, Truck, History, Play } from 'lucide-react';

interface DriverQuickActionsProps {
  isRouteStarted: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenReportIssue: () => void;
  onStartRoute: () => void;
}

export const DriverQuickActions: React.FC<DriverQuickActionsProps> = ({
  isRouteStarted,
  onNavigateTab,
  onOpenReportIssue,
  onStartRoute,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-sm">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
        Driver Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {/* 1. Start / Continue Route */}
        {isRouteStarted ? (
          <button
            onClick={() => onNavigateTab('My Route')}
            className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none transition-all shadow-xs"
          >
            <Navigation className="w-4 h-4 text-emerald-300" />
            <span>Continue Route</span>
          </button>
        ) : (
          <button
            onClick={onStartRoute}
            className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none transition-all shadow-xs"
          >
            <Play className="w-4 h-4 text-emerald-300 fill-current" />
            <span>Start Route</span>
          </button>
        )}

        {/* 2. View Route */}
        <button
          onClick={() => onNavigateTab('My Route')}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
        >
          <RouteIcon className="w-4 h-4 text-blue-400" />
          <span>View Route</span>
        </button>

        {/* 3. View Next Stop */}
        <button
          onClick={() => onNavigateTab('My Route')}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Next Stop</span>
        </button>

        {/* 4. Report Issue */}
        <button
          onClick={onOpenReportIssue}
          className="p-3 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-red-800/60 transition-all"
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Report Issue</span>
        </button>

        {/* 5. View Vehicle */}
        <button
          onClick={() => onNavigateTab('Vehicle')}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
        >
          <Truck className="w-4 h-4 text-purple-400" />
          <span>My Vehicle</span>
        </button>

        {/* 6. Collection History */}
        <button
          onClick={() => onNavigateTab('History')}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>History</span>
        </button>
      </div>
    </div>
  );
};

export default DriverQuickActions;
