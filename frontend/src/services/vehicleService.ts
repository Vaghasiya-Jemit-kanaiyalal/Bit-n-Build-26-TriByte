import { initialVehicles, initialVehicleAttentionItems } from '../mock/vehicleData';
import type { VehicleItem, VehicleAttentionItem } from '../mock/vehicleData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

let mockVehicleStore: VehicleItem[] = [...initialVehicles];

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

function apiVehicleToVehicleItem(v: any): VehicleItem {
  const statusStr = (v.status || 'AVAILABLE').toUpperCase();
  let status: VehicleItem['status'] = 'Available';
  if (statusStr === 'ON_ROUTE') status = 'On Route';
  else if (statusStr === 'ACTIVE') status = 'Active';
  else if (statusStr === 'IDLE') status = 'Idle';
  else if (statusStr === 'MAINTENANCE') status = 'Maintenance';
  else if (statusStr === 'OFFLINE') status = 'Offline';

  const typeStr = (v.vehicle_type || 'COMPACTOR').toUpperCase();
  let type: VehicleItem['type'] = 'Compactor';
  if (typeStr.includes('TIPPER')) type = 'Tipper';
  else if (typeStr.includes('RECYCLING')) type = 'Recycling Truck';
  else if (typeStr.includes('MINI')) type = 'Mini Collection Vehicle';
  else if (typeStr.includes('ELECTRIC')) type = 'Electric Collection Vehicle';

  const energyStr = (v.energy_type || 'DIESEL').toUpperCase();
  let energyType: VehicleItem['energyType'] = 'Diesel';
  if (energyStr.includes('CNG')) energyType = 'CNG';
  else if (energyStr.includes('ELECTRIC')) energyType = 'Electric';
  else if (energyStr.includes('HYBRID')) energyType = 'Hybrid';

  return {
    id: v.vehicle_code || `VEH-${String(v.id).padStart(3, '0')}`,
    name: v.name || `EcoTrack Vehicle ${v.vehicle_code || v.id}`,
    type,
    registration: v.registration_number || v.registration || 'GJ-01-AB-1234',
    capacityKg: Math.round(v.capacity_kg || 1200),
    currentLoadKg: Math.round(v.current_load_kg || 0),
    driverName: v.driver_name || v.driver?.full_name || 'Unassigned',
    assignedRouteId: v.assigned_route_code || v.assigned_route?.route_code || '—',
    zone: v.zone || 'Central Zone',
    status,
    energyType,
    maintenanceStatus: (v.maintenance_status || 'Good') as any,
    lastService: v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : '12 Sep 2026',
    nextService: v.next_service_date ? new Date(v.next_service_date).toLocaleDateString() : '12 Oct 2026',
    coordinates: `${v.latitude || 22.3072}, ${v.longitude || 73.1812}`,
    loadType: v.load_type || 'Mixed Waste',
    routeProgressStops: v.route_progress_stops || '8 / 14',
    collectionProgressPercent: Math.round(v.collection_progress_pct || 60),
    estimatedCompletion: v.estimated_completion || '11:45 AM',
    history: (v.history || []).map((h: any) => ({
      time: h.created_at ? new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
      description: h.description || h.action,
    })),
    maintenanceHistory: (v.maintenance_history || []).map((m: any) => ({
      id: String(m.id),
      date: m.service_date || '12 Sep 2026',
      serviceType: m.service_type || 'Routine Service',
      mileageKm: m.mileage_km || 15000,
      status: m.status || 'Completed',
      notes: m.notes || 'Routine checkup completed',
    })),
  };
}

export const vehicleService = {
  async getVehicles(): Promise<VehicleItem[]> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/vehicles?page=1&page_size=100`);
      if (res.ok) {
        const body = await res.json();
        const rawItems = Array.isArray(body) ? body : (body.items || []);
        if (rawItems.length > 0) {
          console.log(`[vehicleService] Loaded ${rawItems.length} vehicles from PostgreSQL API`);
          return rawItems.map(apiVehicleToVehicleItem);
        }
      }
    } catch (err) {
      console.warn('[vehicleService] Backend unreachable, using fallback:', err);
    }
    return [...mockVehicleStore];
  },

  async getVehicleById(id: string): Promise<VehicleItem | null> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/vehicles/${id}`);
      if (res.ok) {
        return apiVehicleToVehicleItem(await res.json());
      }
    } catch { /* fallback */ }

    return mockVehicleStore.find((v) => v.id === id) || null;
  },

  async createVehicle(vehicleData: Partial<VehicleItem>): Promise<VehicleItem> {
    try {
      const payload = {
        name: vehicleData.name || `Vehicle ${Date.now()}`,
        registration_number: vehicleData.registration || 'GJ-01-XX-9999',
        capacity_kg: vehicleData.capacityKg || 1200,
        vehicle_type: (vehicleData.type || 'COMPACTOR').toUpperCase().replace(/\s+/g, '_'),
        energy_type: (vehicleData.energyType || 'DIESEL').toUpperCase(),
        zone: vehicleData.zone || 'Central Zone',
      };
      const res = await apiFetch(`${API_BASE}/admin/vehicles`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return apiVehicleToVehicleItem(await res.json());
      }
    } catch { /* fallback */ }

    const newVehicle: VehicleItem = {
      id: vehicleData.id || `VEH-${Math.floor(100 + Math.random() * 900)}`,
      name: vehicleData.name || 'New Collection Vehicle',
      type: vehicleData.type || 'Compactor',
      registration: vehicleData.registration || 'GJ-01-AB-9999',
      capacityKg: vehicleData.capacityKg || 1200,
      currentLoadKg: 0,
      driverName: vehicleData.driverName || 'Unassigned',
      assignedRouteId: '—',
      zone: vehicleData.zone || 'Central Zone',
      status: 'Available',
      energyType: vehicleData.energyType || 'Diesel',
      maintenanceStatus: 'Good',
      lastService: 'Today',
      nextService: '1 Month',
      coordinates: '22.3072, 73.1812',
      loadType: 'Mixed Waste',
      routeProgressStops: '0 / 0',
      collectionProgressPercent: 0,
      estimatedCompletion: '—',
      history: [{ time: 'Just now', description: 'Vehicle registered in system' }],
      maintenanceHistory: [],
    };

    mockVehicleStore.unshift(newVehicle);
    return newVehicle;
  },

  async getAttentionItems(): Promise<VehicleAttentionItem[]> {
    return [...initialVehicleAttentionItems];
  },
};
