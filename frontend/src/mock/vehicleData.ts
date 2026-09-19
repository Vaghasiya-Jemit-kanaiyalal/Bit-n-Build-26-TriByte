export interface MaintenanceRecord {
  id: string;
  date: string;
  serviceType: string;
  mileageKm: number;
  status: 'Completed' | 'Pending' | 'Overdue';
  notes: string;
}

export interface VehicleActivity {
  time: string;
  description: string;
}

export interface VehicleItem {
  id: string;
  name: string;
  type: 'Compactor' | 'Tipper' | 'Recycling Truck' | 'Mini Collection Vehicle' | 'Electric Collection Vehicle';
  registration: string;
  capacityKg: number;
  currentLoadKg: number;
  driverName: string;
  assignedRouteId: string;
  zone: string;
  status: 'On Route' | 'Active' | 'Available' | 'Idle' | 'Maintenance' | 'Offline';
  energyType: 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
  maintenanceStatus: 'Good' | 'Due' | 'Overdue' | 'Scheduled';
  lastService: string;
  nextService: string;
  coordinates: string;
  loadType: string;
  routeProgressStops: string;
  collectionProgressPercent: number;
  estimatedCompletion: string;
  history: VehicleActivity[];
  maintenanceHistory: MaintenanceRecord[];
}

export interface VehicleAttentionItem {
  id: string;
  vehicleId: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  actionType: 'view_vehicle' | 'view_maintenance' | 'view_route';
  targetId: string;
}

export const initialVehicleAttentionItems: VehicleAttentionItem[] = [
  { id: 'att-1', vehicleId: 'VEH-007', issue: '92% capacity - Near collection limit', severity: 'critical', actionType: 'view_vehicle', targetId: 'VEH-007' },
  { id: 'att-2', vehicleId: 'VEH-013', issue: 'Maintenance overdue - Service required', severity: 'warning', actionType: 'view_maintenance', targetId: 'VEH-013' },
  { id: 'att-3', vehicleId: 'VEH-018', issue: 'Offline - Last signal 42 min ago', severity: 'critical', actionType: 'view_vehicle', targetId: 'VEH-018' },
  { id: 'att-4', vehicleId: 'VEH-021', issue: 'Route delayed - 18 min behind schedule', severity: 'warning', actionType: 'view_route', targetId: 'RT-022' },
];

