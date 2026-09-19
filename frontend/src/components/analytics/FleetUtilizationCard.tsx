import React from 'react';
import { Truck, ArrowUpRight } from 'lucide-react';
import type { FleetUtilizationItem } from '../../mock/analyticsMockData';

interface FleetUtilizationCardProps {
  fleet: FleetUtilizationItem[];
  onNavigateToVehicles?: () => void;
}

export const FleetUtilizationCard: React.FC<FleetUtilizationCardProps> = ({
  fleet,
  onNavigateToVehicles,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Fleet & Vehicle Utilization</h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              FLEET TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Vehicle operational status, payload utilization and distance covered
          </p>
        </div>

        {onNavigateToVehicles && (
          <button
            onClick={onNavigateToVehicles}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Fleet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 font-medium">Active Fleet</span>
          <strong className="text-emerald-700 font-mono font-bold">18 / 24</strong>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 font-medium">Idle Vehicles</span>
          <strong className="text-amber-700 font-mono font-bold">3</strong>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 font-medium">Maintenance</span>
          <strong className="text-slate-700 font-mono font-bold">2</strong>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 font-medium">Avg Fleet Utilization</span>
          <strong className="text-slate-900 font-mono font-bold">74%</strong>
        </div>
      </div>

      {/* Vehicle Utilization Bar Chart */}
      <div className="space-y-2.5 mb-4">
        {fleet.slice(0, 5).map((veh) => (
          <div key={veh.vehicleId} className="p-2 bg-slate-50/70 rounded-lg border border-slate-100 flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-bold text-slate-900">{veh.vehicleId}</span>
                <span className="text-slate-500 text-[11px] truncate max-w-[140px]">{veh.model}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-slate-500">Cap: {veh.capacityUsage}%</span>
                <strong className="text-slate-900">{veh.utilization}% Utilized</strong>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${veh.status === 'Active' ? 'bg-blue-600' : 'bg-slate-400'}`}
                style={{ width: `${veh.utilization}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Capacity Observation Note */}
      <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
        <span>Fleet capacity is currently sufficient for average daily collection demand (68% capacity payload used).</span>
        <span className="font-bold text-blue-950 font-mono">240t Total Capacity</span>
      </div>

    </div>
  );
};

export default FleetUtilizationCard;
