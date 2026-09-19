import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverDashboardData, DriverRouteStop } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';

import DriverHeader from './DriverHeader';
import DriverStatusStrip from './DriverStatusStrip';
import DriverKpiGrid from './DriverKpiGrid';
import CurrentRouteCard from './CurrentRouteCard';
import DriverVehicleCard from './DriverVehicleCard';
import RouteProgressCard from './RouteProgressCard';
import NextCollectionCard from './NextCollectionCard';
import UpcomingStops from './UpcomingStops';
import DriverAlerts from './DriverAlerts';
import DriverActivity from './DriverActivity';
import DriverQuickActions from './DriverQuickActions';
import BinDetailsDrawer from './BinDetailsDrawer';
import CollectionConfirmModal from './CollectionConfirmModal';
import ReportIssueModal from './ReportIssueModal';

interface DriverDashboardProps {
  user: UserSession;
  onSignOut?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  user,
  onSignOut: _onSignOut,
  onNavigateTab,
}) => {
  const [data, setData] = useState<DriverDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Selected stop for modals/drawers
  const [selectedDrawerStop, setSelectedDrawerStop] = useState<DriverRouteStop | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedConfirmStop, setSelectedConfirmStop] = useState<DriverRouteStop | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedReportStop, setSelectedReportStop] = useState<DriverRouteStop | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const res = await driverService.getDashboard(user.name, user.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load driver dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = driverService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [user]);

  const handleRefresh = async () => {
    setIsSyncing(true);
    await loadData();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleStartRoute = async () => {
    await driverService.startRoute();
  };

  const handleStartCollection = async (stop: DriverRouteStop) => {
    await driverService.startStop(stop.id);
  };

  const handleConfirmCollection = async (stopId: string, customWeightKg?: number) => {
    await driverService.completeStop(stopId, customWeightKg);
  };

  const handleSubmitIssue = async (input: any) => {
    await driverService.reportIssue(input);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await driverService.acknowledgeAlert(alertId);
  };

  const handleViewBinDetails = (stop: DriverRouteStop) => {
    setSelectedDrawerStop(stop);
    setIsDrawerOpen(true);
  };

  const handleCollectBin = (stop: DriverRouteStop) => {
    setSelectedConfirmStop(stop);
    setIsConfirmModalOpen(true);
  };

  const handleReportIssueForStop = (stop: DriverRouteStop) => {
    setSelectedReportStop(stop);
    setIsReportModalOpen(true);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold">Loading Collection Workspace...</p>
      </div>
    );
  }

  const { driverStatus, lastSync, vehicle, route, alerts, activities } = data;

  // Next upcoming or current stop for NextCollectionCard
  const nextStop = route.stops.find((s) => s.status === 'CURRENT' || s.status === 'COLLECTING') ||
    route.stops.find((s) => s.status === 'UPCOMING') || null;

  const upcomingList = route.stops.filter((s) => s.status === 'CURRENT' || s.status === 'COLLECTING' || s.status === 'UPCOMING').slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      {/* Header */}
      <DriverHeader
        user={user}
        notificationCount={alerts.filter((a) => !a.acknowledged).length}
        onNavigateTab={onNavigateTab}
        onRefresh={handleRefresh}
        isSyncing={isSyncing}
      />

      <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Driver Operational Status Strip */}
        <DriverStatusStrip
          status={driverStatus}
          vehicleCode={vehicle.code}
          routeId={route.id}
          routeStatus={route.status}
          lastSync={lastSync}
        />

        {/* Top KPI Cards Grid */}
        <DriverKpiGrid route={route} />

        {/* Grid Row 1: CURRENT ROUTE | MY VEHICLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrentRouteCard
            route={route}
            driverName={user.name}
            onNavigateToRoute={() => onNavigateTab('My Route')}
            onStartRoute={handleStartRoute}
          />
          <DriverVehicleCard
            vehicle={vehicle}
            onNavigateToVehicle={() => onNavigateTab('Vehicle')}
            onReportVehicleIssue={() => {
              setSelectedReportStop(null);
              setIsReportModalOpen(true);
            }}
          />
        </div>

        {/* Grid Row 2: ROUTE PROGRESS | NEXT COLLECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RouteProgressCard route={route} />
          <NextCollectionCard
            stop={nextStop}
            onNavigateStop={() => onNavigateTab('My Route')}
            onViewBinDetails={handleViewBinDetails}
            onCollectBin={handleCollectBin}
          />
        </div>

        {/* Grid Row 3: UPCOMING STOPS */}
        <UpcomingStops
          stops={upcomingList}
          onViewBinDetails={handleViewBinDetails}
          onNavigateToFullRoute={() => onNavigateTab('My Route')}
        />

        {/* Grid Row 4: ATTENTION REQUIRED | RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DriverAlerts
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
          <DriverActivity activities={activities} />
        </div>

        {/* Quick Actions Bar */}
        <DriverQuickActions
          isRouteStarted={route.status === 'IN_PROGRESS' || route.status === 'PAUSED'}
          onNavigateTab={onNavigateTab}
          onOpenReportIssue={() => {
            setSelectedReportStop(null);
            setIsReportModalOpen(true);
          }}
          onStartRoute={handleStartRoute}
        />
      </main>

      {/* Modals & Drawers */}
      <BinDetailsDrawer
        isOpen={isDrawerOpen}
        stop={selectedDrawerStop}
        onClose={() => setIsDrawerOpen(false)}
        onStartCollection={handleStartCollection}
        onMarkCollected={handleCollectBin}
        onReportIssue={handleReportIssueForStop}
      />

      <CollectionConfirmModal
        isOpen={isConfirmModalOpen}
        stop={selectedConfirmStop}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCollection}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        stop={selectedReportStop}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIssue={handleSubmitIssue}
      />
    </div>
  );
};

export default DriverDashboard;
