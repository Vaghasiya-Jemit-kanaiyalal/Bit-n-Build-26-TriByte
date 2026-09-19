import React, { useState, useRef } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Truck,
  Layers,
  Crosshair,
  Activity,
  AlertTriangle,
  RotateCcw,
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

  // Drag and Pan states
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-marker')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: Math.min(300, Math.max(-300, e.clientX - dragStart.x)),
      y: Math.min(250, Math.max(-250, e.clientY - dragStart.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Map Header Toolbar - Monitoring Map Style */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="p-1 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 m-0 flex items-center gap-2">
              Live Command Map
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                ACTIVE
              </span>
            </h3>
            
            {/* 2-View Mode Switcher Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs ml-2">
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
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time municipal waste bin telemetry, collection fleet tracking, and dynamic route polylines.
          </p>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Toggles */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 hover:bg-white rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={showBins}
                onChange={(e) => setShowBins(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Bins</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 hover:bg-white rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Vehicles</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 hover:bg-white rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Routes</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 hover:bg-white rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span>Zones</span>
            </label>
          </div>

          {/* Zoom & Pan Controls */}
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))}
              className="p-1.5 hover:bg-white rounded-lg cursor-pointer border-none bg-transparent transition-colors text-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
              className="p-1.5 hover:bg-white rounded-lg cursor-pointer border-none bg-transparent transition-colors text-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-white rounded-lg cursor-pointer border-none bg-transparent transition-colors text-slate-700"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Operational Map Graphic Canvas */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-[400px] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 shadow-inner cursor-grab active:cursor-grabbing select-none ${
          mapMode === 'satellite' ? 'bg-slate-950' : 'bg-slate-900'
        }`}
      >
        {/* Background Graphic */}
        {mapMode === 'satellite' ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75 transition-transform duration-100"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')`,
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
            }}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-25 transition-transform duration-100"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px)`,
              backgroundSize: '28px 28px',
              transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
            }}
          />
        )}

        {/* Map Vector Canvas Elements */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-100"
          style={{ transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)` }}
        >
          {/* Zone Outlines */}
          {showZones && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect x="5%" y="8%" width="38%" height="80%" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="4 2" rx="14" />
              <text x="7%" y="16%" fill="#10b981" fontSize="10" fontWeight="bold" opacity="0.85">CENTRAL ACADEMIC ZONE</text>

              <rect x="47%" y="8%" width="48%" height="38%" fill="rgba(59, 130, 246, 0.05)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1.5" strokeDasharray="4 2" rx="14" />
              <text x="49%" y="16%" fill="#3b82f6" fontSize="10" fontWeight="bold" opacity="0.85">RESIDENTIAL HOSTEL ZONE</text>

              <rect x="47%" y="50%" width="48%" height="42%" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" strokeDasharray="4 2" rx="14" />
              <text x="49%" y="58%" fill="#f59e0b" fontSize="10" fontWeight="bold" opacity="0.85">INDUSTRIAL & SOUTH ZONE</text>
            </svg>
          )}

          {/* Route Lines */}
          {showRoutes && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {routes.map((rt) => (
                <polyline
                  key={rt.id}
                  points={rt.points.map((p) => `${p.x}%,${p.y}%`).join(' ')}
                  fill="none"
                  stroke={rt.color}
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  opacity="0.9"
                />
              ))}
            </svg>
          )}

          {/* Bin Markers */}
          {showBins &&
            bins.map((bin) => {
              let bg = 'bg-emerald-600';
              if (bin.status === 'CRITICAL') bg = 'bg-red-600 animate-pulse';
              else if (bin.status === 'WARNING') bg = 'bg-amber-500';
              else if (bin.status === 'OFFLINE') bg = 'bg-slate-600';

              return (
                <button
                  key={bin.id}
                  onClick={() => onSelectBin(bin)}
                  style={{ left: `${bin.coordinates.x}%`, top: `${bin.coordinates.y}%` }}
                  className="interactive-marker absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer border-none bg-transparent z-20"
                >
                  <div className={`px-2 py-0.5 rounded-full text-white text-[10px] font-black shadow-md flex items-center gap-1 border border-white/40 ${bg}`}>
                    <span>{bin.binCode}</span>
                    <span className="opacity-90 font-mono">({bin.fillLevel}%)</span>
                  </div>

                  {/* Hover Detail Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 text-[11px] text-left border border-slate-700">
                    <div className="font-extrabold text-emerald-400">{bin.location}</div>
                    <div className="text-[10px] text-slate-300 mt-1">Fill: <strong className="text-white">{bin.fillLevel}%</strong> &bull; {bin.wasteType}</div>
                    <div className="text-[10px] text-red-400 font-bold mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Overflow ETA: {bin.timeToOverflow}</span>
                    </div>
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
                className="interactive-marker absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer border-none bg-transparent z-30"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-400/50 group-hover:scale-110 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 text-[11px] text-left border border-slate-700">
                  <div className="font-extrabold text-blue-400">{v.vehicleCode} ({v.driverName})</div>
                  <div className="text-[10px] text-slate-300 mt-1">Route: <strong className="text-white">{v.currentRoute}</strong></div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Capacity: {v.loadPercentage}%</div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Map Legend & Summary Bar - Monitoring Map Style */}
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
          <span className="text-blue-600">18 Active Fleet</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
