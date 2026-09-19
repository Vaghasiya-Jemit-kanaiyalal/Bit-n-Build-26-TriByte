import React from 'react';
import type { MonitoredVehicle } from '../../../types/monitoring';
import { Truck } from 'lucide-react';

interface FleetMonitoringTableProps {
  vehicles: MonitoredVehicle[];
  onSelectVehicle: (vehicle: MonitoredVehicle) => void;
}

export const FleetMonitoringTable: React.FC<FleetMonitoringTableProps> = ({
  vehicles,
  onSelectVehicle,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Vehicle Fleet Telemetry
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500">
          {vehicles.length} Monitored Vehicles
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th className="p-2.5">Vehicle</th>
              <th className="p-2.5">Driver</th>
              <th className="p-2.5">Route</th>
              <th className="p-2.5">Payload Load</th>
              <th className="p-2.5">Utilization</th>
              <th className="p-2.5">Speed</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Last Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {vehicles.map((v) => (
              <tr
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <td className="p-2.5 font-bold text-slate-900">{v.vehicleCode}</td>
                <td className="p-2.5 font-sans font-medium text-slate-800">{v.driver}</td>
                <td className="p-2.5 text-emerald-800 font-semibold">{v.routeId || '—'}</td>
                <td className="p-2.5 text-slate-700">
                  {v.currentLoadTons}t / {v.capacityTons}t
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[11px]">{v.utilizationPercent}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${v.utilizationPercent}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                </td>
                <td className="p-2.5 text-slate-700">{v.speedKmH} km/h</td>
                <td className="p-2.5 font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'ON ROUTE'
                        ? 'bg-blue-100 text-blue-800'
                        : v.status === 'IDLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'MAINTENANCE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="p-2.5 text-slate-500">{v.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
