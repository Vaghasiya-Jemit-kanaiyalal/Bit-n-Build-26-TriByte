import React, { useEffect } from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import type { BinStop } from '../../mock/routeData';

interface BinDetailModalProps {
  bin: BinStop | null;
  isOpen: boolean;
  onClose: () => void;
  routeName?: string;
}

export const BinDetailModal: React.FC<BinDetailModalProps> = ({
  bin,
  isOpen,
  onClose,
  routeName = 'RT-024',
}) => {
  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bin) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col text-xs text-slate-700 animate-in zoom-in-95 duration-200 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Trash2 className="w-4 h-4 text-[#064e3b]" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 m-0">
              Bin Telemetry &bull; {bin.binId}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 border-none bg-transparent cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 overflow-y-auto">
          <div className="flex items-center justify-between p-3.5 bg-red-50/80 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-red-900 block">{bin.location}</span>
                <span className="text-[10px] text-red-700 font-mono">
                  Predicted Overflow in {bin.predictedOverflow}
                </span>
              </div>
            </div>
            <span className="text-lg font-extrabold font-mono text-red-600">{bin.fillLevel}%</span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Zone</span>
              <span className="font-bold text-slate-900">{bin.zone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Capacity</span>
              <span className="font-bold font-mono text-slate-900">{bin.capacityLiters} L</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Waste Type</span>
              <span className="font-bold text-slate-900">{bin.wasteType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Priority Level</span>
              <span className="font-extrabold text-red-600">{bin.priority}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Collection Status</span>
              <span className="font-bold text-slate-900">{bin.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Assigned Route</span>
              <span className="font-bold text-[#064e3b] font-mono">{routeName}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#064e3b] text-white hover:bg-[#047857] font-bold rounded-xl cursor-pointer border-none text-xs transition-colors shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
