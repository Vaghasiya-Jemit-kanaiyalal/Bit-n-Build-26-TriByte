import React from 'react';
import {
  Trash2,
  AlertTriangle,
  Truck,
  Route as RouteIcon,
  Weight,
  Recycle,
} from 'lucide-react';
import type { DashboardKpiMetrics } from '../../../types/dashboard';

interface DashboardKpiCardsProps {
  kpi: DashboardKpiMetrics;
  onNavigateTab: (tab: string) => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpi, onNavigateTab }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Total Bins */}
      <div
        onClick={() => onNavigateTab('Bin Management')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bins</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.totalBins}</span>
          <span className="text-[10px] font-bold text-slate-500 block mt-1">{kpi.activeBins} Active</span>
        </div>
      </div>

      {/* 2. Bins Needing Collection (Urgent styling) */}
      <div
        onClick={() => onNavigateTab('Bin Management')}
        className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">Needing Collection</span>
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-amber-900 leading-none">{kpi.binsNeedingCollection}</span>
          <span className="text-[10px] font-extrabold text-red-700 block mt-1">{kpi.criticalBins} Critical Overflow</span>
        </div>
      </div>

      {/* 3. Active Vehicles */}
      <div
        onClick={() => onNavigateTab('Vehicles')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Vehicles</span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">
            {kpi.activeVehicles} <span className="text-sm font-bold text-slate-400">/ {kpi.totalVehicles}</span>
          </span>
          <span className="text-[10px] font-bold text-blue-600 block mt-1">{kpi.fleetActivePercentage}% Fleet Active</span>
        </div>
      </div>

      {/* 4. Active Routes */}
      <div
        onClick={() => onNavigateTab('Route')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Routes</span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <RouteIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.activeRoutes}</span>
          <span className="text-[10px] font-bold text-purple-600 block mt-1">{kpi.routesInProgress} In Progress</span>
        </div>
      </div>

      {/* 5. Today's Collection */}
      <div
        onClick={() => onNavigateTab('Analytics')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Collection</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Weight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-slate-900 leading-none">{kpi.todayCollectionTons} t</span>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">{kpi.collectionTrend}</span>
        </div>
      </div>

      {/* 6. Recyclable Waste */}
      <div
        onClick={() => onNavigateTab('Classification')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recyclable Waste</span>
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Recycle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-extrabold text-[#047857] leading-none">{kpi.recyclablePercentage}%</span>
          <span className="text-[10px] font-bold text-teal-600 block mt-1">{kpi.recyclableTons} t today</span>
        </div>
      </div>
    </div>
  );
};
