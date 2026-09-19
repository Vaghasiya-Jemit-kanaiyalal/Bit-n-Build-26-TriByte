import React from 'react';
import type { VehicleItem } from '../../mock/vehicleData';
import { PieChart, BarChart2, ShieldAlert } from 'lucide-react';

interface FleetAnalyticsProps {
  vehicles: VehicleItem[];
}

const FleetAnalytics: React.FC<FleetAnalyticsProps> = ({ vehicles }) => {
  // Calculate Fleet Utilization
  const total = vehicles.length || 1;
  const onRoute = vehicles.filter(v => v.status === 'On Route').length;
  const available = vehicles.filter(v => v.status === 'Available').length;
  const idle = vehicles.filter(v => v.status === 'Idle').length;
  const maintenance = vehicles.filter(v => v.status === 'Maintenance').length;
  const offline = vehicles.filter(v => v.status === 'Offline').length;

  const onRoutePct = Math.round((onRoute / total) * 100);
  const availablePct = Math.round((available / total) * 100);
  const idlePct = Math.round((idle / total) * 100);
  const maintenancePct = Math.round((maintenance / total) * 100);
  const offlinePct = Math.round((offline / total) * 100);

  // Calculate Capacity Distribution
  const below50 = vehicles.filter(v => (v.currentLoadKg / v.capacityKg) < 0.50).length;
  const range50to75 = vehicles.filter(v => {
    const ratio = v.currentLoadKg / v.capacityKg;
    return ratio >= 0.50 && ratio < 0.75;
  }).length;
  const range75to90 = vehicles.filter(v => {
    const ratio = v.currentLoadKg / v.capacityKg;
    return ratio >= 0.75 && ratio < 0.90;
  }).length;
  const above90 = vehicles.filter(v => (v.currentLoadKg / v.capacityKg) >= 0.90).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Fleet Utilization Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Fleet Utilization</h3>
              <p className="text-xs text-slate-500">Operational status breakdown across active fleet</p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            {onRoute + available} / {total} Operational
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex mb-5">
          <div style={{ width: `${onRoutePct}%` }} className="bg-[#738a62] h-full transition-all" title={`On Route: ${onRoute}`} />
          <div style={{ width: `${availablePct}%` }} className="bg-emerald-500 h-full transition-all" title={`Available: ${available}`} />
          <div style={{ width: `${idlePct}%` }} className="bg-slate-400 h-full transition-all" title={`Idle: ${idle}`} />
          <div style={{ width: `${maintenancePct}%` }} className="bg-amber-500 h-full transition-all" title={`Maintenance: ${maintenance}`} />
          <div style={{ width: `${offlinePct}%` }} className="bg-red-500 h-full transition-all" title={`Offline: ${offline}`} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#738a62]" />
              <span className="text-xs text-slate-600 font-medium">On Route</span>
            </div>
            <div className="text-base font-bold text-slate-900">{onRoute} <span className="text-xs font-normal text-slate-500">({onRoutePct}%)</span></div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-600 font-medium">Available</span>
            </div>
            <div className="text-base font-bold text-slate-900">{available} <span className="text-xs font-normal text-slate-500">({availablePct}%)</span></div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-600 font-medium">Idle</span>
            </div>
            <div className="text-base font-bold text-slate-900">{idle} <span className="text-xs font-normal text-slate-500">({idlePct}%)</span></div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-slate-600 font-medium">Maintenance</span>
            </div>
            <div className="text-base font-bold text-slate-900">{maintenance} <span className="text-xs font-normal text-slate-500">({maintenancePct}%)</span></div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-xs text-slate-600 font-medium">Offline</span>
            </div>
            <div className="text-base font-bold text-slate-900">{offline} <span className="text-xs font-normal text-slate-500">({offlinePct}%)</span></div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span className="text-xs text-slate-600 font-medium">Total Fleet</span>
            </div>
            <div className="text-base font-bold text-slate-900">{total} <span className="text-xs font-normal text-slate-500">vehicles</span></div>
          </div>
        </div>
      </div>

      {/* Fleet Load Distribution Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Fleet Load Distribution</h3>
              <p className="text-xs text-slate-500">Capacity utilization segments across collection vehicles</p>
            </div>
          </div>
          {above90 > 0 && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
              <ShieldAlert className="w-3 h-3 mr-1" />
              {above90} High Load
            </span>
          )}
        </div>

        <div className="space-y-3.5">
          {/* Below 50% */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Below 50% Capacity</span>
              <span className="font-semibold text-slate-800">{below50} vehicles</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((below50 / total) * 100)}%` }} />
            </div>
          </div>

          {/* 50-75% */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">50% – 75% Capacity</span>
              <span className="font-semibold text-slate-800">{range50to75} vehicles</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#738a62] rounded-full" style={{ width: `${Math.round((range50to75 / total) * 100)}%` }} />
            </div>
          </div>

          {/* 75-90% */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">75% – 90% Capacity</span>
              <span className="font-semibold text-slate-800">{range75to90} vehicles</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((range75to90 / total) * 100)}%` }} />
            </div>
          </div>

          {/* Above 90% */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium flex items-center">
                <span>Above 90% Capacity (Near Limit)</span>
              </span>
              <span className="font-bold text-red-600">{above90} vehicles</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.round((above90 / total) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetAnalytics;
