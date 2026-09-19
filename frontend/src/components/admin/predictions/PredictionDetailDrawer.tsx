import React from 'react';
import { X, Sparkles, Trash2, CalendarCheck, MapPin } from 'lucide-react';
import type { FillForecastBin } from '../../../types/prediction';

interface PredictionDetailDrawerProps {
  bin: FillForecastBin | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const PredictionDetailDrawer: React.FC<PredictionDetailDrawerProps> = ({
  bin,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen || !bin) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Current vs Predicted Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Fill</span>
              <span className="text-2xl font-mono font-extrabold text-slate-900">{bin.currentFill}%</span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">Rate: +{bin.fillRatePerHour}% / hr</span>
            </div>

            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Predicted (24h)</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-900">{bin.predicted24h}%</span>
              <span className="text-[10px] text-emerald-700 font-bold mt-1">Confidence: {bin.confidence}%</span>
            </div>
          </div>

          {/* Horizon Breakdown Table */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-900 block mb-1">Horizon Forecast Breakdown</span>
            <div className="flex items-center justify-between text-xs font-medium border-b border-slate-200/70 pb-1.5">
              <span className="text-slate-500">6 Hours</span>
              <span className="font-mono font-bold text-slate-800">{bin.predicted6h}%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium border-b border-slate-200/70 pb-1.5">
              <span className="text-slate-500">12 Hours</span>
              <span className="font-mono font-bold text-slate-800">{bin.predicted12h}%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Predicted Overflow Time</span>
              <span className="font-mono font-bold text-red-600">{bin.predictedOverflowTime} ({bin.timeToOverflow})</span>
            </div>
          </div>

          {/* AI Prediction Rationale Explanation */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-950">AI Forecast Rationale</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Simulated
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{bin.explanation}</p>
          </div>

          {/* Telemetry Metadata */}
          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex items-center justify-between">
              <span>Zone:</span>
              <span className="font-bold text-slate-900">{bin.zone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Waste Type:</span>
              <span className="font-bold text-slate-900">{bin.wasteType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Collection:</span>
              <span className="font-mono text-slate-800">{bin.lastCollection}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Next Scheduled Collection:</span>
              <span className="font-mono text-slate-800">{bin.nextScheduledCollection}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Assigned Route:</span>
              <span className="font-bold text-emerald-800">{bin.assignedRoute || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-2">
          <button
            onClick={() => {
              onClose();
              onNavigate('/admin/planning');
            }}
            className="w-full py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Add to Collection Plan</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigate('/admin/bins');
              }}
              className="py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>View Bin</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('/admin/monitoring');
              }}
              className="py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Monitoring</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
