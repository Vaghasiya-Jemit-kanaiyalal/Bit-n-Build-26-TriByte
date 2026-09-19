export interface WasteTrendPoint {
  date: string; // e.g. "Sep 01"
  generated: number; // in tons
  collected: number; // in tons
  predicted: number; // in tons
}

export interface ZoneAnalyticsItem {
  id: string;
  name: string;
  totalBins: number;
  averageFill: number; // percentage e.g. 86
  wastePerDay: number; // tons/day
  collectionsCount: number;
  overflowEvents: number;
  onTimeRate: number; // percentage e.g. 82
  status: 'Critical' | 'Healthy' | 'Attention';
  topBins: Array<{ id: string; location: string; currentFill: number; predictedOverflowHours: number }>;
}

export interface WasteCompositionItem {
  category: string;
  percentage: number;
  tonsPerDay: number;
  color: string;
  isRecyclable: boolean;
}

export interface FleetUtilizationItem {
  vehicleId: string;
  model: string;
  type: string;
  utilization: number; // percentage
  capacityUsage: number; // percentage
  routesCompleted: number;
  totalDistanceKm: number;
  status: 'Active' | 'Idle' | 'Maintenance' | 'Offline';
}

export interface RouteEfficiencyItem {
  routeId: string;
  name: string;
  zone: string;
  distanceKm: number;
  totalStops: number;
  completionRate: number;
  onTimeRate: number;
  avgDurationMin: number;
}

export interface DailyOverflowPoint {
  date: string;
  predicted: number;
  actual: number;
}

export interface PredictionVsActualPoint {
  date: string;
  predictedFill: number;
  actualFill: number;
}

export interface AlertSeverityPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TimeOfDayPoint {
  hour: string; // "08:00"
  collections: number;
  avgVolumeTons: number;
}

export interface BottleneckItem {
  id: string;
  problem: string;
  affectedEntity: string;
  metric: string;
  impact: 'High' | 'Medium' | 'Low';
  zone: string;
  actionRequired: string;
}

export interface OperationalInsightItem {
  id: string;
  badge: 'AI INSIGHT' | 'DEMO OBSERVATION' | 'ANOMALY' | 'EFFICIENCY';
  timestamp: string;
  zoneOrEntity: string;
  title: string;
  description: string;
  relatedModule: 'Bins' | 'Routes' | 'Vehicles' | 'Predictions' | 'Alerts' | 'Classification';
}

export interface AnalyticsSummaryData {
  totalWasteCollectedTons: number;
  totalWasteCollectedTrend: number; // +8.4%
  averageDailyWasteTons: number;
  averageDailyWasteTrend: number; // +5.2%
  collectionEfficiencyRate: number; // 91.4%
  collectionEfficiencyTrend: number; // +3.8%
  recyclableRecoveryRate: number; // 53.2%
  recyclableRecoveryTrend: number; // +6.1%
  overflowEventsCount: number; // 42
  overflowEventsTrend: number; // -14.3%
}

// -------------------------------------------------------------
// CENTRALIZED MOCK DATASET
// -------------------------------------------------------------

export const initialAnalyticsSummary: AnalyticsSummaryData = {
  totalWasteCollectedTons: 248.6,
  totalWasteCollectedTrend: 8.4,
  averageDailyWasteTons: 8.3,
  averageDailyWasteTrend: 5.2,
  collectionEfficiencyRate: 91.4,
  collectionEfficiencyTrend: 3.8,
  recyclableRecoveryRate: 53.2,
  recyclableRecoveryTrend: 6.1,
  overflowEventsCount: 42,
  overflowEventsTrend: -14.3,
};

