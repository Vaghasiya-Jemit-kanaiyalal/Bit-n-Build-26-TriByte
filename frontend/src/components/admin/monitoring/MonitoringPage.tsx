import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  MonitoredBin,
  MonitoredVehicle,
  MonitoredRoute,
  MonitoredSensor,
  LiveActivityEvent,
  MonitoringKpiSummary,
  ZoneStatusSummary,
  MonitoringFilterState,
} from '../../../types/monitoring';
import { monitoringService } from '../../../services/monitoringService';

// Subcomponents
import { MonitoringHeader } from './MonitoringHeader';
import { MonitoringKpiGrid } from './MonitoringKpiGrid';
import { MonitoringMap } from './MonitoringMap';
import { SelectedEntityDrawer } from './SelectedEntityDrawer';
import { LiveVehiclesPanel } from './LiveVehiclesPanel';

interface MonitoringPageProps {
  onNavigateTab?: (tabName: string) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({ onNavigateTab }) => {
  // Live Simulation State
  const [isLive, setIsLive] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [iotDemoActive, setIotDemoActive] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>(
    monitoringService.getLastUpdatedTimestamp()
  );

  // View & Drawer States
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);
  const [_isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Filter & Search State
  const [filters, setFilters] = useState<MonitoringFilterState>({
    searchQuery: '',
    entityType: 'All',
    status: 'All',
    zone: 'All',
    severity: 'All',
  });

  // Local Map Panel Filter State (Area, Waste Type, Status, Toggles)
  const [mapPanelFilters, setMapPanelFilters] = useState({
    area: 'All Areas',
    wasteType: 'All Waste Types',
    status: 'All Status',
    showVehicles: true,
    showRoutes: true,
    showBinLabels: true,
  });

  // Selected Entity State (for slide-over drawer)
  const [selectedEntity, setSelectedEntity] = useState<
    | { type: 'bin'; data: MonitoredBin }
    | { type: 'vehicle'; data: MonitoredVehicle }
    | { type: 'route'; data: MonitoredRoute }
    | null
  >(null);

  // Telemetry Data Stores
  const [kpiSummary, setKpiSummary] = useState<MonitoringKpiSummary>(
    monitoringService.getMonitoringSummary()
  );
  const [bins, setBins] = useState<MonitoredBin[]>([]);
  const [vehicles, setVehicles] = useState<MonitoredVehicle[]>([]);
  const [routes, setRoutes] = useState<MonitoredRoute[]>([]);
  const [_sensors, setSensors] = useState<MonitoredSensor[]>([]);
  const [_activities, setActivities] = useState<LiveActivityEvent[]>([]);
  const [_zoneStatuses, setZoneStatuses] = useState<ZoneStatusSummary[]>([]);

  // Telemetry Refresh Function
  const refreshTelemetryData = useCallback(() => {
    monitoringService.fetchLiveSnapshot().then(() => {
      setKpiSummary(monitoringService.getMonitoringSummary());
      setBins(monitoringService.getBins(filters));
      setVehicles(monitoringService.getVehicles(filters));
      setRoutes(monitoringService.getRoutes(filters));
      setSensors(monitoringService.getSensors());
      setActivities(monitoringService.getLiveActivities(filters));
      setZoneStatuses(monitoringService.getZoneStatuses());
      setLastUpdated(monitoringService.getLastUpdatedTimestamp());
    });
  }, [filters]);

  // IoT Demo Simulator Toggle Handler
  const handleToggleIotDemo = async () => {
    try {
      const token = localStorage.getItem('ecotrack_token') || localStorage.getItem('wastewise_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/admin/monitoring/iot-simulator/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIotDemoActive(data.is_running);
      } else {
        setIotDemoActive(!iotDemoActive);
      }
    } catch {
      setIotDemoActive(!iotDemoActive);
    }
  };

  // Initial & Live Simulation Interval Setup + WebSocket Stream Connection
  useEffect(() => {
    refreshTelemetryData();

    // 1. Connect WebSocket Real-Time Stream (Phase 2)
    const cleanupWs = monitoringService.connectLiveTelemetryStream((payload) => {
      if (payload.type === 'TELEMETRY_UPDATE') {
        console.log('[MonitoringPage] Real-time WebSocket telemetry update received:', payload);
        refreshTelemetryData();
      }
    });

    // 2. Poll interval fallback
    if (isLive) {
      monitoringService.startSimulation((ts) => {
        setLastUpdated(ts);
        refreshTelemetryData();
      }, refreshInterval);
    } else {
      monitoringService.stopSimulation();
    }

    return () => {
      cleanupWs();
      monitoringService.stopSimulation();
    };
  }, [isLive, refreshInterval, refreshTelemetryData]);


  // Active Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.entityType !== 'All') count++;
    if (filters.status !== 'All') count++;
    if (filters.zone !== 'All') count++;
    if (filters.severity !== 'All') count++;
    return count;
  }, [filters]);

  // Handlers
  const handleFilterChange = (updated: Partial<MonitoringFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      entityType: 'All',
      status: 'All',
      zone: 'All',
      severity: 'All',
    });
    setMapPanelFilters({
      area: 'All Areas',
      wasteType: 'All Waste Types',
      status: 'All Status',
      showVehicles: true,
      showRoutes: true,
      showBinLabels: true,
    });
  };

  const handleKpiFilterClick = (
    type: 'bins' | 'criticalBins' | 'vehicles' | 'routes' | 'sensors' | 'collection'
  ) => {
    if (type === 'criticalBins') {
      setFilters((prev) => ({ ...prev, status: 'Critical' }));
    } else if (type === 'vehicles') {
      setFilters((prev) => ({ ...prev, entityType: 'Vehicles' }));
    } else if (type === 'routes') {
      setFilters((prev) => ({ ...prev, entityType: 'Routes' }));
    } else if (type === 'bins') {
      setFilters((prev) => ({ ...prev, entityType: 'Bins' }));
    } else {
      handleResetFilters();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto pb-24">
      {/* 1. Monitoring Page Header */}
      <MonitoringHeader
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
        iotDemoActive={iotDemoActive}
        onToggleIotDemo={handleToggleIotDemo}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={(sec) => setRefreshInterval(sec)}
        lastUpdated={lastUpdated}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
        onOpenFilters={() => setIsFilterDrawerOpen(true)}
        onManualRefresh={refreshTelemetryData}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        onToggleFullscreenMap={() => setIsFullscreenMap(!isFullscreenMap)}
        isFullscreenMap={isFullscreenMap}
        activeFilterCount={activeFilterCount}
      />


      {/* 2. Top 5 KPI Summary Cards */}
      <MonitoringKpiGrid summary={kpiSummary} onFilterClick={handleKpiFilterClick} />

      {/* 3. MAIN MAP & LIVE VEHICLES CANVAS (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[580px]">
        {/* Left Column: Realistic OpenStreetMap Style Campus Bin Map (Takes 8 Columns) */}
        <div className="lg:col-span-8 min-h-[540px]">
          <MonitoringMap
            bins={bins}
            vehicles={vehicles}
            routes={routes}
            selectedBinId={selectedEntity?.type === 'bin' ? selectedEntity.data.id : undefined}
            selectedVehicleId={
              selectedEntity?.type === 'vehicle' ? selectedEntity.data.id : undefined
            }
            selectedRouteId={
              selectedEntity?.type === 'route' ? selectedEntity.data.id : undefined
            }
            onSelectBin={(bin) => setSelectedEntity({ type: 'bin', data: bin })}
            onSelectVehicle={(vehicle) => setSelectedEntity({ type: 'vehicle', data: vehicle })}
            onSelectRoute={(route) => setSelectedEntity({ type: 'route', data: route })}
            isFullscreen={isFullscreenMap}
            onToggleFullscreen={() => setIsFullscreenMap(!isFullscreenMap)}
            showVehicles={mapPanelFilters.showVehicles}
            showRoutes={mapPanelFilters.showRoutes}
            showBinLabels={mapPanelFilters.showBinLabels}
          />
        </div>

        {/* Right Column: Live Vehicles & Map Filters Panel (Takes 4 Columns) */}
        <div className="lg:col-span-4 min-h-[540px]">
          <LiveVehiclesPanel
            vehicles={vehicles}
            routes={routes}
            bins={bins}
            selectedVehicleId={selectedEntity?.type === 'vehicle' ? selectedEntity.data.id : undefined}
            onSelectVehicle={(vehicle) => setSelectedEntity({ type: 'vehicle', data: vehicle })}
            filters={mapPanelFilters}
            onFilterChange={(updated) => setMapPanelFilters((prev) => ({ ...prev, ...updated }))}
            onClearFilters={handleResetFilters}
          />
        </div>
      </div>

      {/* 4. Slide-over Entity Inspector Drawer */}
      <SelectedEntityDrawer
        entity={selectedEntity}
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onNavigateToModule={onNavigateTab}
      />
    </div>
  );
};

export default MonitoringPage;
