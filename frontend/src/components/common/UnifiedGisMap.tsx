import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Plus,
  Minus,
  RotateCcw,
  Truck,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  Layers,
} from 'lucide-react';
import { driverService } from '../../services/driver/driverService';

export interface RouteWaypoint {
  id: string;
  sequence: number;
  code: string;
  label: string;
  fillLevel: number;
  wasteType: string;
  status: 'COMPLETED' | 'CURRENT' | 'COLLECTING' | 'UPCOMING' | 'SKIPPED';
  x: number; // coordinate
  y: number; // coordinate
}

export interface GisRouteData {
  id: string;
  code: string;
  vehicleId: string;
  driverName?: string;
  zone?: string;
  color: string;
  truckColorBg: string;
  truckColorText: string;
  waypoints: RouteWaypoint[];
  currentStepIndex: number;
}

interface UnifiedGisMapProps {
  mode?: 'admin' | 'driver';
  driverId?: 'driver-1' | 'driver-2' | string; // driver-1 = Green route, driver-2 = Yellow route
  zoneName?: string;
  speedKmH?: number;
  selectedBinId?: string;
  selectedVehicleId?: string;
  selectedRouteId?: string;
  onSelectBin?: (bin: any) => void;
  onSelectVehicle?: (vehicle: any) => void;
  onSelectRoute?: (route: any) => void;
  onAddRoute?: (newRoute: GisRouteData) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  stepIntervalMs?: number;
  defaultPointIndex?: number; // for driver mode default point 2 (index 1)
  routesData?: GisRouteData[];
  onOperationPerform?: (action: 'MARK_COLLECTED' | 'SKIP_STOP') => void;
  showRouteSelector?: boolean;
  showAddRoute?: boolean;
}

