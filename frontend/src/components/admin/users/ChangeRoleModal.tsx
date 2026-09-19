import React, { useState } from 'react';
import type { PlatformUser, UserRole } from '../../../types/user';
import { RoleBadge } from './RoleBadge';
import { X, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: PlatformUser | null;
  onClose: () => void;
  onConfirm: (userId: string, newRole: UserRole) => void;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');

  React.useEffect(() => {
    if (user) {
      if (user.role === 'COLLECTOR' || user.role === 'DRIVER') setSelectedRole('VIEWER');
      else setSelectedRole('COLLECTOR');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const rolePrivileges: Record<UserRole, string[]> = {
    ADMIN: [
      'Full administrative access over all 12 modules',
      'User Management & Role Assignment rights',
      'Bin & Vehicle fleet configuration',
      'System Settings & Integrations',
    ],
    COLLECTOR: [
      'Assigned Route execution panel',
      'Vehicle telemetry & status reporting',
      'Collection operations & bin scan logging',
      'Field notifications',
    ],
    VIEWER: [
      'Waste Analytics & trends inspection',
      'Prediction Analytics models & ML forecasts',
      'Collection performance reporting',
      'Exportable area reports',
    ],
    DRIVER: [
      'Assigned Route execution panel',
      'Vehicle telemetry & status reporting',
      'Collection operations & bin scan logging',
      'Field notifications',
    ],
    ANALYST: [
      'Waste Analytics & trends inspection',
      'Prediction Analytics models & ML forecasts',
      'Collection performance reporting',
      'Exportable area reports',
    ],
  };

  const handleApply = () => {
    onConfirm(user.id, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Change Platform Role & Access</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* User Target Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{user.fullName}</p>
              <p className="text-[11px] text-slate-500 font-mono">{user.email} • {user.userCode}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Current Role</span>
              <RoleBadge role={user.role} />
            </div>
          </div>

          {/* New Role Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">Select Target Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="COLLECTOR">Collector</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          {/* Access Consequences Comparison */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-100/70 p-3 rounded border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-700 block text-xs border-b border-slate-200 pb-1">
                Current Access ({user.role})
              </span>
              <ul className="space-y-1 text-slate-600">
                {rolePrivileges[user.role].map((p, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-slate-400">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded border border-emerald-200 space-y-1.5">
              <span className="font-semibold text-emerald-900 block text-xs border-b border-emerald-200 pb-1 flex items-center gap-1">
                New Access ({selectedRole}) <ArrowRight className="w-3 h-3 text-emerald-600" />
              </span>
              <ul className="space-y-1 text-emerald-800">
                {rolePrivileges[selectedRole].map((p, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-500">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="font-semibold">Access Privilege Warning:</strong> Changing this user's role will immediately modify their accessible pages, feature permissions, and operational capabilities in the platform.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedRole === user.role}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
            >
              Confirm Role Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
