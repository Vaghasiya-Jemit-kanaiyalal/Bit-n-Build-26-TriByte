import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import type { PriorityCollectionItem, DashboardVehicleItem } from '../../../types/dashboard';

interface AssignVehicleModalProps {
  item: PriorityCollectionItem | null;
  vehicles: DashboardVehicleItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (binId: string, vehicleCode: string) => void;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  item,
  vehicles,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedVehicleCode, setSelectedVehicleCode] = useState<string>(vehicles[0]?.vehicleCode || 'VH-014');

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[1000000] overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Assign Fleet Vehicle</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs font-medium">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Bin: {item.binCode}</span>
              <span className="text-red-600 font-mono">{item.fillLevel}% Fill</span>
            </div>
            <p className="text-[11px] text-slate-500">{item.location} ({item.zone} Zone)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Select Collection Vehicle:</label>
            <select
              value={selectedVehicleCode}
              onChange={(e) => setSelectedVehicleCode(e.target.value)}
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.vehicleCode}>
                  {v.vehicleCode} &bull; {v.driverName} ({v.type} - {v.utilizationPercentage}% loaded)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(item.id, selectedVehicleCode);
              onClose();
            }}
            className="px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-bold cursor-pointer border-none shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
