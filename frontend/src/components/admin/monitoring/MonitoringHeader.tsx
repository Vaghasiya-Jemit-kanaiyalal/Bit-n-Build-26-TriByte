import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

interface MonitoringHeaderProps {
  isLive: boolean;
  onToggleLive: () => void;
  refreshInterval?: number;
  onRefreshIntervalChange?: (sec: number) => void;
  lastUpdated?: string;
  viewMode?: 'map' | 'list';
  onViewModeChange?: (mode: 'map' | 'list') => void;
  onOpenFilters?: () => void;
  onManualRefresh: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onToggleFullscreenMap?: () => void;
  isFullscreenMap?: boolean;
  activeFilterCount?: number;
}

export const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({
  isLive,
  onToggleLive,
  onManualRefresh,
  onToggleFullscreenMap: _onToggleFullscreenMap,
  isFullscreenMap: _isFullscreenMap = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight m-0">
          Bin Map
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Live locations, fill levels and collection routes across the campus.
        </p>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date & Time display */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 shadow-2xs rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Sep 19, 2026 11:24 AM</span>
        </div>

        {/* Live Indicator Pill */}
        <button
          onClick={onToggleLive}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isLive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
          }`}
          title="Toggle Live Telemetry"
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
          <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onManualRefresh}
          className="p-2 bg-white border border-slate-200/80 shadow-2xs rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer"
          title="Refresh Map"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
