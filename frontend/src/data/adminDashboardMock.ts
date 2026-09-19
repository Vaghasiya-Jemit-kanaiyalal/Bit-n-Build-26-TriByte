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
  DashboardVehicleItem,
  FleetStatusSummary,
  ActiveRouteItem,
  AttentionItem,
  RecentActivityItem,
} from '../types/dashboard';

export const mockDashboardStatusStrip: DashboardStatusStrip = {
  networkStatus: 'Online',
  binSensorsHealth: 'Healthy',
  fleetStatus: 'Operational',
  routeEngineStatus: 'Ready',
  aiPredictionStatus: 'Running',
  isLive: true,
  lastUpdated: 'Just now',
};

export const mockDashboardKpiMetrics: DashboardKpiMetrics = {
  totalBins: 248,
  activeBins: 236,
  binsNeedingCollection: 37,
  criticalBins: 14,
  activeVehicles: 18,
  totalVehicles: 24,
  fleetActivePercentage: 75,
  activeRoutes: 12,
  routesInProgress: 8,
  todayCollectionTons: 8.4,
  collectionTrend: '+12.6% vs yesterday',
  plannedCollectionTons: 10.7,
  recyclablePercentage: 61.8,
  recyclableTons: 5.19,
  nonRecyclableTons: 3.21,
};

export const mockQuickActions: QuickActionItem[] = [
  { id: 'act-1', title: 'Create Collection Plan', route: '/admin/planning', iconName: 'CalendarCheck', badge: 'Recommended' },
  { id: 'act-2', title: 'Create Route', route: '/admin/routes', iconName: 'Route' },
  { id: 'act-3', title: 'Add Bin', route: '/admin/bins', iconName: 'Trash2' },
  { id: 'act-4', title: 'Add Vehicle', route: '/admin/vehicles', iconName: 'Truck' },
  { id: 'act-5', title: 'View Alerts', route: '/admin/alerts', iconName: 'Bell', badge: '5 Active' },
  { id: 'act-6', title: 'View Monitoring', route: '/admin/monitoring', iconName: 'Activity' },
];

export const mockMapBinMarkers: DashboardMapBinMarker[] = [
  { id: 'b-1', binCode: 'BIN-1042', location: 'Market Road Plaza', zone: 'Central', fillLevel: 96, status: 'CRITICAL', wasteType: 'General', timeToOverflow: '2h 15m', coordinates: { x: 22, y: 35 } },
  { id: 'b-2', binCode: 'BIN-0921', location: 'Industrial Estate Loading Dock', zone: 'Industrial', fillLevel: 89, status: 'CRITICAL', wasteType: 'Metal', timeToOverflow: '4h 30m', coordinates: { x: 78, y: 25 } },
  { id: 'b-3', binCode: 'BIN-0844', location: 'Hostel Block A Entrance', zone: 'Residential', fillLevel: 92, status: 'CRITICAL', wasteType: 'Organic', timeToOverflow: '3h 10m', coordinates: { x: 62, y: 55 } },
  { id: 'b-4', binCode: 'BIN-1198', location: 'Central Library Gate', zone: 'Central', fillLevel: 78, status: 'WARNING', wasteType: 'Paper', timeToOverflow: '6h 45m', coordinates: { x: 30, y: 40 } },
  { id: 'b-5', binCode: 'BIN-0731', location: 'West Campus Terminal', zone: 'West', fillLevel: 0, status: 'OFFLINE', wasteType: 'General', timeToOverflow: 'N/A', coordinates: { x: 15, y: 65 } },
  { id: 'b-6', binCode: 'BIN-0512', location: 'Sports Complex Main Gate', zone: 'South', fillLevel: 72, status: 'WARNING', wasteType: 'Plastic', timeToOverflow: '8h 20m', coordinates: { x: 45, y: 75 } },
  { id: 'b-7', binCode: 'BIN-0331', location: 'East Tech Hub Plaza', zone: 'East', fillLevel: 45, status: 'NORMAL', wasteType: 'Plastic', timeToOverflow: '24h+', coordinates: { x: 82, y: 70 } },
];

export const mockMapVehicleMarkers: DashboardMapVehicleMarker[] = [
  { id: 'v-1', vehicleCode: 'VH-014', driverName: 'Driver 024', currentRoute: 'RT-028', status: 'On Route', loadPercentage: 76, coordinates: { x: 28, y: 38 } },
  { id: 'v-[#]', vehicleCode: 'VH-007', driverName: 'Driver 012', currentRoute: 'RT-024', status: 'On Route', loadPercentage: 62, coordinates: { x: 68, y: 58 } },
  { id: 'v-3', vehicleCode: 'VH-019', driverName: 'Driver 008', currentRoute: 'RT-031', status: 'On Route', loadPercentage: 84, coordinates: { x: 74, y: 30 } },
];

