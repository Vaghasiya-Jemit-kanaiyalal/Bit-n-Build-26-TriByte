import React from 'react';
import type { PlatformUser, UserSortState } from '../../../types/user';
import { UserTableRow } from './UserTableRow';
import { FilterX, ArrowUp, ArrowDown } from 'lucide-react';

interface UserTableProps {
  users: PlatformUser[];
  selectedUserIds: string[];
  sort: UserSortState;
  isLoading: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectUser: (id: string) => void;
  onSortChange: (field: UserSortState['field']) => void;
  onViewDetails: (user: PlatformUser) => void;
  onEdit: (user: PlatformUser) => void;
  onChangeRole: (user: PlatformUser) => void;
  onAssignDriver: (user: PlatformUser) => void;
  onResetAccess: (user: PlatformUser) => void;
  onDeactivate: (user: PlatformUser) => void;
  onReactivate: (user: PlatformUser) => void;
  onResetFilters: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUserIds,
  sort,
  isLoading,
  onToggleSelectAll,
  onToggleSelectUser,
  onSortChange,
  onViewDetails,
  onEdit,
  onChangeRole,
  onAssignDriver,
  onResetAccess,
  onDeactivate,
  onReactivate,
  onResetFilters,
}) => {
  const isAllSelected =
    users.length > 0 && users.every((u) => selectedUserIds.includes(u.id));
  const isSomeSelected =
    selectedUserIds.length > 0 && !isAllSelected;

  const renderSortIcon = (field: UserSortState['field']) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-slate-800 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-slate-800 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-md w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FilterX className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No users match your filters</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Try adjusting your search criteria, role filters, or zone parameters to locate workforce members.
        </p>
        <button
          onClick={onResetFilters}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                />
              </th>

              <th
                onClick={() => onSortChange('fullName')}
                className="px-3 py-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                User {renderSortIcon('fullName')}
              </th>

              <th
                onClick={() => onSortChange('role')}
                className="px-3 py-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Role {renderSortIcon('role')}
              </th>

              <th className="px-3 py-3">Zone</th>

              <th className="px-3 py-3">Assignment / Access</th>

              <th
                onClick={() => onSortChange('status')}
                className="px-3 py-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Status {renderSortIcon('status')}
              </th>

              <th className="px-3 py-3">Contact</th>

              <th
                onClick={() => onSortChange('lastActiveAt')}
                className="px-3 py-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Last Active {renderSortIcon('lastActiveAt')}
              </th>

              <th
                onClick={() => onSortChange('joinedAt')}
                className="px-3 py-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                Joined {renderSortIcon('joinedAt')}
              </th>

              <th className="pr-4 pl-2 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUserIds.includes(user.id)}
                onToggleSelect={onToggleSelectUser}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onChangeRole={onChangeRole}
                onAssignDriver={onAssignDriver}
                onResetAccess={onResetAccess}
                onDeactivate={onDeactivate}
                onReactivate={onReactivate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
