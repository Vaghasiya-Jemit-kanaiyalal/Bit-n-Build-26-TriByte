import React from 'react';
import { Search, X } from 'lucide-react';

interface VehicleFiltersProps {
  searchTerm?: string;
  searchQuery?: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  zoneFilter: string;
  onZoneChange: (value: string) => void;
  capacityFilter: string;
  onCapacityChange: (value: string) => void;
  onClearFilters: () => void;
  filteredCount?: number;
  activeCount?: number;
  totalCount?: number;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  searchTerm,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  zoneFilter,
  onZoneChange,
  capacityFilter,
  onCapacityChange,
  onClearFilters,
  filteredCount,
  activeCount,
  totalCount,
}) => {
  const query = searchQuery ?? searchTerm ?? '';
  const count = filteredCount ?? activeCount ?? 0;

  const hasActiveFilters =
    query.trim() !== '' ||
    statusFilter !== 'All' ||
    typeFilter !== 'All' ||
    zoneFilter !== 'All' ||
    capacityFilter !== 'All';

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-[#9ca3af] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vehicle ID, driver or route..."
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] focus:outline-none focus:border-[#738a62]"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Route">On Route</option>
            <option value="Available">Available</option>
            <option value="Idle">Idle</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Types</option>
            <option value="Compactor">Compactor</option>
            <option value="Tipper">Tipper</option>
            <option value="Recycling Truck">Recycling Truck</option>
            <option value="Mini Collection Vehicle">Mini Collection Vehicle</option>
            <option value="Electric Collection Vehicle">Electric Collection Vehicle</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div>
          <select
            value={zoneFilter}
            onChange={(e) => onZoneChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Zones</option>
            <option value="North">North Zone</option>
            <option value="South">South Zone</option>
            <option value="East">East Zone</option>
            <option value="West">West Zone</option>
            <option value="Central">Central Zone</option>
          </select>
        </div>

        {/* Capacity Filter */}
        <div>
          <select
            value={capacityFilter}
            onChange={(e) => onCapacityChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#374151] focus:outline-none focus:border-[#738a62]"
          >
            <option value="All">All Capacities</option>
            <option value="Small">Small (&lt;800 kg)</option>
            <option value="Medium">Medium (800–1200 kg)</option>
            <option value="Large">Large (&gt;1200 kg)</option>
          </select>
        </div>
      </div>

      {/* Toolbar Status Row */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f3f4f6]">
        <div className="text-[#6b7280]">
          Showing <strong>{count}</strong> of <strong>{totalCount ?? 24}</strong> fleet vehicles
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[#738a62] font-semibold hover:underline cursor-pointer border-none bg-transparent"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleFilters;
