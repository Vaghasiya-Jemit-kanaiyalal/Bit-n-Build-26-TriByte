import React from 'react';
import type { UserStatus } from '../../../types/user';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-[#047857] border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        ACTIVE
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        PENDING
      </span>
    );
  }

  if (status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        SUSPENDED
      </span>
    );
  }

  // INACTIVE
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      INACTIVE
    </span>
  );
};
