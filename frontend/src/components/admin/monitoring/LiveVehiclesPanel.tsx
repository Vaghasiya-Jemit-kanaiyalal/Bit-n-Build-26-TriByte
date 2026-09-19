import React from 'react';
import { Navigation, Truck } from 'lucide-react';
import type { MonitoredVehicle, MonitoredRoute, MonitoredBin } from '../../../types/monitoring';

interface LiveVehiclesPanelProps {
  vehicles: MonitoredVehicle[];
  routes?: MonitoredRoute[];
  bins?: MonitoredBin[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: MonitoredVehicle) => void;
  filters?: any;
  onFilterChange?: (filters: any) => void;
  onClearFilters?: () => void;
  onNavigateGoogleMaps?: () => void;
}

export const LiveVehiclesPanel: React.FC<LiveVehiclesPanelProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onNavigateGoogleMaps,
}) => {
  // Current active vehicle selection
  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || {
    id: 'TRK-021',
    vehicleCode: 'Vehicle V-03',
    driver: 'Rohit Patel',
    currentLoadTons: 0.85,
    capacityTons: 2.0,
    utilizationPercent: 43,
    status: 'ON ROUTE',
  };

  const routeStops = [
    { id: 1, name: 'H-104', fill: 88, fillColor: 'bg-amber-500', time: '10:15 AM', status: 'Completed', statusBg: 'bg-emerald-100 text-emerald-800' },
    { id: 2, name: 'CSE-001', fill: 92, fillColor: 'bg-red-500', time: '11:00 AM', status: 'En Route', statusBg: 'bg-blue-100 text-blue-800' },
    { id: 3, name: 'LIB-005', fill: 45, fillColor: 'bg-emerald-500', time: '11:25 AM', status: 'Pending', statusBg: 'bg-slate-100 text-slate-600' },
    { id: 4, name: 'S-05', fill: 30, fillColor: 'bg-emerald-500', time: '11:45 AM', status: 'Pending', statusBg: 'bg-slate-100 text-slate-600' },
    { id: 5, name: 'CAF-01', fill: 78, fillColor: 'bg-amber-500', time: '12:10 PM', status: 'Pending', statusBg: 'bg-slate-100 text-slate-600' },
  ];

  const handleOpenGoogleMaps = () => {
    if (onNavigateGoogleMaps) {
      onNavigateGoogleMaps();
    } else {
      window.open('https://www.google.com/maps/dir/?api=1&destination=23.0225,72.5714', '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col justify-start">
      {/* Live Vehicles Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3.5 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#064e3b]" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Live Vehicles
            </h3>
          </div>
          <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer">
            View All
          </button>
        </div>

        {/* Vehicle Selection Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <select
            value={activeVehicle.id}
            onChange={(e) => {
              const found = vehicles.find((v) => v.id === e.target.value);
              if (found) onSelectVehicle(found);
            }}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleCode || v.id}
              </option>
            ))}
          </select>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            {activeVehicle.status === 'ON ROUTE' ? 'On Route' : activeVehicle.status}
          </span>
        </div>

        {/* Truck Graphic Image */}
        <div className="relative w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-inner">
          <img
            src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=600&q=80"
            alt="Garbage Truck"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
        </div>

        {/* Driver & Load Metadata */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Driver</span>
            <span className="font-extrabold text-slate-900">{activeVehicle.driver || 'Rohit Patel'}</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-500 font-medium">Current Load</span>
              <span className="font-bold font-mono text-slate-800">
                {Math.round((activeVehicle.currentLoadTons || 0.85) * 1000)} / {Math.round((activeVehicle.capacityTons || 2.0) * 1000)} kg
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#047857] h-full rounded-full transition-all duration-300"
                style={{ width: `${activeVehicle.utilizationPercent || 43}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Next Stop</span>
            <span className="font-bold text-slate-900">CSE-001 (2 min)</span>
          </div>
        </div>

        {/* Route Stops Sequence */}
        <div className="pt-2 border-t border-slate-100 space-y-2 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center">🎯</span>
              Route Stops ({routeStops.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {routeStops.map((stop) => (
              <div
                key={stop.id}
                className="flex items-center justify-between text-xs p-2 bg-slate-50/80 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                    {stop.id}
                  </span>
                  <span className="font-bold text-slate-900 font-mono text-xs">{stop.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono text-white rounded bg-slate-800">
                    {stop.fill}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">{stop.time}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${stop.statusBg}`}>
                    {stop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Navigate with Google Maps */}
        <button
          onClick={handleOpenGoogleMaps}
          className="w-full py-2.5 px-4 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
        >
          <Navigation className="w-4 h-4 text-emerald-300" />
          <span>Navigate with Google Maps</span>
        </button>
      </div>
    </div>
  );
};
