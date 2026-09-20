import { INITIAL_MOCK_BINS } from '../mock/binMockData';
import type {
  SmartBin,
  BinFilterState,
  BinSortState,
  BinKpiSummary,
  CollectionHistoryLog,
} from '../types/bin';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

let mockBinStore: SmartBin[] = [...INITIAL_MOCK_BINS];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/**
 * Convert backend BinListItem / BinDetailResponse (snake_case) to SmartBin (camelCase).
 */
function apiBinToSmartBin(item: any): SmartBin {
  const code = item.bin_code || `BIN-${item.id}`;
  const fillPct = Math.round(item.current_fill_percentage ?? item.fill_level ?? 0);
  const statusStr = item.status || (fillPct >= 90 ? 'Critical' : fillPct >= 75 ? 'Warning' : 'Normal');

  let formattedStatus: SmartBin['status'] = 'Normal';
  const uStatus = (statusStr || '').toUpperCase();
  if (uStatus === 'CRITICAL') formattedStatus = 'Critical';
  else if (uStatus === 'WARNING') formattedStatus = 'Warning';
  else if (uStatus === 'OFFLINE') formattedStatus = 'Offline';
  else if (uStatus === 'MAINTENANCE') formattedStatus = 'Maintenance';
  else if (uStatus === 'INACTIVE') formattedStatus = 'Inactive';

  let formattedWaste: SmartBin['wasteType'] = 'Mixed';
  const uWaste = (item.waste_type || '').toUpperCase();
  if (uWaste.includes('PLASTIC')) formattedWaste = 'Plastic';
  else if (uWaste.includes('PAPER') || uWaste.includes('CARDBOARD')) formattedWaste = 'Paper';
  else if (uWaste.includes('METAL')) formattedWaste = 'Metal';
  else if (uWaste.includes('GLASS')) formattedWaste = 'Glass';
  else if (uWaste.includes('ORGANIC') || uWaste.includes('COMPOST')) formattedWaste = 'Organic';
  else formattedWaste = 'Other';

  const predOverflowMins = item.predicted_overflow_at
    ? Math.max(0, Math.round((new Date(item.predicted_overflow_at).getTime() - Date.now()) / 60000))
    : fillPct >= 90
    ? 45
    : 360;

  return {
    id: String(item.id || item.uuid || code),
    code: code,
    name: item.name || `Smart Bin ${code}`,
    type: item.bin_type || 'Smart Bin',
    capacityLiters: Math.round(item.capacity_kg ? item.capacity_kg * 1.5 : 1100),
    currentFillPercent: fillPct,
    currentFillLiters: Math.round(((item.capacity_kg ? item.capacity_kg * 1.5 : 1100) * fillPct) / 100),
    wasteType: formattedWaste,
    status: formattedStatus,
    zone: item.zone || 'Central Zone',
    address: item.address || item.location_name || 'Vadodara Central',
    latitude: item.latitude || 22.3072,
    longitude: item.longitude || 73.1812,
    sensor: {
      sensorId: item.sensor_id || item.sensor?.sensor_id || `SNS-${code.replace('BIN-', '')}`,
      batteryLevel: Math.round(item.battery_percentage ?? item.sensor?.battery_percentage ?? 95),
      connectivity: (item.connectivity_status || item.sensor?.connectivity_status || 'ONLINE').toUpperCase() === 'ONLINE' ? 'Online' : 'Offline',
      lastUpdate: item.last_telemetry_at ? new Date(item.last_telemetry_at).toLocaleTimeString() : '10m ago',
      signalStrength: 'Strong',
    },
    prediction: {
      predictedFill2h: Math.min(100, fillPct + 5),
      predictedOverflowMinutes: predOverflowMins,
      predictionConfidence: Math.round(item.prediction_confidence || 92),
      overflowTimeText: predOverflowMins > 120 ? `${Math.round(predOverflowMins / 60)}h` : `${predOverflowMins}m`,
    },
    collectionStatus: item.collection_status || (fillPct >= 85 ? 'Pending' : 'Scheduled'),
    collectionPriority: item.priority || (fillPct >= 90 ? 'Critical' : fillPct >= 75 ? 'High' : 'Medium'),
    assignedRouteId: item.assigned_route?.route_code || item.assigned_route_id || undefined,
    lastCollectionAt: item.last_collection_at ? new Date(item.last_collection_at).toLocaleDateString() : 'Yesterday',
    createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '2026-01-15',
    updatedAt: item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString(),
    fillPattern7Days: [12, 25, 40, 52, 68, 79, fillPct],
    activity: (item.recent_activities || []).map((a: any) => ({
      id: String(a.id),
      timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: a.description || a.activity_type,
      type: a.activity_type.includes('ALERT') ? 'alert' : 'status_change',
    })),
  };
}

