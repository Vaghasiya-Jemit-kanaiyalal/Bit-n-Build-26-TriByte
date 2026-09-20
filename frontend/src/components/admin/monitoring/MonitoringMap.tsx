import React, { useState, useRef, useEffect } from 'react';
import type { MonitoredBin, MonitoredVehicle, MonitoredRoute } from '../../../types/monitoring';
import type { ZoneName } from '../../../types/bin';
import { binService } from '../../../services/binService';
import {
  Plus,
  Minus,
  Target,
  X,
  AlertTriangle,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Globe,
  PlusCircle,
} from 'lucide-react';

interface MonitoringMapProps {
  bins: MonitoredBin[];
  vehicles?: MonitoredVehicle[];
  routes?: MonitoredRoute[];
  selectedBinId?: string;
  selectedVehicleId?: string;
  selectedRouteId?: string;
  onSelectBin: (bin: MonitoredBin) => void;
  onSelectVehicle?: (vehicle: MonitoredVehicle) => void;
  onSelectRoute?: (route: MonitoredRoute) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showVehicles?: boolean;
  showRoutes?: boolean;
  showBinLabels?: boolean;
}

export const MonitoringMap: React.FC<MonitoringMapProps> = ({
  bins: initialBins,
  onSelectBin,
  isFullscreen = false,
  onToggleFullscreen,
  showVehicles: _propShowVehicles = true,
  showRoutes: _propShowRoutes = true,
  showBinLabels: _propShowBinLabels = true,
}) => {
  // Map Modes & Views
  const [mapType, setMapType] = useState<'map' | 'vector'>('map');
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.7);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Phase 4 & 5: Search & Area Selection Hierarchy
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');

  // Phase 6: Functional Bin Allocation State
  const [isAllocatingBin, setIsAllocatingBin] = useState<boolean>(false);
  const [allocationModal, setAllocationModal] = useState<{ open: boolean; x: number; y: number } | null>(null);
  const [allocBinCode, setAllocBinCode] = useState<string>('');
  const [allocWasteType, setAllocWasteType] = useState<string>('Plastic');
  const [allocCapacity, setAllocCapacity] = useState<number>(240);
  const [allocZone, setAllocZone] = useState<string>('Academic Block');
  const [allocAddress, setAllocAddress] = useState<string>('Campus Gate 3');

  // Local allocated bins list
  const [allocatedBinsList, setAllocatedBinsList] = useState<MonitoredBin[]>([]);

  // Combined bins
  const bins = [...allocatedBinsList, ...initialBins];

  // Native Fullscreen API state tracking
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);

  // Realistic Map Toggles
  const [mapToggles, setMapToggles] = useState({
    bins: true,
    vehicles: true,
    routes: true,
    binLabels: true,
  });

  // Vector Grid Toggles
  const [vectorToggles, setVectorToggles] = useState({
    bins: true,
    vehicles: true,
    routes: true,
    zones: true,
  });

  const [openPopupBin, setOpenPopupBin] = useState<MonitoredBin | null>(
    bins.find((b) => b.binCode === 'CSE-001' || b.fillPercent >= 90) || bins[0] || null
  );


  const containerRef = useRef<HTMLDivElement>(null);
  const mapWidth = 1000;
  const mapHeight = 650;

  // Listen for native browser fullscreenchange events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsNativeFullscreen(isFs);
      if (!isFs && isFullscreen && onToggleFullscreen) {
        onToggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, onToggleFullscreen]);

  // Native Laptop Fullscreen toggle handler using HTML5 Fullscreen API
  const handleToggleFullscreen = async () => {
    try {
      const elem = containerRef.current;
      const activeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );

      if (!activeFs && elem) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Native Fullscreen API error:', err);
    }

    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  const isFsActive = isFullscreen || isNativeFullscreen;

  // Pan controls
  const handlePan = (dx: number, dy: number) => {
    setPanPosition((prev) => ({
      x: Math.min(350, Math.max(-350, prev.x + dx)),
      y: Math.min(300, Math.max(-300, prev.y + dy)),
    }));
  };

  const handleResetView = () => {
    setZoomLevel(0.7);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-marker')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPanPosition({
      x: Math.min(400, Math.max(-400, newX)),
      y: Math.min(350, Math.max(-350, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Realistic Campus Bins
  const realisticBins = [
    { id: 'b-1', binCode: 'CSE-001', label: 'CSE-001', fill: 92, status: 'Critical', wasteType: 'Plastic', capacity: '240 L', predicted: '~ 4 hours', x: 450, y: 220, zone: 'CSE Block' },
    { id: 'b-2', binCode: 'H-104', label: 'H-104', fill: 88, status: 'Critical', wasteType: 'Organic', capacity: '1100 L', predicted: '~ 6 hours', x: 570, y: 310, zone: 'Hostel Block B' },
    { id: 'b-3', binCode: 'LIB-005', label: 'LIB-005', fill: 67, status: 'Warning', wasteType: 'Paper', capacity: '400 L', predicted: '~ 1 day', x: 230, y: 300, zone: 'Library' },
    { id: 'b-4', binCode: 'ACAD-01', label: 'ACAD-01', fill: 45, status: 'Normal', wasteType: 'General', capacity: '240 L', predicted: 'Normal', x: 310, y: 140, zone: 'Academic Block' },
    { id: 'b-5', binCode: 'ACAD-02', label: 'ACAD-02', fill: 78, status: 'Warning', wasteType: 'Recyclable', capacity: '240 L', predicted: '~ 12 hours', x: 410, y: 110, zone: 'Academic Block' },
    { id: 'b-6', binCode: 'BIN-30', label: 'BIN-30', fill: 30, status: 'Normal', wasteType: 'Organic', capacity: '240 L', predicted: 'Normal', x: 360, y: 240, zone: 'CSE Block' },
    { id: 'b-7', binCode: 'BIN-52', label: 'BIN-52', fill: 52, status: 'Normal', wasteType: 'General', capacity: '240 L', predicted: 'Normal', x: 350, y: 365, zone: 'Library' },
    { id: 'b-8', binCode: 'H-105', label: 'H-105', fill: 95, status: 'Critical', wasteType: 'Organic', capacity: '1100 L', predicted: '~ 2 hours', x: 270, y: 460, zone: 'Hostel Block A' },
    { id: 'b-9', binCode: 'BIN-28', label: 'BIN-28', fill: 28, status: 'Normal', wasteType: 'General', capacity: '240 L', predicted: 'Normal', x: 375, y: 475, zone: 'Hostel Block A' },
    { id: 'b-10', binCode: 'S-05', label: 'S-05', fill: 62, status: 'Warning', wasteType: 'General', capacity: '800 L', predicted: '~ 1 day', x: 480, y: 430, zone: 'Sports Complex' },
    { id: 'b-11', binCode: 'BIN-18', label: 'BIN-18', fill: 18, status: 'Normal', wasteType: 'Recyclable', capacity: '240 L', predicted: 'Normal', x: 560, y: 500, zone: 'Sports Complex' },
    { id: 'b-12', binCode: 'CAF-01', label: 'CAF-01', fill: 15, status: 'Normal', wasteType: 'Recyclable', capacity: '240 L', predicted: 'Normal', x: 685, y: 280, zone: 'East Campus' },
    { id: 'b-13', binCode: 'BIN-40', label: 'BIN-40', fill: 40, status: 'Normal', wasteType: 'General', capacity: '240 L', predicted: 'Normal', x: 715, y: 385, zone: 'East Campus' },
    { id: 'b-14', binCode: 'BIN-73', label: 'BIN-73', fill: 73, status: 'Warning', wasteType: 'Organic', capacity: '800 L', predicted: '~ 16 hours', x: 695, y: 460, zone: 'Sports Complex' },
  ];

  // Exact Vector Grid Bins
  const vectorBins = [
    { id: 'vb-1', binCode: 'NORTH-91', fill: 91, status: 'Critical', x: 325, y: 110 },
    { id: 'vb-2', binCode: 'NORTH-93', fill: 93, status: 'Critical', x: 380, y: 90 },
    { id: 'vb-3', binCode: 'IND-55', fill: 55, status: 'Normal', x: 670, y: 250 },
    { id: 'vb-4', binCode: 'IND-84', fill: 84, status: 'Warning', x: 730, y: 290 },
    { id: 'vb-5', binCode: 'CENT-94', fill: 94, status: 'Critical', x: 470, y: 270 },
    { id: 'vb-6', binCode: 'CENT-92', fill: 92, status: 'Critical', x: 518, y: 310 },
    { id: 'vb-7', binCode: 'CENT-95', fill: 95, status: 'Critical', x: 555, y: 275 },
    { id: 'vb-8', binCode: 'CENT-88', fill: 88, status: 'Warning', x: 435, y: 330 },
    { id: 'vb-9', binCode: 'WEST-38', fill: 38, status: 'Normal', x: 130, y: 315 },
    { id: 'vb-10', binCode: 'WEST-42', fill: 42, status: 'Normal', x: 185, y: 360 },
    { id: 'vb-11', binCode: 'RES-89', fill: 89, status: 'Warning', x: 260, y: 495 },
    { id: 'vb-12', binCode: 'SOUTH-78', fill: 78, status: 'Warning', x: 405, y: 510 },
    { id: 'vb-13', binCode: 'SOUTH-15', fill: 15, status: 'Offline', x: 475, y: 545 },
    { id: 'vb-14', binCode: 'EAST-96', fill: 96, status: 'Critical', x: 805, y: 435 },
    { id: 'vb-15', binCode: 'EAST-97', fill: 97, status: 'Critical', x: 865, y: 475 },
  ];

  // Vector Vehicles (TRK Badges)
  const vectorVehicles = [
    { id: 'vv-1', code: 'TRK', x: 345, y: 100 },
    { id: 'vv-2', code: 'TRK', x: 710, y: 270 },
    { id: 'vv-3', code: 'TRK', x: 495, y: 285 },
    { id: 'vv-4', code: 'TRK', x: 160, y: 330 },
    { id: 'vv-5', code: 'TRK', x: 242, y: 460 },
    { id: 'vv-6', code: 'TRK', x: 445, y: 525 },
    { id: 'vv-7', code: 'TRK', x: 825, y: 445 },
  ];

  // Realistic map styling helpers
  const getBinStyle = (fillPct: number, status?: string) => {
    if (status === 'Offline' || status === 'Maintenance') {
      return { pillBg: 'bg-slate-500 text-white', binFillColor: '#94a3b8', borderColor: 'border-slate-600' };
    }
    if (fillPct >= 80) {
      return { pillBg: 'bg-red-600 text-white animate-pulse', binFillColor: '#dc2626', borderColor: 'border-red-700' };
    }
    if (fillPct >= 60) {
      return { pillBg: 'bg-amber-500 text-white', binFillColor: '#d97706', borderColor: 'border-amber-600' };
    }
    return { pillBg: 'bg-emerald-600 text-white', binFillColor: '#059669', borderColor: 'border-emerald-700' };
  };

  // Vector circle color helper matching exact screenshot
  const getVectorCircleBg = (fill: number, status?: string) => {
    if (status === 'Offline') return 'bg-slate-400 text-white';
    if (fill >= 90) return 'bg-red-600 text-white animate-pulse shadow-red-500/50';
    if (fill >= 75) return 'bg-amber-500 text-white';
    return 'bg-emerald-600 text-white';
  };

  // Polyline for realistic campus route
  const activeRoutePolyline = [
    { x: 510, y: 550 },
    { x: 310, y: 510 },
    { x: 425, y: 440 },
    { x: 440, y: 335 },
    { x: 520, y: 330 },
    { x: 520, y: 250 },
    { x: 470, y: 240 },
    { x: 470, y: 150 },
  ];
  const routePolylinePoints = activeRoutePolyline.map((p) => `${p.x},${p.y}`).join(' ');

  const routeStopsPositions = [
    { num: 1, x: 310, y: 510 },
    { num: 2, x: 470, y: 240 },
    { num: 3, x: 520, y: 330 },
    { num: 4, x: 425, y: 440 },
    { num: 5, x: 510, y: 550 },
  ];

  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAllocatingBin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(e.clientX - rect.left);
    const clickY = Math.round(e.clientY - rect.top);

    setAllocationModal({ open: true, x: clickX, y: clickY });
    setAllocBinCode(`BIN-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSaveAllocatedBin = async () => {
    if (!allocationModal) return;

    try {
      const created = await binService.createBin({
        code: allocBinCode || `BIN-${Math.floor(1000 + Math.random() * 9000)}`,
        name: allocAddress,
        address: allocAddress,
        zone: allocZone as ZoneName,
        capacityLiters: allocCapacity,
        wasteType: allocWasteType as any,
        latitude: 22.3 + (allocationModal.y / mapHeight) * 0.1,
        longitude: 73.1 + (allocationModal.x / mapWidth) * 0.1,
      });

      const mapWaste: MonitoredBin['wasteType'] = allocWasteType === 'Organic' ? 'Organic' : allocWasteType === 'Recyclable' ? 'Recyclable' : 'General';
      const mapStatus: MonitoredBin['status'] = created.status === 'Critical' ? 'Critical' : created.status === 'Warning' ? 'Warning' : 'Normal';

      const newMonitoredBin: MonitoredBin = {
        id: created.id,
        binCode: created.id,
        location: created.address,
        zone: 'Central Zone',
        fillPercent: created.currentFillPercent,
        capacityLiters: created.capacityLiters,
        status: mapStatus,
        wasteType: mapWaste,
        sensorId: created.sensor.sensorId,
        batteryPercent: 98,
        signalStrength: 'Strong',
        lastUpdate: 'Just now',
        predictedOverflowMinutes: 1080,
        x: allocationModal.x,
        y: allocationModal.y,
      };

      setAllocatedBinsList((prev) => [newMonitoredBin, ...prev]);
      setOpenPopupBin(newMonitoredBin);
      onSelectBin(newMonitoredBin);
    } catch (err) {
      console.warn('Bin allocation save error:', err);
    }

    setAllocationModal(null);
    setIsAllocatingBin(false);
  };

  return (
    <div
      ref={containerRef}
      id="monitoring-map-container"
      className={`bg-white border border-slate-200/80 shadow-sm flex flex-col overflow-hidden relative transition-all duration-200 ${
        isFsActive
          ? 'fixed inset-0 z-[999999] w-screen h-screen rounded-none border-none bg-slate-900 p-0 m-0'
          : 'w-full h-full min-h-[580px] rounded-2xl'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Active Allocation Mode Banner */}
      {isAllocatingBin && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between z-40 animate-pulse">
          <span className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>BIN ALLOCATION MODE ACTIVE: Click anywhere on the map to place a new Smart Bin.</span>
          </span>
          <button
            onClick={() => setIsAllocatingBin(false)}
            className="px-2 py-1 bg-emerald-800 hover:bg-emerald-900 rounded text-[11px] cursor-pointer"
          >
            Cancel Allocation
          </button>
        </div>
      )}

      {/* 1. TOP CONTROL BAR */}
      <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 z-30 select-none">
        {/* Left: Search & Area Hierarchy & Map Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Location Input */}
          <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search location / bin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none w-32 sm:w-40 font-medium"
            />
          </div>

          {/* Area Selection Hierarchy Dropdown */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setPanPosition({ x: 0, y: 0 });
                setZoomLevel(e.target.value === 'All Areas' ? 0.7 : 1.1);
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All Areas">India &gt; Gujarat &gt; Vadodara (All Areas)</option>
              <option value="CSE Block">Vadodara &gt; CSE &amp; Tech Block</option>
              <option value="Hostel Block A">Vadodara &gt; Hostel Zone A</option>
              <option value="Hostel Block B">Vadodara &gt; Hostel Zone B</option>
              <option value="Library">Vadodara &gt; Library &amp; Academic Zone</option>
              <option value="East Campus">Vadodara &gt; East Campus &amp; Cafeteria</option>
              <option value="Sports Complex">Vadodara &gt; Sports Complex</option>
            </select>
          </div>

          {/* Map View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => { setMapType('map'); setSatelliteView(false); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-none ${
                mapType === 'map' && !satelliteView
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Normal View
            </button>
            <button
              onClick={() => { setMapType('map'); setSatelliteView(true); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-none ${
                mapType === 'map' && satelliteView
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Satellite View
            </button>
            <button
              onClick={() => setMapType('vector')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border-none ${
                mapType === 'vector'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Vector View
            </button>
          </div>

          {/* Allocate Bin Trigger */}
          <button
            onClick={() => setIsAllocatingBin(!isAllocatingBin)}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer flex items-center gap-1.5 transition-all border ${
              isAllocatingBin
                ? 'bg-emerald-700 text-white border-emerald-800 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="Allocate new smart bin on map"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAllocatingBin ? 'Placing Bin...' : 'Allocate Bin'}</span>
          </button>
        </div>

        {/* Center / Right Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-3 border-r border-slate-200 pr-3">
            {mapType === 'vector' ? (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vectorToggles.bins}
                    onChange={(e) => setVectorToggles((v) => ({ ...v, bins: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Bins</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vectorToggles.vehicles}
                    onChange={(e) => setVectorToggles((v) => ({ ...v, vehicles: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Vehicles</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vectorToggles.routes}
                    onChange={(e) => setVectorToggles((v) => ({ ...v, routes: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Routes</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vectorToggles.zones}
                    onChange={(e) => setVectorToggles((v) => ({ ...v, zones: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Zones</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapToggles.bins}
                    onChange={(e) => setMapToggles((v) => ({ ...v, bins: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Bins</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapToggles.vehicles}
                    onChange={(e) => setMapToggles((v) => ({ ...v, vehicles: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Vehicles</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapToggles.routes}
                    onChange={(e) => setMapToggles((v) => ({ ...v, routes: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Routes</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapToggles.binLabels}
                    onChange={(e) => setMapToggles((v) => ({ ...v, binLabels: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Bin Labels</span>
                </label>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 gap-2 font-mono">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="hover:text-slate-900 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.1))}
                className="hover:text-slate-900 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleResetView}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold cursor-pointer"
            >
              Fit View
            </button>

            {/* Native Fullscreen API Trigger Button */}
            <button
              onClick={handleToggleFullscreen}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold shadow-xs cursor-pointer flex items-center gap-1.5 text-xs transition-colors border ${
                isFsActive
                  ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
              }`}
            >
              {isFsActive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{isFsActive ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN MAP CANVAS AREA */}
      <div
        onClick={handleMapCanvasClick}
        className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center ${
          mapType === 'vector' ? 'bg-[#f8fafc]' : 'bg-[#eef2f5]'
        } ${isDragging ? 'cursor-grabbing' : isAllocatingBin ? 'cursor-crosshair' : 'cursor-grab'}`}
      >
        {/* MAP CANVAS VIEW TRANSFORM WRAPPER */}
        <div
          className="relative w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Dot Matrix Pattern for Vector Grid */}
              <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#cbd5e1" opacity="0.8" />
              </pattern>

              {/* Tile grid pattern */}
              <pattern id="streetGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
              </pattern>

              {/* Water Pattern */}
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>

              {/* Green Park Grad */}
              <linearGradient id="parkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dcfce7" />
                <stop offset="100%" stopColor="#bbf7d0" />
              </linearGradient>

              {/* Building Shadow */}
              <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* ==================== A) VECTOR OPERATIONS GRID MAP MODE ==================== */}
            {mapType === 'vector' ? (
              <>
                <rect width="100%" height="100%" fill="#f8fafc" />
                <rect width="100%" height="100%" fill="url(#dotGrid)" />

                {/* 7 OPERATIONAL ZONES POLYGONS */}
                {vectorToggles.zones && (
                  <g opacity="0.85">
                    <polygon
                      points="250,50 590,50 570,390 255,390"
                      fill="#f1f5f9"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="410"
                      y="140"
                      fill="#94a3b8"
                      fontSize="14"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      NORTH ZONE
                    </text>

                    <polygon
                      points="40,50 250,50 255,390 40,390"
                      fill="#f8fafc"
                      stroke="#e2e8f0"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="140"
                      y="200"
                      fill="#94a3b8"
                      fontSize="14"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      WEST ZONE
                    </text>

                    <polygon
                      points="255,230 585,230 610,610 300,610"
                      fill="#ecfdf5"
                      stroke="#a7f3d0"
                      strokeWidth="2.5"
                    />
                    <text
                      x="400"
                      y="370"
                      fill="#6ee7b7"
                      fontSize="15"
                      fontFamily="sans-serif"
                      fontWeight="extrabold"
                      letterSpacing="2"
                    >
                      CENTRAL ZONE
                    </text>

                    <polygon
                      points="590,50 950,50 950,230 580,230"
                      fill="#fff7ed"
                      stroke="#ffedd5"
                      strokeWidth="2"
                    />
                    <text
                      x="740"
                      y="150"
                      fill="#fdba74"
                      fontSize="14"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      INDUSTRIAL ZONE
                    </text>

                    <polygon
                      points="580,230 950,230 950,420 610,420"
                      fill="#f0f9ff"
                      stroke="#bae6fd"
                      strokeWidth="2"
                    />
                    <text
                      x="740"
                      y="330"
                      fill="#93c5fd"
                      fontSize="14"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      EAST ZONE
                    </text>

                    <polygon
                      points="40,390 255,390 300,610 40,610"
                      fill="#faf5ff"
                      stroke="#f5d0fe"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="160"
                      y="520"
                      fill="#c084fc"
                      fontSize="13"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      RESIDENTIAL ZONE
                    </text>

                    <polygon
                      points="610,420 950,420 950,610 610,610"
                      fill="#f0fdf4"
                      stroke="#bbf7d0"
                      strokeWidth="2"
                    />
                    <text
                      x="730"
                      y="530"
                      fill="#86efac"
                      fontSize="14"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      letterSpacing="1.5"
                    >
                      SOUTH ZONE
                    </text>
                  </g>
                )}

                {/* VECTOR ACTIVE MINT ROUTE LINES */}
                {vectorToggles.routes && (
                  <g>
                    <polyline
                      points="325,110 380,90"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="670,250 730,290"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="435,330 470,270 518,310 555,275"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="805,435 865,475"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </>
            ) : (
              /* ==================== B) REALISTIC MAP MODE ==================== */
              <>
                <rect width="100%" height="100%" fill="#f1f5f9" />
                <rect width="100%" height="100%" fill="url(#streetGrid)" opacity="0.6" />

                {/* Green Park Areas */}
                <path
                  d="M 50,50 L 280,40 C 350,120 280,220 120,250 Z"
                  fill="url(#parkGrad)"
                  opacity="0.8"
                />
                <path
                  d="M 600,400 C 650,380 750,390 850,420 L 920,580 L 580,580 Z"
                  fill="url(#parkGrad)"
                  opacity="0.8"
                />

                {/* Blue Lake / Water Body */}
                <path
                  d="M 520,30 C 580,20 620,60 600,120 C 560,150 510,120 520,30 Z"
                  fill="url(#waterGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                {/* Paved Campus Roads & Pathways */}
                <g stroke="#ffffff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 60,80 L 940,80 L 940,580 L 60,580 Z" />
                  <path d="M 280,80 L 280,580" />
                  <path d="M 600,80 L 600,580" />
                  <path d="M 60,330 L 940,330" />
                  <path d="M 60,480 L 940,480" />
                </g>

                {/* Inner Road Markings */}
                <g stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 60,80 L 940,80 L 940,580 L 60,580 Z" />
                  <path d="M 280,80 L 280,580" />
                  <path d="M 600,80 L 600,580" />
                  <path d="M 60,330 L 940,330" />
                  <path d="M 60,480 L 940,480" />
                </g>

                {/* Campus Buildings Layout */}
                <g filter="url(#dropShadow)">
                  <rect
                    x="330"
                    y="100"
                    width="130"
                    height="70"
                    rx="8"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="395"
                    y="132"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Academic
                  </text>
                  <text
                    x="395"
                    y="146"
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Block
                  </text>

                  <rect
                    x="430"
                    y="210"
                    width="120"
                    height="80"
                    rx="8"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="490"
                    y="255"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    CSE Block
                  </text>

                  <rect
                    x="180"
                    y="270"
                    width="110"
                    height="80"
                    rx="8"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="235"
                    y="315"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Library
                  </text>

                  <rect
                    x="170"
                    y="440"
                    width="120"
                    height="70"
                    rx="8"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="230"
                    y="480"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Hostel Block A
                  </text>

                  <rect
                    x="530"
                    y="290"
                    width="110"
                    height="75"
                    rx="8"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="585"
                    y="332"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Hostel Block B
                  </text>

                  <rect
                    x="630"
                    y="420"
                    width="130"
                    height="85"
                    rx="8"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x="695"
                    y="468"
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Sports Complex
                  </text>

                  <rect
                    x="470"
                    y="540"
                    width="90"
                    height="30"
                    rx="6"
                    fill="#1e293b"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text
                    x="515"
                    y="560"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    Main Gate
                  </text>
                </g>

                {/* STREET NAMES */}
                <g fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  <text x="100" y="100">
                    Street 104
                  </text>
                  <text x="800" y="100">
                    Campus Ave
                  </text>
                </g>

                {/* ACTIVE ROUTE POLYLINE */}
                {mapToggles.routes && (
                  <g>
                    <polyline
                      points={routePolylinePoints}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shadow-lg"
                    />
                  </g>
                )}

                {/* ROUTE NUMBERED STOP BADGES */}
                {mapToggles.routes &&
                  routeStopsPositions.map((stop) => (
                    <g
                      key={stop.num}
                      transform={`translate(${stop.x}, ${stop.y})`}
                      className="cursor-pointer interactive-marker"
                    >
                      <circle
                        r="12"
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="shadow-md"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {stop.num}
                      </text>
                    </g>
                  ))}

                {/* VEHICLE MARKER */}
                {mapToggles.vehicles && (
                  <g
                    transform="translate(520, 290)"
                    className="cursor-pointer interactive-marker shadow-xl"
                  >
                    <rect
                      x="-24"
                      y="-14"
                      width="48"
                      height="28"
                      rx="8"
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="extrabold"
                      fontFamily="sans-serif"
                    >
                      🚛 V-03
                    </text>
                  </g>
                )}
              </>
            )}
          </svg>

          {/* HTML MARKERS OVERLAY LAYER */}
          <div className="absolute inset-0 pointer-events-auto select-none">
            {/* ==================== A) VECTOR GRID MARKERS ==================== */}
            {mapType === 'vector' ? (
              <>
                {/* Bins */}
                {vectorToggles.bins &&
                  vectorBins.map((bin) => {
                    const isRed = bin.fill >= 90;
                    return (
                      <div
                        key={bin.id}
                        style={{
                          position: 'absolute',
                          left: `${(bin.x / mapWidth) * 100}%`,
                          top: `${(bin.y / mapHeight) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        className="interactive-marker cursor-pointer flex items-center justify-center transition-transform hover:scale-125 z-20"
                      >
                        {/* RED DUSTBIN BLINKING RING */}
                        {isRed && (
                          <span className="absolute -inset-1.5 rounded-full bg-red-600 opacity-75 animate-ping" />
                        )}

                        <div
                          className={`relative w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-extrabold shadow-md border-2 border-white ${getVectorCircleBg(
                            bin.fill,
                            bin.status
                          )}`}
                        >
                          {bin.fill}
                        </div>
                      </div>
                    );
                  })}

                {/* TRK Vehicles */}
                {vectorToggles.vehicles &&
                  vectorVehicles.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        position: 'absolute',
                        left: `${(v.x / mapWidth) * 100}%`,
                        top: `${(v.y / mapHeight) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="interactive-marker cursor-pointer z-30"
                    >
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-blue-600 text-white border border-white shadow-md">
                        TRK
                      </span>
                    </div>
                  ))}
              </>
            ) : (
              /* ==================== B) REALISTIC MAP MARKERS ==================== */
              mapToggles.bins &&
                realisticBins.map((bin) => {
                  const style = getBinStyle(bin.fill, bin.status);
                  const isRed = bin.fill >= 80;

                  return (
                    <div
                      key={bin.id}
                      style={{
                        position: 'absolute',
                        left: `${(bin.x / mapWidth) * 100}%`,
                        top: `${(bin.y / mapHeight) * 100}%`,
                        transform: 'translate(-50%, -100%)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const match = bins.find((b) => b.binCode === bin.binCode);
                        if (match) onSelectBin(match);
                        setOpenPopupBin(bin as any);
                      }}
                      className="cursor-pointer group z-20 flex flex-col items-center select-none interactive-marker"
                    >
                      {/* Fill % Pill Tag */}
                      {mapToggles.binLabels && (
                        <div
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono shadow-md border ${style.pillBg} ${style.borderColor} mb-0.5 transition-transform duration-200 group-hover:scale-110 flex items-center gap-1`}
                        >
                          <span>{bin.fill}%</span>
                        </div>
                      )}

                    {/* 3D Trash Bin Icon */}
                    <div className="relative flex flex-col items-center transition-transform duration-200 group-hover:scale-125">
                      {/* RED DUSTBIN BLINKING ANIMATION */}
                      {isRed && (
                        <span className="absolute -inset-2 rounded-xl bg-red-600 opacity-75 animate-ping" />
                      )}

                      <div
                        className={`relative w-7 h-8 rounded-b-md rounded-t-sm flex flex-col justify-between items-center p-0.5 shadow-lg border border-slate-900/20 ${
                          isRed ? 'animate-bounce shadow-red-500/50' : ''
                        }`}
                        style={{ backgroundColor: style.binFillColor }}
                      >
                        <div className="w-8 h-2 bg-slate-900/40 rounded-t-xs" />
                        <div className="text-[10px] text-white/90 font-mono font-bold leading-none mb-1">
                          🗑️
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* CLICKED BIN POPUP CARD (FOR REALISTIC MODE) */}
            {openPopupBin && mapType !== 'vector' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${((openPopupBin as any).x / mapWidth) * 100}%`,
                  top: `${((openPopupBin as any).y / mapHeight) * 100}%`,
                  transform: 'translate(-30%, -115%)',
                }}
                className="z-40 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 space-y-2 animate-in fade-in duration-200 text-slate-800 interactive-marker"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-red-100 text-red-700 text-xs">🗑️</span>
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      {openPopupBin.binCode}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPopupBin(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-red-600 text-sm">
                    {openPopupBin.fillPercent ?? (openPopupBin as any).fill}% Full
                  </div>
                  <div className="text-slate-500 font-medium">{openPopupBin.wasteType}</div>
                  <div className="text-slate-500 font-medium">
                    {(openPopupBin as any).capacity || `${openPopupBin.capacityLiters} L`}
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Near Overflow</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    Predicted: {(openPopupBin as any).predicted || '~ 4 hours'}
                  </div>
                </div>
              </div>
            )}

            {/* NEW SMART BIN ALLOCATION MODAL POPUP */}
            {allocationModal?.open && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(allocationModal.x / mapWidth) * 100}%`,
                  top: `${(allocationModal.y / mapHeight) * 100}%`,
                  transform: 'translate(-50%, -110%)',
                }}
                className="z-50 w-64 bg-white rounded-2xl shadow-2xl border border-emerald-500 p-4 space-y-3 animate-in fade-in duration-200 text-slate-800 interactive-marker"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      Allocate Bin
                    </span>
                  </div>
                  <button
                    onClick={() => setAllocationModal(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Bin Code</label>
                    <input
                      type="text"
                      value={allocBinCode}
                      onChange={(e) => setAllocBinCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Waste Type</label>
                      <select
                        value={allocWasteType}
                        onChange={(e) => setAllocWasteType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                      >
                        <option value="Plastic">Plastic</option>
                        <option value="Organic">Organic</option>
                        <option value="Paper">Paper</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Capacity (L)</label>
                      <input
                        type="number"
                        value={allocCapacity}
                        onChange={(e) => setAllocCapacity(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Zone</label>
                    <input
                      type="text"
                      value={allocZone}
                      onChange={(e) => setAllocZone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">Location Address</label>
                    <input
                      type="text"
                      value={allocAddress}
                      onChange={(e) => setAllocAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setAllocationModal(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAllocatedBin}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Save Allocation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TOP-RIGHT: DIRECTIONAL PAN D-PAD + ZOOM CONTROLS */}
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-3">
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-1.5 shadow-md flex flex-col items-center gap-1">
            <button
              onClick={() => handlePan(0, 50)}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Pan Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePan(50, 0)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Pan Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                title="Reset View Center"
              >
                <Target className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePan(-50, 0)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Pan Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => handlePan(0, -50)}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Pan Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-2xl p-1 flex flex-col gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Zoom In (+)"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-mono text-center font-bold text-slate-500 py-0.5 border-y border-slate-100">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Zoom Out (-)"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. EMBEDDED BOTTOM MAP LEGEND BAR */}
        <div className="absolute bottom-3 left-4 right-4 z-30 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 font-semibold select-none">
          {mapType === 'vector' ? (
            <>
              <div className="flex flex-wrap items-center gap-5">
                <span className="font-extrabold uppercase text-[11px] text-slate-400">
                  LEGEND:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span>Normal Bin (&lt;75%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Warning (75–89%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-bold text-red-600">Critical (&gt;90%) [Blinking]</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span>Offline Bin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600 text-white font-mono font-bold">
                    TRK
                  </span>
                  <span>Vehicle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-1 bg-emerald-500 rounded" />
                  <span>Active Route</span>
                </div>
              </div>

              <button
                onClick={handleToggleFullscreen}
                className={`px-4 py-1.5 rounded-xl font-extrabold flex items-center gap-2 cursor-pointer shadow-xs border transition-colors ${
                  isFsActive
                    ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isFsActive ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isFsActive ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span>Normal (&lt; 60%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Moderate (60-80%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <span className="font-bold text-red-600">High (&gt; 80%) [Blinking]</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span>Maintenance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🚛</span>
                  <span>Collection Vehicle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-1 bg-[#0284c7] rounded" />
                  <span>Planned Route</span>
                </div>
              </div>

              <button
                onClick={handleToggleFullscreen}
                className={`px-4 py-1.5 rounded-xl font-extrabold flex items-center gap-2 cursor-pointer shadow-xs border transition-colors ${
                  isFsActive
                    ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isFsActive ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isFsActive ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
