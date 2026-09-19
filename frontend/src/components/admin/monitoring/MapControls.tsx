import React from 'react';
import { ZoomIn, ZoomOut, Crosshair, Layers } from 'lucide-react';

interface MapControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onLocateFleet: () => void;
  layers: {
    bins: boolean;
    vehicles: boolean;
    routes: boolean;
    zones: boolean;
  };
  onToggleLayer: (layer: 'bins' | 'vehicles' | 'routes' | 'zones') => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFitView,
  onLocateFleet,
  layers,
  onToggleLayer,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border-b border-slate-200 text-xs">
      <div className="flex items-center gap-2 font-semibold text-slate-700">
        <Layers className="w-4 h-4 text-emerald-700" />
        <span>Vector Operations Grid</span>
        <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
          7 Operational Zones
        </span>
      </div>

      {/* Layer Toggles & Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          <label className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.bins}
              onChange={() => onToggleLayer('bins')}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span>Bins</span>
          </label>
          <span className="text-slate-300">•</span>
          <label className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.vehicles}
              onChange={() => onToggleLayer('vehicles')}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span>Vehicles</span>
          </label>
          <span className="text-slate-300">•</span>
          <label className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.routes}
              onChange={() => onToggleLayer('routes')}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span>Routes</span>
          </label>
          <span className="text-slate-300">•</span>
          <label className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={layers.zones}
              onChange={() => onToggleLayer('zones')}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span>Zones</span>
          </label>
        </div>

        <div className="flex items-center gap-1 border border-slate-300 rounded bg-white overflow-hidden">
          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 text-slate-700 cursor-pointer border-none bg-transparent"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] px-1 font-mono text-slate-500">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 text-slate-700 cursor-pointer border-none bg-transparent"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onFitView}
          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded cursor-pointer transition-colors"
        >
          Fit View
        </button>

        <button
          onClick={onLocateFleet}
          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded cursor-pointer transition-colors flex items-center gap-1"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
          <span>Locate Fleet</span>
        </button>
      </div>
    </div>
  );
};

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 shadow-sm text-[11px] text-slate-600 flex items-center gap-3">
      <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Legend:</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
        <span>Normal Bin (&lt;75%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
        <span>Warning (75-89%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block" />
        <span>Critical (&gt;90%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
        <span>Offline Bin</span>
      </div>
      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
        <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
          TRK
        </span>
        <span>Vehicle</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-0.5 bg-emerald-500 inline-block" />
        <span>Active Route</span>
      </div>
    </div>
  );
};
