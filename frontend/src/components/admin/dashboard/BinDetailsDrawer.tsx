import React, { useEffect } from 'react';
import { X, Trash2, CalendarCheck, Battery, Wifi } from 'lucide-react';
import type { DashboardMapBinMarker } from '../../../types/dashboard';

interface BinDetailsDrawerProps {
  bin: DashboardMapBinMarker | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const BinDetailsDrawer: React.FC<BinDetailsDrawerProps> = ({
  bin,
  isOpen,
  onClose,
  onNavigateTab,
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

  if (!isOpen || !bin) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-extrabold text-xs">
              {bin.binCode.substring(4)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{bin.binCode}</span>
              <span className="text-xs text-slate-500 font-medium">{bin.location}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer border-none bg-transparent"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Fill Level</span>
              <span className="text-3xl font-mono font-extrabold text-red-600">{bin.fillLevel}%</span>
            </div>
            <span
              className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-md ${
                bin.status === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {bin.status}
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Zone:</span>
              <span className="font-bold text-slate-900">{bin.zone} Zone</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Waste Type:</span>
              <span className="font-bold text-slate-900">{bin.wasteType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Predicted Overflow ETA:</span>
              <span className="font-bold text-red-600">{bin.timeToOverflow}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Sensor Signal:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                98% Excellent
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Battery Level:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                84%
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-2">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('Planning');
            }}
            className="w-full py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Add to Collection Plan</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateTab('Bin Management');
            }}
            className="w-full py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>View All Bins</span>
          </button>
        </div>
      </div>
    </div>
  );
};
