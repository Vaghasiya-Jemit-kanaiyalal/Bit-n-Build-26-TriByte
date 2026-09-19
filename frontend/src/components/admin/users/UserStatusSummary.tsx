import React from 'react';
import type { UserStatus } from '../../../types/user';

interface UserStatusSummaryProps {
  counts: Record<UserStatus | 'All', number>;
  selectedStatus: UserStatus | 'All';
  onSelectStatus: (status: UserStatus | 'All') => void;
}

export const UserStatusSummary: React.FC<UserStatusSummaryProps> = ({
  counts,
  selectedStatus,
  onSelectStatus,
}) => {
  const tabs: { status: UserStatus | 'All'; label: string; badgeColor: string }[] = [
    { status: 'All', label: 'All Users', badgeColor: 'bg-slate-200 text-slate-700' },
    { status: 'ACTIVE', label: 'Active', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { status: 'INACTIVE', label: 'Inactive', badgeColor: 'bg-slate-200 text-slate-700' },
    { status: 'PENDING', label: 'Pending', badgeColor: 'bg-amber-100 text-amber-800' },
    { status: 'SUSPENDED', label: 'Suspended', badgeColor: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isSelected = selectedStatus === tab.status;
        const count = counts[tab.status] || 0;

        return (
          <button
            key={tab.status}
            onClick={() => onSelectStatus(tab.status)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isSelected ? 'bg-slate-700 text-white' : tab.badgeColor
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
