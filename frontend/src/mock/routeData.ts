export interface BinStop {
  id: string;
  binId: string;
  location: string;
  zone: string;
  fillLevel: number;
  wasteType: string;
  priority: 'Critical' | 'High' | 'Normal';
  status: 'Completed' | 'Pending' | 'In Progress' | 'Skipped';
  eta: string;
  capacityLiters: number;
  predictedOverflow: string;
}

export interface RouteItem {
  id: string;
  name: string;
  vehicleId: string;
  driverName: string;
  zone: string;
  startTime: string;
  estimatedCompletion: string;
  totalDistanceKm: number;
  estimatedTimeMin: number;
  totalStops: number;
  completedStops: number;
  vehicleCapacityPercent: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'At Risk';
  priorityStopsCount: number;
  overflowRiskStopsCount: number;
  stops: BinStop[];
}

export interface RouteAlert {
  id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export const initialAlerts: RouteAlert[] = [
  { id: 'alt-1', message: 'Bin BIN-104 in Zone A approaching overflow (96% capacity)', severity: 'critical', timestamp: '10 mins ago' },
  { id: 'alt-2', message: 'Vehicle TRK-04 at 72% capacity limit', severity: 'warning', timestamp: '25 mins ago' },
  { id: 'alt-3', message: 'Route RT-022 delayed by 18 minutes due to heavy traffic on Main St', severity: 'warning', timestamp: '40 mins ago' },
];

export const initialRoutes: RouteItem[] = [
  {
    id: 'RT-024',
    name: 'North Campus Route 24',
    vehicleId: 'TRK-04',
    driverName: 'Arjun Patel',
    zone: 'Zone A',
    startTime: '08:30 AM',
    estimatedCompletion: '11:45 AM',
    totalDistanceKm: 18.6,
    estimatedTimeMin: 195,
    totalStops: 14,
    completedStops: 8,
    vehicleCapacityPercent: 72,
    status: 'In Progress',
    priorityStopsCount: 3,
    overflowRiskStopsCount: 2,
    stops: [
      { id: 'st-1', binId: 'BIN-104', location: 'Central Cafeteria', zone: 'Zone A', fillLevel: 96, wasteType: 'Mixed', priority: 'Critical', status: 'Pending', eta: '09:02 AM', capacityLiters: 240, predictedOverflow: '1h 20m' },
      { id: 'st-2', binId: 'BIN-217', location: 'North Gate', zone: 'Zone A', fillLevel: 91, wasteType: 'Plastic', priority: 'Critical', status: 'Pending', eta: '09:18 AM', capacityLiters: 120, predictedOverflow: '2h 05m' },
      { id: 'st-3', binId: 'BIN-083', location: 'Library Block', zone: 'Zone B', fillLevel: 78, wasteType: 'Paper', priority: 'High', status: 'Pending', eta: '09:31 AM', capacityLiters: 180, predictedOverflow: '4h 30m' },
      { id: 'st-4', binId: 'BIN-142', location: 'Sports Complex', zone: 'Zone B', fillLevel: 74, wasteType: 'Organic', priority: 'High', status: 'Completed', eta: '08:56 AM', capacityLiters: 240, predictedOverflow: '6h 00m' },
      { id: 'st-5', binId: 'BIN-099', location: 'Student Center', zone: 'Zone A', fillLevel: 88, wasteType: 'Plastic', priority: 'High', status: 'Completed', eta: '08:44 AM', capacityLiters: 240, predictedOverflow: '3h 15m' },
      { id: 'st-6', binId: 'BIN-112', location: 'Engineering Annex', zone: 'Zone A', fillLevel: 65, wasteType: 'Paper', priority: 'Normal', status: 'Completed', eta: '08:32 AM', capacityLiters: 120, predictedOverflow: '12h 00m' },
      { id: 'st-7', binId: 'BIN-[#401]', location: 'Hostel Block 1', zone: 'Zone A', fillLevel: 82, wasteType: 'Mixed', priority: 'High', status: 'Completed', eta: '08:20 AM', capacityLiters: 240, predictedOverflow: '5h 00m' },
      { id: 'st-8', binId: 'BIN-[#402]', location: 'Hostel Block 2', zone: 'Zone A', fillLevel: 79, wasteType: 'Organic', priority: 'Normal', status: 'Completed', eta: '08:10 AM', capacityLiters: 240, predictedOverflow: '8h 00m' },
      { id: 'st-9', binId: 'BIN-[#403]', location: 'Faculty Housing', zone: 'Zone B', fillLevel: 55, wasteType: 'Paper', priority: 'Normal', status: 'Completed', eta: '08:00 AM', capacityLiters: 120, predictedOverflow: '18h 00m' },
      { id: 'st-10', binId: 'BIN-[#404]', location: 'Admin Quad', zone: 'Zone A', fillLevel: 60, wasteType: 'Plastic', priority: 'Normal', status: 'Completed', eta: '07:50 AM', capacityLiters: 180, predictedOverflow: '14h 00m' },
      { id: 'st-11', binId: 'BIN-305', location: 'Science Building', zone: 'Zone B', fillLevel: 85, wasteType: 'Glass', priority: 'High', status: 'Pending', eta: '09:45 AM', capacityLiters: 120, predictedOverflow: '3h 40m' },
      { id: 'st-12', binId: 'BIN-308', location: 'Auditorium Rear', zone: 'Zone B', fillLevel: 68, wasteType: 'Mixed', priority: 'Normal', status: 'Pending', eta: '10:05 AM', capacityLiters: 240, predictedOverflow: '9h 15m' },
      { id: 'st-13', binId: 'BIN-312', location: 'Health Center', zone: 'Zone B', fillLevel: 72, wasteType: 'Organic', priority: 'Normal', status: 'Pending', eta: '10:20 AM', capacityLiters: 120, predictedOverflow: '7h 50m' },
      { id: 'st-14', binId: 'BIN-319', location: 'Main Gate Exit', zone: 'Zone A', fillLevel: 50, wasteType: 'Metal', priority: 'Normal', status: 'Pending', eta: '10:40 AM', capacityLiters: 180, predictedOverflow: '22h 00m' },
    ],
  },
  {
    id: 'RT-021',
    name: 'West Campus Route 21',
    vehicleId: 'TRK-01',
    driverName: 'Rohan Shah',
    zone: 'Zone C',
    startTime: '06:00 AM',
    estimatedCompletion: '09:30 AM',
    totalDistanceKm: 22.4,
    estimatedTimeMin: 210,
    totalStops: 18,
    completedStops: 18,
    vehicleCapacityPercent: 95,
    status: 'Completed',
    priorityStopsCount: 4,
    overflowRiskStopsCount: 0,
    stops: [],
  },
  {
    id: 'RT-022',
    name: 'Central Zone Route 22',
    vehicleId: 'TRK-02',
    driverName: 'Neha Patel',
    zone: 'Zone B',
    startTime: '07:15 AM',
    estimatedCompletion: '11:00 AM',
    totalDistanceKm: 17.8,
    estimatedTimeMin: 180,
    totalStops: 15,
    completedStops: 10,
    vehicleCapacityPercent: 84,
    status: 'At Risk',
    priorityStopsCount: 5,
    overflowRiskStopsCount: 3,
    stops: [],
  },
  {
    id: 'RT-023',
    name: 'East Campus Route 23',
    vehicleId: 'TRK-03',
    driverName: 'Vivek Shah',
    zone: 'Zone D',
    startTime: '01:00 PM',
    estimatedCompletion: '04:30 PM',
    totalDistanceKm: 25.1,
    estimatedTimeMin: 210,
    totalStops: 21,
    completedStops: 0,
    vehicleCapacityPercent: 0,
    status: 'Planned',
    priorityStopsCount: 2,
    overflowRiskStopsCount: 1,
    stops: [],
  },
];