// 30 Days Waste Trend
export const wasteTrendData: WasteTrendPoint[] = [
  { date: 'Sep 01', generated: 7.8, collected: 7.2, predicted: 7.6 },
  { date: 'Sep 02', generated: 8.1, collected: 7.7, predicted: 8.0 },
  { date: 'Sep 03', generated: 8.4, collected: 8.0, predicted: 8.2 },
  { date: 'Sep 04', generated: 7.9, collected: 7.5, predicted: 7.8 },
  { date: 'Sep 05', generated: 8.6, collected: 8.2, predicted: 8.5 },
  { date: 'Sep 06', generated: 9.2, collected: 8.8, predicted: 9.0 },
  { date: 'Sep 07', generated: 9.8, collected: 9.1, predicted: 9.5 },
  { date: 'Sep 08', generated: 8.0, collected: 7.6, predicted: 7.9 },
  { date: 'Sep 09', generated: 8.2, collected: 7.8, predicted: 8.1 },
  { date: 'Sep 10', generated: 8.5, collected: 8.1, predicted: 8.4 },
  { date: 'Sep 11', generated: 8.3, collected: 7.9, predicted: 8.2 },
  { date: 'Sep 12', generated: 8.8, collected: 8.4, predicted: 8.6 },
  { date: 'Sep 13', generated: 9.5, collected: 9.0, predicted: 9.3 },
  { date: 'Sep 14', generated: 10.4, collected: 9.8, predicted: 10.1 },
  { date: 'Sep 15', generated: 8.1, collected: 7.7, predicted: 8.0 },
  { date: 'Sep 16', generated: 8.3, collected: 7.9, predicted: 8.2 },
  { date: 'Sep 17', generated: 8.6, collected: 8.2, predicted: 8.5 },
  { date: 'Sep 18', generated: 8.4, collected: 8.0, predicted: 8.3 },
  { date: 'Sep 19', generated: 8.9, collected: 8.5, predicted: 8.7 },
];

// Zone Performance Dataset
export const zonePerformanceData: ZoneAnalyticsItem[] = [
  {
    id: 'ZONE-IND',
    name: 'Industrial Zone',
    totalBins: 35,
    averageFill: 86,
    wastePerDay: 2.4,
    collectionsCount: 19,
    overflowEvents: 9,
    onTimeRate: 82,
    status: 'Critical',
    topBins: [
      { id: 'BIN-1087', location: 'Central Market Dumpster', currentFill: 96, predictedOverflowHours: 1.5 },
      { id: 'BIN-1201', location: 'Industrial Gate 4', currentFill: 92, predictedOverflowHours: 2.8 },
      { id: 'BIN-1134', location: 'Manufacturing Hub', currentFill: 88, predictedOverflowHours: 4.2 },
    ]
  },
  {
    id: 'ZONE-[#738a62]',
    name: 'Central Zone',
    totalBins: 52,
    averageFill: 71,
    wastePerDay: 2.1,
    collectionsCount: 31,
    overflowEvents: 7,
    onTimeRate: 94,
    status: 'Healthy',
    topBins: [
      { id: 'BIN-1042', location: 'Civic Plaza North', currentFill: 84, predictedOverflowHours: 5.0 },
      { id: 'BIN-1011', location: 'Metro Junction A', currentFill: 79, predictedOverflowHours: 7.1 },
    ]
  },
  {
    id: 'ZONE-RES',
    name: 'Residential Zone',
    totalBins: 35,
    averageFill: 73,
    wastePerDay: 1.8,
    collectionsCount: 24,
    overflowEvents: 6,
    onTimeRate: 91,
    status: 'Attention',
    topBins: [
      { id: 'BIN-1055', location: 'Greenwood Apartments', currentFill: 87, predictedOverflowHours: 3.2 },
    ]
  },
  {
    id: 'ZONE-WST',
    name: 'West Zone',
    totalBins: 47,
    averageFill: 68,
    wastePerDay: 1.7,
    collectionsCount: 28,
    overflowEvents: 5,
    onTimeRate: 92,
    status: 'Healthy',
    topBins: [
      { id: 'BIN-1090', location: 'West Avenue Mall', currentFill: 81, predictedOverflowHours: 6.4 },
    ]
  },
  {
    id: 'ZONE-NTH',
    name: 'North Zone',
    totalBins: 41,
    averageFill: 64,
    wastePerDay: 1.6,
    collectionsCount: 26,
    overflowEvents: 4,
    onTimeRate: 95,
    status: 'Healthy',
    topBins: [
      { id: 'BIN-1102', location: 'North Technology Park', currentFill: 75, predictedOverflowHours: 8.0 },
    ]
  },
  {
    id: 'ZONE-EST',
    name: 'East Zone',
    totalBins: 38,
    averageFill: 79,
    wastePerDay: 1.9,
    collectionsCount: 22,
    overflowEvents: 7,
    onTimeRate: 88,
    status: 'Attention',
    topBins: [
      { id: 'BIN-1144', location: 'Eastern Freight Terminal', currentFill: 89, predictedOverflowHours: 2.1 },
    ]
  },
  {
    id: 'ZONE-STH',
    name: 'South Zone',
    totalBins: 40,
    averageFill: 61,
    wastePerDay: 1.2,
    collectionsCount: 21,
    overflowEvents: 4,
    onTimeRate: 96,
    status: 'Healthy',
    topBins: [
      { id: 'BIN-1066', location: 'South Riverside Park', currentFill: 72, predictedOverflowHours: 9.5 },
    ]
  }
];

