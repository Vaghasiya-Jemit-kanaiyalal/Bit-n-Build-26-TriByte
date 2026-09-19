import React from 'react';
import { Users, UserCheck, Truck, BarChart3, Shield } from 'lucide-react';
import type { UserKpiSummary, UserRole, UserStatus } from '../../../types/user';

interface UserKpiGridProps {
  summary: UserKpiSummary;
  onFilterRole?: (role: UserRole | 'All') => void;
  onFilterStatus?: (status: UserStatus | 'All') => void;
}

export const UserKpiGrid: React.FC<UserKpiGridProps> = ({
  summary,
  onFilterRole,
  onFilterStatus,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. TOTAL USERS */}
      <div
        onClick={() => {
          onFilterRole && onFilterRole('All');
          onFilterStatus && onFilterStatus('All');
        }}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-all h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Total Users
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{summary.totalUsers}</span>
            <span className="text-[10px] font-bold text-emerald-600">+8/mo</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Registered accounts</span>
        </div>
      </div>

      {/* 2. ACTIVE USERS */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('ACTIVE')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Active Users
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{summary.activeUsers}</span>
            <span className="text-[10px] font-bold text-emerald-600">{summary.activePercent}%</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Online / Operational</span>
        </div>
      </div>

      {/* 3. COLLECTION DRIVERS */}
      <div
        onClick={() => onFilterRole && onFilterRole('DRIVER')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-all h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Drivers
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight font-mono leading-none">{summary.driverCount}</span>
            <span className="text-[10px] font-bold text-blue-600">{summary.activeDriverCount} duty</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Field collection crew</span>
        </div>
      </div>

      {/* 4. OPERATIONS ANALYSTS */}
      <div
        onClick={() => onFilterRole && onFilterRole('ANALYST')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-purple-300 transition-all h-full"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Analysts
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight font-mono leading-none">{summary.analystCount}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Analytics & Monitoring</span>
        </div>
      </div>

      {/* 5. ADMINS */}
      <div
        onClick={() => onFilterRole && onFilterRole('ADMIN')}
        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all h-full col-span-2 md:col-span-1"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Admins
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <Shield className="w-4 h-4 text-emerald-800" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight font-mono leading-none">{summary.adminCount}</span>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 leading-tight block">Full platform access</span>
        </div>
      </div>
    </div>
  );
};
