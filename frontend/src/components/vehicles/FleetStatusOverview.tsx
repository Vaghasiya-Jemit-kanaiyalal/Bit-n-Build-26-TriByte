import React from 'react';
import type { VehicleItem } from '../../mock/vehicleData';

interface FleetStatusOverviewProps {
  vehicles?: VehicleItem[];
  operational?: number;
  onRoute?: number;
  available?: number;
  idle?: number;
  maintenance?: number;
  offline?: number;
}

export const FleetStatusOverview: React.FC<FleetStatusOverviewProps> = ({
  vehicles,
  operational: propOperational,
  onRoute: propOnRoute,
  available: propAvailable,
  idle: propIdle,
  maintenance: propMaintenance,
  offline: propOffline,
}) => {
  const onRoute = vehicles ? vehicles.filter(v => v.status === 'On Route').length : (propOnRoute ?? 11);
  const available = vehicles ? vehicles.filter(v => v.status === 'Available').length : (propAvailable ?? 5);
  const idle = vehicles ? vehicles.filter(v => v.status === 'Idle').length : (propIdle ?? 3);
  const maintenance = vehicles ? vehicles.filter(v => v.status === 'Maintenance').length : (propMaintenance ?? 3);
  const offline = vehicles ? vehicles.filter(v => v.status === 'Offline').length : (propOffline ?? 1);
  const operational = vehicles
    ? vehicles.filter(v => v.status === 'On Route' || v.status === 'Available' || v.status === 'Active').length
    : (propOperational ?? (onRoute + available));

  const total = Math.max(1, vehicles ? vehicles.length : (operational + maintenance + offline));
  const onRoutePct = Math.round((onRoute / total) * 100);
  const availablePct = Math.round((available / total) * 100);
  const idlePct = Math.round((idle / total) * 100);
  const maintPct = Math.round((maintenance / total) * 100);
  const offlinePct = Math.round((offline / total) * 100);

  return (
    <div className="bg-white rounded-md p-4 border border-[#e5e7eb] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider m-0">
          Fleet Status Distribution
        </h3>
        <span className="text-[11px] text-[#6b7280]">
          Total Registered Fleet: <strong>{total} Vehicles</strong>
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="w-full h-3 bg-[#f3f4f6] rounded-full overflow-hidden flex">
        <div
          className="bg-[#738a62] h-full transition-all duration-300"
          style={{ width: `${onRoutePct}%` }}
          title={`On Route: ${onRoute}`}
        />
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${availablePct}%` }}
          title={`Available: ${available}`}
        />
        <div
          className="bg-blue-400 h-full transition-all duration-300"
          style={{ width: `${idlePct}%` }}
          title={`Idle: ${idle}`}
        />
        <div
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${maintPct}%` }}
          title={`Maintenance: ${maintenance}`}
        />
        <div
          className="bg-red-500 h-full transition-all duration-300"
          style={{ width: `${offlinePct}%` }}
          title={`Offline: ${offline}`}
        />
      </div>

      {/* Segment Legends */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-[#738a62]" />
            <span>On Route</span>
          </div>
          <span className="font-bold text-[#111827] text-sm ml-3.5">{onRoute}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <span className="font-bold text-[#111827] text-sm ml-3.5">{available}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Idle</span>
          </div>
          <span className="font-bold text-[#111827] text-sm ml-3.5">{idle}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
            <span>Operational</span>
          </div>
          <span className="font-bold text-[#111827] text-sm ml-3.5">{operational}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Maintenance</span>
          </div>
          <span className="font-bold text-[#111827] text-sm ml-3.5">{maintenance}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Offline</span>
          </div>
          <span className="font-bold text-[#111827] text-sm ml-3.5">{offline}</span>
        </div>
      </div>
    </div>
  );
};

export default FleetStatusOverview;
