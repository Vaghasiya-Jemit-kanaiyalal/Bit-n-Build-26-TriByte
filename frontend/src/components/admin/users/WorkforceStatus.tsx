import React from 'react';
import type { PlatformUser } from '../../../types/user';
import { UserAvatar } from './UserAvatar';
import { Truck, Activity, ShieldCheck } from 'lucide-react';

interface WorkforceStatusProps {
  users: PlatformUser[];
  onSelectUser: (user: PlatformUser) => void;
}

export const WorkforceStatus: React.FC<WorkforceStatusProps> = ({ users, onSelectUser }) => {
  // Compute recent active users
  const recentUsers = users
    .filter((u) => u.lastActiveAt && u.lastActiveAt !== 'Never')
    .slice(0, 5);

  // Operational metrics
  const activeDrivers = users.filter((u) => u.role === 'DRIVER' && u.status === 'ACTIVE');
  const activeAnalysts = users.filter((u) => u.role === 'ANALYST' && u.status === 'ACTIVE');
  const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.status === 'ACTIVE');

  const driversOnRoute = activeDrivers.filter(
    (u) => u.driverStats?.currentDutyStatus === 'On Route'
  ).length;
  const driversIdle = activeDrivers.filter(
    (u) => u.driverStats?.currentDutyStatus === 'Idle'
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Workforce Deployment Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-500" /> Driver Duty Breakdown
          </h3>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
            {activeDrivers.length} Active Drivers
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase">On Route</p>
            <p className="text-sm font-bold font-mono text-emerald-700">{driversOnRoute}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase">Idle / Ready</p>
            <p className="text-sm font-bold font-mono text-blue-700">{driversIdle}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase">Off Duty</p>
            <p className="text-sm font-bold font-mono text-slate-700">8</p>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase">Unassigned</p>
            <p className="text-sm font-bold font-mono text-amber-700">4</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
          <span>Vehicle Fleet Match Rate: <strong className="text-slate-800 font-mono">92.3%</strong></span>
          <span>Route Coverage: <strong className="text-slate-800 font-mono">100%</strong></span>
        </div>
      </div>

      {/* Recently Active Operators */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
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

      {/* Access & Security Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Access & Security Context
          </h3>
          <span className="text-xs text-slate-500 font-mono">Platform Health</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">Active Analysts</span>
            <span className="text-sm font-bold font-mono text-slate-900">{activeAnalysts.length} Users</span>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">Active Managers</span>
            <span className="text-sm font-bold font-mono text-slate-900">{activeAdmins.length} Users</span>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">Pending Invites</span>
            <span className="text-sm font-bold font-mono text-amber-700">2 Accounts</span>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase">Security Policy</span>
            <span className="text-xs font-bold text-emerald-700">MFA Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
