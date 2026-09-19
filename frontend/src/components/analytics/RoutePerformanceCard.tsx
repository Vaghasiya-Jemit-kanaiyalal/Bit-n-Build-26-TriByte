import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { RouteEfficiencyItem } from '../../mock/analyticsMockData';

interface RoutePerformanceCardProps {
  routes: RouteEfficiencyItem[];
  onNavigateToRoutes?: () => void;
}

export const RoutePerformanceCard: React.FC<RoutePerformanceCardProps> = ({
  routes,
  onNavigateToRoutes,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Route Execution & Efficiency</h3>
            <span className="text-[10px] font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              OPTIMIZED ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            On-time route completion rates, distance efficiency and stop counts
          </p>
        </div>

        {onNavigateToRoutes && (
          <button
            onClick={onNavigateToRoutes}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Routes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top 4 Route Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Routes
          </span>
          <span className="text-xl font-black font-mono text-slate-900">148</span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">92% On-time</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Delayed Routes
          </span>
          <span className="text-xl font-black font-mono text-amber-700">8%</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Traffic bottlenecks</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Route Distance
          </span>
          <span className="text-xl font-black font-mono text-slate-900">24.6 km</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Per collection loop</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Stops / Route
          </span>
          <span className="text-xl font-black font-mono text-slate-900">18 Stops</span>
          <span className="text-[10px] text-[#047857] font-bold block mt-0.5">High density</span>
        </div>
      </div>

      {/* Top Routes Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
              <th className="pb-2">Route ID</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Zone</th>
              <th className="pb-2">Distance</th>
              <th className="pb-2">Stops</th>
              <th className="pb-2 text-right">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {routes.map((r) => (
              <tr key={r.routeId} className="hover:bg-slate-50">
                <td className="py-2 font-mono font-bold text-slate-900">{r.routeId}</td>
                <td className="py-2 text-slate-800">{r.name}</td>
                <td className="py-2 text-slate-500">{r.zone}</td>
                <td className="py-2 font-mono">{r.distanceKm} km</td>
                <td className="py-2 font-mono">{r.totalStops}</td>
                <td className="py-2 text-right font-mono font-bold text-emerald-700">
                  {r.completionRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default RoutePerformanceCard;
