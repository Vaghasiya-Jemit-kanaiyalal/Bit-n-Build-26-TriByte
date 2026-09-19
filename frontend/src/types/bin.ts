export type WasteType = 'Mixed' | 'Organic' | 'Plastic' | 'Paper' | 'Glass' | 'Metal' | 'Other';

export type BinStatus = 'Normal' | 'Warning' | 'Critical' | 'Offline' | 'Maintenance' | 'Inactive';

export type BinType = 'Smart Bin' | 'Standard Bin' | 'Recycling Bin' | 'Organic Bin' | 'Mixed Waste Bin';

export type CollectionStatus = 'Pending' | 'Scheduled' | 'Assigned' | 'In Progress' | 'Collected' | 'Overdue';

export type CollectionPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ZoneName =
  | 'Central Zone'
  | 'North Zone'
  | 'South Zone'
  | 'East Zone'
  | 'West Zone'
  | 'Industrial Zone'
  | 'Residential Zone';

export interface SensorTelemetry {
  sensorId: string;
  batteryLevel: number; // Percentage
  connectivity: 'Online' | 'Offline';
  lastUpdate: string;
  signalStrength: 'Strong' | 'Moderate' | 'Weak' | 'No Signal';
}

export interface BinPrediction {
  predictedFill2h: number; // Percent
  predictedOverflowMinutes: number; // Minutes until 100%
  predictionConfidence: number; // Percentage
  overflowTimeText: string; // e.g. "2h 10m"
}

export interface CollectionHistoryLog {
  id: string;
  date: string;
  routeId: string;
  vehicleId: string;
  driverName: string;
  collectedAmountTons: number;
  status: 'Completed' | 'Partial' | 'Missed';
}

export interface BinActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'fill_update' | 'collection' | 'alert' | 'maintenance' | 'status_change';
}

export interface SmartBin {
  id: string; // e.g. BIN-1087
  code: string;
  name?: string;
  type: BinType;
  capacityLiters: number;
  currentFillPercent: number;
  currentFillLiters: number;
  wasteType: WasteType;
  status: BinStatus;
  zone: ZoneName;
  address: string;
  latitude: number;
  longitude: number;
  sensor: SensorTelemetry;
  prediction: BinPrediction;
  collectionStatus: CollectionStatus;
  collectionPriority: CollectionPriority;
  assignedRouteId?: string; // e.g. R-104
  lastCollectionAt: string;
  nextScheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  history?: CollectionHistoryLog[];
  activity?: BinActivityLog[];
  fillPattern7Days?: number[]; // Percentages for last 7 days
}

export interface BinFilterState {
  searchQuery: string;
  status: BinStatus | 'All';
  fillLevelRange: 'All' | '0-25' | '26-50' | '51-75' | '76-90' | '91-100';
  wasteType: WasteType | 'All';
  zone: ZoneName | 'All';
  collectionStatus: CollectionStatus | 'All';
}

export interface BinSortState {
  field: 'currentFillPercent' | 'predictedOverflowMinutes' | 'lastCollectionAt' | 'createdAt' | 'id';
  direction: 'asc' | 'desc';
}

export interface BinKpiSummary {
  totalBins: number;
  activeBins: number;
  activePercent: number;
  needingCollection: number;
  needingCollectionPercent: number;
  criticalBins: number;
  offlineBins: number;
  maintenanceBins: number;
  avgFillPercent: number;
}
