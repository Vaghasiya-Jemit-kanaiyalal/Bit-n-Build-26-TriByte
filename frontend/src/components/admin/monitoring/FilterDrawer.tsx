import React from 'react';
import type { MonitoringFilterState, ZoneName } from '../../../types/monitoring';
import { X, Filter, RotateCcw } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  filters: MonitoringFilterState;
  onClose: () => void;
  onFilterChange: (updated: Partial<MonitoringFilterState>) => void;
  onResetFilters: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  filters,
  onClose,
  onFilterChange,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  const zones: ZoneName[] = [
    'Central Zone',
    'North Zone',
    'South Zone',
    'East Zone',
    'West Zone',
    'Industrial Zone',
    'Residential Zone',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Live Operations Map &amp; Feed Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Entity Type */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) =>
                onFilterChange({
                  entityType: e.target.value as MonitoringFilterState['entityType'],
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-900 focus:outline-none"
            >
              <option value="All">All Entities (Bins, Vehicles, Routes)</option>
              <option value="Bins">Smart Waste Bins Only</option>
              <option value="Vehicles">Collection Fleet Vehicles Only</option>
              <option value="Routes">Active Routes Only</option>
            </select>
          </div>

          {/* Operational Zone */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Municipal Zone</label>
            <select
              value={filters.zone}
              onChange={(e) =>
                onFilterChange({
                  zone: e.target.value as ZoneName | 'All',
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-900 focus:outline-none"
            >
              <option value="All">All Zones</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Operational Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-900 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Critical">Critical (&gt;90% Fill)</option>
              <option value="Warning">Warning (75-89% Fill)</option>
              <option value="Normal">Normal (&lt;75% Fill)</option>
              <option value="ON ROUTE">Vehicle: On Route</option>
              <option value="IDLE">Vehicle: Idle</option>
              <option value="MAINTENANCE">Vehicle: Maintenance</option>
              <option value="Offline">Offline / Disconnected</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Live Activity Event Severity</label>
            <select
              value={filters.severity}
              onChange={(e) =>
                onFilterChange({
                  severity: e.target.value as MonitoringFilterState['severity'],
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-900 focus:outline-none"
            >
              <option value="All">All Event Severities</option>
              <option value="critical">Critical Events Only</option>
              <option value="warning">Warning Events</option>
              <option value="info">Informational Events</option>
              <option value="success">Successful Events</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