export const defaultGisRoutes: GisRouteData[] = [
  // Route 1: TRK-01 (Green Route - Driver 1)
  {
    id: 'r-1',
    code: 'RT-001',
    vehicleId: 'TRK-01',
    driverName: 'Rahul Patel (Driver 1)',
    zone: 'Zone 1 (DEPSTAR Sector)',
    color: '#10b981',
    truckColorBg: 'bg-emerald-600',
    truckColorText: 'text-emerald-400 border-emerald-500/50',
    currentStepIndex: 0,
    waypoints: [
      { id: 'w-1-1', sequence: 1, code: 'BIN-101', label: 'Main Entrance Gate', fillLevel: 75, wasteType: 'Organic', status: 'CURRENT', x: 260, y: 140 },
      { id: 'w-1-2', sequence: 2, code: 'BIN-102', label: 'Academic Block A', fillLevel: 88, wasteType: 'General', status: 'UPCOMING', x: 280, y: 170 },
      { id: 'w-1-3', sequence: 3, code: 'BIN-103', label: 'Central Library Square', fillLevel: 94, wasteType: 'Paper', status: 'UPCOMING', x: 330, y: 220 },
      { id: 'w-1-4', sequence: 4, code: 'BIN-104', label: 'Science Auditorium', fillLevel: 76, wasteType: 'Plastic', status: 'UPCOMING', x: 420, y: 215 },
      { id: 'w-1-5', sequence: 5, code: 'BIN-105', label: 'Student Cafeteria Yard', fillLevel: 92, wasteType: 'Organic', status: 'UPCOMING', x: 470, y: 265 },
      { id: 'w-1-6', sequence: 6, code: 'BIN-110', label: 'Engineering Workshop', fillLevel: 65, wasteType: 'Metal', status: 'UPCOMING', x: 540, y: 225 },
      { id: 'w-1-7', sequence: 7, code: 'BIN-107', label: 'Hostel Sector North', fillLevel: 58, wasteType: 'General', status: 'UPCOMING', x: 580, y: 275 },
      { id: 'w-1-8', sequence: 8, code: 'BIN-108', label: 'Sports Complex Gate', fillLevel: 45, wasteType: 'Plastic', status: 'UPCOMING', x: 640, y: 315 },
    ],
  },
  // Route 2: TRK-02 (Blue Route - Admin Fleet)
  {
    id: 'r-2',
    code: 'RT-002',
    vehicleId: 'TRK-02',
    driverName: 'Fleet Unit 2',
    zone: 'Zone 2 (CSPIT Tech Sector)',
    color: '#3b82f6',
    truckColorBg: 'bg-blue-600',
    truckColorText: 'text-blue-400 border-blue-500/50',
    currentStepIndex: 0,
    waypoints: [
      { id: 'w-2-1', sequence: 1, code: 'BIN-201', label: 'DEPSTAR Academic Block', fillLevel: 55, wasteType: 'Plastic', status: 'CURRENT', x: 670, y: 285 },
      { id: 'w-2-2', sequence: 2, code: 'BIN-202', label: 'CSPIT Computer Lab Yard', fillLevel: 82, wasteType: 'E-Waste', status: 'UPCOMING', x: 720, y: 325 },
      { id: 'w-2-3', sequence: 3, code: 'BIN-203', label: 'University Canteen', fillLevel: 91, wasteType: 'Organic', status: 'UPCOMING', x: 750, y: 375 },
      { id: 'w-2-4', sequence: 4, code: 'BIN-204', label: 'Research Park Gate', fillLevel: 64, wasteType: 'General', status: 'UPCOMING', x: 800, y: 405 },
      { id: 'w-2-5', sequence: 5, code: 'BIN-205', label: 'Central Processing Hub', fillLevel: 40, wasteType: 'Metal', status: 'UPCOMING', x: 850, y: 445 },
    ],
  },
  // Route 3: TRK-03 (Yellow Route - Driver 2)
  {
    id: 'r-3',
    code: 'RT-003',
    vehicleId: 'TRK-03',
    driverName: 'Amit Shah (Driver 2)',
    zone: 'Zone 3 (Sayajigunj Hub)',
    color: '#f59e0b',
    truckColorBg: 'bg-amber-600',
    truckColorText: 'text-amber-400 border-amber-500/50',
    currentStepIndex: 0,
    waypoints: [
      { id: 'w-3-1', sequence: 1, code: 'BIN-301', label: 'Sayajigunj Circle Depot', fillLevel: 82, wasteType: 'General', status: 'CURRENT', x: 700, y: 65 },
      { id: 'w-3-2', sequence: 2, code: 'BIN-302', label: 'Alkapuri Market Plaza', fillLevel: 98, wasteType: 'Organic', status: 'UPCOMING', x: 780, y: 120 },
      { id: 'w-3-3', sequence: 3, code: 'BIN-304', label: 'Railway Station Square', fillLevel: 84, wasteType: 'Paper', status: 'UPCOMING', x: 830, y: 155 },
      { id: 'w-3-4', sequence: 4, code: 'BIN-305', label: 'Medical College Ward', fillLevel: 72, wasteType: 'Plastic', status: 'UPCOMING', x: 890, y: 195 },
      { id: 'w-3-5', sequence: 5, code: 'BIN-307', label: 'RC Dutt Road Complex', fillLevel: 50, wasteType: 'General', status: 'UPCOMING', x: 930, y: 235 },
    ],
  },
  // Route 4: TRK-04 (Red Route - Admin Fleet)
  {
    id: 'r-4',
    code: 'RT-004',
    vehicleId: 'TRK-04',
    driverName: 'Fleet Unit 4',
    zone: 'Zone 4 (Makarpura Logistics)',
    color: '#ef4444',
    truckColorBg: 'bg-red-600',
    truckColorText: 'text-red-400 border-red-500/50',
    currentStepIndex: 1,
    waypoints: [
      { id: 'w-4-1', sequence: 1, code: 'BIN-401', label: 'Makarpura GIDC Sector 1', fillLevel: 78, wasteType: 'Metal', status: 'COMPLETED', x: 215, y: 385 },
      { id: 'w-4-2', sequence: 2, code: 'BIN-402', label: 'Logistics Park Gate 4', fillLevel: 95, wasteType: 'General', status: 'CURRENT', x: 295, y: 395 },
      { id: 'w-4-3', sequence: 3, code: 'BIN-403', label: 'Waghodia Road Junction', fillLevel: 88, wasteType: 'Organic', status: 'UPCOMING', x: 350, y: 440 },
      { id: 'w-4-4', sequence: 4, code: 'BIN-404', label: 'Old Padra Road Plaza', fillLevel: 62, wasteType: 'Plastic', status: 'UPCOMING', x: 420, y: 435 },
      { id: 'w-4-5', sequence: 5, code: 'BIN-406', label: 'Subhanpura Complex', fillLevel: 44, wasteType: 'Paper', status: 'UPCOMING', x: 550, y: 475 },
    ],
  },
];

