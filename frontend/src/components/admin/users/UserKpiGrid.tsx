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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. TOTAL USERS */}
      <div
        onClick={() => {
          onFilterRole && onFilterRole('All');
          onFilterStatus && onFilterStatus('All');
        }}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all"
      >
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            TOTAL USERS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {summary.totalUsers}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              +8 this month
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Registered platform accounts
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {/* 2. ACTIVE USERS */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('ACTIVE')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all"
      >
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            ACTIVE USERS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {summary.activeUsers}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              {summary.activePercent}% active
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Online / Operational
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0 border border-emerald-100">
          <UserCheck className="w-5 h-5 text-[#047857]" />
        </div>
      </div>

      {/* 3. COLLECTORS */}
      <div
        onClick={() => onFilterRole && onFilterRole('COLLECTOR')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
      >
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            COLLECTORS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700 leading-none">
              {summary.collectorCount || summary.driverCount}
            </span>
            <span className="text-[10px] font-bold text-blue-600">
              {summary.activeDriverCount} active on duty
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Field collection crew
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
          <Truck className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* 4. VIEWERS */}
      <div
        onClick={() => onFilterRole && onFilterRole('VIEWER')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
      >
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            VIEWERS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700 leading-none">
              {summary.viewerCount || summary.analystCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Platform Viewers
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Analytics & Monitoring
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* 5. ADMINS */}
      <div
        onClick={() => onFilterRole && onFilterRole('ADMIN')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all col-span-2 md:col-span-1"
      >
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            ADMINS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#064e3b] leading-none">
              {summary.adminCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              Full Platform Access
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Waste Managers
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#064e3b] flex items-center justify-center shrink-0 border border-emerald-200">
          <Shield className="w-5 h-5 text-[#064e3b]" />
        </div>
      </div>
    </div>
  );
};
