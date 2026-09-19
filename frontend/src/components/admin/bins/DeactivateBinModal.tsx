import React from 'react';
import { Power, X, AlertOctagon } from 'lucide-react';
import type { SmartBin } from '../../../types/bin';

interface DeactivateBinModalProps {
  bin: SmartBin | null;
  onClose: () => void;
  onConfirm: (bin: SmartBin) => void;
}

export const DeactivateBinModal: React.FC<DeactivateBinModalProps> = ({
  bin,
  onClose,
  onConfirm,
}) => {
  if (!bin) return null;

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-red-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-red-950 m-0">
                Deactivate {bin.id}?
              </h3>
              <p className="text-xs text-red-800 font-medium m-0">
                Confirm bin deactivation from active fleet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-red-700 hover:bg-red-100 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 font-medium leading-relaxed m-0">
            Are you sure you want to deactivate <strong className="text-slate-900 font-mono">{bin.id}</strong> ({bin.address})?
          </p>

          <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-red-900 leading-relaxed font-medium">
            This bin will no longer participate in active collection monitoring, fill telemetry tracking, or AI route optimization cycles until re-activated.
          </div>

          {/* ACTIONS */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(bin)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer border-none flex items-center gap-1.5"
            >
              <Power className="w-4 h-4" />
              <span>Deactivate Bin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
