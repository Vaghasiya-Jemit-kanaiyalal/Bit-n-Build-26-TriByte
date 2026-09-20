import React, { useState, useMemo } from 'react';
import { RouteHeader } from './RouteHeader';
import { RouteKpiCards } from './RouteKpiCards';
import { RouteAlerts } from './RouteAlerts';
import { RouteComparison } from './RouteComparison';
import { RouteMap } from './RouteMap';
import { SelectedRoutePanel } from './SelectedRoutePanel';
import { RouteFilters } from './RouteFilters';
import { RouteStopsTable } from './RouteStopsTable';
import { RouteListTable } from './RouteListTable';
import { CreateRouteModal } from './CreateRouteModal';
import { RouteDetailsDrawer } from './RouteDetailsDrawer';
import { BinDetailModal } from './BinDetailModal';
import { ReportIssueModal } from './ReportIssueModal';
import { useEffect } from 'react';
import { initialRoutes, initialAlerts } from '../../mock/routeData';
import type { RouteItem, BinStop, RouteAlert } from '../../mock/routeData';
import { routeService } from '../../services/routeService';

export const RoutePage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>(initialRoutes);
  const [alerts, setAlerts] = useState<RouteAlert[]>(initialAlerts);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('RT-024');

  useEffect(() => {
    routeService.getRoutes().then((data) => {
      if (data && data.length > 0) {
        setRoutes(data);
        setSelectedRouteId(data[0].id);
      }
    });
  }, []);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');

  // Modal / Drawer States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [drawerRoute, setDrawerRoute] = useState<RouteItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBinStop, setSelectedBinStop] = useState<BinStop | null>(null);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active selected route object
  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((rt) => {
      const matchesSearch =
        searchTerm === '' ||
        rt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rt.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rt.zone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || rt.status === statusFilter;
      const matchesZone = zoneFilter === 'All' || rt.zone === zoneFilter;
      const matchesVehicle = vehicleFilter === 'All' || rt.vehicleId === vehicleFilter;

      return matchesSearch && matchesStatus && matchesZone && matchesVehicle;
    });
  }, [routes, searchTerm, statusFilter, zoneFilter, vehicleFilter]);

  // Handler Actions
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleCreateRoute = (newRoute: RouteItem) => {
    setRoutes((prev) => [newRoute, ...prev]);
    setSelectedRouteId(newRoute.id);
    setIsCreateModalOpen(false);

    // Add alert notification
    const newAlert: RouteAlert = {
      id: 'alt-' + Date.now(),
      message: `Route ${newRoute.id} (${newRoute.name}) created and scheduled for dispatch.`,
      severity: 'info',
      timestamp: 'Just now',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleUpdateRouteStatus = (newStatus: RouteItem['status']) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === activeRoute.id ? { ...r, status: newStatus } : r))
    );
  };

  const handleMarkStopComplete = () => {
    if (!activeRoute.stops || activeRoute.stops.length === 0) return;
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoute.id) return r;
        const newCompleted = Math.min(r.completedStops + 1, r.totalStops);
        const newStatus = newCompleted === r.totalStops ? 'Completed' : r.status;
        return {
          ...r,
          completedStops: newCompleted,
          status: newStatus,
        };
      })
    );
  };

  const handleReportIssueSubmit = (issueText: string) => {
    const newAlert: RouteAlert = {
      id: 'alt-' + Date.now(),
      message: `Route ${activeRoute.id} Alert: ${issueText}`,
      severity: 'warning',
      timestamp: 'Just now',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOpenBinModal = (stop: BinStop) => {
    setSelectedBinStop(stop);
    setIsBinModalOpen(true);
  };

  const handleOpenDrawer = (rt: RouteItem) => {
    setDrawerRoute(rt);
    setIsDrawerOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setZoneFilter('All');
    setVehicleFilter('All');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1f2937] p-4 sm:p-6 md:p-8 font-sans max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <RouteHeader
        onCreateClick={() => setIsCreateModalOpen(true)}
        onRefreshClick={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* KPI Cards */}
      <RouteKpiCards
        activeCount={12}
        plannedCount={7}
        inProgressCount={4}
        completedCount={21}
        atRiskCount={2}
      />

      {/* Operational Warnings / Alerts */}
      <RouteAlerts alerts={alerts} onDismissAlert={handleDismissAlert} />

      {/* Simulated Optimization Comparison */}
      <RouteComparison />

      {/* MAIN MAP & SELECTED ROUTE GRID (65-70% vs 30-35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left Map View (~68% width) */}
        <div className="lg:col-span-8 min-h-[420px]">
          <RouteMap
            stops={activeRoute.stops || []}
            onSelectBin={handleOpenBinModal}
            selectedBinId={selectedBinStop?.binId}
          />
        </div>

        {/* Right Selected Route Panel (~32% width) */}
        <div className="lg:col-span-4 min-h-[420px]">
          <SelectedRoutePanel
            route={activeRoute}
            onUpdateRouteStatus={handleUpdateRouteStatus}
            onReportIssueClick={() => setIsReportIssueOpen(true)}
            onMarkStopComplete={handleMarkStopComplete}
          />
        </div>
      </div>

      {/* ROUTE FILTERS BAR */}
      <RouteFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        zoneFilter={zoneFilter}
        onZoneChange={setZoneFilter}
        vehicleFilter={vehicleFilter}
        onVehicleChange={setVehicleFilter}
        onClearFilters={handleClearFilters}
      />

      {/* ROUTE STOPS TABLE FOR SELECTED ROUTE */}
      <RouteStopsTable
        stops={activeRoute.stops || []}
        onViewStopBin={handleOpenBinModal}
        selectedBinId={selectedBinStop?.binId}
      />

      {/* TODAY'S ROUTES MANAGEMENT TABLE */}
      <RouteListTable
        routes={filteredRoutes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={(rt) => setSelectedRouteId(rt.id)}
        onViewDetailsDrawer={handleOpenDrawer}
      />

      {/* MODALS & DRAWERS */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoute={handleCreateRoute}
      />

      <RouteDetailsDrawer
        route={drawerRoute}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectBin={handleOpenBinModal}
      />

      <BinDetailModal
        bin={selectedBinStop}
        isOpen={isBinModalOpen}
        onClose={() => setIsBinModalOpen(false)}
        routeName={activeRoute.id}
      />

      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        onSubmitIssue={handleReportIssueSubmit}
        routeId={activeRoute.id}
      />

    </div>
  );
};

export default RoutePage;
