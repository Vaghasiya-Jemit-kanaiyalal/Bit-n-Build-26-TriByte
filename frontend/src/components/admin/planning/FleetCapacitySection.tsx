import React from 'react';
import { Truck } from 'lucide-react';
import type { PlanningVehicle } from '../../../types/planning';

interface FleetCapacitySectionProps {
  vehicles: PlanningVehicle[];
  selectedVehicleIds: string[];
  onToggleVehicleSelection: (vehicleId: string) => void;
}

export const FleetCapacitySection: React.FC<FleetCapacitySectionProps> = ({
  vehicles,
  selectedVehicleIds,
  onToggleVehicleSelection,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Truck className="w-5 h-5 mr-2 text-emerald-400" />
            Fleet Capacity Overview
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Monitor real-time vehicle load limits, available tonnage, and driver assignment readiness.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 bg-slate-800 text-emerald-400 border border-slate-700 rounded-full">
          {vehicles.filter((v) => v.status === 'AVAILABLE').length} / {vehicles.length} Vehicles Available
        </span>
      </div>

      {/* Fleet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Driver Assigned</th>
              <th className="py-3 px-4">Total Capacity</th>
              <th className="py-3 px-4">Current Load</th>
              <th className="py-3 px-4">Available Capacity</th>
              <th className="py-3 px-4">Utilization</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {vehicles.map((v) => {
              const isSelected = selectedVehicleIds.includes(v.vehicleId);
              const typeLabel = v.vehicleType || v.type || v.model || 'Compactor';
              const util = v.utilizationPct ?? v.utilizationPercent ?? 0;

              return (
                <tr
                  key={v.vehicleId}
                  onClick={() => onToggleVehicleSelection(v.vehicleId)}
                  className={`hover:bg-slate-50/80 transition cursor-pointer ${
                    isSelected ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold font-mono text-emerald-800">{v.vehicleId}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {typeLabel}
                  </td>

                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {v.driverName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {v.capacityTons} t
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {v.currentLoadTons} t
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {v.availableCapacityTons} t
                  </td>

                  {/* Utilization bar */}
                  <td className="py-3 px-4 w-40">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${util > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${util}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-900 font-semibold">{util}%</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      v.status === 'LIMITED CAPACITY' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      v.status === 'ON ROUTE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
