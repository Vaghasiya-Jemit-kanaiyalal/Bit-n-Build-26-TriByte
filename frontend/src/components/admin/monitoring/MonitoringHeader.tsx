import React from 'react';
import {
  Activity,
  RefreshCw,
  Search,
  Filter,
  Map as MapIcon,
  List,
  Maximize2,
  X,
} from 'lucide-react';

interface MonitoringHeaderProps {
  isLive: boolean;
  onToggleLive: () => void;
  refreshInterval: number;
  onRefreshIntervalChange: (sec: number) => void;
  lastUpdated: string;
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
  onOpenFilters: () => void;
  onManualRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleFullscreenMap: () => void;
  activeFilterCount: number;
}

export const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({
  isLive,
  onToggleLive,
  refreshInterval,
  onRefreshIntervalChange,
  lastUpdated,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  onManualRefresh,
  searchQuery,
  onSearchChange,
  onToggleFullscreenMap,
  activeFilterCount,
}) => {
  return (
    <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      {/* Top Title & Primary Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Breadcrumbs */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
            <span>ADMIN</span>
            <span>/</span>
            <span>OPERATIONS</span>
            <span>/</span>
            <span className="text-emerald-700">MONITORING</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
              Live Operations Command Center
            </h1>
            {/* Live Indicator Pill */}
            <button
              onClick={onToggleLive}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
              title="Toggle Live Telemetry Simulation"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>{isLive ? 'LIVE TELEMETRY ●' : 'PAUSED'}</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time operational view of smart bins, collection vehicles, routes, and connected sensors.
          </p>
        </div>

        {/* Right Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Refresh Interval Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-normal">Interval:</span>
            <select
              value={refreshInterval}
              onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value={5}>5 sec</option>
              <option value={10}>10 sec</option>
              <option value={30}>30 sec</option>
              <option value={60}>60 sec</option>
            </select>
          </div>

          {/* Last Updated badge */}
          <span className="hidden xl:inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
            Updated: <strong className="text-slate-800">{lastUpdated}</strong>
          </span>

          {/* Manual Refresh */}
          <button
            onClick={onManualRefresh}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            title="Manual Telemetry Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Map vs List Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          {/* Fullscreen Map Trigger */}
          <button
            onClick={onToggleFullscreenMap}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            title="Expand Fullscreen Operations Map"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Filter Drawer Trigger */}
          <button
            onClick={onOpenFilters}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-700 text-white rounded-full px-1.5 py-0.2 text-[10px] font-mono">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search bin (e.g. BIN-1087), vehicle (TRK-021), route (R-104), sensor (SNS-1087) or zone location..."
          className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
