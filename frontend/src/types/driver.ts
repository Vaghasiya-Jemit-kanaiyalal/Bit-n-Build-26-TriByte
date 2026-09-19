export type DriverStatus = 'OFF_DUTY' | 'ON_DUTY' | 'ON_ROUTE' | 'BREAK' | 'COMPLETED';

export type RouteStatus = 'PLANNED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export type StopStatus = 'COMPLETED' | 'CURRENT' | 'UPCOMING' | 'SKIPPED' | 'FAILED' | 'COLLECTING';

export type StopPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DriverRouteStop {
  id: string;
  sequence: number;
  binId: string;
  location: string;
  zone: string;
  fillLevel: number; // percentage
  capacityKg: number;
  estimatedWasteKg: number;
  wasteType: string;
  priority: StopPriority;
  status: StopStatus;
  distanceKm: number;
  estimatedArrivalMin: number;
  lastCollection: string;
  sensorStatus: 'Online' | 'Offline' | 'Warning';
  batteryLevel: number;
  collectionStatus: string;
  collectedAt?: string;
  collectedWeightKg?: number;
  skippedReason?: string;
  skippedNotes?: string;
  coordinates: {
    x: number; // for SVG canvas (0 - 100)
    y: number; // for SVG canvas (0 - 100)
  };
}

export interface DriverVehicle {
  id: string;
  code: string;
  type: string;
  registration: string;
  capacityTons: number;
  currentLoadTons: number;
  utilizationPct: number;
  status: string;
  fuelType: string;
  nextServiceKm: number;
}

export interface DriverAlert {
  id: string;
  type: 'CRITICAL_BIN' | 'COLLECTION_ISSUE' | 'VEHICLE_CAPACITY' | 'ROUTE_DELAY';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  acknowledged: boolean;
}

export interface DriverActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'collection' | 'route' | 'vehicle' | 'issue';
}

export interface DriverRoute {
  id: string;
  name: string;
  zone: string;
  status: RouteStatus;
  vehicleCode: string;
  totalStops: number;
  completedStops: number;
  skippedStops: number;
  remainingStops: number;
  totalDistanceKm: number;
  estimatedRemainingMin: number;
  progressPct: number;
  totalCollectedTons: number;
  estimatedRemainingTons: number;
  averageStopTimeMin: number;
  estimatedCompletionTime: string;
  startTime: string;
  elapsedTime: string;
  stops: DriverRouteStop[];
  wasteByCategory: {
    Plastic: number;
    Paper: number;
    Metal: number;
    Glass: number;
    Organic: number;
    Other: number;
  };
}

export interface ReportIssueInput {
  binId?: string;
  vehicleCode?: string;
  issueType: string;
  description: string;
  notes?: string;
}

export interface DriverDashboardData {
  driverName: string;
  driverId: string;
  driverStatus: DriverStatus;
  lastSync: string;
  vehicle: DriverVehicle;
  route: DriverRoute;
  alerts: DriverAlert[];
  activities: DriverActivity[];
}