// Waste Composition
export const wasteCompositionData: WasteCompositionItem[] = [
  { category: 'Organic', percentage: 42, tonsPerDay: 3.49, color: '#10b981', isRecyclable: true },
  { category: 'Plastic', percentage: 21, tonsPerDay: 1.74, color: '#3b82f6', isRecyclable: true },
  { category: 'Paper', percentage: 16, tonsPerDay: 1.33, color: '#f59e0b', isRecyclable: true },
  { category: 'Glass', percentage: 9, tonsPerDay: 0.75, color: '#a855f7', isRecyclable: true },
  { category: 'Metal', percentage: 7, tonsPerDay: 0.58, color: '#64748b', isRecyclable: true },
  { category: 'Other', percentage: 5, tonsPerDay: 0.42, color: '#94a3b8', isRecyclable: false },
];

// Fleet Utilization
export const fleetUtilizationData: FleetUtilizationItem[] = [
  { vehicleId: 'TRK-021', model: 'EV Heavy Compactor', type: 'Electric', utilization: 82, capacityUsage: 86, routesCompleted: 14, totalDistanceKm: 340, status: 'Active' },
  { vehicleId: 'TRK-014', model: 'Volvo CleanCity 200', type: 'Hybrid', utilization: 76, capacityUsage: 79, routesCompleted: 12, totalDistanceKm: 290, status: 'Active' },
  { vehicleId: 'TRK-008', model: 'Isuzu Side Loader', type: 'Diesel', utilization: 71, capacityUsage: 72, routesCompleted: 11, totalDistanceKm: 260, status: 'Active' },
  { vehicleId: 'TRK-017', model: 'BYD E-Dump Truck', type: 'Electric', utilization: 63, capacityUsage: 68, routesCompleted: 9, totalDistanceKm: 210, status: 'Active' },
  { vehicleId: 'TRK-012', model: 'Scania P280 Rear Loader', type: 'Diesel', utilization: 58, capacityUsage: 62, routesCompleted: 8, totalDistanceKm: 185, status: 'Idle' },
  { vehicleId: 'TRK-003', model: 'Mercedes Econic 2630', type: 'Hybrid', utilization: 0, capacityUsage: 0, routesCompleted: 0, totalDistanceKm: 0, status: 'Maintenance' },
];

// Route Performance
export const routePerformanceData: RouteEfficiencyItem[] = [
  { routeId: 'R-101', name: 'Central Commercial Express', zone: 'Central Zone', distanceKm: 22.4, totalStops: 18, completionRate: 98, onTimeRate: 96, avgDurationMin: 115 },
  { routeId: 'R-104', name: 'North Residential Loop B', zone: 'North Zone', distanceKm: 28.1, totalStops: 24, completionRate: 87, onTimeRate: 82, avgDurationMin: 142 },
  { routeId: 'R-106', name: 'Industrial Sector Heavy Route', zone: 'Industrial Zone', distanceKm: 19.8, totalStops: 14, completionRate: 94, onTimeRate: 92, avgDurationMin: 105 },
  { routeId: 'R-109', name: 'West Commercial Sweep', zone: 'West Zone', distanceKm: 25.5, totalStops: 20, completionRate: 96, onTimeRate: 91, avgDurationMin: 128 },
  { routeId: 'R-112', name: 'South Parks & Institutional', zone: 'South Zone', distanceKm: 21.0, totalStops: 16, completionRate: 99, onTimeRate: 97, avgDurationMin: 98 },
];

// Daily Overflow Trend
export const overflowTrendData: DailyOverflowPoint[] = [
  { date: 'Sep 13', predicted: 4, actual: 3 },
  { date: 'Sep 14', predicted: 6, actual: 5 },
  { date: 'Sep 15', predicted: 3, actual: 2 },
  { date: 'Sep 16', predicted: 5, actual: 4 },
  { date: 'Sep 17', predicted: 4, actual: 4 },
  { date: 'Sep 18', predicted: 5, actual: 3 },
  { date: 'Sep 19', predicted: 4, actual: 3 },
];

