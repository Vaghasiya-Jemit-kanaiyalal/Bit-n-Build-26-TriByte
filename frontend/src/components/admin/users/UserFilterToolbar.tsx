import React from 'react';
import type { UserRole, UserStatus, ZoneName, UserFilterState, UserSortState } from '../../../types/user';
import { Search, Filter, X, ArrowUpDown, RefreshCw } from 'lucide-react';

interface UserFilterToolbarProps {
  filters: UserFilterState;
  sort: UserSortState;
  onFilterChange: (updated: Partial<UserFilterState>) => void;
  onSortChange: (updated: Partial<UserSortState>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  activeFilterCount: number;
}

export const UserFilterToolbar: React.FC<UserFilterToolbarProps> = ({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  onResetFilters,
  onRefresh,
  activeFilterCount,
}) => {
  const zoneOptions: ZoneName[] = [
    'Central Zone',
    'North Zone',
    'South Zone',
    'East Zone',
    'West Zone',
    'Industrial Zone',
    'Residential Zone',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-3">
      {/* Search & Select Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by name, email, user ID, phone, vehicle or route..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 text-slate-900"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div className="min-w-[130px]">
          <select
            value={filters.role}
            onChange={(e) => onFilterChange({ role: e.target.value as UserRole | 'All' })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">All Roles</option>
            <option value="ADMIN">Waste Manager</option>
            <option value="DRIVER">Collection Driver</option>
            <option value="ANALYST">Operations Analyst</option>
            <option value="VIEWER">System Viewer (Read-Only)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[130px]">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as UserStatus | 'All' })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">Status: All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div className="min-w-[130px]">
          <select
            value={filters.zone}
            onChange={(e) => onFilterChange({ zone: e.target.value as ZoneName | 'All' })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">Zone: All Zones</option>
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment Filter */}
        <div className="min-w-[130px]">
          <select
            value={filters.assignment}
            onChange={(e) =>
              onFilterChange({
                assignment: e.target.value as 'All' | 'Assigned' | 'Unassigned',
              })
            }
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">Assignment: All</option>
            <option value="Assigned">Assigned</option>
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>

        {/* Activity Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.activityFilter}
            onChange={(e) =>
              onFilterChange({
                activityFilter: e.target.value as 'All' | 'Active Today' | 'Active This Week' | 'Inactive 7+ Days',
              })
            }
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">Activity: Any Time</option>
            <option value="Active Today">Active Today</option>
            <option value="Active This Week">Active This Week</option>
            <option value="Inactive 7+ Days">Inactive 7+ Days</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sort.field}
            onChange={(e) =>
              onSortChange({ field: e.target.value as UserSortState['field'] })
            }
            className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="fullName">Sort: Name</option>
            <option value="joinedAt">Sort: Recently Joined</option>
            <option value="lastActiveAt">Sort: Last Active</option>
            <option value="role">Sort: Role</option>
          </select>
          <button
            onClick={() =>
              onSortChange({ direction: sort.direction === 'asc' ? 'desc' : 'asc' })
            }
            title={`Toggle direction (${sort.direction})`}
            className="text-xs font-bold font-mono text-slate-500 hover:text-slate-900 px-1 border-l border-slate-200"
          >
            {sort.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all"
          title="Refresh user data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Active Filters:
          </span>

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full border border-slate-200">
              Query: "{filters.searchQuery}"
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="hover:text-slate-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.role !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-full border border-emerald-200">
              Role: {filters.role}
              <button
                onClick={() => onFilterChange({ role: 'All' })}
                className="hover:text-emerald-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.status !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 font-medium px-2 py-0.5 rounded-full border border-blue-200">
              Status: {filters.status}
              <button
                onClick={() => onFilterChange({ status: 'All' })}
                className="hover:text-blue-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.zone !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-800 font-medium px-2 py-0.5 rounded-full border border-purple-200">
              Zone: {filters.zone}
              <button
                onClick={() => onFilterChange({ zone: 'All' })}
                className="hover:text-purple-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.assignment !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-full border border-amber-200">
              Assignment: {filters.assignment}
              <button
                onClick={() => onFilterChange({ assignment: 'All' })}
                className="hover:text-amber-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.activityFilter !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded-full border border-slate-300">
              Activity: {filters.activityFilter}
              <button
                onClick={() => onFilterChange({ activityFilter: 'All' })}
                className="hover:text-slate-950"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
