import React, { useState } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Truck,
} from 'lucide-react';
import type {
  DashboardMapBinMarker,
  DashboardMapVehicleMarker,
  DashboardMapRoutePolyline,
} from '../../../types/dashboard';

interface DashboardMapProps {
  bins: DashboardMapBinMarker[];
  vehicles: DashboardMapVehicleMarker[];
  routes: DashboardMapRoutePolyline[];
  onSelectBin: (bin: DashboardMapBinMarker) => void;
  onSelectVehicle: (vehicle: DashboardMapVehicleMarker) => void;
  onSelectRoute: (route: DashboardMapRoutePolyline) => void;
}

export const DashboardMap: React.FC<DashboardMapProps> = ({
  bins,
  vehicles,
  routes,
  onSelectBin,
  onSelectVehicle,
  onSelectRoute: _onSelectRoute,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showBins, setShowBins] = useState<boolean>(true);
  const [showVehicles, setShowVehicles] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Map Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <MapPin className="w-4 h-4 text-[#047857]" />
            <h3 className="text-sm font-bold text-slate-900 m-0">Live Operations Command Map</h3>
            
            {/* 2-View Mode Switcher Tabs */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center gap-1 border border-slate-300/60 text-xs ml-2">
              <button
                onClick={() => setMapMode('vector')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  mapMode === 'vector'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vector Grid
              </button>
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  mapMode === 'satellite'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Realistic Satellite
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time municipal waste bin fill levels, active collection fleet, and route lines.
          </p>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Toggles */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-100 p-1 rounded-xl border border-slate-200">
            <label className="flex items-center gap-1 cursor-pointer px-1.5 py-0.5 hover:bg-white rounded">
              <input
                type="checkbox"
                checked={showBins}
                onChange={(e) => setShowBins(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Bins</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer px-1.5 py-0.5 hover:bg-white rounded">
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Vehicles</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer px-1.5 py-0.5 hover:bg-white rounded">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Routes</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer px-1.5 py-0.5 hover:bg-white rounded">
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Zones</span>
            </label>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))}
              className="p-1.5 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
              className="p-1.5 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Operational Map Graphic */}
      <div className={`relative w-full h-80 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 shadow-inner ${
        mapMode === 'satellite' ? 'bg-slate-950' : 'bg-slate-900'
      }`}>
        {/* Background Graphic */}
        {mapMode === 'satellite' ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75 transition-transform duration-300"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')`,
              transform: `scale(${zoomLevel})`,
            }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-20 transition-transform duration-300"
            style={{
              backgroundImage: `radial-gradient(#334155 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
              transform: `scale(${zoomLevel})`,
            }}
          />
        )}

        {/* Zone Outlines */}
        {showZones && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoomLevel})` }}>
            <rect x="5%" y="8%" width="38%" height="80%" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" strokeDasharray="4 2" rx="14" />
            <text x="7%" y="16%" fill="#10b981" fontSize="10" fontWeight="bold" opacity="0.7">CENTRAL ACADEMIC ZONE</text>

            <rect x="47%" y="8%" width="48%" height="38%" fill="rgba(59, 130, 246, 0.04)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" strokeDasharray="4 2" rx="14" />
            <text x="49%" y="16%" fill="#3b82f6" fontSize="10" fontWeight="bold" opacity="0.7">RESIDENTIAL HOSTEL ZONE</text>

            <rect x="47%" y="50%" width="48%" height="42%" fill="rgba(245, 158, 11, 0.04)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" strokeDasharray="4 2" rx="14" />
            <text x="49%" y="58%" fill="#f59e0b" fontSize="10" fontWeight="bold" opacity="0.7">INDUSTRIAL & SOUTH ZONE</text>
          </svg>
        )}

        {/* Route Lines */}
        {showRoutes && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoomLevel})` }}>
            {routes.map((rt) => (
              <polyline
                key={rt.id}
                points={rt.points.map((p) => `${p.x}%,${p.y}%`).join(' ')}
                fill="none"
                stroke={rt.color}
                strokeWidth="2.5"
                strokeDasharray="6 3"
                opacity="0.85"
              />
            ))}
          </svg>
        )}

        {/* Dynamic Markers */}
        <div className="absolute inset-0 w-full h-full transition-transform duration-300" style={{ transform: `scale(${zoomLevel})` }}>
          {/* Bin Markers */}
          {showBins &&
            bins.map((bin) => {
              let bg = 'bg-emerald-600';
              if (bin.status === 'CRITICAL') bg = 'bg-red-600 animate-bounce';
              else if (bin.status === 'WARNING') bg = 'bg-amber-500';
              else if (bin.status === 'OFFLINE') bg = 'bg-slate-600';

              return (
                <button
                  key={bin.id}
                  onClick={() => onSelectBin(bin)}
                  style={{ left: `${bin.coordinates.x}%`, top: `${bin.coordinates.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer border-none bg-transparent"
                >
                  <div className={`px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-white/30 ${bg}`}>
                    <span>{bin.binCode}</span>
                    <span className="opacity-90 font-mono">({bin.fillLevel}%)</span>
                  </div>

                  {/* Hover Card */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 w-44 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 text-[11px] text-left border border-slate-700">
                    <div className="font-bold text-emerald-400">{bin.location}</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Fill Level: {bin.fillLevel}% &bull; {bin.wasteType}</div>
                    <div className="text-[10px] text-red-400 font-bold mt-0.5">Overflow ETA: {bin.timeToOverflow}</div>
                  </div>
                </button>
              );
            })}

          {/* Vehicle Markers */}
          {showVehicles &&
            vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                style={{ left: `${v.coordinates.x}%`, top: `${v.coordinates.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer border-none bg-transparent"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-400/50">
                  <Truck className="w-4 h-4" />
                </div>

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 w-44 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 text-[11px] text-left border border-slate-700">
                  <div className="font-bold text-blue-400">{v.vehicleCode} ({v.driverName})</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Route: {v.currentRoute}</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Load Capacity: {v.loadPercentage}%</div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Map Legend & Summary Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Normal &lt;75%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Warning 75-90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Critical &gt;90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Vehicle</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-700 font-mono">
          <span>236 Online Bins</span>
          <span>&bull;</span>
          <span className="text-red-600">14 Critical Bins</span>
          <span>&bull;</span>
          <span className="text-blue-600">18 Active Vehicles</span>
        </div>
      </div>
    </div>
  );
};
