import type {
  DashboardStatusStrip,
  DashboardKpiMetrics,
  QuickActionItem,
  DashboardMapBinMarker,
  DashboardMapVehicleMarker,
  DashboardMapRoutePolyline,
  LiveOperationEvent,
  BinCapacityDistribution,
  AiForecastSummary,
  CollectionPerformanceSummary,
  WasteCompositionSummary,
  ZonePerformanceItem,
  PriorityCollectionItem,
  FleetStatusSummary,
  ActiveRouteItem,
  AttentionItem,
  RecentActivityItem,
  DashboardFilterState,
} from '../types/dashboard';

import {
  mockDashboardStatusStrip,
  mockDashboardKpiMetrics,
  mockQuickActions,
  mockMapBinMarkers,
  mockMapVehicleMarkers,
  mockMapRoutePolylines,
  mockLiveOperationEvents,
  mockBinCapacityDistribution,
  mockAiForecastSummary,
  mockCollectionPerformanceSummary,
  mockWasteCompositionSummary,
  mockZonePerformanceList,
  mockPriorityCollectionList,
  mockFleetStatusSummary,
  mockActiveRoutesList,
  mockAttentionItemList,
  mockRecentActivityList,
} from '../data/adminDashboardMock';

class DashboardService {
  private liveEvents: LiveOperationEvent[] = [...mockLiveOperationEvents];

  public getStatusStrip(): DashboardStatusStrip {
    return { ...mockDashboardStatusStrip, lastUpdated: new Date().toLocaleTimeString() };
  }

  public getKpiMetrics(): DashboardKpiMetrics {
    return { ...mockDashboardKpiMetrics };
  }

  public getQuickActions(): QuickActionItem[] {
    return [...mockQuickActions];
  }

  public getMapBinMarkers(filters?: Partial<DashboardFilterState>): DashboardMapBinMarker[] {
    let list = [...mockMapBinMarkers];
    if (filters?.zone && filters.zone !== 'All') {
      list = list.filter((b) => b.zone.toLowerCase() === filters.zone?.toLowerCase());
    }
    if (filters?.operationalStatus && filters.operationalStatus !== 'All') {
      list = list.filter((b) => b.status.toLowerCase() === filters.operationalStatus?.toLowerCase());
    }
    return list;
  }

  public getMapVehicleMarkers(): DashboardMapVehicleMarker[] {
    return [...mockMapVehicleMarkers];
  }

  public getMapRoutePolylines(): DashboardMapRoutePolyline[] {
    return [...mockMapRoutePolylines];
  }

  public getLiveOperationsFeed(): LiveOperationEvent[] {
    return [...this.liveEvents];
  }

  public getBinCapacityDistribution(): BinCapacityDistribution {
    return { ...mockBinCapacityDistribution };
  }

  public getAiForecastSummary(): AiForecastSummary {
    return { ...mockAiForecastSummary };
  }

  public getCollectionPerformanceSummary(): CollectionPerformanceSummary {
    return { ...mockCollectionPerformanceSummary };
  }

  public getWasteCompositionSummary(): WasteCompositionSummary {
    return { ...mockWasteCompositionSummary };
  }

  public getZonePerformanceList(filters?: Partial<DashboardFilterState>): ZonePerformanceItem[] {
    let list = [...mockZonePerformanceList];
    if (filters?.zone && filters.zone !== 'All') {
      list = list.filter((z) => z.zone.toLowerCase() === filters.zone?.toLowerCase());
    }
    return list;
  }

  public getPriorityCollectionList(filters?: Partial<DashboardFilterState>): PriorityCollectionItem[] {
    let list = [...mockPriorityCollectionList];
    if (filters?.zone && filters.zone !== 'All') {
      list = list.filter((p) => p.zone.toLowerCase() === filters.zone?.toLowerCase());
    }
    return list;
  }

  public getFleetStatusSummary(): FleetStatusSummary {
    return { ...mockFleetStatusSummary };
  }

  public getActiveRoutesList(): ActiveRouteItem[] {
    return [...mockActiveRoutesList];
  }

  public getAttentionItemList(): AttentionItem[] {
    return [...mockAttentionItemList];
  }

  public getRecentActivityList(): RecentActivityItem[] {
    return [...mockRecentActivityList];
  }

  public assignVehicleToPriorityBin(binId: string, vehicleCode: string): boolean {
    const bin = mockPriorityCollectionList.find((p) => p.id === binId || p.binCode === binId);
    if (bin) {
      bin.assignedVehicle = vehicleCode;
      return true;
    }
    return false;
  }
}

export const dashboardService = new DashboardService();
