import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Crosshair, Truck, MapPin, RotateCcw, Activity } from 'lucide-react';
import type { BinStop } from '../../mock/routeData';

import { showWebsiteToast } from '../common/NotificationToast';

interface RouteMapProps {
  stops: BinStop[];
  onSelectBin?: (stop: BinStop) => void;
  selectedBinId?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  stops,
  onSelectBin,
  selectedBinId,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');

  // Coordinates for mock SVG layout
  const mapWidth = 720;
  const mapHeight = 440;

  const mockPoints = [
    { id: 'start', label: 'Depot Start', x: 70, y: 370, type: 'start' },
    { id: 'BIN-104', label: 'Central Cafeteria (96%)', x: 220, y: 130, status: 'Critical', fill: 96 },
    { id: 'BIN-217', label: 'North Gate (91%)', x: 340, y: 90, status: 'Critical', fill: 91 },
    { id: 'BIN-083', label: 'Library Block (78%)', x: 440, y: 180, status: 'High', fill: 78 },
    { id: 'BIN-142', label: 'Sports Complex (74%)', x: 580, y: 220, status: 'Completed', fill: 74 },
    { id: 'BIN-099', label: 'Student Center (88%)', x: 310, y: 240, status: 'Completed', fill: 88 },
    { id: 'BIN-112', label: 'Engineering Annex (65%)', x: 180, y: 290, status: 'Completed', fill: 65 },
    { id: 'BIN-[#401]', label: 'Hostel Block 1 (82%)', x: 500, y: 310, status: 'Completed', fill: 82 },
    { id: 'BIN-305', label: 'Science Bldg (85%)', x: 620, y: 120, status: 'Pending', fill: 85 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full">
      {/* Map Control Toolbar - Monitoring Map Style */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700">
            <MapPin className="w-4 h-4" />
          </span>
          <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            Route Execution Map
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              LIVE GPS
            </span>
          </span>
          {/* 2-View Mode Switcher Tabs */}
          <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center gap-1 border border-slate-300/60 ml-2">
            <button
              onClick={() => setMapMode('vector')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border-none ${
                mapMode === 'vector'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Vector Grid
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border-none ${
                mapMode === 'satellite'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Realistic Satellite
            </button>
          </div>
        </div>

        {/* Map Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-300/80 rounded-xl bg-white overflow-hidden p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-100 text-slate-700 cursor-pointer border-none bg-transparent transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1 font-mono text-slate-600 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-100 text-slate-700 cursor-pointer border-none bg-transparent transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoomLevel(1)}
            className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-300/80 hover:bg-slate-100 rounded-xl cursor-pointer shadow-2xs transition-all"
          >
            Fit Route
          </button>
          <button
            onClick={() => showWebsiteToast('Centered map focus on vehicle TRK-04.', 'info', 'Map View')}
            className="px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs transition-all"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
            <span>Center Vehicle</span>
          </button>
        </div>
      </div>

      {/* Map Interactive SVG Canvas */}
      <div className={`relative flex-1 overflow-hidden min-h-[360px] flex items-center justify-center p-2 ${
        mapMode === 'satellite' ? 'bg-slate-950' : 'bg-slate-900'
      }`}>
        
        {/* Realistic Satellite Background */}
        {mapMode === 'satellite' ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75 transition-opacity duration-300"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')`,
            }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* SVG Container */}
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <svg width={mapWidth} height={mapHeight} className="overflow-visible">
            {/* Zone Boundaries */}
            <rect x="30" y="30" width="340" height="380" rx="14" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="45" y="55" fill="#10b981" fontSize="11" fontWeight="800" letterSpacing="0.05em">ZONE A (NORTH CAMPUS)</text>

            <rect x="390" y="30" width="300" height="380" rx="14" fill="rgba(59, 130, 246, 0.05)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="405" y="55" fill="#3b82f6" fontSize="11" fontWeight="800" letterSpacing="0.05em">ZONE B (CENTRAL &amp; EAST)</text>

            {/* Completed Path Segment (Emerald Green) */}
            <path
              d="M 70 370 L 180 290 L 310 240 L 500 310 L 580 220"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Path Segment (Sky Blue) */}
            <path
              d="M 580 220 L 440 180 L 220 130 L 340 90 L 620 120"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Depot Start Node */}
            <g transform="translate(70, 370)">
              <circle r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle">DEPOT</text>
            </g>

            {/* Active Vehicle Position (TRK-04) */}
            <g transform="translate(440, 180)" className="cursor-pointer">
              <circle r="20" fill="#38bdf8" fillOpacity="0.3" className="animate-ping" />
              <circle r="15" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <foreignObject x="-9" y="-9" width="18" height="18">
                <Truck className="w-4.5 h-4.5 text-white" />
              </foreignObject>
              <rect x="-26" y="-34" width="52" height="18" rx="6" fill="#0f172a" />
              <text x="0" y="-21" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">TRK-04</text>
            </g>

            {/* Bin Stop Markers */}
            {mockPoints.map((pt) => {
              if (pt.type === 'start') return null;
              const isSelected = selectedBinId === pt.id;
              const isCritical = pt.status === 'Critical';
              const isHigh = pt.status === 'High';
              const isCompleted = pt.status === 'Completed';

              let fillColor = '#64748b';
              if (isCritical) fillColor = '#ef4444';
              else if (isHigh) fillColor = '#f59e0b';
              else if (isCompleted) fillColor = '#10b981';

              const stopData = stops.find((s) => s.binId === pt.id);

              return (
                <g
                  key={pt.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  onClick={() => stopData && onSelectBin && onSelectBin(stopData)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <circle r={isSelected ? "15" : "12"} fill={fillColor} stroke="#ffffff" strokeWidth="2" />
                  <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {pt.fill}%
                  </text>

                  {/* Label tooltip */}
                  <rect x="-48" y="-32" width="96" height="18" rx="4" fill="#0f172a" fillOpacity="0.9" />
                  <text x="0" y="-20" fill="#ffffff" fontSize="8 font-bold" textAnchor="middle">
                    {pt.id} &bull; {pt.fill}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Map Legend Footer - Monitoring Map Style */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-600 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Active Route Segment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pending Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Critical Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>Vehicle TRK-04</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Live GPS Route Sync &bull; 8 Stops Total
        </span>
      </div>
    </div>
  );
};

export default RouteMap;
