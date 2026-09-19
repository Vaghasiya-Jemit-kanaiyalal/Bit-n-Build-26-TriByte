import { X, Battery, Activity, PackageCheck, Play, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { DriverRouteStop } from '../../types/driver';

interface BinDetailsDrawerProps {
  isOpen: boolean;
  stop: DriverRouteStop | null;
  onClose: () => void;
  onStartCollection: (stop: DriverRouteStop) => void;
  onMarkCollected: (stop: DriverRouteStop) => void;
  onReportIssue: (stop: DriverRouteStop) => void;
}

export const BinDetailsDrawer: React.FC<BinDetailsDrawerProps> = ({
  isOpen,
  stop,
  onClose,
  onStartCollection,
  onMarkCollected,
  onReportIssue,
}) => {
  if (!isOpen || !stop) return null;

  const isCritical = stop.priority === 'CRITICAL' || stop.fillLevel >= 90;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs">
                #{stop.sequence}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 block">{stop.binId}</span>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{stop.location}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 border-none bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 flex flex-col gap-4 text-xs">
            {/* Priority & Status Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Collection Priority</span>
                <span className={`font-extrabold ${isCritical ? 'text-red-700' : 'text-emerald-800'}`}>
                  {stop.priority} PRIORITY ({stop.fillLevel}% Full)
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                stop.status === 'COMPLETED'
                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {stop.collectionStatus || stop.status}
              </span>
            </div>

            {/* Field Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Zone Location</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{stop.zone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Waste Category</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{stop.wasteType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Bin Capacity</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{stop.capacityKg} kg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Estimated Waste</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{stop.estimatedWasteKg} kg</span>
              </div>
            </div>

            {/* Sensor & Telemetry */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-900 text-xs mb-2.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>IoT Sensor Telemetry</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500">Sensor Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {stop.sensorStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-500">Battery Level:</span>
                  <span className="font-bold text-slate-800 font-mono flex items-center gap-1">
                    <Battery className="w-3 h-3 text-emerald-600" /> {stop.batteryLevel}%
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 text-right">
                Last recorded collection: <span className="font-medium text-slate-600">{stop.lastCollection}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Action Footer - Field Operations Only */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
          {stop.status !== 'COMPLETED' && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onStartCollection(stop);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>Start Collection</span>
              </button>

              <button
                onClick={() => {
                  onMarkCollected(stop);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none transition-all shadow-xs"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mark Collected</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onReportIssue(stop);
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-red-200 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Collection Issue</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BinDetailsDrawer;
