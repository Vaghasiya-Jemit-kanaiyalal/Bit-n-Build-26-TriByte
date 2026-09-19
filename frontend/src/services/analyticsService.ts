import {
  initialAnalyticsSummary,
  wasteTrendData,
  zonePerformanceData,
  wasteCompositionData,
  fleetUtilizationData,
  routePerformanceData,
  overflowTrendData,
  predictionVsActualData,
  timeOfDayData,
  bottleneckList,
  operationalInsightsList,
  type AnalyticsSummaryData,
  type WasteTrendPoint,
  type ZoneAnalyticsItem,
  type WasteCompositionItem,
  type FleetUtilizationItem,
  type RouteEfficiencyItem,
  type DailyOverflowPoint,
  type PredictionVsActualPoint,
  type TimeOfDayPoint,
  type BottleneckItem,
  type OperationalInsightItem
} from '../mock/analyticsMockData';

export type DateRangeType = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'This Year' | 'Custom';
export type ComparePeriodType = 'Previous Period' | 'Previous Year' | 'No Comparison';

export const analyticsService = {
  getSummary: (dateRange: DateRangeType = 'Last 30 Days', _compare: ComparePeriodType = 'Previous Period'): AnalyticsSummaryData => {
    // Multiplier based on selected date range for realistic simulation
    let factor = 1;
    if (dateRange === 'Today') factor = 0.033;
    else if (dateRange === 'Yesterday') factor = 0.034;
    else if (dateRange === 'Last 7 Days') factor = 0.23;
    else if (dateRange === 'Last 90 Days') factor = 3.0;
    else if (dateRange === 'This Year') factor = 8.5;

    const baseTons = initialAnalyticsSummary.totalWasteCollectedTons * (dateRange === 'Last 30 Days' ? 1 : factor);

    return {
      ...initialAnalyticsSummary,
      totalWasteCollectedTons: Math.round(baseTons * 10) / 10,
      averageDailyWasteTons: Math.round((baseTons / (dateRange === 'Today' ? 1 : dateRange === 'Last 7 Days' ? 7 : 30)) * 10) / 10 || 8.3,
    };
  },

  getWasteTrends: (_dateRange: DateRangeType, zoneFilter: string = 'All'): WasteTrendPoint[] => {
    let data = [...wasteTrendData];
    if (zoneFilter !== 'All') {
      const zoneScale = zoneFilter === 'Industrial Zone' ? 0.29 : zoneFilter === 'Central Zone' ? 0.25 : 0.20;
      data = data.map(pt => ({
        ...pt,
        generated: Math.round(pt.generated * zoneScale * 10) / 10,
        collected: Math.round(pt.collected * zoneScale * 10) / 10,
        predicted: Math.round(pt.predicted * zoneScale * 10) / 10,
      }));
    }
    return data;
  },

  getZonePerformance: (): ZoneAnalyticsItem[] => {
    return zonePerformanceData;
  },

  getWasteComposition: (): WasteCompositionItem[] => {
    return wasteCompositionData;
  },

  getFleetUtilization: (): FleetUtilizationItem[] => {
    return fleetUtilizationData;
  },

  getRoutePerformance: (): RouteEfficiencyItem[] => {
    return routePerformanceData;
  },

  getOverflowAnalytics: (): DailyOverflowPoint[] => {
    return overflowTrendData;
  },

  getPredictionVsActual: (): PredictionVsActualPoint[] => {
    return predictionVsActualData;
  },

  getTimeOfDayAnalytics: (): TimeOfDayPoint[] => {
    return timeOfDayData;
  },

  getBottlenecks: (): BottleneckItem[] => {
    return bottleneckList;
  },

  getOperationalInsights: (): OperationalInsightItem[] => {
    return operationalInsightsList;
  }
};

export default analyticsService;
