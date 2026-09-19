import React from 'react';
import { Eye, Copy, Route } from 'lucide-react';
import type { RouteItem } from '../../mock/routeData';

import { showWebsiteToast } from '../common/NotificationToast';

interface RouteListTableProps {
  routes: RouteItem[];
  selectedRouteId: string;
  onSelectRoute: (route: RouteItem) => void;
  onViewDetailsDrawer: (route: RouteItem) => void;
}

export const RouteListTable: React.FC<RouteListTableProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onViewDetailsDrawer,
}) => {
  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-[#738a62]" />
          <h3 className="text-sm font-bold text-[#111827] m-0">Today's Collection Routes</h3>
          <span className="text-xs text-[#6b7280] font-medium">({routes.length} Active Schedules)</span>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#6b7280]">
          No collection routes match your current filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[#6b7280] font-bold uppercase text-[10px]">
                <th className="pb-2.5 pt-1 px-2">Route ID</th>
                <th className="pb-2.5 pt-1 px-2">Vehicle</th>
                <th className="pb-2.5 pt-1 px-2">Driver</th>
                <th className="pb-2.5 pt-1 px-2">Zone</th>
                <th className="pb-2.5 pt-1 px-2">Stops</th>
                <th className="pb-2.5 pt-1 px-2">Distance</th>
                <th className="pb-2.5 pt-1 px-2">Progress</th>
                <th className="pb-2.5 pt-1 px-2">Status</th>
                <th className="pb-2.5 pt-1 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6] font-medium text-[#374151]">
              {routes.map((rt) => {
                const isSelected = selectedRouteId === rt.id;
                const progressPct = Math.round((rt.completedStops / rt.totalStops) * 100);

                return (
                  <tr
                    key={rt.id}
                    onClick={() => onSelectRoute(rt)}
                    className={`transition-colors cursor-pointer hover:bg-[#f9fafb] ${
                      isSelected ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    {/* Route ID */}
                    <td className="py-3 px-2 font-bold text-[#111827]">
                      {rt.id}
                      {isSelected && (
                        <span className="ml-1.5 text-[9px] bg-[#738a62] text-white px-1.5 py-0.5 rounded uppercase">
                          Selected
                        </span>
                      )}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-2 font-bold text-[#1f2937]">{rt.vehicleId}</td>

                    {/* Driver */}
                    <td className="py-3 px-2 text-[#4b5563]">{rt.driverName}</td>

                    {/* Zone */}
                    <td className="py-3 px-2 text-[#6b7280]">{rt.zone}</td>

                    {/* Stops */}
                    <td className="py-3 px-2 font-mono text-[#374151]">{rt.totalStops} stops</td>

                    {/* Distance */}
                    <td className="py-3 px-2 font-mono text-[#374151]">{rt.totalDistanceKm} km</td>

                    {/* Progress Bar */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111827] text-[11px] min-w-[32px]">
                          {progressPct}%
                        </span>
                        <div className="w-16 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rt.status === 'Completed'
                                ? 'bg-[#059669]'
                                : rt.status === 'At Risk'
                                ? 'bg-red-600'
                                : 'bg-[#738a62]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rt.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rt.status === 'In Progress'
                            ? 'bg-[#738a62]/15 text-[#738a62]'
                            : rt.status === 'At Risk'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rt.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewDetailsDrawer(rt)}
                          title="View Details"
                          className="px-2 py-1 text-[11px] font-semibold text-[#374151] hover:text-[#111827] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db] rounded cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-[#738a62]" />
                          <span>View</span>
                        </button>


                        <button
                          onClick={() => showWebsiteToast(`Route ${rt.id} duplicated into draft template.`, 'success', 'Route Duplicated')}
                          title="Duplicate Route"
                          className="p-1 text-[#6b7280] hover:text-[#111827] bg-white border border-[#d1d5db] rounded cursor-pointer hover:bg-[#f3f4f6]"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
