import {
  MOCK_BINS,
  MOCK_VEHICLES,
  MOCK_ROUTES,
  MOCK_SENSORS,
  MOCK_LIVE_ACTIVITIES,
  MOCK_ZONE_STATUSES,
} from '../mock/monitoringMockData';
import type {
  MonitoredBin,
  MonitoredVehicle,
  MonitoredRoute,
  MonitoredSensor,
  LiveActivityEvent,
  MonitoringKpiSummary,
  ZoneStatusSummary,
  MonitoringFilterState,
} from '../types/monitoring';

let binsStore: MonitoredBin[] = JSON.parse(JSON.stringify(MOCK_BINS));
let vehiclesStore: MonitoredVehicle[] = JSON.parse(JSON.stringify(MOCK_VEHICLES));
let routesStore: MonitoredRoute[] = JSON.parse(JSON.stringify(MOCK_ROUTES));
let sensorsStore: MonitoredSensor[] = JSON.parse(JSON.stringify(MOCK_SENSORS));
let activitiesStore: LiveActivityEvent[] = JSON.parse(JSON.stringify(MOCK_LIVE_ACTIVITIES));
let zoneStatusesStore: ZoneStatusSummary[] = JSON.parse(JSON.stringify(MOCK_ZONE_STATUSES));

let simulationTimer: ReturnType<typeof setInterval> | null = null;
let lastUpdatedTimestamp: string = new Date().toLocaleTimeString('en-US', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

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

export const monitoringService = {
  async fetchLiveSnapshot(): Promise<void> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/monitoring/map-data`);
      if (res.ok) {
        const data = await res.json();
        console.log('[monitoringService] Live map telemetry loaded from FastAPI backend:', data);
        if (data.bins && data.bins.length > 0) {
          binsStore = data.bins.map((b: any) => ({
            id: String(b.id || b.uuid || b.bin_code),
            binCode: b.bin_code,
            location: b.name || b.address || 'Central Location',
            zone: b.zone || 'Central Zone',
            fillPercent: Math.round(b.fill_percentage || b.current_fill_percentage || 50),
            status: (b.status || 'NORMAL').toUpperCase() === 'CRITICAL' ? 'Critical' : (b.status || 'NORMAL').toUpperCase() === 'WARNING' ? 'Warning' : 'Normal',
            wasteType: b.waste_type || 'Mixed',
            lastUpdate: b.last_telemetry_at ? new Date(b.last_telemetry_at).toLocaleTimeString() : 'Just now',
            sensorId: `SNS-${b.bin_code}`,
            x: b.longitude ? ((b.longitude - 73.15) / 0.1) * 80 + 10 : Math.random() * 80 + 10,
            y: b.latitude ? ((22.35 - b.latitude) / 0.1) * 80 + 10 : Math.random() * 80 + 10,
          }));
        }
      }
    } catch (err) {
      console.warn('[monitoringService] Monitoring API unreachable, using local store:', err);
    }
  },

  getMonitoringSummary(): MonitoringKpiSummary {
    const binsMonitored = 248;
    const onlineBins = binsStore.filter((b) => b.status !== 'Offline').length + 220;
    const criticalBins = binsStore.filter((b) => b.fillPercent >= 90).length + 10;
    const activeVehicles = vehiclesStore.filter((v) => v.status === 'ON ROUTE' || v.status === 'IDLE').length + 12;
    const totalVehicles = 24;
    const activeRoutes = routesStore.length + 7;
    const onScheduleRoutes = routesStore.filter((r) => r.status === 'On Schedule').length + 6;
    const sensorHealthPct = 94.7;
    const offlineSensors = 12;
    const activeStopsCount = 26;

    return {
      binsMonitored,
      onlineBins,
      criticalBins,
      activeVehicles,
      totalVehicles,
      activeRoutes,
      onScheduleRoutes,
      sensorHealthPct,
      offlineSensors,
      activeStopsCount,
    };
  },

  getBins(filter?: Partial<MonitoringFilterState>): MonitoredBin[] {
    let result = [...binsStore];
    if (filter) {
      if (filter.zone && filter.zone !== 'All') {
        result = result.filter((b) => b.zone === filter.zone);
      }
      if (filter.status && filter.status !== 'All') {
        result = result.filter((b) => b.status === filter.status);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (b) =>
            b.binCode.toLowerCase().includes(query) ||
            b.location.toLowerCase().includes(query) ||
            b.zone.toLowerCase().includes(query) ||
            b.sensorId.toLowerCase().includes(query)
        );
      }
    }
    return result;
  },

  getVehicles(filter?: Partial<MonitoringFilterState>): MonitoredVehicle[] {
    let result = [...vehiclesStore];
    if (filter) {
      if (filter.status && filter.status !== 'All') {
        result = result.filter((v) => v.status === filter.status);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (v) =>
            v.vehicleCode.toLowerCase().includes(query) ||
            v.driver.toLowerCase().includes(query) ||
            (v.routeId && v.routeId.toLowerCase().includes(query))
        );
      }
    }
    return result;
  },

  getRoutes(filter?: Partial<MonitoringFilterState>): MonitoredRoute[] {
    let result = [...routesStore];
    if (filter) {
      if (filter.zone && filter.zone !== 'All') {
        result = result.filter((r) => r.zone === filter.zone);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (r) =>
            r.routeCode.toLowerCase().includes(query) ||
            r.driverName.toLowerCase().includes(query) ||
            r.vehicleId.toLowerCase().includes(query)
        );
      }
    }
    return result;
  },

  getSensors(): MonitoredSensor[] {
    return [...sensorsStore];
  },

  getLiveActivities(filter?: Partial<MonitoringFilterState>): LiveActivityEvent[] {
    let result = [...activitiesStore];
    if (filter) {
      if (filter.entityType && filter.entityType !== 'All') {
        const typeStr = filter.entityType.toUpperCase();
        result = result.filter((a) => a.entityType === typeStr);
      }
      if (filter.severity && filter.severity !== 'All') {
        result = result.filter((a) => a.severity === filter.severity);
      }
    }
    return result;
  },

  getZoneStatuses(): ZoneStatusSummary[] {
    return [...zoneStatusesStore];
  },

  getLastUpdatedTimestamp(): string {
    return lastUpdatedTimestamp;
  },

  assignVehicleToRoute(vehicleId: string, routeId: string, driverName?: string): MonitoredVehicle | null {
    const idx = vehiclesStore.findIndex((v) => v.id === vehicleId || v.vehicleCode === vehicleId);
    if (idx === -1) return null;

    const vehicle = vehiclesStore[idx];
    const updated: MonitoredVehicle = {
      ...vehicle,
      status: 'ON ROUTE',
      routeId,
      driver: driverName || vehicle.driver || 'Rohit Patel',
      speedKmH: 28,
      lastUpdate: 'Just now',
    };

    vehiclesStore[idx] = updated;

    // Log live activity event
    activitiesStore.unshift({
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      entityType: 'VEHICLE',
      entityId: updated.vehicleCode,
      eventType: 'VEHICLE_ASSIGNED',
      message: `Admin assigned vehicle ${updated.vehicleCode} to route ${routeId}. Real-time collection started.`,
      location: 'Central Depot',
      severity: 'info',
    });

    return updated;
  },

  unassignVehicle(vehicleId: string): MonitoredVehicle | null {
    const idx = vehiclesStore.findIndex((v) => v.id === vehicleId || v.vehicleCode === vehicleId);
    if (idx === -1) return null;

    const vehicle = vehiclesStore[idx];
    const updated: MonitoredVehicle = {
      ...vehicle,
      status: 'IDLE',
      routeId: undefined,
      speedKmH: 0,
      currentLoadTons: 0,
      utilizationPercent: 0,
      x: 515,
      y: 550,
      lastUpdate: 'Just now',
    };

    vehiclesStore[idx] = updated;

    activitiesStore.unshift({
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      entityType: 'VEHICLE',
      entityId: updated.vehicleCode,
      eventType: 'VEHICLE_UNASSIGNED',
      message: `Admin unassigned vehicle ${updated.vehicleCode}. Vehicle returned to Main Gate Depot.`,
      location: 'Main Gate Depot',
      severity: 'info',
    });

    return updated;
  },

  // Live Simulation Engine (Ticks every N seconds)
  startSimulation(onTick: (timestamp: string) => void, intervalSeconds: number = 2) {
    this.stopSimulation();

    // Defined route polyline waypoints for assigned vehicles
    const campusRouteWaypoints = [
      { x: 515, y: 550, binCode: null, label: 'Depot' },
      { x: 310, y: 510, binCode: 'H-105', label: 'Hostel Block A' },
      { x: 425, y: 440, binCode: 'BIN-52', label: 'Library' },
      { x: 520, y: 330, binCode: 'H-104', label: 'Hostel Block B' },
      { x: 470, y: 240, binCode: 'CSE-001', label: 'CSE Block' },
      { x: 410, y: 110, binCode: 'ACAD-02', label: 'Academic Block' },
      { x: 685, y: 280, binCode: 'CAF-01', label: 'East Campus' },
      { x: 515, y: 550, binCode: null, label: 'Depot Return' },
    ];

    let waypointIndices: Record<string, number> = {};

    simulationTimer = setInterval(() => {
      const now = new Date();
      lastUpdatedTimestamp = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // 1. Process active vehicles movement along assigned route
      vehiclesStore = vehiclesStore.map((v) => {
        // UNASSIGNED / IDLE vehicles STAY STATIONARY AT DEPOT
        if (v.status !== 'ON ROUTE' || !v.routeId) {
          return {
            ...v,
            speedKmH: 0,
            x: 515,
            y: 550,
            lastUpdate: 'Just now',
          };
        }

        // Assigned active vehicle moves step-by-step
        const currentWpIdx = waypointIndices[v.id] || 0;
        const targetWpIdx = (currentWpIdx + 1) % campusRouteWaypoints.length;
        const currentWp = campusRouteWaypoints[currentWpIdx];
        const targetWp = campusRouteWaypoints[targetWpIdx];

        // Interpolate position step
        const stepRatio = 0.25; // Move 25% closer per tick
        const nextX = Math.round((v.x ?? currentWp.x) + (targetWp.x - (v.x ?? currentWp.x)) * stepRatio);
        const nextY = Math.round((v.y ?? currentWp.y) + (targetWp.y - (v.y ?? currentWp.y)) * stepRatio);

        // Check if arrived at target waypoint
        const distance = Math.hypot(targetWp.x - nextX, targetWp.y - nextY);
        let updatedLoad = v.currentLoadTons;

        if (distance < 12) {
          // Advance waypoint index
          waypointIndices[v.id] = targetWpIdx;

          // If target waypoint has a bin, collect it in real time!
          if (targetWp.binCode) {
            const binIdx = binsStore.findIndex((b) => b.binCode === targetWp.binCode);
            if (binIdx !== -1 && binsStore[binIdx].fillPercent > 10) {
              const oldFill = binsStore[binIdx].fillPercent;
              binsStore[binIdx] = {
                ...binsStore[binIdx],
                fillPercent: 0,
                status: 'Normal',
                lastUpdate: 'Just now',
              };

              updatedLoad = Math.min(v.capacityTons, Number((v.currentLoadTons + 0.4).toFixed(2)));

              activitiesStore.unshift({
                id: `ACT-${Date.now()}`,
                timestamp: lastUpdatedTimestamp,
                entityType: 'BIN',
                entityId: targetWp.binCode,
                eventType: 'BIN_COLLECTED',
                message: `Vehicle ${v.vehicleCode} collected bin ${targetWp.binCode} (${oldFill}% -> 0%). Load updated to ${updatedLoad} tons.`,
                location: targetWp.label,
                severity: 'info',
              });
            }
          }
        }

        const newSpeed = Math.floor(25 + Math.random() * 10);
        const utilization = Math.round((updatedLoad / v.capacityTons) * 100);

        return {
          ...v,
          x: nextX,
          y: nextY,
          speedKmH: newSpeed,
          currentLoadTons: updatedLoad,
          utilizationPercent: utilization,
          lastUpdate: 'Just now',
        };
      });

      // 2. Micro-update fill level of 1 uncollected bin to simulate gradual fill accumulation
      const activeBinIndices = binsStore
        .map((b, i) => (b.status !== 'Offline' && b.fillPercent < 95 ? i : -1))
        .filter((i) => i !== -1);

      if (activeBinIndices.length > 0 && Math.random() < 0.4) {
        const randomBinIdx = activeBinIndices[Math.floor(Math.random() * activeBinIndices.length)];
        const bin = binsStore[randomBinIdx];
        const fillIncrement = Number((Math.random() * 0.8 + 0.2).toFixed(1));
        const newFill = Math.min(99, Number((bin.fillPercent + fillIncrement).toFixed(1)));

        binsStore[randomBinIdx] = {
          ...bin,
          fillPercent: newFill,
          lastUpdate: 'Just now',
          status: newFill >= 90 ? 'Critical' : newFill >= 75 ? 'Warning' : 'Normal',
        };
      }

      // 3. Keep activity list trimmed to top 30
      if (activitiesStore.length > 30) {
        activitiesStore = activitiesStore.slice(0, 30);
      }

      onTick(lastUpdatedTimestamp);
    }, intervalSeconds * 1000);
  },

  stopSimulation() {
    if (simulationTimer) {
      clearInterval(simulationTimer);
      simulationTimer = null;
    }
  },

  connectLiveTelemetryStream(
    onMessage: (data: any) => void,
    onError?: (err: any) => void
  ): () => void {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1')
      .replace(/^http:/, 'ws:')
      .replace(/^https:/, 'wss:')
      .replace(/\/api\/v1$/, '');

    const wsUrl = `${baseUrl}/api/v1/ws/telemetry`;
    let socket: WebSocket | null = null;
    let isClosedExplicitly = false;

    try {
      socket = new WebSocket(wsUrl);
      console.log('[monitoringService] Attempting live telemetry WebSocket connection:', wsUrl);

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('[monitoringService] Telemetry WebSocket message received:', payload);
          onMessage(payload);
        } catch (e) {
          console.warn('[monitoringService] Error parsing WebSocket message:', e);
        }
      };

      socket.onerror = (err) => {
        console.warn('[monitoringService] Telemetry WebSocket connection error (using polling fallback):', err);
        if (onError) onError(err);
      };

      socket.onclose = () => {
        if (!isClosedExplicitly) {
          console.log('[monitoringService] Telemetry WebSocket closed cleanly or lost server endpoint.');
        }
      };
    } catch (err) {
      console.warn('[monitoringService] WebSocket initialization error:', err);
    }

    return () => {
      isClosedExplicitly = true;
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  },
};

