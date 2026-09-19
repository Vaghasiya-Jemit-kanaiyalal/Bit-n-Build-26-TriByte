import React, { useState, useEffect, useCallback } from 'react';
import type {
  DashboardFilterState,
  DashboardMapBinMarker,
  PriorityCollectionItem,
  DashboardVehicleItem,
  ActiveRouteItem,
  AttentionItem,
} from '../../../types/dashboard';
import { dashboardService } from '../../../services/dashboardService';

// Subcomponents
import { DashboardHeader } from './DashboardHeader';
import { DashboardStatusStrip } from './DashboardStatusStrip';
import { DashboardKpiCards } from './DashboardKpiCards';
import { QuickActions } from './QuickActions';
import { DashboardMap } from './DashboardMap';
import { LiveOperationsFeed } from './LiveOperationsFeed';
import { BinCapacityCard } from './BinCapacityCard';
import { AIForecastCard } from './AIForecastCard';
import { CollectionPerformanceCard } from './CollectionPerformanceCard';
import { WasteCompositionCard } from './WasteCompositionCard';
import { ZonePerformanceTable } from './ZonePerformanceTable';
import { PriorityCollectionTable } from './PriorityCollectionTable';
import { FleetStatusCard } from './FleetStatusCard';
import { ActiveRoutesCard } from './ActiveRoutesCard';
import { AttentionRequired } from './AttentionRequired';
import { RecentActivity } from './RecentActivity';

// Drawers & Modals
import { BinDetailsDrawer } from './BinDetailsDrawer';
import { VehicleDetailsDrawer } from './VehicleDetailsDrawer';
import { RouteDetailsDrawer } from './RouteDetailsDrawer';
import { AlertDetailsDrawer } from './AlertDetailsDrawer';
import { AssignVehicleModal } from './AssignVehicleModal';

