import React, { useState } from 'react';
import { Navigation, Truck, UserCheck, Play, Square } from 'lucide-react';
import type { MonitoredVehicle, MonitoredRoute, MonitoredBin } from '../../../types/monitoring';
import { monitoringService } from '../../../services/monitoringService';

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
  onRefresh?: () => void;
}

export const LiveVehiclesPanel: React.FC<LiveVehiclesPanelProps> = ({
  vehicles,
  routes = [],
  selectedVehicleId,
  onSelectVehicle,
  onNavigateGoogleMaps,
  onRefresh,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('R-104');

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

  const isAssigned = activeVehicle.status === 'ON ROUTE' && !!activeVehicle.routeId;

  const handleAssignVehicle = () => {
    monitoringService.assignVehicleToRoute(activeVehicle.id, selectedRouteId || 'R-104');
    if (onRefresh) onRefresh();
  };

  const handleUnassignVehicle = () => {
    monitoringService.unassignVehicle(activeVehicle.id);
    if (onRefresh) onRefresh();
  };

  const routeStops = [
    { id: 1, name: 'H-104', fill: 88, fillColor: 'bg-amber-500', time: '10:15 AM', status: 'Completed', statusBg: 'bg-emerald-100 text-emerald-800' },
    { id: 2, name: 'CSE-001', fill: 92, fillColor: 'bg-red-500', time: '11:00 AM', status: isAssigned ? 'En Route' : 'Idle', statusBg: isAssigned ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600' },
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
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {vehicles.filter((v) => v.status === 'ON ROUTE').length} Active
          </span>
        </div>

        {/* Vehicle Selection Dropdown & Status */}
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
                {v.vehicleCode || v.id} {v.status !== 'ON ROUTE' ? '(IDLE)' : '(ON ROUTE)'}
              </option>
            ))}
          </select>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
              isAssigned
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {isAssigned ? 'ON ROUTE' : 'UNASSIGNED (IDLE)'}
          </span>
        </div>

        {/* Admin Assignment Trigger Action Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Assignment:</span>
            </span>
            <span className="font-mono text-[11px] text-slate-600">
              {activeVehicle.routeId ? `Assigned to ${activeVehicle.routeId}` : 'No Active Route'}
            </span>
          </div>

          {!isAssigned ? (
            <div className="flex items-center gap-2 pt-1">
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
              >
                {routes.length > 0 ? (
                  routes.map((r) => (
                    <option key={r.id} value={r.routeCode || r.id}>
                      {r.routeCode || r.id} - {r.zone || 'Central Zone'}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="R-104">Route R-104 (Central Loop)</option>
                    <option value="R-101">Route R-101 (North Zone)</option>
                    <option value="R-102">Route R-102 (East Zone)</option>
                  </>
                )}
              </select>
              <button
                onClick={handleAssignVehicle}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Assign &amp; Dispatch</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-emerald-800 animate-pulse">
                ⚡ Navigating Real-Time Path...
              </span>
              <button
                onClick={handleUnassignVehicle}
                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Unassign (Park at Depot)</span>
              </button>
            </div>
          )}
        </div>

        {/* Truck Graphic Image */}
        <div className="relative w-full h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-inner">
          <img
            src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=600&q=80"
            alt="Garbage Truck"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 text-white text-xs font-bold font-mono">
            Speed: {activeVehicle.speedKmH || 0} km/h
          </div>
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
                {Math.round((activeVehicle.currentLoadTons || 0) * 1000)} / {Math.round((activeVehicle.capacityTons || 2.0) * 1000)} kg
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#047857] h-full rounded-full transition-all duration-300"
                style={{ width: `${activeVehicle.utilizationPercent || 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Status / Location</span>
            <span className="font-bold text-slate-900">
              {isAssigned ? 'En Route (Collecting Bins)' : 'Stationary at Main Gate Depot'}
            </span>
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

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
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

