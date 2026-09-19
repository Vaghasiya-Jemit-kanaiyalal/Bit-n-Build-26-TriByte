import React, { useState } from 'react';
import { Layers, Route as RouteIcon, Power, Download, X } from 'lucide-react';
import type { ZoneName } from '../../../types/bin';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAssignZone: (zone: ZoneName) => void;
  onBulkAssignRoute: (routeId: string) => void;
  onBulkDeactivate: () => void;
  onBulkExport: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAssignZone,
  onBulkAssignRoute,
  onBulkDeactivate,
  onBulkExport,
}) => {
  const [showZoneSelect, setShowZoneSelect] = useState(false);
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [routeInput, setRouteInput] = useState('R-104');

  if (selectedCount === 0) return null;

  return (
    <div className="bg-[#064e3b] text-white rounded-2xl p-3 px-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-slideUp">
      <div className="flex items-center gap-3">
        <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
          {selectedCount} BINS SELECTED
        </span>
        <span className="text-xs text-slate-200 font-medium hidden md:inline">
          Apply bulk operational updates
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Bulk Assign Zone Dropdown */}
        {showZoneSelect ? (
          <select
            autoFocus
            onChange={(e) => {
              if (e.target.value) {
                onBulkAssignZone(e.target.value as ZoneName);
                setShowZoneSelect(false);
              }
            }}
            onBlur={() => setShowZoneSelect(false)}
            className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold border-none"
          >
            <option value="">Choose Zone...</option>
            <option value="Central Zone">Central Zone</option>
            <option value="North Zone">North Zone</option>
            <option value="South Zone">South Zone</option>
            <option value="East Zone">East Zone</option>
            <option value="West Zone">West Zone</option>
            <option value="Industrial Zone">Industrial Zone</option>
            <option value="Residential Zone">Residential Zone</option>
          </select>
        ) : (
          <button
            onClick={() => setShowZoneSelect(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Assign Zone</span>
          </button>
        )}

        {/* Bulk Assign Route Input */}
        {showRouteInput ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={routeInput}
              onChange={(e) => setRouteInput(e.target.value)}
              placeholder="e.g. R-104"
              className="w-20 px-2.5 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold font-mono focus:outline-none"
            />
            <button
              onClick={() => {
                onBulkAssignRoute(routeInput);
                setShowRouteInput(false);
              }}
              className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold border-none cursor-pointer"
            >
              Apply
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowRouteInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
          >
            <RouteIcon className="w-3.5 h-3.5" />
            <span>Assign Route</span>
          </button>
        )}

        {/* Export Selected */}
        <button
          onClick={onBulkExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Bulk Deactivate */}
        <button
          onClick={onBulkDeactivate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all border border-red-400/40 cursor-pointer ml-1"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Deactivate</span>
        </button>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer border-none bg-transparent ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
