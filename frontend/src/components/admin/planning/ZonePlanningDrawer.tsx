import React from 'react';
import { X, MapPin, Truck, UserCheck, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import type { ZoneDemand } from '../../../types/planning';

interface ZonePlanningDrawerProps {
  zone: ZoneDemand | null;
  onClose: () => void;
  onPrioritizeZone: (zoneName: string) => void;
  onAddToPlan: (zoneName: string) => void;
  onNavigate: (tab: string) => void;
}

export const ZonePlanningDrawer: React.FC<ZonePlanningDrawerProps> = ({
  zone,
  onClose,
  onPrioritizeZone,
  onAddToPlan,
  onNavigate,
}) => {
  if (!zone) return null;

  const name = zone.zoneName || zone.zone || 'Zone';
  const binsCount = zone.totalBins || zone.binsCount || 0;
  const pBins = zone.priorityBins ?? zone.priorityBinsCount ?? 0;
  const cFill = zone.currentFillPct ?? zone.currentFill ?? 0;
  const pFill = zone.predictedFillPct ?? zone.predictedFill ?? 0;
  const assignedV = zone.assignedVehicles ?? zone.assignedVehiclesCount ?? 0;
  const availD = zone.availableDrivers ?? zone.availableDriversCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold tracking-tight text-white">{name} Zone</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Zone Operational Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                zone.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                zone.status === 'HIGH DEMAND' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                zone.status === 'WATCH' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {zone.status}
              </span>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
            
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Total Bins</span>
                <span className="text-xl font-bold font-mono text-slate-900">{binsCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Priority Bins</span>
                <span className="text-xl font-bold font-mono text-emerald-700">{pBins}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Current Fill</span>
                <span className="text-xl font-bold font-mono text-slate-900">{cFill}%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-500 block">Predicted Fill</span>
                <span className="text-xl font-bold font-mono text-emerald-700">{pFill}%</span>
              </div>
            </div>

            {/* Waste & Capacity Requirements */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Demand & Capacity Requirements</h4>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Expected Waste Output:</span>
                <span className="font-bold font-mono text-slate-900">{zone.expectedWasteTons} tons</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Required Fleet Capacity:</span>
                <span className="font-bold font-mono text-emerald-800">{zone.requiredCapacityTons} tons</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Recommended Window:</span>
                <span className="font-semibold text-slate-800">{zone.recommendedWindow}</span>
              </div>
            </div>

            {/* Breakdown & Critical/Warning */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bin Health Status</h4>
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Critical Bins (≥85%)</span>
                </div>
                <span className="font-bold font-mono text-red-600">{zone.criticalBins}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Warning Bins (70-84%)</span>
                </div>
                <span className="font-bold font-mono text-amber-600">{zone.warningBins}</span>
              </div>
            </div>

            {/* Fleet & Resource Allocation */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Zone Resources</h4>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Assigned Vehicles</span>
                </div>
                <span className="font-semibold text-slate-800">{assignedV} vehicles</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Available Drivers</span>
                </div>
                <span className="font-semibold text-slate-800">{availD} drivers</span>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Recommended Action</h5>
              <p className="text-xs text-amber-800">{zone.recommendedAction}</p>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onPrioritizeZone(name)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition"
              >
                Prioritize Zone
              </button>
              <button
                onClick={() => onAddToPlan(name)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition"
              >
                Add Zone to Plan
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <button
                onClick={() => onNavigate('Bins')}
                className="flex items-center text-slate-600 hover:text-emerald-700 font-medium"
              >
                <span>View Bins</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
              <button
                onClick={() => onNavigate('Monitoring')}
                className="flex items-center text-slate-600 hover:text-emerald-700 font-medium"
              >
                <span>View Monitoring</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
