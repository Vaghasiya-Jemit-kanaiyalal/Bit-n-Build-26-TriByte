import React from 'react';
import type { MonitoredRoute } from '../../../types/monitoring';
import { Route as RouteIcon } from 'lucide-react';

interface RouteMonitoringTableProps {
  routes: MonitoredRoute[];
  onSelectRoute: (route: MonitoredRoute) => void;
}

export const RouteMonitoringTable: React.FC<RouteMonitoringTableProps> = ({
  routes,
  onSelectRoute,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <RouteIcon className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Collection Routes Monitoring
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500">
          {routes.length} Active Routes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th className="p-2.5">Route</th>
              <th className="p-2.5">Zone</th>
              <th className="p-2.5">Vehicle</th>
              <th className="p-2.5">Stops Progress</th>
              <th className="p-2.5">Progress %</th>
              <th className="p-2.5">ETA</th>
              <th className="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {routes.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelectRoute(r)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <td className="p-2.5 font-bold text-slate-900">{r.routeCode}</td>
                <td className="p-2.5 font-sans font-medium text-slate-800">{r.zone}</td>
                <td className="p-2.5 font-semibold text-blue-700">{r.vehicleId}</td>
                <td className="p-2.5 text-slate-700">
                  {r.completedStops} / {r.totalStops}
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[11px] font-bold">{r.progressPercent}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${r.progressPercent}%` }}
                        className="h-full bg-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                </td>
                <td className="p-2.5 text-slate-700">{r.eta}</td>
                <td className="p-2.5 font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'On Schedule'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'Delayed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