export const mockMapRoutePolylines: DashboardMapRoutePolyline[] = [
  { id: 'r-1', routeCode: 'RT-028', color: '#10b981', points: [{ x: 10, y: 20 }, { x: 22, y: 35 }, { x: 30, y: 40 }] },
  { id: 'r-2', routeCode: 'RT-024', color: '#3b82f6', points: [{ x: 50, y: 45 }, { x: 62, y: 55 }, { x: 68, y: 58 }] },
  { id: 'r-3', routeCode: 'RT-031', color: '#f59e0b', points: [{ x: 70, y: 15 }, { x: 78, y: 25 }, { x: 82, y: 70 }] },
];

export const mockLiveOperationEvents: LiveOperationEvent[] = [
  { id: 'evt-1', timestamp: '10:42 AM', title: 'Vehicle VH-014 started Route RT-028', subtitle: 'Central Zone &bull; 18 Stops assigned', severity: 'LOW', type: 'VEHICLE' },
  { id: 'evt-2', timestamp: '10:39 AM', title: 'Bin BIN-1042 reached 96% fill level', subtitle: 'Market Road Plaza &bull; Critical Overflow Risk', severity: 'CRITICAL', type: 'BIN' },
  { id: 'evt-3', timestamp: '10:35 AM', title: 'Collection completed at BIN-0821', subtitle: '124 kg collected by Vehicle VH-007', severity: 'LOW', type: 'COLLECTION' },
  { id: 'evt-4', timestamp: '10:31 AM', title: 'AI prediction flagged BIN-1198', subtitle: 'Expected critical overflow in 6h 45m', severity: 'MEDIUM', type: 'AI' },
  { id: 'evt-5', timestamp: '10:27 AM', title: 'Vehicle VH-007 reached 78% capacity', subtitle: 'Route RT-024 &bull; 3.9t load onboard', severity: 'MEDIUM', type: 'VEHICLE' },
  { id: 'evt-6', timestamp: '10:21 AM', title: 'Route RT-024 paused due to traffic', subtitle: 'Driver 012 requested 10m adjustment', severity: 'HIGH', type: 'ROUTE' },
];

export const mockBinCapacityDistribution: BinCapacityDistribution = {
  normalCount: 182,
  warningCount: 40,
  criticalCount: 14,
  offlineCount: 12,
  averageFillPercentage: 72.4,
  highestFillZone: 'Central',
  predictedOverflowCount: 9,
};

export const mockAiForecastSummary: AiForecastSummary = {
  expectedWasteTons: 8.9,
  expectedCollectionDemandBins: 42,
  predictedOverflowBins: 9,
  predictionConfidence: 91.8,
  trendPoints: [
    { timeLabel: '06:00', predictedDemandBins: 12, predictedWasteTons: 2.1 },
    { timeLabel: '09:00', predictedDemandBins: 18, predictedWasteTons: 3.8 },
    { timeLabel: '12:00', predictedDemandBins: 28, predictedWasteTons: 5.6 },
    { timeLabel: '15:00', predictedDemandBins: 42, predictedWasteTons: 8.2 },
    { timeLabel: '18:00', predictedDemandBins: 34, predictedWasteTons: 7.4 },
    { timeLabel: '21:00', predictedDemandBins: 16, predictedWasteTons: 3.2 },
  ],
  aiInsightText: 'Collection demand is expected to peak between 15:00–18:00, with Central and Industrial zones contributing the highest predicted volume.',
};

export const mockCollectionPerformanceSummary: CollectionPerformanceSummary = {
  plannedTons: 10.7,
  collectedTons: 8.4,
  remainingTons: 2.3,
  completionPercentage: 78.5,
  plannedStops: 64,
  completedStops: 48,
  remainingStops: 16,
  avgCollectionTimeMinutes: 11.8,
  onTimeCollectionPercentage: 92.4,
};

export const mockWasteCompositionSummary: WasteCompositionSummary = {
  recyclablePercentage: 61.8,
  nonRecyclablePercentage: 38.2,
  estimatedRecyclableTons: 5.19,
  estimatedNonRecyclableTons: 3.21,
  categories: [
    { category: 'Organic', percentage: 31, color: '#10b981' },
    { category: 'Plastic', percentage: 22, color: '#3b82f6' },
    { category: 'Paper', percentage: 16, color: '#f59e0b' },
    { category: 'Other', percentage: 15, color: '#6b7280' },
    { category: 'Metal', percentage: 9, color: '#64748b' },
    { category: 'Glass', percentage: 7, color: '#8b5cf6' },
  ],
};

