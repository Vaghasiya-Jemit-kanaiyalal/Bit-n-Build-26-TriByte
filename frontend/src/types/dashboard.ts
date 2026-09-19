export type OperationalRiskLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type VehicleOperationalStatus = 'Available' | 'On Route' | 'Idle' | 'Maintenance' | 'Offline';
export type RouteOperationalStatus = 'Planned' | 'In Progress' | 'Paused' | 'Completed';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DashboardStatusStrip {
  networkStatus: 'Online' | 'Degraded' | 'Offline';
  binSensorsHealth: 'Healthy' | 'Warning' | 'Critical';
  fleetStatus: 'Operational' | 'Limited' | 'Maintenance';
  routeEngineStatus: 'Ready' | 'Calculating' | 'Offline';
  aiPredictionStatus: 'Running' | 'Paused' | 'Degraded';
  isLive: boolean;
  lastUpdated: string;
}

export interface DashboardKpiMetrics {
  totalBins: number;
  activeBins: number;
  binsNeedingCollection: number;
  criticalBins: number;
  activeVehicles: number;
  totalVehicles: number;
  fleetActivePercentage: number;
  activeRoutes: number;
  routesInProgress: number;
  todayCollectionTons: number;
  collectionTrend: string;
  plannedCollectionTons: number;
  recyclablePercentage: number;
  recyclableTons: number;
  nonRecyclableTons: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  route: string;
  iconName: string;
  badge?: string;
}

export interface DashboardMapBinMarker {
  id: string;
  binCode: string;
  location: string;
  zone: string;
  fillLevel: number;
  status: OperationalRiskLevel;
  wasteType: string;
  timeToOverflow: string;
  coordinates: { x: number; y: number };
}

export interface DashboardMapVehicleMarker {
  id: string;
  vehicleCode: string;
  driverName: string;
  currentRoute: string;
  status: VehicleOperationalStatus;
  loadPercentage: number;
  coordinates: { x: number; y: number };
}

export interface DashboardMapRoutePolyline {
  id: string;
  routeCode: string;
  color: string;
  points: { x: number; y: number }[];
}

export interface LiveOperationEvent {
  id: string;
  timestamp: string;
  title: string;
  subtitle: string;
  severity: AlertSeverity;
  type: 'VEHICLE' | 'BIN' | 'COLLECTION' | 'AI' | 'ROUTE';
}

export interface BinCapacityDistribution {
  normalCount: number;
  warningCount: number;
  criticalCount: number;
  offlineCount: number;
  averageFillPercentage: number;
  highestFillZone: string;
  predictedOverflowCount: number;
}

export interface AiForecastTrendPoint {
  timeLabel: string;
  predictedDemandBins: number;
  predictedWasteTons: number;
}

export interface AiForecastSummary {
  expectedWasteTons: number;
  expectedCollectionDemandBins: number;
  predictedOverflowBins: number;
  predictionConfidence: number;
  trendPoints: AiForecastTrendPoint[];
  aiInsightText: string;
}

export interface CollectionPerformanceSummary {
  plannedTons: number;
  collectedTons: number;
  remainingTons: number;
  completionPercentage: number;
  plannedStops: number;
  completedStops: number;
  remainingStops: number;
  avgCollectionTimeMinutes: number;
  onTimeCollectionPercentage: number;
}

export interface WasteCompositionCategory {
  category: 'Organic' | 'Plastic' | 'Paper' | 'Metal' | 'Glass' | 'Other';
  percentage: number;
  color: string;
}

export interface WasteCompositionSummary {
  recyclablePercentage: number;
  nonRecyclablePercentage: number;
  estimatedRecyclableTons: number;
  estimatedNonRecyclableTons: number;
  categories: WasteCompositionCategory[];
}

export interface ZonePerformanceItem {
  zone: string;
  totalBins: number;
  avgFillPercentage: number;
  criticalBinsCount: number;
  collectedTodayTons: number;
  collectionEfficiencyPercentage: number;
  status: OperationalRiskLevel;
}

export interface PriorityCollectionItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  binCode: string;
  location: string;
  zone: string;
  fillLevel: number;
  timeToOverflow: string;
  estimatedWasteKg: number;
  collectionWindow: string;
  assignedRoute?: string;
  assignedVehicle?: string;
  coordinates: { x: number; y: number };
}

export interface DashboardVehicleItem {
  id: string;
  vehicleCode: string;
  type: string;
  currentLoadTons: number;
  capacityTons: number;
  utilizationPercentage: number;
  status: VehicleOperationalStatus;
  driverName: string;
  assignedRoute?: string;
  coordinates: { x: number; y: number };
}

export interface FleetStatusSummary {
  availablePercentage: number;
  onRouteCount: number;
  idleCount: number;
  maintenanceCount: number;
  offlineCount: number;
  vehicles: DashboardVehicleItem[];
}

export interface ActiveRouteItem {
  id: string;
  routeCode: string;
  vehicleCode: string;
  driverName: string;
  totalStops: number;
  completedStops: number;
  remainingStops: number;
  distanceKm: number;
  status: RouteOperationalStatus;
  estimatedDuration: string;
  completionPercentage: number;
}

export interface AttentionItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  relatedEntityId: string;
  entityType: 'BIN' | 'VEHICLE' | 'ROUTE' | 'PREDICTION' | 'SENSOR';
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  statusBadge: string;
}

export interface DashboardFilterState {
  dateRange: 'today' | 'yesterday' | '7days' | '30days';
  zone: string;
  operationalStatus: 'All' | 'Active' | 'Warning' | 'Critical';
}
