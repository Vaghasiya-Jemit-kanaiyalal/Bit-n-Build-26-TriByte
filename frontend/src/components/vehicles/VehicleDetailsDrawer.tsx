import React, { useEffect } from 'react';
import {
  X,
  Truck,
  User,
  MapPin,
  Calendar,
  Wrench,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Maximize2
} from 'lucide-react';
import type { VehicleItem } from '../../mock/vehicleData';
import VehicleStatusBadge from './VehicleStatusBadge';
import LoadProgress from './LoadProgress';

interface VehicleDetailsDrawerProps {
  vehicle: VehicleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (vehicle: VehicleItem) => void;
  onAssign: (vehicle: VehicleItem) => void;
  onViewMaintenance: (vehicle: VehicleItem) => void;
  onNavigateToRoute?: (routeId: string) => void;
  onViewDriver?: (driverName: string) => void;
}

const VehicleDetailsDrawer: React.FC<VehicleDetailsDrawerProps> = ({
  vehicle,
  isOpen,
  onClose,
  onEdit,
  onAssign,
  onViewMaintenance,
  onNavigateToRoute,
  onViewDriver
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !vehicle) return null;

  const handleRouteClick = () => {
    if (vehicle.assignedRouteId && vehicle.assignedRouteId !== '—' && onNavigateToRoute) {
      onNavigateToRoute(vehicle.assignedRouteId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60 text-[#738a62]">
                <Truck className="w-5 h-5 text-[#88a573]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-semibold text-[#88a573] tracking-wide">{vehicle.id}</span>
                  <VehicleStatusBadge status={vehicle.status} />
                </div>
                <h2 className="text-lg font-semibold text-white tracking-tight">{vehicle.name}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="text-slate-500">Last status: <strong className="text-slate-700">{vehicle.status}</strong></span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAssign(vehicle)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              >
                Assign Route
              </button>
              <button
                onClick={() => onEdit(vehicle)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 hover:text-[#738a62] transition-colors shadow-2xs"
              >
                Edit Details
              </button>
            </div>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            
            {/* Operational Quick Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium mb-1">Vehicle Type</div>
                <div className="text-sm font-semibold text-slate-900">{vehicle.type}</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">Reg: {vehicle.registration}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium mb-1">Assigned Route</div>
                {vehicle.assignedRouteId && vehicle.assignedRouteId !== '—' ? (
                  <button
                    onClick={handleRouteClick}
                    className="inline-flex items-center text-sm font-semibold text-[#738a62] hover:underline"
                  >
                    <span>{vehicle.assignedRouteId}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>
                ) : (
                  <span className="text-sm text-slate-400 italic">Unassigned</span>
                )}
                <div className="text-xs text-slate-500 mt-1 font-medium">{vehicle.zone} Zone</div>
              </div>
            </div>

            {/* Operational Status Section */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#738a62]" />
                  <h3 className="text-sm font-semibold text-slate-900">Operational Progress</h3>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  ETA {vehicle.estimatedCompletion || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Route Progress</span>
                    <span className="font-semibold text-slate-800">{vehicle.routeProgressStops || '8 / 14 stops'}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#738a62] transition-all"
                      style={{ width: `${vehicle.collectionProgressPercent || 57}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Collection %</span>
                    <span className="font-semibold text-slate-800">{vehicle.collectionProgressPercent || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${vehicle.collectionProgressPercent || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Breakdown */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Capacity & Payload</h3>
                <span className="text-xs text-slate-500 font-medium">Fuel: <strong className="text-slate-700">{vehicle.energyType}</strong></span>
              </div>

              <LoadProgress currentLoad={vehicle.currentLoadKg} capacity={vehicle.capacityKg} />

              <div className="pt-2 grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Total Capacity</div>
                  <div className="text-xs font-bold text-slate-800">{vehicle.capacityKg} kg</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Current Load</div>
                  <div className="text-xs font-bold text-slate-800">{vehicle.currentLoadKg} kg</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Remaining</div>
                  <div className="text-xs font-bold text-emerald-700">{Math.max(0, vehicle.capacityKg - vehicle.currentLoadKg)} kg</div>
                </div>
              </div>
            </div>

            {/* Mock Map / Location Preview */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#738a62]" />
                  <h3 className="text-sm font-semibold text-slate-900">Vehicle Location</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">GPS: {vehicle.coordinates}</span>
              </div>

              {/* Styled Mock SVG Map */}
              <div className="relative h-44 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* SVG Mock Map Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                  {/* Mock Route Path */}
                  <path d="M 30 110 Q 90 40 160 80 T 290 120 T 400 60" fill="none" stroke="#738a62" strokeWidth="3" strokeDasharray="5,5" />
                  <circle cx="30" cy="110" r="4" fill="#38bdf8" />
                  <circle cx="160" cy="80" r="4" fill="#38bdf8" />
                  <circle cx="290" cy="120" r="4" fill="#38bdf8" />
                </svg>

                {/* Simulated Vehicle Marker Pulse */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
                    <div className="relative p-2 bg-[#738a62] text-white rounded-full shadow-lg border-2 border-white">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-mono rounded border border-slate-700 shadow-md">
                    TRK-04 ({vehicle.id})
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-[11px] text-slate-300 rounded border border-slate-700">
                  Zone: <strong className="text-white">{vehicle.zone} Zone</strong>
                </div>

                <div className="absolute top-2 right-2 p-1.5 bg-slate-800/80 text-slate-300 rounded hover:text-white cursor-pointer">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Assigned Driver</h3>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 font-semibold text-slate-700 flex items-center justify-center text-sm border border-slate-300">
                    {vehicle.driverName !== 'Unassigned' ? vehicle.driverName.split(' ').map((n: string) => n[0]).join('') : '?'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{vehicle.driverName}</div>
                    <div className="text-xs text-slate-500">Field Collection Specialist</div>
                  </div>
                </div>

                <button
                  onClick={() => onViewDriver ? onViewDriver(vehicle.driverName) : null}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  View Driver
                </button>
              </div>
            </div>

            {/* Maintenance Section */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Maintenance & Health</h3>
                </div>
                {vehicle.maintenanceStatus === 'Overdue' ? (
                  <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    OVERDUE
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    {vehicle.maintenanceStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium block mb-0.5">Last Service</span>
                  <span className="font-semibold text-slate-800 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {vehicle.lastService}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium block mb-0.5">Next Scheduled</span>
                  <span className={`font-semibold flex items-center ${vehicle.maintenanceStatus === 'Overdue' ? 'text-red-600' : 'text-slate-800'}`}>
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {vehicle.nextService}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewMaintenance(vehicle)}
                className="w-full py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <span>View Maintenance History</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Vehicle Activity Timeline */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(vehicle.history || [
                  { time: '10:42 AM', description: 'Collection started on Route ' + (vehicle.assignedRouteId || 'RT-024') },
                  { time: '10:18 AM', description: 'Reached checkpoint BIN-104 (82% full)' },
                  { time: '09:56 AM', description: 'Departed Central Depot' },
                  { time: '09:40 AM', description: `Assigned to driver ${vehicle.driverName}` }
                ]).map((act, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-[#738a62] border-2 border-white ring-2 ring-slate-100" />
                    <div className="text-xs font-mono text-slate-400">{act.time}</div>
                    <div className="text-xs text-slate-700 font-medium mt-0.5">{act.description}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onAssign(vehicle);
              }}
              className="w-1/2 mr-2 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Assign Route / Driver
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(vehicle);
              }}
              className="w-1/2 ml-2 py-2 text-xs font-medium text-white bg-[#738a62] hover:bg-[#5f7350] rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Edit Vehicle Specs
            </button>
          </div>
        </div>
      </div>
  );
};

export default VehicleDetailsDrawer;
