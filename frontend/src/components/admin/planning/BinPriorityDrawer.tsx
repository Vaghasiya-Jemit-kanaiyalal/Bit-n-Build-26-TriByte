import React from 'react';
import { X, Trash2, ShieldAlert, MapPin, CheckCircle2 } from 'lucide-react';
import type { PriorityBin } from '../../../types/planning';

interface BinPriorityDrawerProps {
  bin: PriorityBin | null;
  onClose: () => void;
  onTogglePlanBin: (binId: string) => void;
  onNavigate: (tab: string) => void;
}

export const BinPriorityDrawer: React.FC<BinPriorityDrawerProps> = ({
  bin,
  onClose,
  onTogglePlanBin,
  onNavigate,
}) => {
  if (!bin) return null;

  const fill = bin.fillLevelPct ?? bin.fillLevel ?? 0;
  const predFill = bin.predictedFillPct ?? bin.predictedFill ?? 0;
  const wasteKg = bin.estimatedWasteKg ?? ((bin.estimatedWasteTons ?? 0) * 1000);
  const category = bin.priorityCategory || 'Medium';
  const reason = bin.priorityReason || bin.reason || 'High urgency';
  const isSelected = bin.isSelectedForPlan ?? bin.isSelected;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-mono text-emerald-400">{bin.binId}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {bin.zone} Zone
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">AI Priority Score</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">{bin.priorityScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Simulated AI Priority</span>
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  category === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  category === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
            
            {/* Status & Location */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Location</span>
                  <span className="text-sm font-medium text-slate-900">{bin.location}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">Waste Type:</span>
                <span className="font-semibold text-slate-800 uppercase font-mono">{bin.wasteType}</span>
              </div>
            </div>

            {/* Fill & Overflow telemetry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Current Fill</span>
                <span className="text-xl font-bold font-mono text-slate-900">{fill}%</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Predicted Fill</span>
                <span className="text-xl font-bold font-mono text-emerald-700">{predFill}%</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Estimated Waste</span>
                <span className="text-xl font-bold font-mono text-slate-900">{wasteKg} kg</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Time to Overflow</span>
                <span className="text-xl font-bold font-mono text-red-600">{bin.timeToOverflowHours}h</span>
              </div>
            </div>

            {/* AI Priority Reason */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1 text-amber-600" />
                Priority Reason
              </h5>
              <p className="text-xs text-amber-800">{reason}</p>
            </div>

            {/* Timestamps & Route */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Metadata</h5>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Last Collection:</span>
                <span className="font-mono text-slate-700">{bin.lastCollection}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Next Scheduled:</span>
                <span className="font-mono text-slate-700">{bin.nextCollection}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Assigned Route:</span>
                <span className="font-mono font-semibold text-emerald-700">{bin.assignedRoute || 'Unassigned'}</span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            <button
              onClick={() => onTogglePlanBin(bin.binId)}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-2 ${
                isSelected
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              {isSelected ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove from Collection Plan</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Add to Collection Plan</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('Bins')}
                className="w-full py-2 px-3 text-center border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                View Bin Details
              </button>
              <button
                onClick={() => onNavigate('Monitoring')}
                className="w-full py-2 px-3 text-center border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                View Monitoring
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