interface AdminDashboardPageProps {
  user?: { name?: string; role?: string };
  onNavigateTab?: (tabName: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  user = { name: 'Jemit Vaghasiya', role: 'Waste Manager' },
  onNavigateTab,
}) => {
  // Navigation Helper
  const handleNavigate = useCallback(
    (tabName: string) => {
      if (onNavigateTab) {
        onNavigateTab(tabName);
      }
    },
    [onNavigateTab]
  );

  // Filter State
  const [filters, setFilters] = useState<DashboardFilterState>({
    dateRange: 'today',
    zone: 'All',
    operationalStatus: 'All',
  });

  // Live Stream Toggle State
  const [isLive, setIsLive] = useState<boolean>(true);

  // Drawers & Modals State
  const [selectedBin, setSelectedBin] = useState<DashboardMapBinMarker | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<DashboardVehicleItem | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<ActiveRouteItem | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AttentionItem | null>(null);
  const [assigningPriorityBin, setAssigningPriorityBin] = useState<PriorityCollectionItem | null>(null);

  // Data State
  const [statusStrip, setStatusStrip] = useState(dashboardService.getStatusStrip());
  const [kpis, setKpis] = useState(dashboardService.getKpiMetrics());
  const quickActions = dashboardService.getQuickActions();
  const [binMarkers, setBinMarkers] = useState<DashboardMapBinMarker[]>(dashboardService.getMapBinMarkers(filters));
  const vehicleMarkers = dashboardService.getMapVehicleMarkers();
  const routePolylines = dashboardService.getMapRoutePolylines();
  const [liveEvents, setLiveEvents] = useState(dashboardService.getLiveOperationsFeed());
  const binCapacity = dashboardService.getBinCapacityDistribution();
  const aiForecast = dashboardService.getAiForecastSummary();
  const collectionPerformance = dashboardService.getCollectionPerformanceSummary();
  const wasteComposition = dashboardService.getWasteCompositionSummary();
  const [zonePerformance, setZonePerformance] = useState(dashboardService.getZonePerformanceList(filters));
  const [priorityQueue, setPriorityQueue] = useState(dashboardService.getPriorityCollectionList(filters));
  const fleetStatus = dashboardService.getFleetStatusSummary();
  const activeRoutes = dashboardService.getActiveRoutesList();
  const attentionItems = dashboardService.getAttentionItemList();
  const recentActivity = dashboardService.getRecentActivityList();

  // Refresh Handler
  const handleRefresh = useCallback(() => {
    setStatusStrip(dashboardService.getStatusStrip());
    setKpis(dashboardService.getKpiMetrics());
    setBinMarkers(dashboardService.getMapBinMarkers(filters));
    setZonePerformance(dashboardService.getZonePerformanceList(filters));
    setPriorityQueue(dashboardService.getPriorityCollectionList(filters));
    setLiveEvents(dashboardService.getLiveOperationsFeed());
  }, [filters]);

  // Live Stream Simulation Effect
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setStatusStrip((prev) => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    }, 6000);

    return () => clearInterval(timer);
  }, [isLive]);

  // Re-fetch data on filter change
  useEffect(() => {
    setBinMarkers(dashboardService.getMapBinMarkers(filters));
    setZonePerformance(dashboardService.getZonePerformanceList(filters));
    setPriorityQueue(dashboardService.getPriorityCollectionList(filters));
  }, [filters]);

  // Modal Handlers
  const handleConfirmAssignment = (binId: string, vehicleCode: string) => {
    dashboardService.assignVehicleToPriorityBin(binId, vehicleCode);
    setPriorityQueue(dashboardService.getPriorityCollectionList(filters));
    alert(`Vehicle ${vehicleCode} assigned successfully.`);
  };

  const handleExport = () => {
    alert(`Simulated Operational Summary PDF/CSV export generated on ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* 1. Header */}
      <DashboardHeader
        user={user}
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Main Body */}
      <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
        {/* 2. Top System Status Strip */}
        <DashboardStatusStrip
          status={{ ...statusStrip, isLive }}
          onToggleLive={() => setIsLive(!isLive)}
        />

        {/* 3. Top KPI Grid */}
        <DashboardKpiCards kpi={kpis} onNavigateTab={handleNavigate} />

        {/* 4. Quick Actions Row */}
        <QuickActions actions={quickActions} onNavigateTab={handleNavigate} />

        {/* 5. Live Operations Map & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <DashboardMap
              bins={binMarkers}
              vehicles={vehicleMarkers}
              routes={routePolylines}
              onSelectBin={setSelectedBin}
              onSelectVehicle={(v) => {
                const found = fleetStatus.vehicles.find((item) => item.vehicleCode === v.vehicleCode);
                if (found) setSelectedVehicle(found);
              }}
              onSelectRoute={(r) => {
                const found = activeRoutes.find((item) => item.routeCode === r.routeCode);
                if (found) setSelectedRoute(found);
              }}
            />
          </div>
          <div className="lg:col-span-4">
            <LiveOperationsFeed events={liveEvents} />
          </div>
        </div>

        {/* 6. Bin Capacity Overview & AI Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <BinCapacityCard distribution={binCapacity} onNavigateTab={handleNavigate} />
          </div>
          <div className="lg:col-span-6">
            <AIForecastCard forecast={aiForecast} onNavigateTab={handleNavigate} />
          </div>
        </div>

        {/* 7. Collection Performance & Waste Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <CollectionPerformanceCard performance={collectionPerformance} onNavigateTab={handleNavigate} />
          </div>
          <div className="lg:col-span-6">
            <WasteCompositionCard composition={wasteComposition} onNavigateTab={handleNavigate} />
          </div>
        </div>

        {/* 8. Municipal Zone Performance Table */}
        <ZonePerformanceTable zones={zonePerformance} />

        {/* 9. Priority Collection Queue */}
        <PriorityCollectionTable
          items={priorityQueue}
          onSelectBin={(code) => {
            const found = binMarkers.find((b) => b.binCode === code);
            if (found) setSelectedBin(found);
          }}
          onAssignVehicle={setAssigningPriorityBin}
          onPrioritize={(item) => {
            alert(`Bin ${item.binCode} prioritized for immediate route dispatch.`);
          }}
        />

        {/* 10. Fleet Status & Active Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <FleetStatusCard
              fleet={fleetStatus}
              onSelectVehicle={setSelectedVehicle}
              onNavigateTab={handleNavigate}
            />
          </div>
          <div className="lg:col-span-6">
            <ActiveRoutesCard
              routes={activeRoutes}
              onSelectRoute={setSelectedRoute}
              onNavigateTab={handleNavigate}
            />
          </div>
        </div>

        {/* 11. Attention Required & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <AttentionRequired
              items={attentionItems}
              onSelectAlert={setSelectedAlert}
              onNavigateTab={handleNavigate}
            />
          </div>
          <div className="lg:col-span-5">
            <RecentActivity activity={recentActivity} />
          </div>
        </div>
      </main>

      {/* DRAWERS & MODALS */}
      <BinDetailsDrawer
        bin={selectedBin}
        isOpen={!!selectedBin}
        onClose={() => setSelectedBin(null)}
        onNavigateTab={handleNavigate}
      />

      <VehicleDetailsDrawer
        vehicle={selectedVehicle}
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onNavigateTab={handleNavigate}
      />

      <RouteDetailsDrawer
        route={selectedRoute}
        isOpen={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onNavigateTab={handleNavigate}
      />

      <AlertDetailsDrawer
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onNavigateTab={handleNavigate}
      />

      <AssignVehicleModal
        item={assigningPriorityBin}
        vehicles={fleetStatus.vehicles}
        isOpen={!!assigningPriorityBin}
        onClose={() => setAssigningPriorityBin(null)}
        onConfirm={handleConfirmAssignment}
      />
    </div>
  );
};

export default AdminDashboardPage;
