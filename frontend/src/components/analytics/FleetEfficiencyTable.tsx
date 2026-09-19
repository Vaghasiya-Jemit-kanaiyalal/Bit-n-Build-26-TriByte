import React from 'react';
import { Truck, ExternalLink } from 'lucide-react';

interface VehicleEfficiencyItem {
  id: string;
  name: string;
  type: string;
  utilization: number;
  avgLoad: number;
  capacityKg: number;
  distanceKm: number;
  fuelType: string;
  fuelConsumption: string;
  downtimeHours: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE';
}

interface FleetEfficiencyTableProps {
  onNavigateToVehicles?: () => void;
}

export const FleetEfficiencyTable: React.FC<FleetEfficiencyTableProps> = ({ onNavigateToVehicles }) => {
  const vehicles: VehicleEfficiencyItem[] = [
    { id: 'VEH-001', name: 'EcoCompactor 01', type: 'Compactor', utilization: 94, avgLoad: 1120, capacityKg: 1200, distanceKm: 142.5, fuelType: 'Diesel', fuelConsumption: '14.2 L/100km', downtimeHours: 0.5, status: 'ACTIVE' },
    { id: 'VEH-002', name: 'GreenHaul 02', type: 'Recycling Truck', utilization: 88, avgLoad: 780, capacityKg: 900, distanceKm: 118.0, fuelType: 'CNG', fuelConsumption: '11.8 kg/100km', downtimeHours: 1.0, status: 'ACTIVE' },
    { id: 'VEH-003', name: 'CleanMove 07', type: 'Tipper', utilization: 76, avgLoad: 1850, capacityKg: 2500, distanceKm: 95.4, fuelType: 'Electric', fuelConsumption: '0.8 kWh/km', downtimeHours: 4.5, status: 'MAINTENANCE' },
    { id: 'VEH-004', name: 'CitySweeper 04', type: 'Mini Collector', utilization: 91, avgLoad: 540, capacityKg: 600, distanceKm: 165.2, fuelType: 'CNG', fuelConsumption: '9.4 kg/100km', downtimeHours: 0.0, status: 'ACTIVE' },
    { id: 'VEH-005', name: 'HeavyLift 09', type: 'Hook Loader', utilization: 82, avgLoad: 3100, capacityKg: 4000, distanceKm: 88.6, fuelType: 'Diesel', fuelConsumption: '18.5 L/100km', downtimeHours: 2.0, status: 'IDLE' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center">
            <Truck className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vehicle Fleet Utilization & Efficiency</h3>
            <p className="text-[11px] text-slate-500 font-medium">Historical payload factor, mileage, energy efficiency, and operational downtime</p>
          </div>
        </div>

        {onNavigateToVehicles && (
          <button
            onClick={onNavigateToVehicles}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border-none"
          >
            <span>Manage Fleet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Vehicle</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Utilization</th>
              <th className="py-2.5 px-3">Avg Load / Capacity</th>
              <th className="py-2.5 px-3">Distance</th>
              <th className="py-2.5 px-3">Energy / Fuel</th>
              <th className="py-2.5 px-3">Downtime</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {vehicles.map((v) => {
              const loadPct = Math.round((v.avgLoad / v.capacityKg) * 100);
              return (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900">{v.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{v.id}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">{v.type}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            v.utilization > 90 ? 'bg-emerald-500' : v.utilization > 75 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${v.utilization}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs">{v.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900">{v.avgLoad} kg</span>
                    <span className="text-slate-400 text-[10px] ml-1">({loadPct}%)</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{v.distanceKm} km</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{v.fuelConsumption} ({v.fuelType})</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{v.downtimeHours} hrs</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        v.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : v.status === 'MAINTENANCE'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
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

export default FleetEfficiencyTable;
