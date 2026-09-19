import React from 'react';
import type { UserRole } from '../../../types/user';
import { CheckCircle2, XCircle, Download, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkChangeRole: (role: UserRole) => void;
  onBulkAssignZone: (zone: string) => void;
  onBulkExport: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate,
  onBulkChangeRole,
  onBulkAssignZone,
  onBulkExport,
}) => {
  if (selectedCount === 0) return null;

  const zones = ['Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Industrial Zone', 'Residential Zone'];

  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-between bg-slate-900 text-white p-3 px-4 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3">
        <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-500/30">
          {selectedCount} {selectedCount === 1 ? 'user' : 'users'} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear selection
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Bulk Activate */}
        <button
          onClick={onBulkActivate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Activate
        </button>

        {/* Bulk Deactivate */}
        <button
          onClick={onBulkDeactivate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Deactivate
        </button>

        {/* Bulk Change Role */}
        <div className="relative group">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onBulkChangeRole(e.target.value as UserRole);
                e.target.value = '';
              }
            }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white rounded-md focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Change Role...
            </option>
            <option value="COLLECTOR">Set Role: Collector</option>
            <option value="VIEWER">Set Role: Viewer</option>
          </select>
        </div>

        {/* Bulk Assign Zone */}
        <div className="relative group">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onBulkAssignZone(e.target.value);
                e.target.value = '';
              }
            }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white rounded-md focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Assign Zone...
            </option>
            {zones.map((z) => (
              <option key={z} value={z}>
                Assign to {z}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Export */}
        <button
          onClick={onBulkExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export ({selectedCount})
        </button>
      </div>
    </div>
  );
};
