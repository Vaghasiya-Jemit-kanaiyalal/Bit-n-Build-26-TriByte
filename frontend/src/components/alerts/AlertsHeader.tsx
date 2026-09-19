import React from 'react';
import { CheckCheck, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface AlertsHeaderProps {
  onMarkAllRead: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  isRefreshing?: boolean;
}

export const AlertsHeader: React.FC<AlertsHeaderProps> = ({
  onMarkAllRead,
  onRefresh,
  onOpenSettings,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5e7eb]">
      {/* Left: Breadcrumbs & Title */}
      <div>
        <div className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase mb-1">
          ADMIN / OPERATIONS / ALERTS
        </div>
        <h1 className="text-xl font-extrabold text-[#111827] tracking-tight m-0">
          Alerts & Incident Center
        </h1>
        <p className="text-xs text-[#6b7280] font-medium mt-0.5">
          Monitor operational issues, AI warnings and collection events requiring attention.
        </p>
      </div>

      {/* Right: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onMarkAllRead}
          className="px-3 py-2 text-xs font-semibold text-[#374151] bg-white hover:bg-[#f9fafb] border border-[#d1d5db] rounded-md shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          title="Mark all alerts as read"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Mark All Read</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-[#4b5563] hover:text-[#111827] bg-white border border-[#d1d5db] rounded-md shadow-2xs hover:bg-[#f9fafb] cursor-pointer transition-all disabled:opacity-50"
          title="Refresh alerts"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#738a62]' : ''}`} />
        </button>

        <button
          onClick={onOpenSettings}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#738a62] hover:bg-[#5f7350] rounded-md shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Alert Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AlertsHeader;
