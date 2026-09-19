import React, { useState, useRef, useEffect } from 'react';
import type { PlatformUser } from '../../../types/user';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import {
  MoreVertical,
  Eye,
  Edit,
  ShieldAlert,
  Truck,
  RotateCcw,
  UserX,
  UserCheck,
  Mail,
  Phone,
} from 'lucide-react';

interface UserTableRowProps {
  user: PlatformUser;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
  onViewDetails: (user: PlatformUser) => void;
  onEdit: (user: PlatformUser) => void;
  onChangeRole: (user: PlatformUser) => void;
  onAssignDriver: (user: PlatformUser) => void;
  onResetAccess: (user: PlatformUser) => void;
  onDeactivate: (user: PlatformUser) => void;
  onReactivate: (user: PlatformUser) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onEdit,
  onChangeRole,
  onAssignDriver,
  onResetAccess,
  onDeactivate,
  onReactivate,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);


  return (
    <tr
      className={`hover:bg-slate-50/80 transition-colors ${
        isSelected ? 'bg-amber-50/40' : ''
      }`}
    >
      {/* Selection Checkbox */}
      <td className="pl-4 pr-2 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
        />
      </td>

      {/* Name (Avatar + Full Name + User ID) */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            initials={user.avatarInitials}
            bgColor={user.avatarBgColor}
            role={user.role}
            size="md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onViewDetails(user)}
                className="text-xs font-semibold text-slate-900 hover:text-emerald-700 transition-colors truncate text-left cursor-pointer border-none bg-transparent p-0"
              >
                {user.fullName}
              </button>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                {user.userCode}
              </span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                <Phone className="w-2.5 h-2.5" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[180px]">{user.email}</span>
        </div>
      </td>

      {/* Role */}
      <td className="px-3 py-3">
        <RoleBadge role={user.role} />
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <UserStatusBadge status={user.status} />
      </td>

      {/* Assigned Vehicle */}
      <td className="px-3 py-3">
        {user.role === 'DRIVER' ? (
          <span className="inline-block font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
            {user.assignedVehicleId || 'Unassigned'}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* Assigned Zone */}
      <td className="px-3 py-3">
        <span className="text-xs font-medium text-slate-700">
          {user.zone || 'Central Zone'}
        </span>
      </td>

      {/* Last Login */}
      <td className="px-3 py-3">
        <span className="text-xs text-slate-600 font-mono">
          {user.lastActiveAt || user.loginSession?.lastLoginAt || 'Never'}
        </span>
      </td>

      {/* Created At */}
      <td className="px-3 py-3">
        <span className="text-xs text-slate-500 font-mono">
          {user.createdAt ? user.createdAt.split('T')[0] : user.joinedAt || '—'}
        </span>
      </td>

      {/* Action Dropdown Menu */}
      <td className="pr-4 pl-2 py-3 text-right">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="User options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white border border-slate-200 ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-30">
              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onViewDetails(user);
                  }}
                  className="group flex items-center w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(user);
                  }}
                  className="group flex items-center w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Edit className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600" />
                  Edit User Info
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onChangeRole(user);
                  }}
                  className="group flex items-center w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600" />
                  Change Role
                </button>
                {user.role === 'DRIVER' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onAssignDriver(user);
                    }}
                    className="group flex items-center w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Truck className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600" />
                    Assign Vehicle / Route
                  </button>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onResetAccess(user);
                  }}
                  className="group flex items-center w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600" />
                  Reset Access / Password
                </button>
                {user.status === 'INACTIVE' ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onReactivate(user);
                    }}
                    className="group flex items-center w-full px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    Reactivate Account
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeactivate(user);
                    }}
                    className="group flex items-center w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <UserX className="w-3.5 h-3.5 mr-2 text-red-500" />
                    Deactivate User
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
