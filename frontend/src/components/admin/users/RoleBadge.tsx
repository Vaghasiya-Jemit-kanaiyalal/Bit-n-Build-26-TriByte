import React from 'react';
import { Shield, Truck, BarChart3 } from 'lucide-react';
import type { UserRole } from '../../../types/user';

interface RoleBadgeProps {
  role: UserRole;
  showSubtitle?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showSubtitle = false }) => {
  if (role === 'ADMIN') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-[#047857] border border-emerald-200 tracking-wider uppercase">
          <Shield className="w-3 h-3 text-[#047857]" />
          ADMIN
        </span>
        {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Waste Manager</span>}
      </div>
    );
  }

  if (role === 'DRIVER') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 tracking-wider uppercase">
          <Truck className="w-3 h-3 text-blue-600" />
          DRIVER
        </span>
        {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Driver / Field Worker</span>}
      </div>
    );
  }

  // ANALYST
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 tracking-wider uppercase">
        <BarChart3 className="w-3 h-3 text-purple-600" />
        ANALYST
      </span>
      {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Analyst / Supervisor</span>}
    </div>
  );
};
