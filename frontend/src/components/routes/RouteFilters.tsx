import React from 'react';
import { Search, X, Calendar } from 'lucide-react';

interface RouteFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  zoneFilter: string;
  onZoneChange: (value: string) => void;
  vehicleFilter: string;
  onVehicleChange: (value: string) => void;
  onClearFilters: () => void;
}

export const RouteFilters: React.FC<RouteFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  zoneFilter,
  onZoneChange,
  vehicleFilter,
  onVehicleChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchTerm !== '' || statusFilter !== 'All' || zoneFilter !== 'All' || vehicleFilter !== 'All';

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-3.5 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      
      {/* Left Search Input */}
      <div className="relative flex items-center flex-1 max-w-sm">
        <Search className="absolute left-3 w-3.5 h-3.5 text-[#9ca3af]" />
        <input
          placeholder="Search route ID, driver, location, or bin..."
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:bg-white focus:border-[#738a62]"
        />
      </div>

      {/* Right Dropdowns & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        
        {/* Status Dropdown */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-[#6b7280]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-medium text-[#374151] focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="At Risk">At Risk</option>
          </select>
        </div>

        {/* Zone Dropdown */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-[#6b7280]">Zone:</span>
          <select
            value={zoneFilter}
            onChange={(e) => onZoneChange(e.target.value)}
            className="px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-medium text-[#374151] focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="All">All Zones</option>
            <option value="Zone A">Zone A</option>
            <option value="Zone B">Zone B</option>
            <option value="Zone C">Zone C</option>
            <option value="Zone D">Zone D</option>
          </select>
        </div>

        {/* Vehicle Dropdown */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-[#6b7280]">Vehicle:</span>
          <select
            value={vehicleFilter}
            onChange={(e) => onVehicleChange(e.target.value)}
            className="px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-medium text-[#374151] focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="All">All Vehicles</option>
            <option value="TRK-01">TRK-01</option>
            <option value="TRK-02">TRK-02</option>
            <option value="TRK-03">TRK-03</option>
            <option value="TRK-04">TRK-04</option>
          </select>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-semibold text-[#374151]">
          <Calendar className="w-3.5 h-3.5 text-[#6b7280]" />
          <span>Today (Sep 19)</span>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
