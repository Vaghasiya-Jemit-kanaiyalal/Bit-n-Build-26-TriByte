export type BinStatus = 'Normal' | 'Warning' | 'Critical' | 'Offline';
export type VehicleStatus = 'ON ROUTE' | 'IDLE' | 'MAINTENANCE' | 'OFFLINE';
export type RouteStatus = 'On Schedule' | 'Delayed' | 'At Risk' | 'Completed';
export type SensorConnectivity = 'Online' | 'Warning' | 'Offline';
export type EventSeverity = 'critical' | 'warning' | 'info' | 'success';

export type ZoneName =
  | 'Central Zone'
  | 'North Zone'
  | 'South Zone'
  | 'East Zone'
  | 'West Zone'
  | 'Industrial Zone'
  | 'Residential Zone';

export interface MonitoredBin {
  id: string; // BIN-1042
  binCode: string;
  location: string;
  zone: ZoneName;
  fillPercent: number;
  capacityLiters: number;
  wasteType: 'Organic' | 'Recyclable' | 'Hazardous' | 'General';
  status: BinStatus;
  sensorId: string;
  batteryPercent: number;
  signalStrength: 'Strong' | 'Medium' | 'Weak' | 'None';
  lastUpdate: string;
  predictedOverflowMinutes: number; // e.g. 130 mins
  assignedRouteId?: string;
  x: number; // SVG map coordinate % (0-100)
  y: number; // SVG map coordinate % (0-100)
  temperatureCelsius?: number;
}

export interface MonitoredVehicle {
  id: string; // TRK-021
  vehicleCode: string;
  type: 'Compactor Truck' | 'Recycling Truck' | 'Mini Hauler' | 'Roll-off Truck';
  driver: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  heading: 'North' | 'East' | 'South' | 'West' | 'North-East' | 'South-East';
  currentLoadTons: number;
  capacityTons: number;
  utilizationPercent: number;
  status: VehicleStatus;
  routeId?: string;
  lastUpdate: string;
  x: number; // SVG map coordinate % (0-100)
  y: number; // SVG map coordinate % (0-100)
}

export interface MonitoredRoute {
  id: string; // R-104
  routeCode: string;
  zone: ZoneName;
  vehicleId: string;
  driverName: string;
  completedStops: number;
  totalStops: number;
  progressPercent: number;
  distanceCompletedKm: number;
  totalDistanceKm: number;
  eta: string;
  status: RouteStatus;
  lastUpdate: string;
  pathPoints: { x: number; y: number }[];
}

export interface MonitoredSensor {
  id: string; // SNS-1087
  binId: string;
  batteryPercent: number;
  signalStrength: 'Strong' | 'Medium' | 'Weak' | 'None';
  connectivity: SensorConnectivity;
  lastUpdate: string;
  status: 'Online' | 'Warning' | 'Offline';
}

export interface LiveActivityEvent {
  id: string;
  timestamp: string;
  entityType: 'BIN' | 'VEHICLE' | 'ROUTE' | 'SENSOR' | 'SYSTEM';
  entityId: string;
  eventType: string;
  message: string;
  location: string;
  severity: EventSeverity;
}

export interface MonitoringKpiSummary {
  binsMonitored: number;
  onlineBins: number;
  criticalBins: number;
  activeVehicles: number;
  totalVehicles: number;
  activeRoutes: number;
  onScheduleRoutes: number;
  sensorHealthPct: number;
  offlineSensors: number;
  activeStopsCount: number;
}

export interface ZoneStatusSummary {
  zone: ZoneName;
  binsCount: number;
  criticalBins: number;
  activeVehicles: number;
  activeRoutes: number;
  status: 'Healthy' | 'Attention' | 'Critical';
}

export interface MonitoringFilterState {
  searchQuery: string;
  entityType: 'All' | 'Bins' | 'Vehicles' | 'Routes' | 'Sensors';
  status: string; // All | Normal | Warning | Critical | Offline | ON ROUTE | IDLE
  zone: ZoneName | 'All';
  severity: 'All' | 'critical' | 'warning' | 'info' | 'success';
}
