import { Truck, AlertTriangle, Fuel, Wrench, ArrowUpRight } from 'lucide-react';
import type { DriverVehicle } from '../../types/driver';

interface DriverVehicleCardProps {
  vehicle: DriverVehicle;
  onNavigateToVehicle: () => void;
  onReportVehicleIssue: () => void;
}

export const DriverVehicleCard: React.FC<DriverVehicleCardProps> = ({
  vehicle,
  onNavigateToVehicle,
  onReportVehicleIssue,
}) => {
  const {
    code,
    type,
    registration,
    capacityTons,
    currentLoadTons,
    utilizationPct,
    fuelType,
    nextServiceKm,
  } = vehicle;

  const isWarning = utilizationPct >= 80 && utilizationPct < 90;
  const isCritical = utilizationPct >= 90;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">My Vehicle</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {registration}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {code} &bull; {type}
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            On Route
          </span>
        </div>

        {/* Load Utilization Meter */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
            <span>Payload Utilization</span>
            <span className="font-mono text-slate-900">
              {currentLoadTons} t / {capacityTons} t ({utilizationPct}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical
                  ? 'bg-red-600'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-700'
              }`}
              style={{ width: `${Math.min(100, utilizationPct)}%` }}
            />
          </div>

          {/* Warnings */}
          {isCritical ? (
            <div className="flex items-center gap-2 text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Vehicle capacity is near full ({currentLoadTons} t / {capacityTons} t). Prepare for depot unload.</span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-2 text-xs text-amber-800 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Vehicle capacity is approaching the operational threshold ({utilizationPct}%).</span>
            </div>
          ) : null}
        </div>

        {/* Technical specs */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Fuel className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fuel / Energy</span>
              <span className="font-bold text-slate-900">{fuelType}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Wrench className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Next Service</span>
              <span className="font-bold text-slate-900 font-mono">In {nextServiceKm} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={onNavigateToVehicle}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 transition-all"
        >
          <span>View Vehicle</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReportVehicleIssue}
          className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs cursor-pointer border border-red-200 transition-all flex items-center gap-1"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </button>
      </div>
    </div>
  );
};

export default DriverVehicleCard;
