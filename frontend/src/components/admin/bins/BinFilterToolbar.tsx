import React from 'react';
import { Search, X, Download } from 'lucide-react';
import type { BinFilterState, BinSortState } from '../../../types/bin';

interface BinFilterToolbarProps {
  filters: BinFilterState;
  sort: BinSortState;
  onFilterChange: (updates: Partial<BinFilterState>) => void;
  onSortChange: (sort: BinSortState) => void;
  onClearFilters: () => void;
  totalFiltered: number;
  totalCount: number;
  onExportCSV: () => void;
}

export const BinFilterToolbar: React.FC<BinFilterToolbarProps> = ({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  onClearFilters,
  totalFiltered,
  totalCount,
  onExportCSV,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'All' ||
    filters.fillLevelRange !== 'All' ||
    filters.wasteType !== 'All' ||
    filters.zone !== 'All' ||
    filters.collectionStatus !== 'All';

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
      {/* Search Input & Export Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by bin ID, location or zone..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 rounded-xl text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-[#047857] transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Count & Export Button */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 font-bold">{totalFiltered}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{totalCount}</strong> bins
          </span>

          <button
            onClick={onExportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
        {/* 1. Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value as any })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#047857]"
        >
          <option value="All">Status: All</option>
          <option value="Normal">Normal</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
          <option value="Offline">Offline</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* 2. Fill Level Filter */}
        <select
          value={filters.fillLevelRange}
          onChange={(e) => onFilterChange({ fillLevelRange: e.target.value as any })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#047857]"
        >
          <option value="All">Fill: All Levels</option>
          <option value="0-25">0–25%</option>
          <option value="26-50">26–50%</option>
          <option value="51-75">51–75%</option>
          <option value="76-90">76–90%</option>
          <option value="91-100">91–100%</option>
        </select>

        {/* 3. Waste Type Filter */}
        <select
          value={filters.wasteType}
          onChange={(e) => onFilterChange({ wasteType: e.target.value as any })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#047857]"
        >
          <option value="All">Waste: All Types</option>
          <option value="Mixed">Mixed</option>
          <option value="Organic">Organic</option>
          <option value="Plastic">Plastic</option>
          <option value="Paper">Paper</option>
          <option value="Glass">Glass</option>
          <option value="Metal">Metal</option>
          <option value="Other">Other</option>
        </select>

        {/* 4. Zone Filter */}
        <select
          value={filters.zone}
          onChange={(e) => onFilterChange({ zone: e.target.value as any })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#047857]"
        >
          <option value="All">Zone: All Zones</option>
          <option value="Central Zone">Central Zone</option>
          <option value="North Zone">North Zone</option>
          <option value="South Zone">South Zone</option>
          <option value="East Zone">East Zone</option>
          <option value="West Zone">West Zone</option>
          <option value="Industrial Zone">Industrial Zone</option>
          <option value="Residential Zone">Residential Zone</option>
        </select>

        {/* 5. Collection Status Filter */}
        <select
          value={filters.collectionStatus}
          onChange={(e) => onFilterChange({ collectionStatus: e.target.value as any })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#047857]"
        >
          <option value="All">Collection: All</option>
          <option value="Pending">Pending</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Collected">Collected</option>
          <option value="Overdue">Overdue</option>
        </select>

        {/* 6. Sort By Dropdown */}
        <select
          value={`${sort.field}-${sort.direction}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-') as [any, any];
            onSortChange({ field, direction });
          }}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#047857]"
        >
          <option value="currentFillPercent-desc">Sort: Fill Level (High → Low)</option>
          <option value="currentFillPercent-asc">Sort: Fill Level (Low → High)</option>
          <option value="predictedOverflowMinutes-asc">Sort: Urgent Overflow</option>
          <option value="id-asc">Sort: Bin ID (A → Z)</option>
          <option value="lastCollectionAt-desc">Sort: Last Collection</option>
        </select>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Filters:
          </span>

          {filters.status !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#047857] text-xs font-bold border border-emerald-200">
              Status: {filters.status}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ status: 'All' })}
              />
            </span>
          )}

          {filters.fillLevelRange !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#047857] text-xs font-bold border border-emerald-200">
              Fill: {filters.fillLevelRange}%
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ fillLevelRange: 'All' })}
              />
            </span>
          )}

          {filters.wasteType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#047857] text-xs font-bold border border-emerald-200">
              Waste: {filters.wasteType}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ wasteType: 'All' })}
              />
            </span>
          )}

          {filters.zone !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#047857] text-xs font-bold border border-emerald-200">
              Zone: {filters.zone}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ zone: 'All' })}
              />
            </span>
          )}

          {filters.collectionStatus !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[#047857] text-xs font-bold border border-emerald-200">
              Collection: {filters.collectionStatus}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ collectionStatus: 'All' })}
              />
            </span>
          )}

          <button
            onClick={onClearFilters}
            className="text-xs font-bold text-slate-500 hover:text-red-600 cursor-pointer underline ml-auto border-none bg-transparent"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
