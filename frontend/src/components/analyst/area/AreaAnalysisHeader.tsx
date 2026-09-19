import React from 'react';
import { Calendar, RefreshCw, MapPin, Filter } from 'lucide-react';

interface AreaAnalysisHeaderProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AreaAnalysisHeader: React.FC<AreaAnalysisHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  selectedZone,
  onZoneChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const zonesList: string[] = ['All', 'Central', 'North', 'South', 'East', 'West', 'Industrial', 'Residential'];

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5 mb-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <MapPin className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Area Analysis</h1>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Compare waste generation, collection efficiency, and recycling rates across municipal sectors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Zone Selector */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <span className="text-xs font-bold text-slate-500 mr-1.5">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-4"
            >
              {zonesList.map((z) => (
                <option key={z} value={z}>
                  {z === 'All' ? 'All Zones' : `${z} Zone`}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-4"
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaAnalysisHeader;
