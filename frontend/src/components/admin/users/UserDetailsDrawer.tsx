import React from 'react';
import type { PlatformUser } from '../../../types/user';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import {
  X,
  Building,
  Truck,
  Clock,
  Laptop,
  Edit,
  ShieldAlert,
  RotateCcw,
  UserX,
  UserCheck,
  Activity,
} from 'lucide-react';

interface UserDetailsDrawerProps {
  user: PlatformUser | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: PlatformUser) => void;
  onChangeRole: (user: PlatformUser) => void;
  onAssignDriver: (user: PlatformUser) => void;
  onResetAccess: (user: PlatformUser) => void;
  onDeactivate: (user: PlatformUser) => void;
  onReactivate: (user: PlatformUser) => void;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onChangeRole,
  onAssignDriver,
  onResetAccess,
  onDeactivate,
  onReactivate,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
              {user.userCode}
            </span>
            <h2 className="text-sm font-bold text-slate-900">User Details & Workforce Telemetry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* User Hero Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <UserAvatar
                initials={user.avatarInitials}
                bgColor={user.avatarBgColor}
                role={user.role}
                size="lg"
              />
              <div>
                <h3 className="text-base font-bold text-white leading-tight">{user.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge role={user.role} />
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 w-full sm:w-auto">
              <p className="text-[11px] text-slate-400 font-mono">User ID: {user.userCode}</p>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
              <p className="text-xs text-slate-400 font-mono">{user.phone || 'No phone registered'}</p>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building className="w-3.5 h-3.5 text-slate-500" /> Account Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Organization / Dept:</span>
                <span className="font-medium text-slate-800">{user.organization}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <span className="font-medium text-slate-800">{user.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date Joined:</span>
                <span className="font-mono text-slate-700">{user.joinedAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Active:</span>
                <span className="font-mono text-slate-700">{user.lastActiveAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Last Login Time:</span>
                <span className="font-mono text-slate-700">{user.loginSession?.lastLoginAt || user.lastActiveAt}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Operational Zone:</span>
                <span className="font-medium text-slate-800">{user.zone}</span>
              </div>
            </div>
          </div>

          {/* Operational Assignment Section */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" /> Operational Assignment & Scope
              </h4>
              {user.role === 'DRIVER' && (
                <button
                  onClick={() => onAssignDriver(user)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline flex items-center gap-1"
                >
                  Change Assignment
                </button>
              )}
            </div>

            {user.role === 'DRIVER' ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Assigned Vehicle</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                    {user.assignedVehicleId || 'Unassigned'}
                  </span>
                </div>
                <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 block mb-0.5">Assigned Route</span>
                  <span className="font-mono font-bold text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block">
                    {user.assignedRouteId || 'Unassigned'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Current Field Status:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {user.driverStats?.currentDutyStatus || 'Idle'}
                  </span>
                </div>
              </div>
            ) : user.role === 'ANALYST' ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded border border-blue-200">
                  <span className="text-blue-900 font-medium">Analytics Scope</span>
                  <span className="font-bold text-blue-950 font-mono">
                    {user.analyticsScope || 'All Zones'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Accessible Modules:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Analytics', 'Waste Analytics', 'Collection Analytics', 'Prediction Analytics', 'Reports'].map((m) => (
                      <span key={m} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded border border-slate-200">
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded border border-purple-200">
                  <span className="text-purple-900 font-medium">Platform Access Scope</span>
                  <span className="font-bold text-purple-950 font-mono">Full Platform Access (12 Modules)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Full administrative permissions over Bins, Vehicles, Routes, Alerts, Analytics, Users, and Settings.
                </p>
              </div>
            )}
          </div>

          {/* Performance & Activity Metrics Section */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Activity className="w-3.5 h-3.5 text-slate-500" /> Operational Metrics & Performance
            </h4>

            {user.role === 'DRIVER' && user.driverStats && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase">Stops Done</p>
                    <p className="text-sm font-bold font-mono text-slate-900">{user.driverStats.stopsCompleted}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase">Routes Done</p>
                    <p className="text-sm font-bold font-mono text-slate-900">{user.driverStats.routesCompleted}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase">Tonnage</p>
                    <p className="text-sm font-bold font-mono text-emerald-700">{user.driverStats.collectionVolumeTons}t</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase">On-Time</p>
                    <p className="text-sm font-bold font-mono text-blue-700">{user.driverStats.onTimeRate}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                    <span>Route Completion Progress</span>
                    <span className="font-bold">{user.driverStats.avgCompletionPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${user.driverStats.avgCompletionPercent}%` }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {user.role === 'ANALYST' && user.analystStats && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase">Reports Generated</p>
                  <p className="text-sm font-bold font-mono text-slate-900">{user.analystStats.reportsGenerated}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase">Analytics Views</p>
                  <p className="text-sm font-bold font-mono text-slate-900">{user.analystStats.analyticsViews}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase">Prediction Runs</p>
                  <p className="text-sm font-bold font-mono text-blue-700">{user.analystStats.predictionReports}</p>
                </div>
              </div>
            )}

            {user.role === 'ADMIN' && user.adminStats && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase">Users Managed</p>
                  <p className="text-sm font-bold font-mono text-slate-900">{user.adminStats.usersManaged}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase">Routes Created</p>
                  <p className="text-sm font-bold font-mono text-slate-900">{user.adminStats.routesCreated}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase">Alerts Resolved</p>
                  <p className="text-sm font-bold font-mono text-emerald-700">{user.adminStats.alertsResolved}</p>
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          {user.activityHistory && user.activityHistory.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Recent User Activity History
              </h4>
              <div className="space-y-2.5">
                {user.activityHistory.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className="font-mono text-[11px] text-slate-400 w-16 shrink-0 pt-0.5">
                      {act.timestamp}
                    </span>
                    <div className="flex-1 bg-slate-50 p-2 rounded border border-slate-150">
                      <p className="font-medium text-slate-800">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Login Activity Session Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
            <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-slate-500" /> Active Session Security Context
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
              <div>Device: {user.loginSession?.device || 'Chrome 128 / Windows 11'}</div>
              <div>Location: {user.loginSession?.location || 'Ahmedabad, GJ, India'}</div>
              <div>Session Status: Authenticated</div>
              <div>Prev. Login: {user.loginSession?.previousLoginAt || 'Yesterday 09:12'}</div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => {
                onClose();
                onChangeRole(user);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Role
            </button>
            <button
              onClick={() => {
                onClose();
                onResetAccess(user);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {user.status === 'INACTIVE' ? (
            <button
              onClick={() => {
                onClose();
                onReactivate(user);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Reactivate
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onDeactivate(user);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              <UserX className="w-3.5 h-3.5" /> Deactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
