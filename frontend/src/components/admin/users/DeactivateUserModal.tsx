import React from 'react';
import type { PlatformUser } from '../../../types/user';
import { RoleBadge } from './RoleBadge';
import { X, UserX, AlertTriangle } from 'lucide-react';

interface DeactivateUserModalProps {
  isOpen: boolean;
  user: PlatformUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

export const DeactivateUserModal: React.FC<DeactivateUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !user) return null;

  const handleDeactivate = () => {
    onConfirm(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-red-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-950">Deactivate User Account</h3>
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
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900 text-sm">{user.fullName}</p>
            <p className="text-slate-500 font-mono">{user.email} • {user.userCode}</p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400 block">Role:</span>
                <RoleBadge role={user.role} />
              </div>
              <div>
                <span className="text-slate-400 block">Current Assignment:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {user.role === 'DRIVER'
                    ? `${user.assignedVehicleId || 'No Veh'} / ${user.assignedRouteId || 'No Route'}`
                    : 'Global Scope'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Confirm Deactivation:</strong>
              <p className="text-[11px] leading-relaxed">
                <strong>{user.fullName}</strong> will no longer be able to log in or access the platform. Account record and operational telemetry history will be retained. Account can be reactivated anytime by an Admin.
              </p>
            </div>
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
              onClick={handleDeactivate}
              className="px-4 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors shadow-sm"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