// Prediction vs Actual Fill
export const predictionVsActualData: PredictionVsActualPoint[] = [
  { date: '06:00', predictedFill: 42, actualFill: 40 },
  { date: '08:00', predictedFill: 58, actualFill: 56 },
  { date: '10:00', predictedFill: 74, actualFill: 76 },
  { date: '12:00', predictedFill: 83, actualFill: 85 },
  { date: '14:00', predictedFill: 89, actualFill: 88 },
  { date: '16:00', predictedFill: 94, actualFill: 92 },
  { date: '18:00', predictedFill: 62, actualFill: 60 },
];

// Time of Day Collections
export const timeOfDayData: TimeOfDayPoint[] = [
  { hour: '06:00', collections: 12, avgVolumeTons: 1.8 },
  { hour: '08:00', collections: 38, avgVolumeTons: 4.2 },
  { hour: '10:00', collections: 46, avgVolumeTons: 5.1 },
  { hour: '12:00', collections: 29, avgVolumeTons: 3.4 },
  { hour: '14:00', collections: 34, avgVolumeTons: 3.9 },
  { hour: '16:00', collections: 22, avgVolumeTons: 2.5 },
  { hour: '18:00', collections: 14, avgVolumeTons: 1.6 },
  { hour: '20:00', collections: 6, avgVolumeTons: 0.8 },
];

// Operational Bottlenecks
export const bottleneckList: BottleneckItem[] = [
  {
    id: 'BOT-01',
    problem: 'Sustained High Fill Levels',
    affectedEntity: 'Industrial Zone (35 Bins)',
    metric: 'Average 86% Fill Level',
    impact: 'High',
    zone: 'Industrial Zone',
    actionRequired: 'Increase collection shift frequency from 1x to 2x daily'
  },
  {
    id: 'BOT-02',
    problem: 'Above-Average Route Duration',
    affectedEntity: 'Route R-104 (24 Stops)',
    metric: '+22 Min Schedule Delay',
    impact: 'Medium',
    zone: 'North Zone',
    actionRequired: 'Split Route R-104 into 2 sub-routes during morning peak'
  },
  {
    id: 'BOT-03',
    problem: 'High Vehicle Capacity Utilization',
    affectedEntity: 'TRK-021 (Heavy Compactor)',
    metric: '86% Avg Fleet Capacity',
    impact: 'Medium',
    zone: 'Central Zone',
    actionRequired: 'Reassign 2 transfer stops to reserve vehicle TRK-017'
  },
  {
    id: 'BOT-04',
    problem: 'Frequent Bin Overflow Recurrence',
    affectedEntity: 'BIN-1087 (Central Market)',
    metric: '9 Overflow Events in 30 Days',
    impact: 'High',
    zone: 'Central Zone',
    actionRequired: 'Deploy dual 1100L smart compactor bin at Central Market'
  }
];

// AI Operational Insights
export const operationalInsightsList: OperationalInsightItem[] = [
  {
    id: 'INS-101',
    badge: 'AI INSIGHT',
    timestamp: '14 min ago',
    zoneOrEntity: 'Industrial Zone',
    title: 'Highest Project Waste Volume Expected',
    description: 'Industrial Zone has the highest projected waste generation (+18%) over the next 7 days based on manufacturing schedule telemetry.',
    relatedModule: 'Predictions'
  },
  {
    id: 'INS-102',
    badge: 'ANOMALY',
    timestamp: '32 min ago',
    zoneOrEntity: 'BIN-1087',
    title: '14 Bins Exceeding Threshold in <6 Hours',
    description: '14 smart bins are currently predicted to exceed the configured 90% collection threshold before 18:00 today.',
    relatedModule: 'Bins'
  },
  {
    id: 'INS-103',
    badge: 'EFFICIENCY',
    timestamp: '1 hour ago',
    zoneOrEntity: 'Fleet Operations',
    title: 'Weekend Collection Demand Spike Predicted',
    description: 'Collection demand is expected to increase by 24% during the upcoming weekend in Commercial and Central zones.',
    relatedModule: 'Routes'
  },
  {
    id: 'INS-104',
    badge: 'DEMO OBSERVATION',
    timestamp: '2 hours ago',
    zoneOrEntity: 'Route R-104',
    title: 'Above-Average Waste Collection Volume',
    description: 'Route R-104 is associated with 34% higher plastic waste volume compared to historical seasonal averages.',
    relatedModule: 'Classification'
  }
];
