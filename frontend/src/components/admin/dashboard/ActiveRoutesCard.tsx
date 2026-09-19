import React from 'react';
import { Route as RouteIcon, ArrowRight, Eye } from 'lucide-react';
import type { ActiveRouteItem } from '../../../types/dashboard';

interface ActiveRoutesCardProps {
  routes: ActiveRouteItem[];
  onSelectRoute: (r: ActiveRouteItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const ActiveRoutesCard: React.FC<ActiveRoutesCardProps> = ({
  routes,
  onSelectRoute,
  onNavigateTab,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <RouteIcon className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Active Collection Routes</h3>
        </div>
        <button
          onClick={() => onNavigateTab('Route')}
          className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
        >
          View All Routes <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Route List / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px]">
              <th className="py-2 px-2">Route</th>
              <th className="py-2 px-2">Vehicle / Driver</th>
              <th className="py-2 px-2">Stops</th>
              <th className="py-2 px-2">Distance</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {routes.map((rt) => (
              <tr key={rt.id} className="hover:bg-slate-50">
                <td className="py-2 px-2 font-mono font-bold text-slate-900">{rt.routeCode}</td>
                <td className="py-2 px-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{rt.vehicleCode}</span>
                    <span className="text-[9px] text-slate-400">{rt.driverName}</span>
                  </div>
                </td>
                <td className="py-2 px-2 font-mono font-bold">
                  {rt.completedStops} / {rt.totalStops} ({rt.completionPercentage}%)
                </td>
                <td className="py-2 px-2 font-mono text-slate-600">{rt.distanceKm} km</td>
                <td className="py-2 px-2">
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                      rt.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : rt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rt.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <button
                    onClick={() => onSelectRoute(rt)}
                    className="p-1 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
                    title="View Route Details"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
