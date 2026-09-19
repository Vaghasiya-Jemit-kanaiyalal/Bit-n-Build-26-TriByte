import React from 'react';
import { Truck, ArrowRight, Eye } from 'lucide-react';
import type { FleetStatusSummary, DashboardVehicleItem } from '../../../types/dashboard';

interface FleetStatusCardProps {
  fleet: FleetStatusSummary;
  onSelectVehicle: (v: DashboardVehicleItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const FleetStatusCard: React.FC<FleetStatusCardProps> = ({
  fleet,
  onSelectVehicle,
  onNavigateTab,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Vehicle Fleet Status</h3>
        </div>
        <button
          onClick={() => onNavigateTab('Vehicles')}
          className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
        >
          View Fleet <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Fleet Breakdown Row */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">On Route</span>
          <span className="font-mono font-extrabold text-emerald-900">{fleet.onRouteCount}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Available / Idle</span>
          <span className="font-mono font-extrabold text-slate-800">{fleet.idleCount}</span>
        </div>
        <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Maintenance</span>
          <span className="font-mono font-extrabold text-amber-900">{fleet.maintenanceCount}</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Offline</span>
          <span className="font-mono font-extrabold text-slate-600">{fleet.offlineCount}</span>
        </div>
      </div>

      {/* Mini Vehicle Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px]">
              <th className="py-2 px-2">Vehicle</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Load</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {fleet.vehicles.slice(0, 4).map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="py-2 px-2 font-mono font-bold text-slate-900">{v.vehicleCode}</td>
                <td className="py-2 px-2 text-slate-500">{v.type}</td>
                <td className="py-2 px-2 font-mono font-bold text-slate-800">
                  {v.currentLoadTons}t / {v.capacityTons}t ({v.utilizationPercentage}%)
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                      v.status === 'On Route' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <button
                    onClick={() => onSelectVehicle(v)}
                    className="p-1 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
                    title="View Details"
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