export const mockZonePerformanceList: ZonePerformanceItem[] = [
  { zone: 'Central', totalBins: 48, avgFillPercentage: 78, criticalBinsCount: 4, collectedTodayTons: 1.9, collectionEfficiencyPercentage: 94, status: 'CRITICAL' },
  { zone: 'Residential', totalBins: 42, avgFillPercentage: 74, criticalBinsCount: 3, collectedTodayTons: 1.6, collectionEfficiencyPercentage: 92, status: 'CRITICAL' },
  { zone: 'Industrial', totalBins: 36, avgFillPercentage: 71, criticalBinsCount: 3, collectedTodayTons: 1.4, collectionEfficiencyPercentage: 89, status: 'WARNING' },
  { zone: 'South', totalBins: 34, avgFillPercentage: 68, criticalBinsCount: 2, collectedTodayTons: 1.2, collectionEfficiencyPercentage: 91, status: 'WARNING' },
  { zone: 'North', totalBins: 30, avgFillPercentage: 65, criticalBinsCount: 1, collectedTodayTons: 1.0, collectionEfficiencyPercentage: 93, status: 'NORMAL' },
  { zone: 'West', totalBins: 28, avgFillPercentage: 58, criticalBinsCount: 1, collectedTodayTons: 0.8, collectionEfficiencyPercentage: 95, status: 'NORMAL' },
  { zone: 'East', totalBins: 30, avgFillPercentage: 52, criticalBinsCount: 0, collectedTodayTons: 0.5, collectionEfficiencyPercentage: 96, status: 'NORMAL' },
];

export const mockPriorityCollectionList: PriorityCollectionItem[] = [
  {
    id: 'prio-1042',
    priority: 'CRITICAL',
    binCode: 'BIN-1042',
    location: 'Market Road Plaza',
    zone: 'Central',
    fillLevel: 96,
    timeToOverflow: '2h 15m',
    estimatedWasteKg: 124,
    collectionWindow: '12:00–14:00',
    assignedRoute: 'RT-028',
    assignedVehicle: 'VH-014',
    coordinates: { x: 22, y: 35 },
  },
  {
    id: 'prio-0921',
    priority: 'CRITICAL',
    binCode: 'BIN-0921',
    location: 'Industrial Estate Loading Dock',
    zone: 'Industrial',
    fillLevel: 89,
    timeToOverflow: '4h 30m',
    estimatedWasteKg: 108,
    collectionWindow: '13:00–15:00',
    assignedRoute: 'RT-031',
    assignedVehicle: 'VH-019',
    coordinates: { x: 78, y: 25 },
  },
  {
    id: 'prio-0844',
    priority: 'CRITICAL',
    binCode: 'BIN-0844',
    location: 'Hostel Block A Entrance',
    zone: 'Residential',
    fillLevel: 92,
    timeToOverflow: '3h 10m',
    estimatedWasteKg: 140,
    collectionWindow: '12:30–14:30',
    assignedRoute: 'RT-024',
    assignedVehicle: 'VH-007',
    coordinates: { x: 62, y: 55 },
  },
  {
    id: 'prio-1198',
    priority: 'HIGH',
    binCode: 'BIN-1198',
    location: 'Central Library South Gate',
    zone: 'Central',
    fillLevel: 78,
    timeToOverflow: '6h 45m',
    estimatedWasteKg: 95,
    collectionWindow: '15:00–17:00',
    assignedRoute: 'RT-028',
    assignedVehicle: 'VH-014',
    coordinates: { x: 30, y: 40 },
  },
  {
    id: 'prio-0512',
    priority: 'HIGH',
    binCode: 'BIN-0512',
    location: 'Sports Complex Main Gate',
    zone: 'South',
    fillLevel: 72,
    timeToOverflow: '8h 20m',
    estimatedWasteKg: 112,
    collectionWindow: '16:00–18:00',
    assignedRoute: 'RT-012',
    assignedVehicle: 'VH-003',
    coordinates: { x: 45, y: 75 },
  },
];

export const mockDashboardVehicles: DashboardVehicleItem[] = [
  { id: 'vh-014', vehicleCode: 'VH-014', type: 'Compactor Truck', currentLoadTons: 3.8, capacityTons: 5.0, utilizationPercentage: 76, status: 'On Route', driverName: 'Driver 024', assignedRoute: 'RT-028', coordinates: { x: 28, y: 38 } },
  { id: 'vh-007', vehicleCode: 'VH-007', type: 'Side-Loader', currentLoadTons: 3.9, capacityTons: 5.0, utilizationPercentage: 78, status: 'On Route', driverName: 'Driver 012', assignedRoute: 'RT-024', coordinates: { x: 68, y: 58 } },
  { id: 'vh-019', vehicleCode: 'VH-019', type: 'Compactor Truck', currentLoadTons: 4.2, capacityTons: 5.0, utilizationPercentage: 84, status: 'On Route', driverName: 'Driver 008', assignedRoute: 'RT-031', coordinates: { x: 74, y: 30 } },
  { id: 'vh-003', vehicleCode: 'VH-003', type: 'Mini Collector', currentLoadTons: 1.2, capacityTons: 2.5, utilizationPercentage: 48, status: 'Available', driverName: 'Driver 005', coordinates: { x: 40, y: 40 } },
  { id: 'vh-009', vehicleCode: 'VH-009', type: 'Compactor Truck', currentLoadTons: 0.0, capacityTons: 5.0, utilizationPercentage: 0, status: 'Maintenance', driverName: 'Unassigned', coordinates: { x: 10, y: 10 } },
];

