import React, { useState } from 'react';
import type { MonitoredBin, MonitoredVehicle, MonitoredRoute } from '../../../types/monitoring';
import { MapControls, MapLegend } from './MapControls';
import { Maximize2, X } from 'lucide-react';

interface MonitoringMapProps {
  bins: MonitoredBin[];
  vehicles: MonitoredVehicle[];
  routes: MonitoredRoute[];
  selectedBinId?: string;
  selectedVehicleId?: string;
  selectedRouteId?: string;
  onSelectBin: (bin: MonitoredBin) => void;
  onSelectVehicle: (vehicle: MonitoredVehicle) => void;
  onSelectRoute: (route: MonitoredRoute) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MonitoringMap: React.FC<MonitoringMapProps> = ({
  bins,
  vehicles,
  routes,
  selectedBinId,
  selectedVehicleId,
  selectedRouteId,
  onSelectBin,
  onSelectVehicle,
  onSelectRoute,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'bin' | 'vehicle' | 'route';
    title: string;
    subtext: string;
    x: number;
    y: number;
  } | null>(null);

  const [layers, setLayers] = useState({
    bins: true,
    vehicles: true,
    routes: true,
    zones: true,
  });

  const handleToggleLayer = (layer: 'bins' | 'vehicles' | 'routes' | 'zones') => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const mapWidth = 1000;
  const mapHeight = 560;

  // Render Status Color for Bins
  const getBinColor = (status: MonitoredBin['status'], fill: number) => {
    if (status === 'Offline') return '#9ca3af'; // gray
    if (fill >= 90 || status === 'Critical') return '#dc2626'; // red
    if (fill >= 75 || status === 'Warning') return '#d97706'; // amber
    return '#059669'; // emerald
  };

  // Render Status Color for Vehicles
  const getVehicleColor = (status: MonitoredVehicle['status']) => {
    if (status === 'ON ROUTE') return '#2563eb'; // blue
    if (status === 'IDLE') return '#059669'; // emerald
    if (status === 'MAINTENANCE') return '#d97706'; // amber
    return '#6b7280'; // gray
  };

  // Convert coordinate percentages to SVG pixels
  const toSvgX = (pct: number) => (pct / 100) * mapWidth;
  const toSvgY = (pct: number) => (pct / 100) * mapHeight;

  // Render Municipal Zone Polygon Regions
  const zonePolygons = [
    { name: 'North Zone', path: 'M 200,30 L 600,30 L 550,200 L 250,200 Z', color: '#f1f5f9', stroke: '#cbd5e1' },
    { name: 'Central Zone', path: 'M 250,200 L 550,200 L 620,380 L 220,380 Z', color: '#ecfdf5', stroke: '#a7f3d0' },
    { name: 'Industrial Zone', path: 'M 600,30 L 970,30 L 970,380 L 620,380 Z', color: '#fff7ed', stroke: '#fed7aa' },
    { name: 'East Zone', path: 'M 550,200 L 970,200 L 970,380 L 620,380 Z', color: '#eff6ff', stroke: '#bfdbfe' },
    { name: 'West Zone', path: 'M 30,30 L 200,30 L 250,200 L 30,380 Z', color: '#f8fafc', stroke: '#e2e8f0' },
    { name: 'Residential Zone', path: 'M 30,380 L 350,380 L 300,530 L 30,530 Z', color: '#faf5ff', stroke: '#e9d5ff' },
    { name: 'South Zone', path: 'M 350,380 L 970,380 L 970,530 L 300,530 Z', color: '#f0fdf4', stroke: '#bbf7d0' },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'relative h-full min-h-[500px]'
      }`}
    >
      {/* Top Map Toolbar */}
      <MapControls
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
        onFitView={() => setZoomLevel(1)}
        onLocateFleet={() => setZoomLevel(1.2)}
        layers={layers}
        onToggleLayer={handleToggleLayer}
      />

      {/* Main Map SVG Canvas */}
      <div className="relative flex-1 bg-slate-100/90 overflow-hidden flex items-center justify-center p-2 min-h-[420px]">
        {/* Subtle Map Vector Grid Pattern */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Container with Zoom Scale */}
        <div
          className="relative transition-transform duration-300 ease-out w-full h-full flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full max-h-[600px] select-none"
          >
            {/* 1. Zone Polygons */}
            {layers.zones &&
              zonePolygons.map((z) => (
                <g key={z.name}>
                  <path d={z.path} fill={z.color} stroke={z.stroke} strokeWidth="1.5" opacity="0.8" />
                </g>
              ))}

            {/* Road Grid Lines */}
            <g stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,4" opacity="0.4">
              <line x1="50" y1="200" x2="950" y2="200" />
              <line x1="50" y1="380" x2="950" y2="380" />
              <line x1="250" y1="30" x2="250" y2="530" />
              <line x1="600" y1="30" x2="600" y2="530" />
            </g>

            {/* Zone Labels */}
            {layers.zones && (
              <g className="text-[11px] font-extrabold fill-slate-400 select-none uppercase tracking-wider">
                <text x="380" y="110">NORTH ZONE</text>
                <text x="360" y="290">CENTRAL ZONE</text>
                <text x="750" y="180">INDUSTRIAL ZONE</text>
                <text x="760" y="290">EAST ZONE</text>
                <text x="110" y="210">WEST ZONE</text>
                <text x="120" y="440">RESIDENTIAL ZONE</text>
                <text x="600" y="450">SOUTH ZONE</text>
              </g>
            )}

            {/* 2. Route Polylines */}
            {layers.routes &&
              routes.map((r) => {
                const isSelected = selectedRouteId === r.id;
                const pointsStr = r.pathPoints.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
                return (
                  <g key={r.id} onClick={() => onSelectRoute(r)} className="cursor-pointer group">
                    <polyline
                      points={pointsStr}
                      fill="none"
                      stroke={r.status === 'On Schedule' ? '#10b981' : '#f59e0b'}
                      strokeWidth={isSelected ? '5' : '3'}
                      strokeDasharray={r.status === 'Delayed' ? '6,4' : 'none'}
                      opacity={isSelected ? '1' : '0.7'}
                      className="transition-all hover:stroke-emerald-400"
                    />
                  </g>
                );
              })}

            {/* 3. Bin Markers */}
            {layers.bins &&
              bins.map((bin) => {
                const bx = toSvgX(bin.x);
                const by = toSvgY(bin.y);
                const isSelected = selectedBinId === bin.id;
                const color = getBinColor(bin.status, bin.fillPercent);

                return (
                  <g
                    key={bin.id}
                    transform={`translate(${bx}, ${by})`}
                    onClick={() => onSelectBin(bin)}
                    onMouseEnter={() =>
                      setHoveredEntity({
                        type: 'bin',
                        title: `${bin.binCode} • ${bin.fillPercent}% Fill`,
                        subtext: `${bin.location} (${bin.status})`,
                        x: bx,
                        y: by,
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  >
                    {/* Ring for critical */}
                    {bin.fillPercent >= 90 && (
                      <circle r="14" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping opacity-75" />
                    )}

                    <circle
                      r={isSelected ? '11' : '8'}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-md"
                    />

                    {/* Fill percent label inside marker if space */}
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {bin.fillPercent}
                    </text>
                  </g>
                );
              })}

            {/* 4. Vehicle Markers */}
            {layers.vehicles &&
              vehicles.map((v) => {
                const vx = toSvgX(v.x);
                const vy = toSvgY(v.y);
                const isSelected = selectedVehicleId === v.id;
                const color = getVehicleColor(v.status);

                return (
                  <g
                    key={v.id}
                    transform={`translate(${vx}, ${vy})`}
                    onClick={() => onSelectVehicle(v)}
                    onMouseEnter={() =>
                      setHoveredEntity({
                        type: 'vehicle',
                        title: `${v.vehicleCode} (${v.driver})`,
                        subtext: `Status: ${v.status} • Speed: ${v.speedKmH}km/h • Load: ${v.utilizationPercent}%`,
                        x: vx,
                        y: vy,
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  >
                    <rect
                      x="-12"
                      y="-12"
                      width="24"
                      height="24"
                      rx="6"
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '3' : '2'}
                      className="shadow-lg"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      TRK
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* Hover Tooltip Popup */}
          {hoveredEntity && (
            <div
              className="absolute z-30 bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none text-xs space-y-0.5"
              style={{
                left: `${(hoveredEntity.x / mapWidth) * 100}%`,
                top: `${(hoveredEntity.y / mapHeight) * 100}%`,
                transform: 'translate(-50%, -120%)',
              }}
            >
              <p className="font-bold text-white leading-tight">{hoveredEntity.title}</p>
              <p className="text-[11px] text-slate-300 font-mono">{hoveredEntity.subtext}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Legend */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <MapLegend />

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Exit Fullscreen Map</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Fullscreen Map</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
