import { INITIAL_MOCK_BINS } from '../mock/binMockData';
import type {
  SmartBin,
  BinFilterState,
  BinSortState,
  BinKpiSummary,
  CollectionHistoryLog,
} from '../types/bin';

let mockBinStore: SmartBin[] = [...INITIAL_MOCK_BINS];

export const binService = {
  // Fetch all bins matching filters and sort parameters
  async getBins(
    filter?: BinFilterState,
    sort?: BinSortState
  ): Promise<{ data: SmartBin[]; totalCount: number; kpiSummary: BinKpiSummary }> {
    // Simulate lightweight network latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    let result = [...mockBinStore];

    // Apply Filter State
    if (filter) {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (bin) =>
            bin.id.toLowerCase().includes(query) ||
            (bin.name && bin.name.toLowerCase().includes(query)) ||
            bin.address.toLowerCase().includes(query) ||
            bin.zone.toLowerCase().includes(query) ||
            bin.wasteType.toLowerCase().includes(query) ||
            bin.sensor.sensorId.toLowerCase().includes(query)
        );
      }

      if (filter.status !== 'All') {
        result = result.filter((bin) => bin.status === filter.status);
      }

      if (filter.wasteType !== 'All') {
        result = result.filter((bin) => bin.wasteType === filter.wasteType);
      }

      if (filter.zone !== 'All') {
        result = result.filter((bin) => bin.zone === filter.zone);
      }

      if (filter.collectionStatus !== 'All') {
        result = result.filter((bin) => bin.collectionStatus === filter.collectionStatus);
      }

      if (filter.fillLevelRange !== 'All') {
        switch (filter.fillLevelRange) {
          case '0-25':
            result = result.filter((b) => b.currentFillPercent <= 25);
            break;
          case '26-50':
            result = result.filter((b) => b.currentFillPercent > 25 && b.currentFillPercent <= 50);
            break;
          case '51-75':
            result = result.filter((b) => b.currentFillPercent > 50 && b.currentFillPercent <= 75);
            break;
          case '76-90':
            result = result.filter((b) => b.currentFillPercent > 75 && b.currentFillPercent <= 90);
            break;
          case '91-100':
            result = result.filter((b) => b.currentFillPercent > 90);
            break;
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

    // Compute KPI Summary over full store
    const needingCollectionCount = mockBinStore.filter((b) => b.currentFillPercent >= 75).length;
    const criticalCount = mockBinStore.filter((b) => b.status === 'Critical').length;
    const offlineCount = mockBinStore.filter((b) => b.status === 'Offline').length;
    const maintenanceCount = mockBinStore.filter((b) => b.status === 'Maintenance').length;
    const totalFillSum = mockBinStore.reduce((sum, b) => sum + b.currentFillPercent, 0);

    const kpiSummary: BinKpiSummary = {
      totalBins: 248,
      activeBins: 236,
      activePercent: 95.2,
      needingCollection: needingCollectionCount > 0 ? needingCollectionCount : 37,
      needingCollectionPercent: 15,
      criticalBins: criticalCount > 0 ? criticalCount : 14,
      offlineBins: offlineCount > 0 ? offlineCount : 12,
      maintenanceBins: maintenanceCount > 0 ? maintenanceCount : 5,
      avgFillPercent: Math.round(totalFillSum / Math.max(1, mockBinStore.length)),
    };

    return {
      data: result,
      totalCount: result.length,
      kpiSummary,
    };
  },

  async getBinById(id: string): Promise<SmartBin | null> {
    const bin = mockBinStore.find((b) => b.id === id);
    return bin || null;
  },

  async createBin(binData: Partial<SmartBin>): Promise<SmartBin> {
    const newId = binData.id || `BIN-${Math.floor(1000 + Math.random() * 9000)}`;

    if (mockBinStore.some((b) => b.id === newId)) {
      throw new Error(`Bin with ID ${newId} already exists.`);
    }

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
    const index = mockBinStore.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Bin ${id} not found.`);
    }

    const updated = {
      ...mockBinStore[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockBinStore[index] = updated;
    return updated;
  },

  async deactivateBin(id: string): Promise<SmartBin> {
    return this.updateBin(id, {
      status: 'Inactive',
      collectionStatus: 'Overdue',
      sensor: {
        ...mockBinStore.find((b) => b.id === id)!.sensor,
        connectivity: 'Offline',
      },
    });
  },

  async prioritizeBin(id: string): Promise<SmartBin> {
    const bin = mockBinStore.find((b) => b.id === id);
    if (!bin) throw new Error(`Bin ${id} not found.`);

    return this.updateBin(id, {
      collectionPriority: 'Critical',
      collectionStatus: 'Pending',
      activity: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: 'Just now',
          message: 'Priority elevated to CRITICAL by administrator.',
          type: 'alert',
        },
        ...(bin.activity || []),
      ],
    });
  },

  async bulkAssignZone(ids: string[], zone: SmartBin['zone']): Promise<number> {
    let count = 0;
    mockBinStore = mockBinStore.map((b) => {
      if (ids.includes(b.id)) {
        count++;
        return { ...b, zone };
      }
      return b;
    });
    return count;
  },

  async bulkAssignRoute(ids: string[], routeId: string): Promise<number> {
    let count = 0;
    mockBinStore = mockBinStore.map((b) => {
      if (ids.includes(b.id)) {
        count++;
        return { ...b, assignedRouteId: routeId, collectionStatus: 'Assigned' };
      }
      return b;
    });
    return count;
  },

  async bulkDeactivate(ids: string[]): Promise<number> {
    let count = 0;
    mockBinStore = mockBinStore.map((b) => {
      if (ids.includes(b.id)) {
        count++;
        return { ...b, status: 'Inactive', collectionStatus: 'Overdue' };
      }
      return b;
    });
    return count;
  },

  async getBinHistory(id: string): Promise<CollectionHistoryLog[]> {
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