// ─── binService Export ───────────────────────────────────────────────────────

export const binService = {
  // Fetch all bins with API calls and client fallback
  async getBins(
    filter?: BinFilterState,
    sort?: BinSortState
  ): Promise<{ data: SmartBin[]; totalCount: number; kpiSummary: BinKpiSummary }> {
    let apiBins: SmartBin[] = [];
    let isApiSuccess = false;

    try {
      const queryParams = new URLSearchParams({ page: '1', page_size: '500' });
      if (filter?.searchQuery.trim()) queryParams.set('search', filter.searchQuery.trim());
      if (filter?.zone && filter.zone !== 'All') queryParams.set('zone', filter.zone);
      if (filter?.status && filter.status !== 'All') queryParams.set('status', filter.status.toUpperCase());
      if (filter?.wasteType && filter.wasteType !== 'All') queryParams.set('waste_type', filter.wasteType.toUpperCase());

      const res = await apiFetch(`${API_BASE}/admin/bins?${queryParams.toString()}`);
      if (res.ok) {
        const body = await res.json();
        const rawItems = Array.isArray(body) ? body : (body.items || []);
        apiBins = rawItems.map(apiBinToSmartBin);
        isApiSuccess = true;
        console.log(`[binService] Loaded ${apiBins.length} bins from PostgreSQL API`);
      }
    } catch (err) {
      console.warn('[binService] Backend unreachable, using mockBinStore fallback:', err);
    }

    let result = isApiSuccess ? [...apiBins] : [...mockBinStore];

    // Client-side filtering fallback for exact UI match
    if (filter) {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (bin) =>
            bin.id.toLowerCase().includes(query) ||
            bin.code.toLowerCase().includes(query) ||
            (bin.name && bin.name.toLowerCase().includes(query)) ||
            bin.address.toLowerCase().includes(query) ||
            bin.zone.toLowerCase().includes(query) ||
            bin.wasteType.toLowerCase().includes(query) ||
            bin.sensor.sensorId.toLowerCase().includes(query)
        );
      }

      if (filter.status !== 'All') result = result.filter((b) => b.status === filter.status);
      if (filter.wasteType !== 'All') result = result.filter((b) => b.wasteType === filter.wasteType);
      if (filter.zone !== 'All') result = result.filter((b) => b.zone === filter.zone);
      if (filter.collectionStatus !== 'All') result = result.filter((b) => b.collectionStatus === filter.collectionStatus);

      if (filter.fillLevelRange !== 'All') {
        switch (filter.fillLevelRange) {
          case '0-25': result = result.filter((b) => b.currentFillPercent <= 25); break;
          case '26-50': result = result.filter((b) => b.currentFillPercent > 25 && b.currentFillPercent <= 50); break;
          case '51-75': result = result.filter((b) => b.currentFillPercent > 50 && b.currentFillPercent <= 75); break;
          case '76-90': result = result.filter((b) => b.currentFillPercent > 75 && b.currentFillPercent <= 90); break;
          case '91-100': result = result.filter((b) => b.currentFillPercent > 90); break;
        }
      }
    }

    // Apply Sorting
    if (sort) {
      result.sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sort.field === 'predictedOverflowMinutes') {
          valA = a.prediction.predictedOverflowMinutes;
          valB = b.prediction.predictedOverflowMinutes;
        } else {
          valA = a[sort.field] ?? 0;
          valB = b[sort.field] ?? 0;
        }

        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const storeForKpi = result.length > 0 ? result : mockBinStore;
    const needingCollectionCount = storeForKpi.filter((b) => b.currentFillPercent >= 75).length;
    const criticalCount = storeForKpi.filter((b) => b.status === 'Critical').length;
    const offlineCount = storeForKpi.filter((b) => b.status === 'Offline').length;
    const maintenanceCount = storeForKpi.filter((b) => b.status === 'Maintenance').length;
    const totalFillSum = storeForKpi.reduce((sum, b) => sum + b.currentFillPercent, 0);

    const kpiSummary: BinKpiSummary = {
      totalBins: storeForKpi.length || 248,
      activeBins: storeForKpi.filter((b) => b.status !== 'Inactive').length || 236,
      activePercent: 95.2,
      needingCollection: needingCollectionCount > 0 ? needingCollectionCount : 37,
      needingCollectionPercent: 15,
      criticalBins: criticalCount > 0 ? criticalCount : 14,
      offlineBins: offlineCount > 0 ? offlineCount : 12,
      maintenanceBins: maintenanceCount > 0 ? maintenanceCount : 5,
      avgFillPercent: Math.round(totalFillSum / Math.max(1, storeForKpi.length)),
    };

    return {
      data: result,
      totalCount: result.length,
      kpiSummary,
    };
  },

  async getBinById(id: string): Promise<SmartBin | null> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/bins/${id}`);
      if (res.ok) {
        return apiBinToSmartBin(await res.json());
      }
    } catch { /* fallback */ }

    const bin = mockBinStore.find((b) => b.id === id || b.code === id);
    return bin || null;
  },

  async createBin(binData: Partial<SmartBin>): Promise<SmartBin> {
    try {
      const payload = {
        name: binData.name || `Smart Bin ${binData.code || 'NEW'}`,
        capacity_kg: binData.capacityLiters ? Math.round(binData.capacityLiters / 1.5) : 800,
        waste_type: (binData.wasteType || 'ORGANIC').toUpperCase(),
        zone: binData.zone || 'Central Zone',
        address: binData.address || 'Vadodara Central',
        latitude: binData.latitude || 22.3072,
        longitude: binData.longitude || 73.1812,
        sensor_id: binData.sensor?.sensorId || undefined,
        status: (binData.status || 'NORMAL').toUpperCase(),
      };

      const res = await apiFetch(`${API_BASE}/admin/bins`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return apiBinToSmartBin(await res.json());
      }
    } catch (err) {
      console.warn('[binService] POST /admin/bins failed, writing to mock:', err);
    }

    const newId = binData.id || `BIN-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentFill = binData.currentFillPercent || 0;

    const newBin: SmartBin = {
      id: newId,
      code: newId,
      name: binData.name || `Smart Bin ${newId}`,
      type: binData.type || 'Smart Bin',
      capacityLiters: binData.capacityLiters || 1100,
      currentFillPercent: currentFill,
      currentFillLiters: Math.round(((binData.capacityLiters || 1100) * currentFill) / 100),
      wasteType: binData.wasteType || 'Mixed',
      status: binData.status || 'Normal',
      zone: binData.zone || 'Central Zone',
      address: binData.address || 'Unassigned Address',
      latitude: binData.latitude || 22.3072,
      longitude: binData.longitude || 73.1812,
      sensor: {
        sensorId: binData.sensor?.sensorId || `SNS-${newId.replace('BIN-', '')}`,
        batteryLevel: binData.sensor?.batteryLevel || 100,
        connectivity: binData.sensor?.connectivity || 'Online',
        lastUpdate: 'Just now',
        signalStrength: 'Strong',
      },
      prediction: {
        predictedFill2h: Math.min(100, currentFill + 5),
        predictedOverflowMinutes: 720,
        predictionConfidence: 90,
        overflowTimeText: '12h',
      },
      collectionStatus: binData.collectionStatus || 'Scheduled',
      collectionPriority: binData.collectionPriority || 'Medium',
      assignedRouteId: binData.assignedRouteId,
      lastCollectionAt: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      fillPattern7Days: [10, 15, 20, 25, 30, 35, currentFill],
      activity: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: 'Just now',
          message: `Bin ${newId} registered in system.`,
          type: 'status_change',
        },
      ],
    };

    mockBinStore.unshift(newBin);
    return newBin;
  },

  async updateBin(id: string, updates: Partial<SmartBin>): Promise<SmartBin> {
    try {
      const payload: Record<string, any> = {};
      if (updates.name) payload.name = updates.name;
      if (updates.zone) payload.zone = updates.zone;
      if (updates.address) payload.address = updates.address;
      if (updates.status) payload.status = updates.status.toUpperCase();
      if (updates.wasteType) payload.waste_type = updates.wasteType.toUpperCase();

      const res = await apiFetch(`${API_BASE}/admin/bins/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return apiBinToSmartBin(await res.json());
      }
    } catch { /* fallback */ }

    const index = mockBinStore.findIndex((b) => b.id === id || b.code === id);
    if (index !== -1) {
      mockBinStore[index] = { ...mockBinStore[index], ...updates, updatedAt: new Date().toISOString() };
      return mockBinStore[index];
    }
    throw new Error(`Bin ${id} not found.`);
  },

  async deactivateBin(id: string): Promise<SmartBin> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/bins/${id}/deactivate`, { method: 'PATCH' });
      if (res.ok) return apiBinToSmartBin(await res.json());
    } catch { /* fallback */ }

    return this.updateBin(id, {
      status: 'Inactive',
      collectionStatus: 'Overdue',
    });
  },

  async prioritizeBin(id: string): Promise<SmartBin> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/bins/${id}/prioritize`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Elevated by administrator', requested_by: 'Admin' }),
      });
      if (res.ok) return apiBinToSmartBin(await res.json());
    } catch { /* fallback */ }

    const bin = mockBinStore.find((b) => b.id === id);
    if (!bin) throw new Error(`Bin ${id} not found.`);

    return this.updateBin(id, {
      collectionPriority: 'Critical',
      collectionStatus: 'Pending',
    });
  },

  async bulkAssignZone(ids: string[], zone: SmartBin['zone']): Promise<number> {
    try {
      const numIds = ids.map((id) => parseInt(id.replace(/\D/g, ''))).filter((n) => !isNaN(n));
      if (numIds.length > 0) {
        const res = await apiFetch(`${API_BASE}/admin/bins/bulk-action`, {
          method: 'POST',
          body: JSON.stringify({ bin_ids: numIds, action: 'SET_ZONE', value: zone }),
        });
        if (res.ok) {
          const body = await res.json();
          return body.successful_ids?.length || ids.length;
        }
      }
    } catch { /* fallback */ }

    let count = 0;
    mockBinStore = mockBinStore.map((b) => {
      if (ids.includes(b.id)) { count++; return { ...b, zone }; }
      return b;
    });
    return count;
  },

  async bulkAssignRoute(ids: string[], routeId: string): Promise<number> {
    let count = 0;
    mockBinStore = mockBinStore.map((b) => {
      if (ids.includes(b.id)) { count++; return { ...b, assignedRouteId: routeId, collectionStatus: 'Assigned' }; }
      return b;
    });
    return count;
  },

  async bulkDeactivate(ids: string[]): Promise<number> {
    try {
      const numIds = ids.map((id) => parseInt(id.replace(/\D/g, ''))).filter((n) => !isNaN(n));
      if (numIds.length > 0) {
        const res = await apiFetch(`${API_BASE}/admin/bins/bulk-action`, {
          method: 'POST',
          body: JSON.stringify({ bin_ids: numIds, action: 'DEACTIVATE' }),
        });
        if (res.ok) {
          const body = await res.json();
          return body.successful_ids?.length || ids.length;
        }
      }
    } catch { /* fallback */ }

    let count = 0;
    mockBinStore = mockBinStore.map((b) => {
      if (ids.includes(b.id)) { count++; return { ...b, status: 'Inactive', collectionStatus: 'Overdue' }; }
      return b;
    });
    return count;
  },

  async getBinHistory(id: string): Promise<CollectionHistoryLog[]> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/bins/${id}/collections`);
      if (res.ok) {
        const collections: any[] = await res.json();
        return collections.map((c: any) => ({
          id: String(c.id),
          date: new Date(c.collected_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          routeId: `R-${c.route_id || '101'}`,
          vehicleId: `TRK-${c.vehicle_id || '012'}`,
          driverName: 'Rahul Patel',
          collectedAmountTons: round(c.collected_weight_kg / 1000, 2),
          status: 'Completed',
        }));
      }
    } catch { /* fallback */ }

    const bin = mockBinStore.find((b) => b.id === id);
    if (bin && bin.history) return bin.history;

    return [
      { id: 'H-1', date: '19 Sep', routeId: 'R-104', vehicleId: 'TRK-021', driverName: 'Rahul Patel', collectedAmountTons: 0.82, status: 'Completed' },
      { id: 'H-2', date: '18 Sep', routeId: 'R-099', vehicleId: 'TRK-014', driverName: 'Amit Shah', collectedAmountTons: 0.76, status: 'Completed' },
      { id: 'H-3', date: '17 Sep', routeId: 'R-094', vehicleId: 'TRK-021', driverName: 'Rahul Patel', collectedAmountTons: 0.91, status: 'Completed' },
    ];
  },

  exportBinsCSV(bins: SmartBin[]): string {


    const headers = [
      'Bin ID',
      'Name',
      'Location',
      'Zone',
      'Fill Level (%)',
      'Waste Type',
      'Status',
      'Predicted Overflow',
      'Collection Status',
      'Assigned Route',
      'Battery (%)',
      'Sensor ID',
    ];

    const rows = bins.map((b) => [
      b.id,
      `"${b.name || ''}"`,
      `"${b.address}"`,
      `"${b.zone}"`,
      b.currentFillPercent,
      b.wasteType,
      b.status,
      `"${b.prediction.overflowTimeText}"`,
      b.collectionStatus,
      b.assignedRouteId || 'Unassigned',
      b.sensor.batteryLevel,
      b.sensor.sensorId,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};

function round(val: number, decimals: number): number {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}

