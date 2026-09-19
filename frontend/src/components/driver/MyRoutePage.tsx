import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverRoute, DriverRouteStop, DriverAlert } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';

import DriverHeader from './DriverHeader';
import RouteHeader from './route/RouteHeader';
import RouteMap from './route/RouteMap';
import CurrentStopPanel from './route/CurrentStopPanel';
import StopTimeline from './route/StopTimeline';
import RouteSummary from './route/RouteSummary';
import CollectionSummary from './route/CollectionSummary';
import RouteIssues from './route/RouteIssues';
import BinDetailsDrawer from './BinDetailsDrawer';
import CollectionConfirmModal from './CollectionConfirmModal';
import ReportIssueModal from './ReportIssueModal';
import SkipStopModal from './SkipStopModal';

interface MyRoutePageProps {
  user: UserSession;
  onSignOut?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MyRoutePage: React.FC<MyRoutePageProps> = ({
  user,
  onSignOut: _onSignOut,
  onNavigateTab,
}) => {
  const [route, setRoute] = useState<DriverRoute | null>(null);
  const [alerts, setAlerts] = useState<DriverAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected stop on map/timeline
  const [selectedStopId, setSelectedStopId] = useState<string>('');

  // Modals / Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerStop, setDrawerStop] = useState<DriverRouteStop | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [confirmStop, setConfirmStop] = useState<DriverRouteStop | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportStop, setReportStop] = useState<DriverRouteStop | null>(null);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState<boolean>(false);
  const [skipStop, setSkipStop] = useState<DriverRouteStop | null>(null);

  // Complete Route Confirmation warning modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);

  const loadRouteData = async () => {
    try {
      const currentRoute = await driverService.getCurrentRoute();
      const currentAlerts = await driverService.getAlerts();
      setRoute(currentRoute);
      setAlerts(currentAlerts);

      // Auto select current stop if available
      if (!selectedStopId && currentRoute.stops.length > 0) {
        const cur = currentRoute.stops.find((s) => s.status === 'CURRENT' || s.status === 'COLLECTING') || currentRoute.stops[0];
        setSelectedStopId(cur.id);
      }
    } catch (err) {
      console.error('Failed to load route data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteData();
    const unsubscribe = driverService.subscribe(() => {
      loadRouteData();
    });

    // Live movement tick interval
    const simInterval = setInterval(() => {
      driverService.simulateTick();
    }, 6000);

    return () => {
      unsubscribe();
      clearInterval(simInterval);
    };
  }, []);

  const handleStartRoute = async () => {
    await driverService.startRoute();
  };

  const handlePauseRoute = async () => {
    await driverService.pauseRoute();
  };

  const handleResumeRoute = async () => {
    await driverService.resumeRoute();
  };

  const handleCompleteRouteClick = () => {
    if (route && route.remainingStops > 0) {
      setIsCompleteModalOpen(true);
    } else {
      driverService.completeRoute();
    }
  };

  const handleConfirmCompleteRoute = async () => {
    await driverService.completeRoute();
    setIsCompleteModalOpen(false);
  };

  const handleStartCollection = async (stopId: string) => {
    await driverService.startStop(stopId);
  };

  const handleConfirmCollection = async (stopId: string, customWeightKg?: number) => {
    await driverService.completeStop(stopId, customWeightKg);
  };

  const handleConfirmSkipStop = async (stopId: string, reason: string, notes?: string) => {
    await driverService.skipStop(stopId, reason, notes);
  };

  const handleSubmitIssue = async (input: any) => {
    await driverService.reportIssue(input);
  };

  if (loading || !route) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold">Loading Driver Field Map Workspace...</p>
      </div>
    );
  }

  const selectedStop = route.stops.find((s) => s.id === selectedStopId) ||
    route.stops.find((s) => s.status === 'CURRENT' || s.status === 'COLLECTING') ||
    route.stops[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      {/* Header */}
      <DriverHeader
        user={user}
        notificationCount={alerts.filter((a) => !a.acknowledged).length}
        onNavigateTab={onNavigateTab}
        onRefresh={loadRouteData}
      />

      <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Main Route Header & Controls */}
        <RouteHeader
          route={route}
          onStartRoute={handleStartRoute}
          onPauseRoute={handlePauseRoute}
          onResumeRoute={handleResumeRoute}
          onCompleteRoute={handleCompleteRouteClick}
        />

        {/* Map & Current Stop Control Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated GIS Map (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <RouteMap
              stops={route.stops}
              routeStatus={route.status}
              selectedStopId={selectedStopId}
              onSelectStop={(st) => setSelectedStopId(st.id)}
            />
          </div>

          {/* Current Stop Control Panel */}
          <div>
            <CurrentStopPanel
              stop={selectedStop}
              onNavigateStop={(st) => setSelectedStopId(st.id)}
              onStartCollection={handleStartCollection}
              onMarkCollected={(st) => {
                setConfirmStop(st);
                setIsConfirmModalOpen(true);
              }}
              onReportIssue={(st) => {
                setReportStop(st);
                setIsReportModalOpen(true);
              }}
              onSkipStop={(st) => {
                setSkipStop(st);
                setIsSkipModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Ordered Stop Timeline */}
        <StopTimeline
          stops={route.stops}
          selectedStopId={selectedStopId}
          onSelectStop={(st) => setSelectedStopId(st.id)}
          onViewBinDetails={(st) => {
            setDrawerStop(st);
            setIsDrawerOpen(true);
          }}
        />

        {/* Bottom Metrics & Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RouteSummary route={route} />
          <CollectionSummary wasteByCategory={route.wasteByCategory} />
          <RouteIssues stops={route.stops} alerts={alerts} />
        </div>
      </main>

      {/* Modals & Drawers */}
      <BinDetailsDrawer
        isOpen={isDrawerOpen}
        stop={drawerStop}
        onClose={() => setIsDrawerOpen(false)}
        onStartCollection={(st) => handleStartCollection(st.id)}
        onMarkCollected={(st) => {
          setConfirmStop(st);
          setIsConfirmModalOpen(true);
        }}
        onReportIssue={(st) => {
          setReportStop(st);
          setIsReportModalOpen(true);
        }}
      />

      <CollectionConfirmModal
        isOpen={isConfirmModalOpen}
        stop={confirmStop}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCollection}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        stop={reportStop}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIssue={handleSubmitIssue}
      />

      <SkipStopModal
        isOpen={isSkipModalOpen}
        stop={skipStop}
        onClose={() => setIsSkipModalOpen(false)}
        onSkipConfirm={handleConfirmSkipStop}
      />

      {/* Complete Route Confirmation Warning Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-900">
            <h3 className="font-extrabold text-base mb-2 text-slate-900">Complete Route?</h3>
            <p className="text-xs text-slate-600 mb-4">
              There are still <strong className="text-amber-700">{route.remainingStops} remaining stops</strong> on this route. Are you sure you want to finish and log off this route early?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteRoute}
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer border-none shadow-xs"
              >
                Complete Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoutePage;
