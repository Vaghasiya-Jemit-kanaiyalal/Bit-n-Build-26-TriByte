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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
  return localStorage.getItem('ecotrack_token') || localStorage.getItem('wastewise_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = {
    ...authHeaders(),
    ...((init.headers as Record<string, string>) || {}),
  };
  return fetch(url, { ...init, headers });
}

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
    try {
      const routeId = routeState.id || '1';
      const res = await apiFetch(`${API_BASE}/admin/routes/${routeId}/start`, { method: 'POST' });
      if (res.ok) {
        console.log('[driverService] Route started on backend API');
      }
    } catch (err) {
      console.warn('[driverService] Route start API offline/error, using local fallback:', err);
    }

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
    try {
      const routeId = routeState.id || '1';
      const res = await apiFetch(`${API_BASE}/admin/routes/${routeId}/pause`, { method: 'POST' });
      if (res.ok) {
        console.log('[driverService] Route paused on backend API');
      }
    } catch (err) {
      console.warn('[driverService] Route pause API offline/error, using local fallback:', err);
    }

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
    try {
      const routeId = routeState.id || '1';
      const res = await apiFetch(`${API_BASE}/admin/routes/${routeId}/resume`, { method: 'POST' });
      if (res.ok) {
        console.log('[driverService] Route resumed on backend API');
      }
    } catch (err) {
      console.warn('[driverService] Route resume API offline/error, using local fallback:', err);
    }

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
    try {
      const routeId = routeState.id || '1';
      const res = await apiFetch(`${API_BASE}/admin/routes/${routeId}/complete?force=true`, { method: 'POST' });
      if (res.ok) {
        console.log('[driverService] Route completed on backend API');
      }
    } catch (err) {
      console.warn('[driverService] Route complete API offline/error, using local fallback:', err);
    }

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
    let stop = routeState.stops.find(
      (s) => s.id === stopId || s.binId === stopId || (stopId.startsWith('w-') && s.sequence === Number(stopId.split('-').pop()))
    );
    if (!stop) {
      stop = routeState.stops.find((s) => s.status === 'CURRENT' || s.status === 'UPCOMING') || routeState.stops[0];
    }
    if (stop) {
      stop.status = 'COLLECTING';
      stop.collectionStatus = 'In Progress';
    }
    notifyListeners();
    return stop || routeState.stops[0];
  },

  async completeStop(stopId: string, customWeightKg?: number): Promise<DriverRouteStop> {
    let stopIndex = routeState.stops.findIndex(
      (s) => s.id === stopId || s.binId === stopId || (stopId.startsWith('w-') && s.sequence === Number(stopId.split('-').pop()))
    );
    if (stopIndex === -1) {
      stopIndex = routeState.stops.findIndex((s) => s.status === 'CURRENT' || s.status === 'COLLECTING');
    }
    if (stopIndex === -1) stopIndex = 0;

    const stop = routeState.stops[stopIndex];
    const weightKg = customWeightKg || stop.estimatedWasteKg || 120;
    const weightTons = weightKg / 1000;

    try {
      const routeId = routeState.id || '1';
      const numericStopId = stop.id.replace(/\D/g, '') || '1';
      await apiFetch(`${API_BASE}/admin/routes/${routeId}/stops/${numericStopId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ actual_weight_kg: weightKg }),
      });
      console.log('[driverService] Stop completion API succeeded');
    } catch (err) {
      console.warn('[driverService] Stop completion API offline/error, using local fallback:', err);
    }

    stop.status = 'COMPLETED';
    stop.fillLevel = 0;
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

    // Move next stop to CURRENT
    const nextUpcoming = routeState.stops.slice(stopIndex + 1).find((s) => s.status === 'UPCOMING' || (s.status !== 'COMPLETED' && s.status !== 'SKIPPED'));
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
    let stopIndex = routeState.stops.findIndex(
      (s) => s.id === stopId || s.binId === stopId || (stopId.startsWith('w-') && s.sequence === Number(stopId.split('-').pop()))
    );
    if (stopIndex === -1) {
      stopIndex = routeState.stops.findIndex((s) => s.status === 'CURRENT' || s.status === 'COLLECTING');
    }
    if (stopIndex === -1) stopIndex = 0;

    const stop = routeState.stops[stopIndex];

    try {
      const routeId = routeState.id || '1';
      const numericStopId = stop.id.replace(/\D/g, '') || '1';
      await apiFetch(`${API_BASE}/admin/routes/${routeId}/stops/${numericStopId}/skip`, {
        method: 'POST',
        body: JSON.stringify({ reason, notes }),
      });
      console.log('[driverService] Stop skip API succeeded');
    } catch (err) {
      console.warn('[driverService] Stop skip API offline/error, using local fallback:', err);
    }
    stop.status = 'SKIPPED';
    stop.skippedReason = reason;
    stop.skippedNotes = notes;
    stop.collectionStatus = `Skipped: ${reason}`;

    routeState.skippedStops += 1;
    routeState.remainingStops = Math.max(0, routeState.totalStops - routeState.completedStops - routeState.skippedStops);
    routeState.progressPct = Math.round((routeState.completedStops / routeState.totalStops) * 100);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Move next stop to CURRENT
    const nextUpcoming = routeState.stops.slice(stopIndex + 1).find((s) => s.status === 'UPCOMING' || (s.status !== 'COMPLETED' && s.status !== 'SKIPPED'));
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
