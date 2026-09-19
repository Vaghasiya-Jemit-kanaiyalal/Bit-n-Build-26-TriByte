import React from 'react';
import type { SmartBin, BinSortState } from '../../../types/bin';
import { BinTableRow } from './BinTableRow';
import { ArrowUpDown, Trash2 } from 'lucide-react';

interface BinTableProps {
  bins: SmartBin[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  sort: BinSortState;
  onSortChange: (sort: BinSortState) => void;
  onViewDetails: (bin: SmartBin) => void;
  onEditBin: (bin: SmartBin) => void;
  onViewLocation: (bin: SmartBin) => void;
  onViewHistory: (bin: SmartBin) => void;
  onPrioritize: (bin: SmartBin) => void;
  onDeactivate: (bin: SmartBin) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const BinTable: React.FC<BinTableProps> = ({
  bins,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  sort,
  onSortChange,
  onViewDetails,
  onEditBin,
  onViewLocation,
  onViewHistory,
  onPrioritize,
  onDeactivate,
  onClearFilters,
  isLoading = false,
}) => {
  const isAllSelected = bins.length > 0 && bins.every((b) => selectedIds.includes(b.id));

  const handleSortClick = (field: BinSortState['field']) => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ field, direction: 'desc' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-4 shadow-xs">
        <div className="w-8 h-8 rounded-full border-3 border-[#047857] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Updating bin network telemetry...</p>
      </div>
    );
  }

  if (bins.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 m-0">No bins match your current filters</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try changing your search query or removing some of your active filter parameters.
        </p>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-md cursor-pointer border-none"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
              {/* Select All Checkbox */}
              <th className="p-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-[#047857] focus:ring-[#047857] cursor-pointer"
                />
              </th>

              <th className="py-3 px-2">Status</th>

              {/* Bin ID Sortable */}
              <th
                onClick={() => handleSortClick('id')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Bin ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-3">Location</th>

              {/* Zone Sortable */}
              <th
                onClick={() => handleSortClick('zone' as any)}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Zone</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Fill Level Sortable */}
              <th
                onClick={() => handleSortClick('currentFillPercent')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Fill Level</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bins.map((bin) => (
              <BinTableRow
                key={bin.id}
                bin={bin}
                isSelected={selectedIds.includes(bin.id)}
                onToggleSelect={onToggleSelect}
                onViewDetails={onViewDetails}
                onEditBin={onEditBin}
                onViewLocation={onViewLocation}
                onViewHistory={onViewHistory}
                onPrioritize={onPrioritize}
                onDeactivate={onDeactivate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
