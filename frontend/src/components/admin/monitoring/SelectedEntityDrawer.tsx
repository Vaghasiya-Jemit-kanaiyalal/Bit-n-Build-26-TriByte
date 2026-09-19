import React from 'react';
import type { MonitoredBin, MonitoredVehicle, MonitoredRoute } from '../../../types/monitoring';
import {
  X,
  Trash2,
  Route as RouteIcon,
  Cpu,
  BrainCircuit,
  Gauge,
  MapPin,
} from 'lucide-react';

interface SelectedEntityDrawerProps {
  entity:
    | { type: 'bin'; data: MonitoredBin }
    | { type: 'vehicle'; data: MonitoredVehicle }
    | { type: 'route'; data: MonitoredRoute }
    | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const SelectedEntityDrawer: React.FC<SelectedEntityDrawerProps> = ({
  entity,
  isOpen,
  onClose,
  onNavigateToModule,
}) => {
  if (!isOpen || !entity) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
              {entity.type.toUpperCase()}
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Live Telemetry &amp; Status Inspection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* 1. BIN DETAILS */}
          {entity.type === 'bin' && (
            <>
              {/* Bin Hero Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {entity.data.binCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                      entity.data.status === 'Critical'
                        ? 'bg-red-600 text-white'
                        : entity.data.status === 'Warning'
                        ? 'bg-amber-500 text-white'
                        : entity.data.status === 'Offline'
                        ? 'bg-slate-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {entity.data.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{entity.data.location}</h3>
                <p className="text-xs text-slate-400">{entity.data.zone}</p>
              </div>

              {/* Current Fill Status */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Trash2 className="w-3.5 h-3.5 text-slate-500" /> Current Fill Status
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Fill Level:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {entity.data.fillPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${entity.data.fillPercent}%` }}
                      className={`h-full rounded-full ${
                        entity.data.fillPercent >= 90
                          ? 'bg-red-600'
                          : entity.data.fillPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block">Bin Capacity:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {entity.data.capacityLiters} L
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Waste Type:</span>
                      <span className="font-medium text-slate-800">
                        {entity.data.wasteType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensor Health */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" /> Connected Sensor Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sensor ID:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {entity.data.sensorId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Battery Level:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {entity.data.batteryPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Signal Strength:</span>
                    <span className="font-medium text-slate-800">
                      {entity.data.signalStrength}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Update:</span>
                    <span className="font-mono text-slate-700">
                      {entity.data.lastUpdate}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 space-y-2 text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <BrainCircuit className="w-4 h-4 text-emerald-700" />
                  <span>AI Predictive Analytics</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-emerald-800 text-[11px] block">Predicted Overflow:</span>
                    <span className="font-mono font-bold text-red-700">
                      in {Math.floor(entity.data.predictedOverflowMinutes / 60)}h{' '}
                      {entity.data.predictedOverflowMinutes % 60}m
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-[11px] block">Assigned Route:</span>
                    <span className="font-mono font-bold text-emerald-900">
                      {entity.data.assignedRouteId || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 2. VEHICLE DETAILS */}
          {entity.type === 'vehicle' && (
            <>
              {/* Vehicle Hero Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    {entity.data.vehicleCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono bg-blue-600 text-white">
                    {entity.data.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{entity.data.type}</h3>
                <p className="text-xs text-slate-400">Driver: {entity.data.driver}</p>
              </div>

              {/* Vehicle Capacity */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" /> Payload Load Capacity
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Payload Load:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {entity.data.currentLoadTons}t / {entity.data.capacityTons}t (
                      {entity.data.utilizationPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${entity.data.utilizationPercent}%` }}
                      className="h-full rounded-full bg-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Live Location & Speed */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Live Location Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Speed:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {entity.data.speedKmH} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Heading Direction:</span>
                    <span className="font-medium text-slate-800">
                      {entity.data.heading}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Route:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {entity.data.routeId || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last GPS Signal:</span>
                    <span className="font-mono text-slate-700">
                      {entity.data.lastUpdate}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 3. ROUTE DETAILS */}
          {entity.type === 'route' && (
            <>
              {/* Route Hero Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {entity.data.routeCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono bg-emerald-600 text-white">
                    {entity.data.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{entity.data.zone} Collection</h3>
                <p className="text-xs text-slate-400">
                  Vehicle: {entity.data.vehicleId} • Driver: {entity.data.driverName}
                </p>
              </div>

              {/* Progress */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <RouteIcon className="w-3.5 h-3.5 text-slate-500" /> Route Progress &amp; Distance
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Stops Completed:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {entity.data.completedStops} / {entity.data.totalStops} (
                      {entity.data.progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${entity.data.progressPercent}%` }}
                      className="h-full rounded-full bg-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block">Distance Covered:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {entity.data.distanceCompletedKm} / {entity.data.totalDistanceKm} km
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Estimated Completion:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {entity.data.eta}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Navigation Link */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              if (onNavigateToModule) {
                const target =
                  entity.type === 'bin'
                    ? 'Bins'
                    : entity.type === 'vehicle'
                    ? 'Vehicles'
                    : 'Route';
                onNavigateToModule(target);
              }
            }}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer"
          >
            Open Dedicated Module →
          </button>
        </div>
      </div>
    </div>
  );
};
