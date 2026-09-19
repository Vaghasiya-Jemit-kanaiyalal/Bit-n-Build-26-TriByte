export type PlanningStatusType = 'READY' | 'CALCULATING' | 'WARNING' | 'CONFLICT' | 'COMPLETED';
export type PlanningHorizonType = 'Today' | 'Next 12 Hours' | 'Next 24 Hours' | 'Next 48 Hours' | 'Next 7 Days';
export type OptimizationStrategyType = 'Balanced' | 'Shortest Distance' | 'Minimum Collection Time' | 'Maximum Capacity Utilization';

export interface ZoneDemandItem {
  id: string;
  zoneName?: string;
  zone?: string;
  totalBins?: number;
  binsCount?: number;
  currentFillPct?: number;
  currentFill?: number;
  predictedFillPct?: number;
  predictedFill?: number;
  expectedWasteTons: number;
  priorityBins?: number;
  priorityBinsCount?: number;
  overflowRisk: 'High' | 'Medium' | 'Low';
  requiredCapacityTons: number;
  status: 'READY' | 'HIGH DEMAND' | 'WATCH' | 'CONFLICT';
  assignedVehicles?: number;
  assignedVehiclesCount?: number;
  availableDrivers?: number;
  availableDriversCount?: number;
  recommendedWindow: string;
  criticalBins?: number;
  warningBins?: number;
  recommendedAction?: string;
}

export interface PriorityBinItem {
  id: string;
  binId: string;
  location: string;
  zone: string;
  fillLevelPct?: number;
  fillLevel?: number;
  predictedFillPct?: number;
  predictedFill?: number;
  predictedOverflow: string;
  wasteType: string;
  estimatedWasteKg?: number;
  estimatedWasteTons?: number;
  timeToOverflowHours: number;
  priorityScore: number;
  priorityCategory?: 'Critical' | 'High' | 'Medium' | 'Low';
  priorityReason?: string;
  reason?: string;
  collectionStatus: 'Due' | 'Pending' | 'Scheduled' | 'Overdue';
  lastCollection: string;
  nextCollection: string;
  assignedRoute?: string;
  isSelectedForPlan?: boolean;
  isSelected?: boolean;
}

export interface PlanningVehicle {
  id: string;
  vehicleId: string;
  vehicleType?: string;
  type?: string;
  model?: string;
  driverName: string;
  capacityTons: number;
  currentLoadTons: number;
  availableCapacityTons: number;
  utilizationPct?: number;
  utilizationPercent?: number;
  status: 'AVAILABLE' | 'LIMITED CAPACITY' | 'OVER CAPACITY' | 'ON ROUTE' | 'MAINTENANCE' | 'OFFLINE';
}

export interface PlanningDriver {
  id: string;
  driverId?: string;
  driverName?: string;
  name?: string;
  vehicleId: string;
  currentRouteId?: string;
  currentRoute?: string;
  assignedZone?: string;
  zone?: string;
  status: 'AVAILABLE' | 'ON ROUTE' | 'OFF DUTY' | 'UNAVAILABLE';
  hoursAvailable: number;
  availabilityStatus?: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface PlanningConstraint {
  vehicleCapacity: boolean;
  driverAvailability: boolean;
  collectionTimeWindow: boolean;
  wasteTypeCompatibility: boolean;
  zoneRestrictions: boolean;
  trafficConsideration: boolean;
  duplicateBinAssignmentPrevention?: boolean;
  preventDuplicateAssignment?: boolean;
  preventUnavailableVehicleAssignment: boolean;
  preventDriverConflicts: boolean;
  allowManualOverride: boolean;
  maxRouteDurationHours: number;
  maxStopsPerRoute: number;
  maxVehicleUtilizationPct?: number;
  maxVehicleUtilizationPercent?: number;
}

export interface CollectionWindow {
  id: string;
  window?: string;
  windowLabel?: string;
  expectedBins: number;
  expectedWasteTons: number;
  vehiclesRequired: number;
  availableCapacityTons: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  risk?: 'Low' | 'Medium' | 'High';
  isRecommended?: boolean;
}

export interface OptimizationWeights {
  distancePct?: number;
  distanceWeight?: number;
  capacityPct?: number;
  capacityWeight?: number;
  priorityPct?: number;
  priorityWeight?: number;
  timePct?: number;
  timeWeight?: number;
}

export interface OptimizationPreview {
  strategy: OptimizationStrategyType;
  weights: OptimizationWeights;
  estimatedRoutes: number;
  estimatedDistanceKm: number;
  estimatedDurationHours?: string;
  estimatedDurationHoursMin?: string;
  expectedWasteCollectedTons: number;
  capacityUtilizationPct?: number;
  capacityUtilizationPercent?: number;
  priorityCoveragePct?: number;
  priorityCoveragePercent?: number;
  unassignedBins: number;
  conflictsCount: number;
}

export interface PlanningRoute {
  id: string;
  routeId?: string;
  routeCode?: string;
  vehicleId: string;
  driverName: string;
  zone: string;
  stopCount?: number;
  stopsCount?: number;
  expectedWasteTons: number;
  distanceKm: number;
  estimatedDuration?: string;
  duration?: string;
  capacityUtilizationPct?: number;
  capacityUtilizationPercent?: number;
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'READY' | 'ASSIGNED' | 'DISPATCHED';
  binIds?: string[];
  stopBinsList?: string[];
}

export interface PlanningIssue {
  id?: string;
  issueId?: string;
  severity: 'CRITICAL' | 'WARNING' | 'CONFLICT' | 'NOTICE';
  message: string;
  affectedEntity: string;
  actionText: string;
  isResolved?: boolean;
}

export interface PlanningPlan {
  id: string;
  planId: string;
  date: string;
  horizon?: string;
  planningWindow?: string;
  routesCount: number;
  binsCount: number;
  wasteTons: number;
  vehiclesCount: number;
  coveragePct?: number;
  coveragePercent?: number;
  status: 'DRAFT' | 'READY' | 'IN PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
}

export interface PlanningInsight {
  id: string;
  title: string;
  description: string;
  confidenceScore?: number;
  zoneOrEntity?: string;
  badge?: string;
}

export interface PlanningSummary {
  status: PlanningStatusType;
  binsAnalyzed: number;
  priorityBins: number;
  expectedWasteTons: number;
  requiredCapacityTons: number;
  availableCapacityTons: number;
  vehiclesAvailable: number;
  driversAvailable: number;
  predictedOverflowBins: number;
  planningCoveragePercent: number;
}

// Aliases for compatibility
export type ZoneDemand = ZoneDemandItem;
export type PriorityBin = PriorityBinItem;
export type OptimizationStrategy = OptimizationStrategyType;

export type PlanningSummaryData = PlanningSummary;
export type PlanningConstraintsData = PlanningConstraint;
export type CollectionWindowItem = CollectionWindow;
export type OptimizationPreviewData = OptimizationPreview;
export type GeneratedRouteItem = PlanningRoute;
export type PlanningIssueItem = PlanningIssue;
export type RecentPlanItem = PlanningPlan;
export type AIPlanningInsightItem = PlanningInsight;
