import React from 'react';
import {
  Trash2,
  AlertTriangle,
  Truck,
  Route as RouteIcon,
  Weight,
} from 'lucide-react';
import type { DashboardKpiMetrics } from '../../../types/dashboard';

interface DashboardKpiCardsProps {
  kpi: DashboardKpiMetrics;
  onNavigateTab: (tab: string) => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpi, onNavigateTab }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Bins */}
      <div
        onClick={() => onNavigateTab('Bin Management')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2.25rem)] truncate">
            Total Bins
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{kpi.totalBins}</span>
          <span className="text-[10px] font-semibold text-slate-500 block mt-1 leading-tight">{kpi.activeBins} Active</span>
        </div>
      </div>

      {/* 2. Bins Needing Collection */}
      <div
        onClick={() => onNavigateTab('Bin Management')}
        className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200/80 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-all cursor-pointer group h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider leading-tight max-w-[calc(100%-2.25rem)] truncate">
            Needs Pickup
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight font-mono leading-none">{kpi.binsNeedingCollection}</span>
          <span className="text-[10px] font-extrabold text-red-700 block mt-1 leading-tight">{kpi.criticalBins} Critical</span>
        </div>
      </div>

      {/* 3. Active Vehicles */}
      <div
        onClick={() => onNavigateTab('Vehicles')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2.25rem)] truncate">
            Active Fleet
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">
            {kpi.activeVehicles} <span className="text-xs font-bold text-slate-400 font-sans">/ {kpi.totalVehicles}</span>
          </span>
          <span className="text-[10px] font-semibold text-blue-600 block mt-1 leading-tight">{kpi.fleetActivePercentage}% Active</span>
        </div>
      </div>

      {/* 4. Active Routes */}
      <div
        onClick={() => onNavigateTab('Route')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2.25rem)] truncate">
            Active Routes
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
            <RouteIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{kpi.activeRoutes}</span>
          <span className="text-[10px] font-semibold text-purple-600 block mt-1 leading-tight">{kpi.routesInProgress} In Progress</span>
        </div>
      </div>

      {/* 5. Today's Collection */}
      <div
        onClick={() => onNavigateTab('Analytics')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all cursor-pointer group h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2.25rem)] truncate">
            Today's Tonnage
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
            <Weight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{kpi.todayCollectionTons} t</span>
          <span className="text-[10px] font-semibold text-emerald-600 block mt-1 leading-tight">{kpi.collectionTrend}</span>
        </div>
      </div>

    </div>
  );
};
