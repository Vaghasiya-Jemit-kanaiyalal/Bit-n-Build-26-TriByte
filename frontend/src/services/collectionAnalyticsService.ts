/**
 * collectionAnalyticsService.ts
 * Data service for Collection Analytics page.
 */

export interface CollectionKpiData {
  plannedCollections: number;
  plannedTrend: number;
  completedCollections: number;
  completedTrend: number;
  onTimeRate: number; // percentage (e.g. 95.6)
  onTimeRateTrend: number;
  avgCollectionTimeMinutes: number; // e.g. 14.2
  avgCollectionTimeTrend: number;
}

export interface CollectionTrendPoint {
  day: string;
  planned: number;
  completed: number;
  onTime: number;
}

export interface CollectionPerformanceItem {
  id: string;
  zone: string;
  plannedStops: number;
  completedStops: number;
  onTimeRate: number;
  avgStopMinutes: number;
  delayIncidents: number;
  status: 'EXCELLENT' | 'STABLE' | 'DELAYED';
}

export interface BottleneckSummaryItem {
  id: string;
  location: string;
  cause: string;
  avgDelayMinutes: number;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CollectionInsightItem {
  id: string;
  title: string;
  description: string;
  type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
}

export const collectionAnalyticsService = {
  getKpis(_dateRange: string = 'Last 30 Days'): CollectionKpiData {
    return {
      plannedCollections: 1240,
      plannedTrend: +5.2,
      completedCollections: 1186,
      completedTrend: +4.8,
      onTimeRate: 95.6,
      onTimeRateTrend: +1.2,
      avgCollectionTimeMinutes: 14.2,
      avgCollectionTimeTrend: -0.8,
    };
  },

  getCollectionTrends(_dateRange: string = 'Last 30 Days'): CollectionTrendPoint[] {
    return [
      { day: 'Mon', planned: 170, completed: 165, onTime: 160 },
      { day: 'Tue', planned: 180, completed: 176, onTime: 172 },
      { day: 'Wed', planned: 175, completed: 170, onTime: 165 },
      { day: 'Thu', planned: 190, completed: 185, onTime: 180 },
      { day: 'Fri', planned: 200, completed: 194, onTime: 188 },
      { day: 'Sat', planned: 165, completed: 158, onTime: 150 },
      { day: 'Sun', planned: 160, completed: 138, onTime: 130 },
    ];
  },

  getPerformanceList(): CollectionPerformanceItem[] {
    return [
      {
        id: 'COL-Z1',
        zone: 'Central Commercial Zone',
        plannedStops: 320,
        completedStops: 312,
        onTimeRate: 97.5,
        avgStopMinutes: 11.5,
        delayIncidents: 2,
        status: 'EXCELLENT',
      },
      {
        id: 'COL-Z2',
        zone: 'North Residential Suburb',
        plannedStops: 280,
        completedStops: 275,
        onTimeRate: 98.2,
        avgStopMinutes: 13.2,
        delayIncidents: 1,
        status: 'EXCELLENT',
      },
      {
        id: 'COL-Z3',
        zone: 'South Tech Corridor',
        plannedStops: 210,
        completedStops: 202,
        onTimeRate: 96.1,
        avgStopMinutes: 14.0,
        delayIncidents: 3,
        status: 'STABLE',
      },
      {
        id: 'COL-Z4',
        zone: 'East Market District',
        plannedStops: 240,
        completedStops: 220,
        onTimeRate: 91.6,
        avgStopMinutes: 18.4,
        delayIncidents: 8,
        status: 'DELAYED',
      },
      {
        id: 'COL-Z5',
        zone: 'Industrial Sector 4',
        plannedStops: 190,
        completedStops: 177,
        onTimeRate: 93.1,
        avgStopMinutes: 16.1,
        delayIncidents: 5,
        status: 'STABLE',
      },
    ];
  },

  getBottlenecks(): BottleneckSummaryItem[] {
    return [
      {
        id: 'BOT-01',
        location: 'East Market Access Gate',
        cause: 'Morning traffic congestion & narrow alleys',
        avgDelayMinutes: 24,
        impactLevel: 'HIGH',
      },
      {
        id: 'BOT-02',
        location: 'Industrial Dump Dock B',
        cause: 'Heavy compactor unloading queue',
        avgDelayMinutes: 16,
        impactLevel: 'MEDIUM',
      },
      {
        id: 'BOT-03',
        location: 'Riverfront Service Ramp',
        cause: 'Pedestrian crowding during weekend hours',
        avgDelayMinutes: 12,
        impactLevel: 'LOW',
      },
    ];
  },

  getInsights(): CollectionInsightItem[] {
    return [
      {
        id: 'INS-C1',
        title: 'On-Time Completion Improved by 1.2%',
        description: 'Morning route optimization reduced driver idle time across Central Zone by 18 minutes per shift.',
        type: 'POSITIVE',
      },
      {
        id: 'INS-C2',
        title: 'East Market Access Bottleneck Detected',
        description: 'Narrow lane congestion between 09:00 - 10:30 AM caused 8 delay incidents this week.',
        type: 'WARNING',
      },
      {
        id: 'INS-C3',
        title: 'Average Stop Time Reduced to 14.2 min',
        description: 'Smart bin hydraulic arm lift upgrades reduced stop handling time by 45 seconds per bin.',
        type: 'NEUTRAL',
      },
    ];
  },
};
