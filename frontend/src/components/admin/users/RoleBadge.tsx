import React from 'react';
import { Shield, Truck, BarChart3, Eye } from 'lucide-react';
import type { UserRole } from '../../../types/user';

interface RoleBadgeProps {
  role: UserRole;
  showSubtitle?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showSubtitle = false }) => {
  if (role === 'ADMIN') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-[#047857] border border-emerald-200 tracking-wider">
          <Shield className="w-3 h-3 text-[#047857]" />
          Waste Manager
        </span>
        {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5">ADMIN</span>}
      </div>
    );
  }

  if (role === 'DRIVER') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 tracking-wider">
          <Truck className="w-3 h-3 text-blue-600" />
          Collection Driver
        </span>
        {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5 font-sans">DRIVER</span>}
      </div>
    );
  }

  if (role === 'VIEWER') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 tracking-wider">
          <Eye className="w-3 h-3 text-amber-600" />
          New User (Pending Role Assignment)
        </span>
        {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5 font-sans">VIEWER</span>}
      </div>
    );
  }

  // ANALYST
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 tracking-wider">
        <BarChart3 className="w-3 h-3 text-purple-600" />
        Operations Analyst
      </span>
      {showSubtitle && <span className="text-[10px] font-semibold text-slate-500 mt-0.5 font-sans">ANALYST</span>}
    </div>
  );
};
