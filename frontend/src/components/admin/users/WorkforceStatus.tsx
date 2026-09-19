import React from 'react';
import type { PlatformUser } from '../../../types/user';
import { UserAvatar } from './UserAvatar';
import { Truck, Activity, Radio } from 'lucide-react';

interface WorkforceStatusProps {
  users: PlatformUser[];
  onSelectUser: (user: PlatformUser) => void;
}

export const WorkforceStatus: React.FC<WorkforceStatusProps> = ({ users, onSelectUser }) => {
  // Compute recent active users
  const recentUsers = users
    .filter((u) => u.lastActiveAt && u.lastActiveAt !== 'Never')
    .slice(0, 5);

  // Dynamic Driver Duty Calculations
  const allDrivers = users.filter((u) => u.role === 'DRIVER');
  const activeDrivers = allDrivers.filter((u) => u.status === 'ACTIVE');

  const driversOnRoute = activeDrivers.filter(
    (u) => u.driverStats?.currentDutyStatus === 'On Route'
  ).length;
  const driversIdle = activeDrivers.filter(
    (u) => u.driverStats?.currentDutyStatus === 'Idle'
  ).length;
  const driversOffDuty = allDrivers.filter(
    (u) => u.status !== 'ACTIVE' || u.driverStats?.currentDutyStatus === 'Off Duty'
  ).length;
  const driversUnassigned = activeDrivers.filter((u) => !u.assignedVehicleId).length;

  const totalDrivers = allDrivers.length || 1;
  const pctOnRoute = Math.round((driversOnRoute / totalDrivers) * 100);
  const pctIdle = Math.round((driversIdle / totalDrivers) * 100);
  const pctOffDuty = Math.round((driversOffDuty / totalDrivers) * 100);
  const pctUnassigned = Math.max(0, 100 - pctOnRoute - pctIdle - pctOffDuty);

  const vehicleMatchRate = Math.min(
    100,
    Math.round(((activeDrivers.length - driversUnassigned) / (activeDrivers.length || 1)) * 100)
  );
  const activeDeploymentRate = Math.min(
    100,
    Math.round(((driversOnRoute + driversIdle) / totalDrivers) * 100)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Upgraded Driver Duty Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-md">
              <Truck className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                Driver Duty Breakdown
              </h3>
              <p className="text-[10px] text-slate-500 m-0">Real-time driver roster telemetry</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
            {activeDrivers.length} Active Drivers
          </span>
        </div>

        {/* Visual Segmented Duty Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span>Roster Deployment Mix</span>
            <span className="font-mono text-slate-800 font-semibold">{totalDrivers} Total Staff</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200/60">
            <div
              style={{ width: `${pctOnRoute}%` }}
              className="bg-emerald-500 rounded-l-full transition-all duration-300"
              title={`On Route: ${driversOnRoute} (${pctOnRoute}%)`}
            />
            <div
              style={{ width: `${pctIdle}%` }}
              className="bg-blue-500 transition-all duration-300"
              title={`Idle/Ready: ${driversIdle} (${pctIdle}%)`}
            />
            <div
              style={{ width: `${pctOffDuty}%` }}
              className="bg-slate-400 transition-all duration-300"
              title={`Off Duty: ${driversOffDuty} (${pctOffDuty}%)`}
            />
            <div
              style={{ width: `${pctUnassigned}%` }}
              className="bg-amber-400 rounded-r-full transition-all duration-300"
              title={`Unassigned: ${driversUnassigned} (${pctUnassigned}%)`}
            />
          </div>
        </div>

        {/* 4 Status Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">On Route</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-lg font-bold font-mono text-emerald-800 m-0">{driversOnRoute}</p>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">{pctOnRoute}% of roster</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 p-2.5 rounded-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">Idle / Ready</span>
              <Radio className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <p className="text-lg font-bold font-mono text-blue-800 m-0">{driversIdle}</p>
            <span className="text-[10px] font-mono text-blue-600 font-semibold">{pctIdle}% standby</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Off Duty</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            </div>
            <p className="text-lg font-bold font-mono text-slate-700 m-0">{driversOffDuty}</p>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">{pctOffDuty}% shift off</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-md flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Unassigned</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-lg font-bold font-mono text-amber-800 m-0">{driversUnassigned}</p>
            <span className="text-[10px] font-mono text-amber-600 font-semibold">Needs Vehicle</span>
          </div>
        </div>

        {/* Operational Telemetry Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Vehicle Match Rate: <strong className="text-slate-900 font-mono">{vehicleMatchRate}%</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Active Shift Deployment: <strong className="text-slate-900 font-mono">{activeDeploymentRate}%</strong>
          </span>
        </div>
      </div>

      {/* Recently Active Operators Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" /> Recently Active Operators
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Live Feeds</span>
        </div>

        <div className="space-y-2">
          {recentUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelectUser(u)}
              className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar
                  initials={u.avatarInitials}
                  bgColor={u.avatarBgColor}
                  role={u.role}
                  size="sm"
                />
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {u.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">{u.role.toLowerCase()}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                {u.lastActiveAt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
