import React from 'react';
import { UserCheck } from 'lucide-react';
import type { PlanningDriver } from '../../../types/planning';

interface DriverAvailabilitySectionProps {
  drivers: PlanningDriver[];
  selectedDriverIds: string[];
  onToggleDriverSelection: (driverId: string) => void;
}

export const DriverAvailabilitySection: React.FC<DriverAvailabilitySectionProps> = ({
  drivers,
  selectedDriverIds,
  onToggleDriverSelection,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-emerald-400" />
            Driver Availability & Roster
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Review active waste management drivers, operating zones, shift duty hours, and route status.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 bg-slate-800 text-emerald-400 border border-slate-700 rounded-full">
          {drivers.filter((d) => d.status === 'AVAILABLE').length} Available Drivers
        </span>
      </div>

      {/* Driver Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Assigned Vehicle</th>
              <th className="py-3 px-4">Current Route</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Shift Hours Left</th>
              <th className="py-3 px-4">Shift Status</th>
              <th className="py-3 px-4 text-right">Planning Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {drivers.map((driver) => {
              const dId = driver.driverId || driver.id;
              const dName = driver.driverName || driver.name || 'Driver';
              const isSelected = selectedDriverIds.includes(dId);
              const isAvailable = driver.status === 'AVAILABLE';
              const route = driver.currentRouteId || driver.currentRoute || 'None';
              const zone = driver.assignedZone || driver.zone || 'General';
              const avail = driver.availabilityStatus || (isAvailable ? 'AVAILABLE' : 'UNAVAILABLE');

              return (
                <tr
                  key={dId}
                  onClick={() => isAvailable && onToggleDriverSelection(dId)}
                  className={`transition ${
                    isAvailable ? 'hover:bg-slate-50/80 cursor-pointer' : 'opacity-60 bg-slate-50/40 cursor-not-allowed'
                  } ${isSelected ? 'bg-emerald-50/30' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isAvailable}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{dName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{dId}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {driver.vehicleId || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>

                  <td className="py-3 px-4 font-mono text-emerald-700 font-medium">
                    {route}
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {zone}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {driver.hoursAvailable} hrs
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      driver.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      driver.status === 'ON ROUTE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {driver.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                      avail === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {avail}
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
