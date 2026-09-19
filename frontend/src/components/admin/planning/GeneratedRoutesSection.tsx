import React, { useState } from 'react';
import { Route } from 'lucide-react';
import type { PlanningRoute } from '../../../types/planning';

interface GeneratedRoutesSectionProps {
  routes: PlanningRoute[];
  onSelectRoute: (route: PlanningRoute) => void;
  onNavigate: (tab: string) => void;
}

export const GeneratedRoutesSection: React.FC<GeneratedRoutesSectionProps> = ({
  routes,
  onSelectRoute,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [zoneFilter, setZoneFilter] = useState<string>('All');

  const filteredRoutes = routes.filter(
    (r) => zoneFilter === 'All' || r.zone === zoneFilter
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-6 p-6">
      
      {/* Header & Metrics */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Optimized Collection Plan</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Generated & Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and dispatch AI-generated routes tailored to capacity constraints and overflow urgency.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">Filter Zone: All</option>
              <option value="Central">Central</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>

            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex space-x-1 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded font-semibold transition ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded font-semibold transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* Generated Summary Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Routes</span>
            <span className="font-bold font-mono text-slate-900 text-base">{routes.length}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Bins Covered</span>
            <span className="font-bold font-mono text-emerald-800 text-base">34 / 37</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Waste Covered</span>
            <span className="font-bold font-mono text-emerald-800 text-base">8.1 t</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Capacity Util.</span>
            <span className="font-bold font-mono text-slate-900 text-base">72%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Priority Coverage</span>
            <span className="font-bold font-mono text-emerald-800 text-base">97%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Unassigned</span>
            <span className="font-bold font-mono text-amber-700 text-base">3</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-medium">Warnings</span>
            <span className="font-bold font-mono text-amber-700 text-base">1</span>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((r) => (
            <div
              key={r.routeId || r.routeCode}
              onClick={() => onSelectRoute(r)}
              className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Route className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold font-mono text-slate-900 text-sm">{r.routeId || r.routeCode}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {r.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Vehicle</span>
                  <span className="font-mono font-semibold text-slate-800">{r.vehicleId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Driver</span>
                  <span className="font-semibold text-slate-800">{r.driverName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Zone</span>
                  <span className="font-semibold text-slate-800">{r.zone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Stops</span>
                  <span className="font-mono font-bold text-slate-900">{r.stopCount || r.stopsCount} bins</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center font-mono text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans">Waste</span>
                  <span className="font-bold text-emerald-800">{r.expectedWasteTons} t</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans">Distance</span>
                  <span className="text-slate-800">{r.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans">Capacity</span>
                  <span className="font-bold text-slate-900">{r.capacityUtilizationPct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Stops</th>
                <th className="py-3 px-4">Waste</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredRoutes.map((r) => (
                <tr
                  key={r.routeId || r.routeCode}
                  onClick={() => onSelectRoute(r)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold font-mono text-emerald-800">{r.routeId || r.routeCode}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{r.vehicleId}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{r.driverName}</td>
                  <td className="py-3 px-4 text-slate-700">{r.zone}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.stopCount || r.stopsCount}</td>
                  <td className="py-3 px-4 font-mono text-emerald-700">{r.expectedWasteTons} t</td>
                  <td className="py-3 px-4 font-mono text-slate-800">{r.distanceKm} km</td>
                  <td className="py-3 px-4 font-mono text-slate-800">{r.estimatedDuration || r.duration}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.capacityUtilizationPct}%</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {r.priorityLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
