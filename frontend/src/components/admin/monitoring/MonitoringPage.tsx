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
  ZoneName,
} from '../../../types/monitoring';
import { monitoringService } from '../../../services/monitoringService';

// Subcomponents
import { MonitoringHeader } from './MonitoringHeader';
import { MonitoringKpiGrid } from './MonitoringKpiGrid';
import { OperationalHealthBar } from './OperationalHealthBar';
import { MonitoringMap } from './MonitoringMap';
import { SelectedEntityDrawer } from './SelectedEntityDrawer';
import { LiveOperationsPanel } from './LiveOperationsPanel';
import { SensorHealthSection } from './SensorHealthSection';
import { FleetMonitoringTable } from './FleetMonitoringTable';
import { RouteMonitoringTable } from './RouteMonitoringTable';
import { ZoneLiveStatus } from './ZoneLiveStatus';
import { CollectionActivitySection } from './CollectionActivitySection';
import { NetworkHealthBar } from './NetworkHealthBar';
import { FilterDrawer } from './FilterDrawer';

// Alert strip icon
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface MonitoringPageProps {
  onNavigateTab?: (tabName: string) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({ onNavigateTab }) => {
  // Live Simulation State
  const [isLive, setIsLive] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5);
  const [lastUpdated, setLastUpdated] = useState<string>(
    monitoringService.getLastUpdatedTimestamp()
  );

  // View & Drawer States
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isFullscreenMap, setIsFullscreenMap] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Filter & Search State
  const [filters, setFilters] = useState<MonitoringFilterState>({
    searchQuery: '',
    entityType: 'All',
    status: 'All',
    zone: 'All',
    severity: 'All',
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
  const [sensors, setSensors] = useState<MonitoredSensor[]>([]);
  const [activities, setActivities] = useState<LiveActivityEvent[]>([]);
  const [zoneStatuses, setZoneStatuses] = useState<ZoneStatusSummary[]>([]);

  // Telemetry Refresh Function
  const refreshTelemetryData = useCallback(() => {
    setKpiSummary(monitoringService.getMonitoringSummary());
    setBins(monitoringService.getBins(filters));
    setVehicles(monitoringService.getVehicles(filters));
    setRoutes(monitoringService.getRoutes(filters));
    setSensors(monitoringService.getSensors());
    setActivities(monitoringService.getLiveActivities(filters));
    setZoneStatuses(monitoringService.getZoneStatuses());
    setLastUpdated(monitoringService.getLastUpdatedTimestamp());
  }, [filters]);

  // Initial & Live Simulation Interval Setup
  useEffect(() => {
    refreshTelemetryData();

    if (isLive) {
      monitoringService.startSimulation((ts) => {
        setLastUpdated(ts);
        refreshTelemetryData();
      }, refreshInterval);
    } else {
      monitoringService.stopSimulation();
    }

    // MANDATORY CLEANUP ON UNMOUNT
    return () => {
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
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Live Operational Alert Strip */}
      <div className="bg-red-50/90 border border-red-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-red-600 text-white rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-red-950 uppercase tracking-wider font-mono mr-2">
              CRITICAL NOTICE:
            </span>
            <span className="text-red-900 font-medium">
              14 bins currently above 90% fill capacity. 2 active routes delayed.
            </span>
          </div>
        </div>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('Alerts')}
            className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800 hover:underline shrink-0 cursor-pointer"
          >
            <span>View All Operational Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 1. Monitoring Header & Search */}
      <MonitoringHeader
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
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
        activeFilterCount={activeFilterCount}
      />

      {/* 2. Top Live KPI Cards */}
      <MonitoringKpiGrid summary={kpiSummary} onFilterClick={handleKpiFilterClick} />

      {/* 3. Operational Network Health Bar */}
      <OperationalHealthBar />

      {/* 4. MAIN OPERATIONS CANVAS (MAP or LIST) */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[560px]">
          {/* Large Simulated Operations Vector Map (Takes 2 Columns) */}
          <div className="lg:col-span-2 min-h-[500px]">
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
            />
          </div>

          {/* Real-time Streaming Live Operations Activity Feed (Takes 1 Column) */}
          <div className="min-h-[500px]">
            <LiveOperationsPanel activities={activities} />
          </div>
        </div>
      ) : (
        /* LIST VIEW FALLBACK */
        <div className="space-y-6">
          <FleetMonitoringTable
            vehicles={vehicles}
            onSelectVehicle={(v) => setSelectedEntity({ type: 'vehicle', data: v })}
          />
          <RouteMonitoringTable
            routes={routes}
            onSelectRoute={(r) => setSelectedEntity({ type: 'route', data: r })}
          />
        </div>
      )}

      {/* 5. Municipal Zone Live Operational Status */}
      <ZoneLiveStatus
        zones={zoneStatuses}
        onSelectZone={(zoneName: ZoneName) => handleFilterChange({ zone: zoneName })}
      />

      {/* 6. Live Collection Activity Progress */}
      <CollectionActivitySection />

      {/* 7. Fleet & Active Route Monitoring Tables (When in Map View) */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FleetMonitoringTable
            vehicles={vehicles}
            onSelectVehicle={(v) => setSelectedEntity({ type: 'vehicle', data: v })}
          />
          <RouteMonitoringTable
            routes={routes}
            onSelectRoute={(r) => setSelectedEntity({ type: 'route', data: r })}
          />
        </div>
      )}

      {/* 8. IoT Sensor Network Health & Telemetry */}
      <SensorHealthSection sensors={sensors} />

      {/* 9. Infrastructure Network Health Bar */}
      <NetworkHealthBar />

      {/* Slide-over Drawers */}
      <SelectedEntityDrawer
        entity={selectedEntity}
        isOpen={!!selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onNavigateToModule={onNavigateTab}
      />

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        filters={filters}
        onClose={() => setIsFilterDrawerOpen(false)}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default MonitoringPage;
