import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Download,
  Clock,
} from 'lucide-react';
import type { DashboardFilterState } from '../../../types/dashboard';

interface DashboardHeaderProps {
  user?: { name?: string; role?: string };
  filters: DashboardFilterState;
  onFilterChange: (updates: Partial<DashboardFilterState>) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user: _user,
  filters: _filters,
  onFilterChange: _onFilterChange,
  onRefresh,
  onExport,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>(() => {
    const now = new Date();
    return (
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-5 shadow-xs flex flex-col gap-4">
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>ADMIN</span>
            <span>/</span>
            <span className="text-[#047857] font-bold">OPERATIONS CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time overview of waste collection, live network activity, bin capacities, and fleet operations.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Dynamic Clock */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 font-mono font-bold bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateTime}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors border-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
