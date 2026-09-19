import React from 'react';
import type { DriverStatus, RouteStatus } from '../../types/driver';
import { Truck, Route as RouteIcon, Clock, Radio } from 'lucide-react';

interface DriverStatusStripProps {
  status: DriverStatus;
  vehicleCode: string;
  routeId: string;
  routeStatus: RouteStatus;
  lastSync: string;
}

export const DriverStatusStrip: React.FC<DriverStatusStripProps> = ({
  status,
  vehicleCode,
  routeId,
  routeStatus,
  lastSync,
}) => {
  const getStatusBadge = (st: DriverStatus) => {
    switch (st) {
      case 'ON_ROUTE':
        return {
          label: 'On Route',
          bg: 'bg-emerald-500',
          text: 'text-emerald-900 bg-emerald-100 border-emerald-300',
        };
      case 'ON_DUTY':
        return {
          label: 'On Duty',
          bg: 'bg-blue-500',
          text: 'text-blue-900 bg-blue-100 border-blue-300',
        };
      case 'BREAK':
        return {
          label: 'On Break',
          bg: 'bg-amber-500',
          text: 'text-amber-900 bg-amber-100 border-amber-300',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          bg: 'bg-purple-500',
          text: 'text-purple-900 bg-purple-100 border-purple-300',
        };
      case 'OFF_DUTY':
      default:
        return {
          label: 'Off Duty',
          bg: 'bg-slate-400',
          text: 'text-slate-800 bg-slate-100 border-slate-300',
        };
    }
  };

  const statusInfo = getStatusBadge(status);

  const getRouteStatusLabel = (rst: RouteStatus) => {
    switch (rst) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'PLANNED':
        return 'Ready to Start';
      case 'PAUSED':
        return 'Paused';
      case 'COMPLETED':
        return 'Completed';
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
      {/* Driver Operational Status */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
          DRIVER STATUS:
        </span>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.text}`}>
          <span className={`w-2 h-2 rounded-full ${statusInfo.bg} animate-pulse`} />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Grid of Key Operating Metrics */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold">
        {/* Vehicle */}
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Vehicle:</span>
          <span className="font-mono font-bold text-white">{vehicleCode}</span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2">
          <RouteIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Route:</span>
          <span className="font-mono font-bold text-white">{routeId}</span>
        </div>

        {/* Route Status */}
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Route Status:</span>
          <span className="font-bold text-emerald-400">{getRouteStatusLabel(routeStatus)}</span>
        </div>

        {/* Last Sync */}
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last Sync:</span>
          <span className="font-mono text-slate-300">{lastSync}</span>
        </div>
      </div>
    </div>
  );
};

export default DriverStatusStrip;
