import { initialRoutes, initialAlerts } from '../mock/routeData';
import type { RouteItem, RouteAlert, BinStop } from '../mock/routeData';

const API_BASE = 'http://localhost:8000/api/v1';

let mockRouteStore: RouteItem[] = [...initialRoutes];
let mockAlertStore: RouteAlert[] = [...initialAlerts];

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

function apiRouteToRouteItem(r: any): RouteItem {
  const statusStr = (r.status || 'PLANNED').toUpperCase();
  let status: RouteItem['status'] = 'Planned';
  if (statusStr === 'IN_PROGRESS') status = 'In Progress';
  else if (statusStr === 'COMPLETED') status = 'Completed';
  else if (statusStr === 'AT_RISK') status = 'At Risk';

  const stops: BinStop[] = (r.stops || []).map((s: any, idx: number) => ({
    id: String(s.id || `st-${idx + 1}`),
    binId: s.bin_code || s.bin?.bin_code || `BIN-${s.bin_id || idx + 100}`,
    location: s.address || s.bin?.address || s.location_name || 'Central Location',
    zone: s.zone || r.zone || 'Central Zone',
    fillLevel: Math.round(s.fill_level || s.collected_fill_percentage || 80),
    wasteType: s.waste_type || s.bin?.waste_type || 'Mixed',
    priority: (s.priority || 'MEDIUM').toUpperCase() === 'CRITICAL' ? 'Critical' : (s.priority || 'MEDIUM').toUpperCase() === 'HIGH' ? 'High' : 'Normal',
    status: (s.status || 'PENDING').toUpperCase() === 'COMPLETED' ? 'Completed' : (s.status || 'PENDING').toUpperCase() === 'SKIPPED' ? 'Skipped' : 'Pending',
    eta: s.estimated_arrival || `${8 + idx}:${idx * 15 % 60 < 10 ? '0' : ''}${idx * 15 % 60} AM`,
    capacityLiters: 240,
    predictedOverflow: '2h 15m',
  }));

  const completedCount = stops.filter((s) => s.status === 'Completed').length;

  return {
    id: r.route_code || `RT-${r.id}`,
    name: r.name || `Route ${r.route_code || r.id}`,
    vehicleId: r.vehicle_code || r.vehicle?.vehicle_code || `TRK-${r.vehicle_id || '01'}`,
    driverName: r.driver_name || r.driver?.full_name || 'Rahul Patel',
    zone: r.zone || 'Central Zone',
    startTime: r.start_time || '08:30 AM',
    estimatedCompletion: r.estimated_completion || '11:45 AM',
    totalDistanceKm: Number((r.total_distance_km || r.estimated_distance_km || 18.5).toFixed(1)),
    estimatedTimeMin: r.estimated_time_minutes || r.estimated_duration_minutes || 180,
    totalStops: stops.length || r.total_stops || 12,
    completedStops: completedCount || r.completed_stops || 0,
    vehicleCapacityPercent: Math.round(r.capacity_utilization_pct || r.vehicle_capacity_percent || 70),
    status,
    priorityStopsCount: stops.filter((s) => s.priority === 'Critical' || s.priority === 'High').length,
    overflowRiskStopsCount: stops.filter((s) => s.fillLevel >= 90).length,
    stops,
  };
}

export const routeService = {
  async getRoutes(): Promise<RouteItem[]> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/routes?page=1&page_size=100`);
      if (res.ok) {
        const body = await res.json();
        const rawItems = Array.isArray(body) ? body : (body.items || []);
        if (rawItems.length > 0) {
          console.log(`[routeService] Loaded ${rawItems.length} routes from PostgreSQL`);
          return rawItems.map(apiRouteToRouteItem);
        }
      }
    } catch (err) {
      console.warn('[routeService] Backend unreachable, using fallback:', err);
    }
    return [...mockRouteStore];
  },

  async getRouteById(id: string): Promise<RouteItem | null> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/routes/${id}`);
      if (res.ok) {
        return apiRouteToRouteItem(await res.json());
      }
    } catch { /* fallback */ }

    return mockRouteStore.find((r) => r.id === id) || null;
  },

  async createRoute(routeData: Partial<RouteItem>): Promise<RouteItem> {
    try {
      const payload = {
        name: routeData.name || `Route ${Date.now()}`,
        zone: routeData.zone || 'Central Zone',
        vehicle_id: 1,
        driver_id: 1,
        priority: 'MEDIUM',
      };
      const res = await apiFetch(`${API_BASE}/admin/routes`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return apiRouteToRouteItem(await res.json());
      }
    } catch { /* fallback */ }

    const newRoute: RouteItem = {
      id: routeData.id || `RT-${Math.floor(100 + Math.random() * 900)}`,
      name: routeData.name || 'New Collection Route',
      vehicleId: routeData.vehicleId || 'TRK-01',
      driverName: routeData.driverName || 'Rahul Patel',
      zone: routeData.zone || 'Central Zone',
      startTime: '09:00 AM',
      estimatedCompletion: '12:30 PM',
      totalDistanceKm: 15.2,
      estimatedTimeMin: 150,
      totalStops: routeData.stops?.length || 8,
      completedStops: 0,
      vehicleCapacityPercent: 0,
      status: 'Planned',
      priorityStopsCount: 2,
      overflowRiskStopsCount: 1,
      stops: routeData.stops || [],
    };

    mockRouteStore.unshift(newRoute);
    return newRoute;
  },

  async getAlerts(): Promise<RouteAlert[]> {
    return [...mockAlertStore];
  },
};
