import type {
  DriverDashboardData,
  DriverRoute,
  DriverRouteStop,
  DriverVehicle,
  DriverAlert,
  DriverActivity,
  ReportIssueInput,
  DriverStatus,
} from '../../types/driver';
import {
  INITIAL_DRIVER_ALERTS,
  INITIAL_DRIVER_ACTIVITIES,
  INITIAL_DRIVER_ROUTE,
  INITIAL_DRIVER_STOPS,
  INITIAL_DRIVER_VEHICLE,
} from '../../mock/driver/driverMockData';

// In-memory state for live frontend simulation
let driverStatusState: DriverStatus = 'ON_ROUTE';
let vehicleState: DriverVehicle = { ...INITIAL_DRIVER_VEHICLE };
let routeState: DriverRoute = {
  ...INITIAL_DRIVER_ROUTE,
  stops: INITIAL_DRIVER_STOPS.map((s) => ({ ...s })),
  wasteByCategory: { ...INITIAL_DRIVER_ROUTE.wasteByCategory },
};
let alertsState: DriverAlert[] = [...INITIAL_DRIVER_ALERTS];
let activitiesState: DriverActivity[] = [...INITIAL_DRIVER_ACTIVITIES];
let listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach((fn) => fn());
};

export const driverService = {
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  async getDashboard(driverName: string = 'Rahul Patel', driverId: string = 'DRV-104'): Promise<DriverDashboardData> {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      driverName,
      driverId,
      driverStatus: driverStatusState,
      lastSync: timeStr,
      vehicle: { ...vehicleState },
      route: { ...routeState },
      alerts: [...alertsState],
      activities: [...activitiesState],
    };
  },

  async getCurrentRoute(): Promise<DriverRoute> {
    return { ...routeState };
  },

  async getVehicle(): Promise<DriverVehicle> {
    return { ...vehicleState };
  },

  async getNextStop(): Promise<DriverRouteStop | null> {
    const current = routeState.stops.find((s) => s.status === 'CURRENT' || s.status === 'COLLECTING');
    if (current) return current;
    const upcoming = routeState.stops.find((s) => s.status === 'UPCOMING');
    return upcoming || null;
  },

  async getUpcomingStops(limit: number = 8): Promise<DriverRouteStop[]> {
    return routeState.stops
      .filter((s) => s.status === 'CURRENT' || s.status === 'COLLECTING' || s.status === 'UPCOMING')
      .slice(0, limit);
  },

  async getAlerts(): Promise<DriverAlert[]> {
    return [...alertsState];
  },

  async getActivity(): Promise<DriverActivity[]> {
    return [...activitiesState];
  },

  async startRoute(): Promise<DriverRoute> {
    driverStatusState = 'ON_ROUTE';
    routeState.status = 'IN_PROGRESS';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    routeState.startTime = nowStr;

    // Set first non-completed stop as current if none is current
    const currentIdx = routeState.stops.findIndex((s) => s.status === 'CURRENT');
    if (currentIdx === -1) {
      const firstUpcoming = routeState.stops.findIndex((s) => s.status === 'UPCOMING');
      if (firstUpcoming !== -1) {
        routeState.stops[firstUpcoming].status = 'CURRENT';
      }
    }

    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: 'Route Started',
      description: `Route ${routeState.id} started with vehicle ${vehicleState.code}.`,
      type: 'route',
    });

    notifyListeners();
    return { ...routeState };
  },

  async pauseRoute(): Promise<DriverRoute> {
    driverStatusState = 'BREAK';
    routeState.status = 'PAUSED';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: 'Route Paused',
      description: `Driver paused route execution.`,
      type: 'route',
    });

    notifyListeners();
    return { ...routeState };
  },

  async resumeRoute(): Promise<DriverRoute> {
    driverStatusState = 'ON_ROUTE';
    routeState.status = 'IN_PROGRESS';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: 'Route Resumed',
      description: `Driver resumed route execution.`,
      type: 'route',
    });

    notifyListeners();
    return { ...routeState };
  },

  async completeRoute(): Promise<DriverRoute> {
    driverStatusState = 'COMPLETED';
    routeState.status = 'COMPLETED';
    routeState.progressPct = 100;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: 'Route Completed',
      description: `All scheduled stops finished for route ${routeState.id}.`,
      type: 'route',
    });

    notifyListeners();
    return { ...routeState };
  },

  async startStop(stopId: string): Promise<DriverRouteStop> {
    const stop = routeState.stops.find((s) => s.id === stopId || s.binId === stopId);
    if (!stop) throw new Error('Stop not found');

    stop.status = 'COLLECTING';
    notifyListeners();
    return stop;
  },

  async completeStop(stopId: string, customWeightKg?: number): Promise<DriverRouteStop> {
    const stopIndex = routeState.stops.findIndex((s) => s.id === stopId || s.binId === stopId);
    if (stopIndex === -1) throw new Error('Stop not found');

    const stop = routeState.stops[stopIndex];
    const weightKg = customWeightKg || stop.estimatedWasteKg || 120;
    const weightTons = weightKg / 1000;

    stop.status = 'COMPLETED';
    stop.collectionStatus = 'Cleared';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    stop.collectedAt = nowStr;
    stop.collectedWeightKg = weightKg;

    // Update Route Summary metrics
    routeState.completedStops += 1;
    routeState.remainingStops = Math.max(0, routeState.totalStops - routeState.completedStops - routeState.skippedStops);
    routeState.progressPct = Math.round((routeState.completedStops / routeState.totalStops) * 100);
    routeState.totalCollectedTons = Number((routeState.totalCollectedTons + weightTons).toFixed(2));
    routeState.estimatedRemainingTons = Math.max(0, Number((routeState.estimatedRemainingTons - weightTons).toFixed(2)));

    // Update Vehicle metrics
    vehicleState.currentLoadTons = Number((vehicleState.currentLoadTons + weightTons).toFixed(2));
    vehicleState.utilizationPct = Math.min(100, Math.round((vehicleState.currentLoadTons / vehicleState.capacityTons) * 100));

    // Category calculation
    if (stop.wasteType.includes('Plastic')) routeState.wasteByCategory.Plastic = Number((routeState.wasteByCategory.Plastic + weightTons).toFixed(2));
    else if (stop.wasteType.includes('Paper')) routeState.wasteByCategory.Paper = Number((routeState.wasteByCategory.Paper + weightTons).toFixed(2));
    else if (stop.wasteType.includes('Metal')) routeState.wasteByCategory.Metal = Number((routeState.wasteByCategory.Metal + weightTons).toFixed(2));
    else if (stop.wasteType.includes('Organic')) routeState.wasteByCategory.Organic = Number((routeState.wasteByCategory.Organic + weightTons).toFixed(2));
    else routeState.wasteByCategory.Other = Number((routeState.wasteByCategory.Other + weightTons).toFixed(2));

    // Move next UPCOMING stop to CURRENT
    const nextUpcoming = routeState.stops.slice(stopIndex + 1).find((s) => s.status === 'UPCOMING');
    if (nextUpcoming) {
      nextUpcoming.status = 'CURRENT';
    } else if (routeState.remainingStops === 0) {
      routeState.status = 'COMPLETED';
      driverStatusState = 'COMPLETED';
    }

    // Add activity
    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: 'Collection Completed',
      description: `${stop.binId} at ${stop.location} cleared (${weightKg} kg ${stop.wasteType}).`,
      type: 'collection',
    });

    notifyListeners();
    return stop;
  },

  async skipStop(stopId: string, reason: string, notes?: string): Promise<DriverRouteStop> {
    const stopIndex = routeState.stops.findIndex((s) => s.id === stopId || s.binId === stopId);
    if (stopIndex === -1) throw new Error('Stop not found');

    const stop = routeState.stops[stopIndex];
    stop.status = 'SKIPPED';
    stop.skippedReason = reason;
    stop.skippedNotes = notes;
    stop.collectionStatus = `Skipped: ${reason}`;

    routeState.skippedStops += 1;
    routeState.remainingStops = Math.max(0, routeState.totalStops - routeState.completedStops - routeState.skippedStops);
    routeState.progressPct = Math.round((routeState.completedStops / routeState.totalStops) * 100);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Move next UPCOMING stop to CURRENT
    const nextUpcoming = routeState.stops.slice(stopIndex + 1).find((s) => s.status === 'UPCOMING');
    if (nextUpcoming) {
      nextUpcoming.status = 'CURRENT';
    }

    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: 'Stop Skipped',
      description: `${stop.binId} skipped. Reason: ${reason}.`,
      type: 'issue',
    });

    alertsState.unshift({
      id: `alt-${Date.now()}`,
      type: 'COLLECTION_ISSUE',
      title: 'Stop Skipped Alert',
      description: `${stop.binId} on ${stop.location} was skipped (${reason}).`,
      severity: 'warning',
      timestamp: nowStr,
      acknowledged: false,
    });

    notifyListeners();
    return stop;
  },

  async reportIssue(input: ReportIssueInput): Promise<void> {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    activitiesState.unshift({
      id: `act-${Date.now()}`,
      time: nowStr,
      title: `Issue Logged: ${input.issueType}`,
      description: `${input.description}${input.binId ? ` (Bin: ${input.binId})` : ''}`,
      type: 'issue',
    });

    alertsState.unshift({
      id: `alt-${Date.now()}`,
      type: 'COLLECTION_ISSUE',
      title: `Reported Issue - ${input.issueType}`,
      description: `${input.description}${input.notes ? ` - ${input.notes}` : ''}`,
      severity: 'warning',
      timestamp: nowStr,
      acknowledged: false,
    });

    notifyListeners();
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = alertsState.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      notifyListeners();
    }
  },

  // Simulation tick (updates vehicle location and small runtime counters without modifying user actions)
  simulateTick() {
    if (routeState.status === 'IN_PROGRESS') {
      // Small simulated coordinate shift
      const currentStop = routeState.stops.find((s) => s.status === 'CURRENT' || s.status === 'COLLECTING');
      if (currentStop) {
        currentStop.coordinates.x = Math.max(10, Math.min(90, currentStop.coordinates.x + (Math.random() * 0.4 - 0.2)));
        currentStop.coordinates.y = Math.max(10, Math.min(90, currentStop.coordinates.y + (Math.random() * 0.4 - 0.2)));
      }
      notifyListeners();
    }
  },
};