export const initialVehicles: VehicleItem[] = [
  {
    id: 'VEH-001',
    name: 'EcoCompactor 01',
    type: 'Compactor',
    registration: 'GJ-01-AB-1234',
    capacityKg: 1200,
    currentLoadKg: 780,
    driverName: 'Arjun Patel',
    assignedRouteId: 'RT-024',
    zone: 'North Zone',
    status: 'On Route',
    energyType: 'Diesel',
    maintenanceStatus: 'Good',
    lastService: '12 Sep 2026',
    nextService: '12 Oct 2026',
    coordinates: '22.3072, 73.1812',
    loadType: 'Mixed Waste',
    routeProgressStops: '8 / 14',
    collectionProgressPercent: 57,
    estimatedCompletion: '11:45 AM',
    history: [
      { time: '10:42 AM', description: 'Collection started at Central Cafeteria' },
      { time: '10:18 AM', description: 'Reached BIN-104 (96% full)' },
      { time: '09:56 AM', description: 'Route RT-024 started from North Depot' },
      { time: '09:40 AM', description: 'Vehicle assigned to driver Arjun Patel' },
    ],
    maintenanceHistory: [
      { id: 'm-1', date: '12 Sep 2026', serviceType: 'Routine Service', mileageKm: 18420, status: 'Completed', notes: 'Oil and filter inspection, pressure check' },
      { id: 'm-2', date: '12 Aug 2026', serviceType: 'Brake Inspection', mileageKm: 16900, status: 'Completed', notes: 'No major issues, pads 80%' },
    ],
  },
  {
    id: 'VEH-002',
    name: 'GreenHaul 02',
    type: 'Recycling Truck',
    registration: 'GJ-01-CD-5678',
    capacityKg: 900,
    currentLoadKg: 420,
    driverName: 'Neha Shah',
    assignedRouteId: 'RT-021',
    zone: 'West Zone',
    status: 'Available',
    energyType: 'CNG',
    maintenanceStatus: 'Good',
    lastService: '05 Sep 2026',
    nextService: '05 Oct 2026',
    coordinates: '22.2980, 73.1750',
    loadType: 'Dry Recyclables',
    routeProgressStops: '18 / 18',
    collectionProgressPercent: 100,
    estimatedCompletion: '09:30 AM',
    history: [
      { time: '09:30 AM', description: 'Route RT-021 completed successfully' },
      { time: '08:15 AM', description: 'Emptied Bin BIN-099 at West Quad' },
    ],
    maintenanceHistory: [
      { id: 'm-3', date: '05 Sep 2026', serviceType: 'Spark Plug & CNG Check', mileageKm: 14200, status: 'Completed', notes: 'Cleaned intake valves' },
    ],
  },
  {
    id: 'VEH-003',
    name: 'CleanMove 07',
    type: 'Tipper',
    registration: 'GJ-01-EF-9012',
    capacityKg: 1500,
    currentLoadKg: 0,
    driverName: 'Unassigned',
    assignedRouteId: '—',
    zone: 'Central Zone',
    status: 'Maintenance',
    energyType: 'Diesel',
    maintenanceStatus: 'Due',
    lastService: '10 Aug 2026',
    nextService: '10 Sep 2026',
    coordinates: '22.3120, 73.1900',
    loadType: 'Organic Waste',
    routeProgressStops: '0 / 0',
    collectionProgressPercent: 0,
    estimatedCompletion: '—',
    history: [
      { time: 'Yesterday', description: 'Scheduled for hydraulics maintenance' },
    ],
    maintenanceHistory: [
      { id: 'm-4', date: '10 Aug 2026', serviceType: 'Hydraulics Check', mileageKm: 21000, status: 'Completed', notes: 'Replaced hydraulic fluid line' },
    ],
  },
  {
    id: 'VEH-004',
    name: 'EcoMini 03',
    type: 'Mini Collection Vehicle',
    registration: 'GJ-01-GH-3456',
    capacityKg: 500,
    currentLoadKg: 310,
    driverName: 'Rohan Patel',
    assignedRouteId: 'RT-019',
    zone: 'East Zone',
    status: 'On Route',
    energyType: 'Electric',
    maintenanceStatus: 'Good',
    lastService: '14 Sep 2026',
    nextService: '14 Oct 2026',
    coordinates: '22.3050, 73.2010',
    loadType: 'Paper & Plastic',
    routeProgressStops: '10 / 15',
    collectionProgressPercent: 67,
    estimatedCompletion: '12:15 PM',
    history: [
      { time: '10:50 AM', description: 'Battery level 78%. Continuing East Route' },
    ],
    maintenanceHistory: [
      { id: 'm-5', date: '14 Sep 2026', serviceType: 'EV Battery Diagnostic', mileageKm: 9200, status: 'Completed', notes: 'Health 98%' },
    ],
  },
  {
    id: 'VEH-005',
    name: 'VoltClean EV-01',
    type: 'Electric Collection Vehicle',
    registration: 'GJ-01-EV-0001',
    capacityKg: 750,
    currentLoadKg: 620,
    driverName: 'Vikram Joshi',
    assignedRouteId: 'RT-020',
    zone: 'North Zone',
    status: 'On Route',
    energyType: 'Electric',
    maintenanceStatus: 'Good',
    lastService: '18 Aug 2026',
    nextService: '18 Sep 2026',
    coordinates: '22.3150, 73.1840',
    loadType: 'Mixed Recyclables',
    routeProgressStops: '9 / 12',
    collectionProgressPercent: 75,
    estimatedCompletion: '11:10 AM',
    history: [
      { time: '10:05 AM', description: 'Completed Hostel B collection' },
    ],
    maintenanceHistory: [],
  },
  {
    id: 'VEH-006',
    name: 'EcoCompactor 02',
    type: 'Compactor',
    registration: 'GJ-01-AB-9988',
    capacityKg: 1200,
    currentLoadKg: 200,
    driverName: 'Priya Sharma',
    assignedRouteId: 'RT-023',
    zone: 'East Zone',
    status: 'Active',
    energyType: 'Diesel',
    maintenanceStatus: 'Good',
    lastService: '01 Sep 2026',
    nextService: '01 Oct 2026',
    coordinates: '22.3000, 73.1950',
    loadType: 'General Refuse',
    routeProgressStops: '2 / 21',
    collectionProgressPercent: 10,
    estimatedCompletion: '04:30 PM',
    history: [],
    maintenanceHistory: [],
  },
  {
    id: 'VEH-007',
    name: 'GreenHaul 05',
    type: 'Compactor',
    registration: 'GJ-01-CD-7744',
    capacityKg: 1000,
    currentLoadKg: 920,
    driverName: 'Suresh Kumar',
    assignedRouteId: 'RT-018',
    zone: 'South Zone',
    status: 'On Route',
    energyType: 'CNG',
    maintenanceStatus: 'Good',
    lastService: '20 Aug 2026',
    nextService: '20 Sep 2026',
    coordinates: '22.2850, 73.1700',
    loadType: 'Commercial Waste',
    routeProgressStops: '14 / 15',
    collectionProgressPercent: 93,
    estimatedCompletion: '11:00 AM',
    history: [],
    maintenanceHistory: [],
  },
  {
    id: 'VEH-008',
    name: 'CleanMove 02',
    type: 'Tipper',
    registration: 'GJ-01-EF-5511',
    capacityKg: 1500,
    currentLoadKg: 350,
    driverName: 'Manish Verma',
    assignedRouteId: '—',
    zone: 'South Zone',
    status: 'Idle',
    energyType: 'Diesel',
    maintenanceStatus: 'Good',
    lastService: '15 Aug 2026',
    nextService: '15 Sep 2026',
    coordinates: '22.2820, 73.1680',
    loadType: 'Construction Debris',
    routeProgressStops: '0 / 0',
    collectionProgressPercent: 0,
    estimatedCompletion: '—',
    history: [],
    maintenanceHistory: [],
  },
  {
    id: 'VEH-013',
    name: 'EcoMini 01',
    type: 'Mini Collection Vehicle',
    registration: 'GJ-01-GH-1122',
    capacityKg: 600,
    currentLoadKg: 0,
    driverName: 'Unassigned',
    assignedRouteId: '—',
    zone: 'Central Zone',
    status: 'Maintenance',
    energyType: 'CNG',
    maintenanceStatus: 'Overdue',
    lastService: '02 Jun 2026',
    nextService: '02 Jul 2026',
    coordinates: '22.3100, 73.1890',
    loadType: 'Organic',
    routeProgressStops: '0 / 0',
    collectionProgressPercent: 0,
    estimatedCompletion: '—',
    history: [],
    maintenanceHistory: [
      { id: 'm-6', date: '02 Jun 2026', serviceType: 'Transmission Overhaul', mileageKm: 28000, status: 'Overdue', notes: 'Filter replacement & fluid leak' },
    ],
  },
  {
    id: 'VEH-018',
    name: 'VoltClean EV-02',
    type: 'Electric Collection Vehicle',
    registration: 'GJ-01-EV-0002',
    capacityKg: 800,
    currentLoadKg: 550,
    driverName: 'Karan Desai',
    assignedRouteId: 'RT-012',
    zone: 'West Zone',
    status: 'Offline',
    energyType: 'Electric',
    maintenanceStatus: 'Good',
    lastService: '28 Aug 2026',
    nextService: '28 Sep 2026',
    coordinates: '22.2900, 73.1600',
    loadType: 'Electronic Waste',
    routeProgressStops: '4 / 10',
    collectionProgressPercent: 40,
    estimatedCompletion: '12:00 PM',
    history: [
      { time: '10:00 AM', description: 'GPS signal lost near West Substation' },
    ],
    maintenanceHistory: [],
  },
];
