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

  // Live Simulation Engine (Ticks every N seconds)
  startSimulation(onTick: (timestamp: string) => void, intervalSeconds: number = 5) {
    this.stopSimulation();

    simulationTimer = setInterval(() => {
      const now = new Date();
      lastUpdatedTimestamp = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // 1. Micro-update 2 random active bins fill level
      const activeBinIndices = binsStore
        .map((b, i) => (b.status !== 'Offline' && b.fillPercent < 99 ? i : -1))
        .filter((i) => i !== -1);

      if (activeBinIndices.length > 0) {
        const randomBinIdx = activeBinIndices[Math.floor(Math.random() * activeBinIndices.length)];
        const bin = binsStore[randomBinIdx];
        const fillIncrement = Number((Math.random() * 0.4 + 0.1).toFixed(1));
        const newFill = Math.min(99, Number((bin.fillPercent + fillIncrement).toFixed(1)));

        binsStore[randomBinIdx] = {
          ...bin,
          fillPercent: newFill,
          lastUpdate: 'Just now',
          status: newFill >= 90 ? 'Critical' : newFill >= 75 ? 'Warning' : 'Normal',
        };

        // Emit critical alert event if crossed 90%
        if (newFill >= 90 && bin.fillPercent < 90) {
          activitiesStore.unshift({
            id: `ACT-${Date.now()}`,
            timestamp: lastUpdatedTimestamp,
            entityType: 'BIN',
            entityId: bin.binCode,
            eventType: 'BIN_THRESHOLD_REACHED',
            message: `Fill level crossed 90% threshold (${newFill}%). Urgent collection required.`,
            location: bin.location,
            severity: 'critical',
          });
        }
      }

      // 2. Micro-update 1 vehicle position & speed
      const activeVehicles = vehiclesStore.filter((v) => v.status === 'ON ROUTE');
      if (activeVehicles.length > 0) {
        const v = activeVehicles[Math.floor(Math.random() * activeVehicles.length)];
        const idx = vehiclesStore.findIndex((x) => x.id === v.id);
        if (idx !== -1) {
          const speedDelta = Math.floor(Math.random() * 5) - 2;
          const newSpeed = Math.max(15, Math.min(45, v.speedKmH + speedDelta));
          const dx = (Math.random() - 0.5) * 0.4;
          const dy = (Math.random() - 0.5) * 0.4;

          vehiclesStore[idx] = {
            ...v,
            speedKmH: newSpeed,
            x: Math.max(10, Math.min(90, Number((v.x + dx).toFixed(2)))),
            y: Math.max(10, Math.min(90, Number((v.y + dy).toFixed(2)))),
            lastUpdate: 'Just now',
          };
        }
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
};