export const UnifiedGisMap: React.FC<UnifiedGisMapProps> = ({
  mode = 'admin',
  driverId = 'driver-1',
  zoneName = 'DEPSTAR Campus',
  speedKmH = 22,
  selectedBinId,
  selectedVehicleId: _selectedVehicleId,
  selectedRouteId: initialSelectedRouteId,
  onSelectBin,
  onSelectVehicle,
  onSelectRoute,
  onAddRoute,
  isFullscreen = false,
  onToggleFullscreen,
  defaultPointIndex: _defaultPointIndex = 0, // Point 1 default
  routesData = defaultGisRoutes,
  onOperationPerform: _onOperationPerform,
  showRouteSelector = false,
  showAddRoute = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [routesState, setRoutesState] = useState<GisRouteData[]>(routesData);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialSelectedRouteId || 'r-1');
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState<boolean>(false);

  // New Route Form State
  const [newRouteCode, setNewRouteCode] = useState<string>('RT-005');
  const [newVehicleId, setNewVehicleId] = useState<string>('TRK-05');
  const [newDriverName, setNewDriverName] = useState<string>('Vikram Singh');
  const [newZoneName, setNewZoneName] = useState<string>('Zone 5 (New Sector)');

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-elem')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: Math.min(400, Math.max(-400, e.clientX - dragStart.x)),
      y: Math.min(350, Math.max(-350, e.clientY - dragStart.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePan = (dx: number, dy: number) => {
    setPanPosition((prev) => ({
      x: Math.min(400, Math.max(-400, prev.x + dx)),
      y: Math.min(350, Math.max(-350, prev.y + dy)),
    }));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Live Sync with driverService when operations occur in driver panel
  useEffect(() => {
    const syncWithDriverService = async () => {
      try {
        const route = await driverService.getCurrentRoute();
        if (!route || !route.stops) return;
        setRoutesState((prevRoutes) =>
          prevRoutes.map((r) => {
            const isDriverTarget = mode === 'driver'
              ? (driverId === 'driver-2' ? r.id === 'r-3' : r.id === 'r-1')
              : (r.id === 'r-1' || r.id === 'r-3');

            if (isDriverTarget) {
              const updatedWaypoints = r.waypoints.map((wp, wpIdx) => {
                const matchedStop = route.stops[wpIdx] || route.stops.find(
                  (s) => s.binId === wp.code || s.id === wp.id || s.sequence === wp.sequence
                );
                if (matchedStop) {
                  const isComp = matchedStop.status === 'COMPLETED';
                  const isSkip = matchedStop.status === 'SKIPPED';
                  const isColl = matchedStop.status === 'COLLECTING';
                  const isCurr = matchedStop.status === 'CURRENT';
                  const statusToUse = isComp
                    ? 'COMPLETED'
                    : isSkip
                    ? 'SKIPPED'
                    : isColl
                    ? 'COLLECTING'
                    : isCurr
                    ? 'CURRENT'
                    : 'UPCOMING';
                  return {
                    ...wp,
                    status: statusToUse as any,
                    fillLevel: isComp ? 0 : matchedStop.fillLevel,
                  };
                }
                return { ...wp, status: wpIdx === r.currentStepIndex ? 'CURRENT' : 'UPCOMING' };
              });
              const currentIdx = updatedWaypoints.findIndex((w) => w.status === 'CURRENT' || w.status === 'COLLECTING');
              return {
                ...r,
                currentStepIndex: currentIdx >= 0 ? currentIdx : r.currentStepIndex,
                waypoints: updatedWaypoints,
              };
            }
            return r;
          })
        );
      } catch (err) {
        // quiet catch
      }
    };

    syncWithDriverService();
    const unsubscribe = driverService.subscribe(syncWithDriverService);
    return () => unsubscribe();
  }, [driverId, mode]);

  // Filter visible routes based on mode
  const visibleRoutes = routesState.filter((route) => {
    if (mode === 'driver') {
      // In Driver mode, show ONLY that particular driver's route
      if (driverId === 'driver-2' || driverId === 'yellow') {
        return route.id === 'r-3' || route.color === '#f59e0b';
      }
      return route.id === 'r-1' || route.color === '#10b981';
    }
    return true; // Admin mode shows all routes
  });



  // Action: Admin Adds a New Route
  const handleSaveNewRoute = () => {
    const newRoute: GisRouteData = {
      id: 'r-' + Date.now(),
      code: newRouteCode,
      vehicleId: newVehicleId,
      driverName: newDriverName,
      zone: newZoneName,
      color: '#a855f7',
      truckColorBg: 'bg-purple-600',
      truckColorText: 'text-purple-400 border-purple-500/50',
      currentStepIndex: 0,
      waypoints: [
        { id: `w-new-1`, sequence: 1, code: 'BIN-501', label: `${newZoneName} Gate 1`, fillLevel: 85, wasteType: 'Organic', status: 'CURRENT', x: 200, y: 280 },
        { id: `w-new-2`, sequence: 2, code: 'BIN-502', label: `${newZoneName} Plaza`, fillLevel: 92, wasteType: 'Plastic', status: 'UPCOMING', x: 340, y: 320 },
        { id: `w-new-3`, sequence: 3, code: 'BIN-503', label: `${newZoneName} Hub`, fillLevel: 40, wasteType: 'Paper', status: 'UPCOMING', x: 480, y: 350 },
      ],
    };

    setRoutesState((prev) => [...prev, newRoute]);
    setSelectedRouteId(newRoute.id);
    setIsAddRouteModalOpen(false);
    if (onAddRoute) onAddRoute(newRoute);
  };

  return (
    <div
      className={`bg-[#070c18] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative text-white transition-all select-none ${
        isFullscreen ? 'fixed inset-0 z-[99999] rounded-none border-none' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* MAP HEADER TOOLBAR */}
      <div className="p-3.5 sm:p-4 bg-[#091225]/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md">
        {/* Left Title & Dynamic Zone Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-md">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight">
                {mode === 'driver' ? 'Driver Field GIS Navigation' : 'Field Operational GIS Map'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zone: {zoneName}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {mode === 'driver'
                ? `Assigned Route: ${driverId === 'driver-2' || driverId === 'yellow' ? 'Yellow Route (TRK-03)' : 'Green Route (TRK-01)'}`
                : 'Live GPS route visualization & fleet telemetry'}
            </span>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Route Selector & Add Route Trigger - ONLY SHOWN WHEN EXPLICITLY ENABLED */}
          {mode === 'admin' && (showRouteSelector || showAddRoute) && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              {showRouteSelector && (
                <>
                  <Layers className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      const matched = routesState.find((r) => r.id === e.target.value);
                      if (matched && onSelectRoute) onSelectRoute(matched);
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    {routesState.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                        {r.code} ({r.vehicleId})
                      </option>
                    ))}
                  </select>
                </>
              )}
              {showAddRoute && (
                <button
                  onClick={() => setIsAddRouteModalOpen(true)}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1 ml-1"
                  title="Add New Route"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Route</span>
                </button>
              )}
            </div>
          )}



          {/* Speed Indicator */}
          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-extrabold flex items-center gap-1">
            <span>{speedKmH} km/h</span>
          </div>

          {/* Zoom & Fullscreen Controls */}
          <div className="flex items-center gap-0.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-slate-300">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
              className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.1))}
              className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="p-1 hover:text-white rounded cursor-pointer border-none bg-transparent ml-0.5 border-l border-slate-800 pl-1.5"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-red-400" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SVG CANVAS WORKSPACE */}
      <div className={`relative w-full h-[420px] sm:h-[480px] bg-[#070d19] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        
        {/* SVG Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
          <defs>
            <pattern id="masterGisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#masterGisGrid)" />
        </svg>

        {/* Scaled & Panned Interactive Canvas Wrapper */}
        <div
          className="w-full h-full transition-transform duration-100 ease-out relative"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <svg className="w-full h-full min-w-[950px] min-h-[520px]" viewBox="0 0 950 540">
            {/* GIS Road Network Curved Paths */}
            <path d="M 40 120 Q 220 80 440 220 T 900 480" fill="none" stroke="#162238" strokeWidth="22" strokeLinecap="round" />
            <path d="M 80 480 Q 340 320 620 120 T 920 120" fill="none" stroke="#162238" strokeWidth="22" strokeLinecap="round" />
            <path d="M 40 120 Q 220 80 440 220 T 900 480" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
            <path d="M 80 480 Q 340 320 620 120 T 920 120" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

            {/* EXPLICIT ZONAL NAMES ON MAP */}
            <g opacity="0.85" className="pointer-events-none select-none">
              <text x="180" y="55" fill="#34d399" fontSize="11" fontWeight="bold" letterSpacing="0.05em">
                📍 Zone A (DEPSTAR)
              </text>
              <text x="640" y="55" fill="#60a5fa" fontSize="11" fontWeight="bold" letterSpacing="0.05em">
                📍 Zone B (CSPIT)
              </text>
              <text x="660" y="510" fill="#fbbf24" fontSize="11" fontWeight="bold" letterSpacing="0.05em">
                📍 Zone C (Sayajigunj)
              </text>
              <text x="90" y="510" fill="#f87171" fontSize="11" fontWeight="bold" letterSpacing="0.05em">
                📍 Zone D (Makarpura)
              </text>
            </g>

            {/* Render Route Polyline Lines */}
            {visibleRoutes.map((route) => {
              const polylinePoints = route.waypoints.map((wp) => `${wp.x},${wp.y}`).join(' ');
              const isSelected = route.id === selectedRouteId;
              return (
                <polyline
                  key={route.id}
                  points={polylinePoints}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={isSelected ? '5' : '3.5'}
                  strokeDasharray="6 4"
                  opacity={isSelected || mode === 'driver' ? '1' : '0.85'}
                  className="animate-pulse"
                />
              );
            })}

            {/* Render Waypoint Markers & Fill Levels */}
            {visibleRoutes.map((route) =>
              route.waypoints.map((wp) => {
                const isSelected = selectedBinId === wp.id;
                const isHighFill = wp.fillLevel > 85; // STRICTLY GREATER THAN 85% ONLY
                let strokeColor = '#64748b';
                let fillColor = '#0f172a';

                if (wp.status === 'COLLECTING') {
                  strokeColor = '#10b981';
                  fillColor = '#10b981'; // 🟢 Solid Green for Currently Collecting!
                } else if (wp.status === 'COMPLETED') {
                  strokeColor = '#059669';
                  fillColor = '#065f46'; // Distinct Emerald for Completed!
                } else if (wp.status === 'SKIPPED') {
                  strokeColor = '#f59e0b';
                  fillColor = '#f59e0b'; // 🟡 Solid Yellow for Skipped!
                } else if (wp.status === 'CURRENT') {
                  strokeColor = '#ef4444';
                  fillColor = '#ef4444'; // 🔴 Solid Red for Target Stop!
                }

                return (
                  <g
                    key={wp.id}
                    onClick={() => onSelectBin && onSelectBin(wp)}
                    className="interactive-elem cursor-pointer group"
                  >
                    {/* Active Collecting Glow Ring */}
                    {wp.status === 'COLLECTING' && (
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r="18"
                        fill="rgba(16, 185, 129, 0.35)"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Outer Circle Ring */}
                    <circle
                      cx={wp.x}
                      cy={wp.y}
                      r={isSelected ? '14' : '11'}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '3' : '2.5'}
                    />

                    {/* Sequence Number */}
                    <text
                      x={wp.x}
                      y={wp.y + 3.5}
                      textAnchor="middle"
                      fill={wp.status === 'SKIPPED' ? '#000000' : '#ffffff'}
                      fontSize="10"
                      fontWeight="extrabold"
                      className="pointer-events-none select-none"
                    >
                      {wp.sequence}
                    </text>

                    {/* Bin Fill % Label Badge */}
                    <g transform={`translate(${wp.x - 22}, ${wp.y - 24})`} className="pointer-events-none">
                      <rect
                        x="0"
                        y="0"
                        width="44"
                        height="14"
                        rx="3"
                        fill={wp.status === 'COLLECTING' ? '#065f46' : wp.status === 'COMPLETED' ? '#064e3b' : wp.status === 'SKIPPED' ? '#78350f' : isHighFill ? '#450a0a' : '#091225'}
                        stroke={wp.status === 'COLLECTING' ? '#10b981' : wp.status === 'COMPLETED' ? '#059669' : wp.status === 'SKIPPED' ? '#f59e0b' : isHighFill ? '#ef4444' : strokeColor}
                        strokeWidth="1.2"
                      />
                      <text
                        x="22"
                        y="10"
                        textAnchor="middle"
                        fill={wp.status === 'COLLECTING' ? '#34d399' : wp.status === 'COMPLETED' ? '#a7f3d0' : wp.status === 'SKIPPED' ? '#fbbf24' : isHighFill ? '#f87171' : '#e2e8f0'}
                        fontSize="8.5"
                        fontWeight="extrabold"
                      >
                        {wp.code} ({wp.status === 'COMPLETED' ? 0 : wp.fillLevel}%)
                      </text>
                    </g>

                    {/* Tooltip on Hover */}
                    <title>{`Stop ${wp.sequence}: ${wp.code} - ${wp.label} (${wp.fillLevel}% full) [${wp.status}]`}</title>
                  </g>
                );
              })
            )}

            {/* Render Collection Trucks — SOLID & NON-BLINKING */}
            {visibleRoutes.map((route) => {
              const currentWp = route.waypoints[route.currentStepIndex] || route.waypoints[0];
              if (!currentWp) return null;

              return (
                <g
                  key={`truck-${route.id}`}
                  onClick={() => onSelectVehicle && onSelectVehicle(route)}
                  transform={`translate(${currentWp.x - 14}, ${currentWp.y - 14})`}
                  className="interactive-elem cursor-pointer group transition-all duration-700"
                >
                  {/* Vehicle Label Pill */}
                  <g transform="translate(-10, -20)">
                    <rect
                      x="0"
                      y="0"
                      width="48"
                      height="15"
                      rx="4"
                      fill="#0f172a"
                      stroke={route.color}
                      strokeWidth="1.5"
                    />
                    <text
                      x="24"
                      y="11"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="extrabold"
                    >
                      {route.vehicleId}
                    </text>
                  </g>

                  {/* Non-Blinking Static Truck Box */}
                  <rect
                    x="2"
                    y="2"
                    width="24"
                    height="24"
                    rx="6"
                    fill={route.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <Truck x="6" y="6" width="16" height="16" color="#ffffff" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* TOP-RIGHT DIRECTIONAL PANNING CONTROL D-PAD */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-center bg-[#091225]/95 border border-slate-800 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
          <button
            onClick={() => handlePan(0, 50)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Pan Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePan(50, 0)}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Pan Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 hover:bg-emerald-950/80 rounded text-emerald-400 cursor-pointer font-bold text-[10px]"
              title="Reset View Center"
            >
              Center
            </button>
            <button
              onClick={() => handlePan(-50, 0)}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Pan Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handlePan(0, -50)}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
            title="Pan Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* LEGEND OVERLAY AT BOTTOM LEFT */}
        <div className="absolute bottom-3 left-3 bg-[#091225]/95 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-bold flex flex-wrap items-center gap-4 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-slate-200">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="text-white font-bold">Current Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="text-red-400 font-extrabold">Critical Bin (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-amber-400 font-extrabold">Skipped Stop (Yellow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
            <span className="text-slate-300">Upcoming</span>
          </div>
        </div>
      </div>

      {/* ADMIN ADD ROUTE MODAL */}
      {isAddRouteModalOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#091225] border border-slate-700 text-white p-5 rounded-2xl shadow-2xl w-96 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>Create New Route</span>
            </h4>
            <button onClick={() => setIsAddRouteModalOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Route Code</label>
              <input
                type="text"
                value={newRouteCode}
                onChange={(e) => setNewRouteCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Assigned Vehicle ID</label>
              <input
                type="text"
                value={newVehicleId}
                onChange={(e) => setNewVehicleId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Driver Name</label>
              <input
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Operational Zone Name</label>
              <input
                type="text"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 text-xs">
            <button
              onClick={() => setIsAddRouteModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewRoute}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
            >
              Create Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedGisMap;