export const mockFleetStatusSummary: FleetStatusSummary = {
  availablePercentage: 18,
  onRouteCount: 12,
  idleCount: 3,
  maintenanceCount: 2,
  offlineCount: 1,
  vehicles: mockDashboardVehicles,
};

export const mockActiveRoutesList: ActiveRouteItem[] = [
  { id: 'rt-028', routeCode: 'RT-028', vehicleCode: 'VH-014', driverName: 'Driver 024', totalStops: 18, completedStops: 11, remainingStops: 7, distanceKm: 14.8, status: 'In Progress', estimatedDuration: '2h 10m', completionPercentage: 61.1 },
  { id: 'rt-024', routeCode: 'RT-024', vehicleCode: 'VH-007', driverName: 'Driver 012', totalStops: 15, completedStops: 10, remainingStops: 5, distanceKm: 11.2, status: 'In Progress', estimatedDuration: '1h 45m', completionPercentage: 66.7 },
  { id: 'rt-031', routeCode: 'RT-031', vehicleCode: 'VH-019', driverName: 'Driver 008', totalStops: 20, completedStops: 16, remainingStops: 4, distanceKm: 18.4, status: 'In Progress', estimatedDuration: '2h 30m', completionPercentage: 80.0 },
  { id: 'rt-012', routeCode: 'RT-012', vehicleCode: 'VH-003', driverName: 'Driver 005', totalStops: 11, completedStops: 11, remainingStops: 0, distanceKm: 8.5, status: 'Completed', estimatedDuration: '1h 15m', completionPercentage: 100.0 },
];

export const mockAttentionItemList: AttentionItem[] = [
  { id: 'att-1', severity: 'CRITICAL', title: 'Critical Bin Nearing Overflow', description: 'BIN-1042 in Central Market Road is at 96% fill level. Immediate pickup required within 2 hours.', timestamp: '10:39 AM', relatedEntityId: 'BIN-1042', entityType: 'BIN' },
  { id: 'att-2', severity: 'HIGH', title: 'Vehicle Maintenance Due', description: 'VH-009 is due for scheduled 10,000 km hydraulic sensor service in 180 km.', timestamp: '09:15 AM', relatedEntityId: 'VH-009', entityType: 'VEHICLE' },
  { id: 'att-3', severity: 'MEDIUM', title: 'Route Constraint Warning', description: 'RT-031 vehicle load capacity is near maximum (84%). Route re-optimization suggested.', timestamp: '10:21 AM', relatedEntityId: 'RT-031', entityType: 'ROUTE' },
  { id: 'att-4', severity: 'MEDIUM', title: 'Low Prediction Confidence', description: 'BIN-1182 prediction confidence score dropped to 67% due to erratic telemetry.', timestamp: '08:45 AM', relatedEntityId: 'BIN-1182', entityType: 'PREDICTION' },
  { id: 'att-5', severity: 'LOW', title: 'Sensor Disconnection', description: 'BIN-0731 optical fill sensor has not reported telemetry for 42 minutes.', timestamp: '07:30 AM', relatedEntityId: 'BIN-0731', entityType: 'SENSOR' },
];

export const mockRecentActivityList: RecentActivityItem[] = [
  { id: 'act-101', timestamp: '10:42 AM', type: 'Route Started', description: 'Vehicle VH-014 started Route RT-028 assigned to Driver 024', statusBadge: 'In Progress' },
  { id: 'act-102', timestamp: '10:35 AM', type: 'Collection Completed', description: 'BIN-0821 collected by VH-007 (124 kg total waste)', statusBadge: 'Completed' },
  { id: 'act-103', timestamp: '10:29 AM', type: 'AI Forecast Generated', description: 'Prediction engine flagged 14 bins for overflow risk over next 24 hours', statusBadge: 'System' },
  { id: 'act-104', timestamp: '10:15 AM', type: 'Vehicle Status Changed', description: 'VH-003 status updated to Available after morning depot shift', statusBadge: 'Fleet' },
  { id: 'act-105', timestamp: '09:50 AM', type: 'Alert Acknowledged', description: 'Operator acknowledged sensor warning for BIN-1198', statusBadge: 'Alerts' },
];
