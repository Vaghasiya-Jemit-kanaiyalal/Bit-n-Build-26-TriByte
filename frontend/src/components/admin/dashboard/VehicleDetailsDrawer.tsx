import React from 'react';
import { X, Truck } from 'lucide-react';
import type { DashboardVehicleItem } from '../../../types/dashboard';

interface VehicleDetailsDrawerProps {
  vehicle: DashboardVehicleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const VehicleDetailsDrawer: React.FC<VehicleDetailsDrawerProps> = ({
  vehicle,
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              <Truck className="w-4 h-4 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{vehicle.vehicleCode}</span>
              <span className="text-xs text-slate-500 font-medium">{vehicle.type}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Payload Load</span>
              <span className="text-2xl font-mono font-extrabold text-blue-700">
                {vehicle.currentLoadTons}t / {vehicle.capacityTons}t
              </span>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md">
              {vehicle.utilizationPercentage}% Loaded
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Operational Status:</span>
              <span className="font-bold text-emerald-700">{vehicle.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Assigned Driver:</span>
              <span className="font-bold text-slate-900">{vehicle.driverName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Assigned Route:</span>
              <span className="font-bold text-purple-700">{vehicle.assignedRoute || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('Vehicles');
            }}
            className="w-full py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Manage Fleet Vehicle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
