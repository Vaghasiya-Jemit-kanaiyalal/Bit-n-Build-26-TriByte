import React, { useState } from 'react';
import { Truck, Plus, Minus, RotateCcw, Navigation, Radio } from 'lucide-react';
import type { DriverRouteStop, RouteStatus } from '../../../types/driver';

interface RouteMapProps {
  stops: DriverRouteStop[];
  routeStatus?: RouteStatus;
  selectedStopId?: string;
  onSelectStop: (stop: DriverRouteStop) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  stops,
  routeStatus: _routeStatus,
  selectedStopId,
  onSelectStop,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLiveSimulation, setIsLiveSimulation] = useState<boolean>(true);

  // Generate SVG polyline path string connecting stop coordinates
  const pathPoints = stops.map((s) => `${s.coordinates.x * 8},${s.coordinates.y * 5}`).join(' ');

  // Current active stop or vehicle position
  const currentStop = stops.find((s) => s.status === 'CURRENT' || s.status === 'COLLECTING') || stops[0];
  const vehicleX = currentStop ? currentStop.coordinates.x * 8 : 400;
  const vehicleY = currentStop ? currentStop.coordinates.y * 5 : 250;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col relative text-white">
      {/* Map Header Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Field Operational GIS Map</span>
            <span className="text-[10px] text-slate-400">Live GPS tracking & waypoint route path</span>
          </div>
        </div>

        {/* Live Simulation Indicator & Map Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveSimulation(!isLiveSimulation)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
              isLiveSimulation
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveSimulation ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLiveSimulation ? 'LIVE' : 'PAUSED'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-slate-300">
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
              className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Workspace */}
      <div className="relative w-full h-[320px] sm:h-[420px] bg-[#0b1329] overflow-hidden select-none">
        {/* Grid Lines Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Scaled Interactive Canvas */}
        <div
          className="w-full h-full transition-transform duration-300 relative"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <svg className="w-full h-full min-w-[800px] min-h-[500px]" viewBox="0 0 800 500">
            {/* Simulated Road Network lines */}
            <path d="M 50 100 Q 200 80 400 200 T 750 400" fill="none" stroke="#1e293b" strokeWidth="14" />
            <path d="M 100 450 Q 300 300 500 100 T 750 100" fill="none" stroke="#1e293b" strokeWidth="14" />

            {/* Active Planned Route Polyline */}
            <polyline
              points={pathPoints}
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeDasharray="6 4"
              className="animate-pulse"
            />

            {/* Waypoint Markers */}
            {stops.map((stop) => {
              const cx = stop.coordinates.x * 8;
              const cy = stop.coordinates.y * 5;
              const isSelected = selectedStopId === stop.id;
              const isCurrent = stop.status === 'CURRENT' || stop.status === 'COLLECTING';
              const isCompleted = stop.status === 'COMPLETED';
              const isSkipped = stop.status === 'SKIPPED';

              let markerColor = '#64748b'; // default neutral
              if (isCompleted) markerColor = '#10b981'; // green
              if (isCurrent) markerColor = '#ef4444'; // critical red highlight
              if (isSkipped) markerColor = '#f59e0b'; // amber

              return (
                <g
                  key={stop.id}
                  onClick={() => onSelectStop(stop)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring for current stop */}
                  {isCurrent && (
                    <circle cx={cx} cy={cy} r="18" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? '14' : '10'}
                    fill="#0f172a"
                    stroke={markerColor}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Inner text number */}
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {stop.sequence}
                  </text>

                  {/* Tooltip on hover */}
                  <title>{`${stop.sequence}. ${stop.binId} - ${stop.location} (${stop.fillLevel}% full)`}</title>
                </g>
              );
            })}

            {/* Moving Vehicle Truck Marker */}
            {currentStop && (
              <g transform={`translate(${vehicleX - 12}, ${vehicleY - 12})`} className="transition-all duration-1000">
                <circle cx="12" cy="12" r="16" fill="rgba(16, 185, 129, 0.3)" />
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
                <Truck x="4" y="4" width="16" height="16" color="#ffffff" />
              </g>
            )}
          </svg>
        </div>

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-[11px] font-semibold flex flex-wrap items-center gap-3 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-bold">Current Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-300">Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Skipped</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
