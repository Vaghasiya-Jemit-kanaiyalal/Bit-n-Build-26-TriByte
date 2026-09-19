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
  const [selectedRole, setSelectedRole] = useState<UserRole>('ANALYST');
  const [emailError, setEmailError] = useState<string | null>(null);

  React.useEffect(() => {
    setEmailError(null);
    if (user) {
      if (user.role === 'DRIVER') setSelectedRole('ANALYST');
      else setSelectedRole('DRIVER');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const rolePrivileges: Record<UserRole, string[]> = {
    ADMIN: [
      'Full system and operational management',
      'Manage users, bins, vehicles, routes, settings',
      'Create collection plans & assign drivers',
      'Access all monitoring, analytics, and predictions',
    ],
    DRIVER: [
      'Field collection and assigned route execution',
      'View assigned vehicle & assigned bins',
      'Start, pause, resume, and complete routes',
      'Mark bins collected & report collection issues',
    ],
    ANALYST: [
      'Waste, collection, route, & fleet analytics',
      'View prediction models & recycling analytics',
      'Generate & export analytical reports',
      'Zone & area intelligence analysis',
    ],
  };

  const handleApply = () => {
    const userEmail = user.email.toLowerCase().trim();
    if (selectedRole === 'DRIVER' && !userEmail.endsWith('@driver.gmail.com')) {
      setEmailError('Collection Driver accounts must use an @driver.gmail.com email.');
      return;
    }
    if (selectedRole === 'ANALYST' && !userEmail.endsWith('@analyst.gmail.com')) {
      setEmailError('Operations Analyst accounts must use an @analyst.gmail.com email.');
      return;
    }

    setEmailError(null);
    onConfirm(user.id, selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
              onChange={(e) => {
                setSelectedRole(e.target.value as UserRole);
                setEmailError(null);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            >
              <option value="DRIVER">Collection Driver</option>
              <option value="ANALYST">Operations Analyst</option>
              <option value="ADMIN">Waste Manager (Admin)</option>
            </select>
            {emailError && (
              <p className="text-red-600 font-semibold text-[11px] mt-1.5 bg-red-50 p-2 rounded border border-red-200">
                {emailError}
              </p>
            )}
          </div>

          {/* Access Consequences Comparison */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-100/70 p-3 rounded border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-700 block text-xs border-b border-slate-200 pb-1">
                Current Role: {user.role}
              </span>
              <ul className="space-y-1 text-slate-600">
                {rolePrivileges[user.role]?.map((p, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-slate-400">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded border border-emerald-200 space-y-1.5">
              <span className="font-semibold text-emerald-900 block text-xs border-b border-emerald-200 pb-1 flex items-center gap-1">
                New Role: {selectedRole} <ArrowRight className="w-3 h-3 text-emerald-600" />
              </span>
              <ul className="space-y-1 text-emerald-800">
                {rolePrivileges[selectedRole]?.map((p, i) => (
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
              Changing this user's role will change their system access and dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedRole === user.role}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm cursor-pointer"
            >
              Confirm Role Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
