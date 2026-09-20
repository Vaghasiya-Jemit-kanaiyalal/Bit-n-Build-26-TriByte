import React, { useState, useRef, useEffect } from 'react';
import type { MonitoredBin, MonitoredVehicle, MonitoredRoute } from '../../../types/monitoring';
import type { ZoneName } from '../../../types/bin';
import { binService } from '../../../services/binService';
import { UnifiedGisMap } from '../../common/UnifiedGisMap';
import {
  Globe,
  Search,
  PlusCircle,
  X,
  Maximize2,
  Minimize2,
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
  onSelectVehicle,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');

  // Allocation state
  const [isAllocatingBin, setIsAllocatingBin] = useState<boolean>(false);
  const [allocationModal, setAllocationModal] = useState<{ open: boolean; x: number; y: number } | null>(null);
  const [allocBinCode, setAllocBinCode] = useState<string>('');
  const [allocWasteType, setAllocWasteType] = useState<string>('Plastic');
  const [allocCapacity, setAllocCapacity] = useState<number>(240);
  const [allocZone, setAllocZone] = useState<string>('Academic Block');
  const [allocAddress, setAllocAddress] = useState<string>('Campus Gate 3');

  const [allocatedBinsList, setAllocatedBinsList] = useState<MonitoredBin[]>([]);
  const bins = [...allocatedBinsList, ...initialBins];

  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsNativeFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Native Fullscreen API error:', err);
    }
    if (onToggleFullscreen) onToggleFullscreen();
  };

  const isFsActive = isFullscreen || isNativeFullscreen;

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
        latitude: 22.3,
        longitude: 73.1,
      });

      const newMonitoredBin: MonitoredBin = {
        id: created.id,
        binCode: created.id,
        location: created.address,
        zone: 'Central Zone',
        fillPercent: created.currentFillPercent,
        capacityLiters: created.capacityLiters,
        status: created.status === 'Critical' ? 'Critical' : created.status === 'Warning' ? 'Warning' : 'Normal',
        wasteType: allocWasteType as any,
        sensorId: created.sensor.sensorId,
        batteryPercent: 98,
        signalStrength: 'Strong',
        lastUpdate: 'Just now',
        predictedOverflowMinutes: 1080,
        x: allocationModal.x,
        y: allocationModal.y,
      };

      setAllocatedBinsList((prev) => [newMonitoredBin, ...prev]);
      onSelectBin(newMonitoredBin);
    } catch (err) {
      console.warn('Bin allocation save error:', err);
    }

    setAllocationModal(null);
    setIsAllocatingBin(false);
  };

  const displayZoneName = selectedArea !== 'All Areas' ? selectedArea : 'DEPSTAR Campus';

  return (
    <div
      ref={containerRef}
      id="monitoring-map-container"
      className={`bg-[#070c18] border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative transition-all duration-200 ${
        isFsActive
          ? 'fixed inset-0 z-[999999] w-screen h-screen rounded-none border-none bg-[#070c18] p-0 m-0'
          : 'w-full h-full min-h-[580px] rounded-2xl'
      }`}
    >
      {/* Allocation Banner */}
      {isAllocatingBin && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between z-40 animate-pulse">
          <span className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>BIN ALLOCATION MODE ACTIVE: Click anywhere to place a new Smart Bin.</span>
          </span>
          <button
            onClick={() => setIsAllocatingBin(false)}
            className="px-2 py-1 bg-emerald-800 hover:bg-emerald-900 rounded text-[11px] cursor-pointer"
          >
            Cancel Allocation
          </button>
        </div>
      )}

      {/* TOP CONTROL BAR: AREA FILTER & SEARCH */}
      <div className="bg-[#091225] border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 z-30 select-none text-white">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search location / bin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-32 sm:w-44 font-medium"
            />
          </div>

          {/* Area Selection Hierarchy Dropdown */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
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

          {/* Allocate Bin Trigger */}
          <button
            onClick={() => setIsAllocatingBin(!isAllocatingBin)}
            className={`px-3 py-1 rounded-xl font-extrabold text-xs cursor-pointer flex items-center gap-1.5 transition-all border ${
              isAllocatingBin
                ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAllocatingBin ? 'Placing Bin...' : 'Allocate Bin'}</span>
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="px-3 py-1 rounded-xl font-bold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs flex items-center gap-1.5 text-slate-300 cursor-pointer"
        >
          {isFsActive ? <Minimize2 className="w-3.5 h-3.5 text-red-400" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isFsActive ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* UNIFIED GIS MAP COMPONENT */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <UnifiedGisMap
          zoneName={displayZoneName}
          stepIntervalMs={60000}
          isFullscreen={isFsActive}
          onToggleFullscreen={handleToggleFullscreen}
          onSelectBin={(wp) => {
            const foundBin = bins.find((b) => b.binCode === wp.code || b.id === wp.id);
            if (foundBin) {
              onSelectBin(foundBin);
            } else {
              onSelectBin({
                id: wp.id,
                binCode: wp.code,
                location: wp.label,
                zone: displayZoneName as any,
                fillPercent: wp.fillLevel,
                capacityLiters: 240,
                status: wp.fillLevel > 80 ? 'Critical' : wp.fillLevel > 60 ? 'Warning' : 'Normal',
                wasteType: wp.wasteType as any,
                sensorId: `SN-${wp.code}`,
                batteryPercent: 95,
                signalStrength: 'Strong',
                lastUpdate: 'Just now',
                predictedOverflowMinutes: 240,
                x: wp.x,
                y: wp.y,
              });
            }
          }}
          onSelectVehicle={(route) => {
            if (onSelectVehicle) {
              onSelectVehicle({
                id: route.vehicleId,
                vehicleCode: route.vehicleId,
                type: 'Compactor Truck',
                driver: route.driverName || 'Driver',
                latitude: 22.3,
                longitude: 73.1,
                speedKmH: 22,
                heading: 'North',
                currentLoadTons: 3.5,
                capacityTons: 8.0,
                utilizationPercent: 44,
                status: 'ON ROUTE' as any,
                lastUpdate: 'Just now',
                x: 500,
                y: 300,
              });
            }
          }}
        />

        {/* Allocation Modal Popup */}
        {allocationModal && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#091225] border border-slate-700 text-white p-5 rounded-2xl shadow-2xl w-80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-extrabold text-sm text-emerald-400">Allocate New Smart Bin</h4>
              <button onClick={() => setAllocationModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bin Code</label>
                <input
                  type="text"
                  value={allocBinCode}
                  onChange={(e) => setAllocBinCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Waste Type</label>
                <select
                  value={allocWasteType}
                  onChange={(e) => setAllocWasteType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                >
                  <option value="Plastic">Plastic</option>
                  <option value="Organic">Organic</option>
                  <option value="Paper">Paper</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Capacity (L)</label>
                <input
                  type="number"
                  value={allocCapacity}
                  onChange={(e) => setAllocCapacity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Zone</label>
                <input
                  type="text"
                  value={allocZone}
                  onChange={(e) => setAllocZone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Location Address</label>
                <input
                  type="text"
                  value={allocAddress}
                  onChange={(e) => setAllocAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setAllocationModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAllocatedBin}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Save Allocation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringMap;
