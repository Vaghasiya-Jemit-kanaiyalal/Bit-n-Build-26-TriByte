import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface AlertFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  severityFilter: string;
  onSeverityChange: (s: string) => void;
  statusFilter: string;
  onStatusChange: (s: string) => void;
  typeFilter: string;
  onTypeChange: (t: string) => void;
  sourceFilter: string;
  onSourceChange: (src: string) => void;
  zoneFilter: string;
  onZoneChange: (z: string) => void;
  dateFilter: string;
  onDateChange: (d: string) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const AlertFilterToolbar: React.FC<AlertFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  sourceFilter,
  onSourceChange,
  zoneFilter,
  onZoneChange,
  dateFilter,
  onDateChange,
  onClearFilters,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    severityFilter !== 'All' ||
    statusFilter !== 'All' ||
    typeFilter !== 'All' ||
    sourceFilter !== 'All' ||
    zoneFilter !== 'All' ||
    dateFilter !== 'All';

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-2xs p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts, bin ID, vehicle, route or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] focus:outline-none focus:border-[#738a62]"
          />
        </div>

        {/* Severity */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
            <option value="SNOOZED">Snoozed</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Sources</option>
            <option value="AI Prediction">AI Prediction</option>
            <option value="Sensor">Sensor</option>
            <option value="Route Engine">Route Engine</option>
            <option value="Vehicle System">Vehicle System</option>
            <option value="Admin/System">Admin/System</option>
          </select>
        </div>

        {/* Zone */}
        <div>
          <select
            value={zoneFilter}
            onChange={(e) => onZoneChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Zones</option>
            <option value="Central Zone">Central Zone</option>
            <option value="North Zone">North Zone</option>
            <option value="South Zone">South Zone</option>
            <option value="East Zone">East Zone</option>
            <option value="West Zone">West Zone</option>
            <option value="Industrial Zone">Industrial Zone</option>
            <option value="Residential Zone">Residential Zone</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>

      </div>

      {/* Active Filter Chips & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-2 text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Showing <strong className="text-slate-900">{filteredCount}</strong> of <strong className="text-slate-900">{totalCount}</strong> operational alerts</span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            {severityFilter !== 'All' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 text-[11px] font-semibold">
                <span>Severity: {severityFilter}</span>
                <button onClick={() => onSeverityChange('All')} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {zoneFilter !== 'All' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 text-[11px] font-semibold">
                <span>Zone: {zoneFilter}</span>
                <button onClick={() => onZoneChange('All')} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {typeFilter !== 'All' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 text-[11px] font-semibold">
                <span>Type: {typeFilter}</span>
                <button onClick={() => onTypeChange('All')} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {sourceFilter !== 'All' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 text-[11px] font-semibold">
                <span>Source: {sourceFilter}</span>
                <button onClick={() => onSourceChange('All')} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={onClearFilters}
              className="text-[#738a62] font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertFilterToolbar;
