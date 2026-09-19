import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import type { SmartBin } from '../../../types/bin';

interface PrioritizeCollectionModalProps {
  bin: SmartBin | null;
  onClose: () => void;
  onConfirm: (bin: SmartBin) => void;
}

export const PrioritizeCollectionModal: React.FC<PrioritizeCollectionModalProps> = ({
  bin,
  onClose,
  onConfirm,
}) => {
  if (!bin) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-950 m-0">
                Prioritize {bin.id}?
              </h3>
              <p className="text-xs text-amber-800 font-medium m-0">
                Elevate dispatch priority for AI route optimization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-700 hover:bg-amber-100 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Location:</span>
              <strong className="text-slate-900">{bin.address}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Current Fill Level:</span>
              <strong className="text-red-600 font-mono font-extrabold">{bin.currentFillPercent}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Predicted Overflow:</span>
              <strong className="text-slate-900 font-mono font-bold">{bin.prediction.overflowTimeText}</strong>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 leading-relaxed font-medium">
            <strong>Suggested Action:</strong> Add this bin to the high-priority dispatch queue and trigger AI route recalculation for the next available collection truck.
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer border-none flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Prioritize Collection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
