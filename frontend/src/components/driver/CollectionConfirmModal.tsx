import React, { useState } from 'react';
import { PackageCheck, X, Scale } from 'lucide-react';
import type { DriverRouteStop } from '../../types/driver';

interface CollectionConfirmModalProps {
  isOpen: boolean;
  stop: DriverRouteStop | null;
  onClose: () => void;
  onConfirm: (stopId: string, customWeightKg?: number) => void;
}

export const CollectionConfirmModal: React.FC<CollectionConfirmModalProps> = ({
  isOpen,
  stop,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !stop) return null;

  const [weightKg, setWeightKg] = useState<number>(stop.estimatedWasteKg || 120);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(stop.id, weightKg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Complete Collection?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="mt-4 flex flex-col gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Bin Identifier:</span>
              <span className="font-bold text-slate-900 font-mono">{stop.binId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Location:</span>
              <span className="font-bold text-slate-900 truncate max-w-[180px]">{stop.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Waste Category:</span>
              <span className="font-bold text-slate-900">{stop.wasteType}</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Logged Collection Tonnage (kg)
            </label>
            <div className="relative flex items-center">
              <Scale className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="10"
                max="2000"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border border-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer border-none shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Confirm Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionConfirmModal;
