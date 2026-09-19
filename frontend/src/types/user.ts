export type UserRole = 'ADMIN' | 'DRIVER' | 'ANALYST';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export type ZoneName =
  | 'Central Zone'
  | 'North Zone'
  | 'South Zone'
  | 'East Zone'
  | 'West Zone'
  | 'Industrial Zone'
  | 'Residential Zone'
  | 'All Zones';

export interface DriverStats {
  routesCompleted: number;
  stopsCompleted: number;
  onTimeRate: number; // Percentage
  collectionVolumeTons: number;
  avgCompletionPercent: number;
  currentDutyStatus: 'On Route' | 'Idle' | 'Off Duty' | 'On Leave';
}

export interface AnalystStats {
  reportsGenerated: number;
  analyticsViews: number;
  predictionReports: number;
  lastReportName: string;
}

export interface AdminStats {
  usersManaged: number;
  routesCreated: number;
  vehiclesUpdated: number;
  alertsResolved: number;
}

export interface UserActivityLog {
  id: string;
  timestamp: string;
  description: string;
  category: 'login' | 'route' | 'collection' | 'analytics' | 'admin' | 'security';
}

export interface UserLoginSession {
  lastLoginAt: string;
  device: string;
  location: string;
  ipAddress?: string;
  previousLoginAt?: string;
}

export interface PlatformUser {
  id: string; // e.g. USR-001
  userCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  organization: string;
  department: string;
  zone: ZoneName;
  assignedVehicleId?: string; // e.g. TRK-021 (for Drivers)
  assignedRouteId?: string; // e.g. R-104 (for Drivers)
  analyticsScope?: 'All Zones' | 'Assigned Zones'; // (for Analysts)
  accessScope?: 'Full Platform' | 'Operational Only' | 'Analytics Only';
  avatarInitials: string;
  avatarBgColor?: string;
  lastActiveAt: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  loginSession?: UserLoginSession;
  activityHistory?: UserActivityLog[];
  driverStats?: DriverStats;
  analystStats?: AnalystStats;
  adminStats?: AdminStats;
  invitationDetails?: {
    sentAt: string;
    expiresAt: string;
  };
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  organization?: string;
  department?: string;
  zone?: ZoneName;
  assignedVehicleId?: string;
  assignedRouteId?: string;
  analyticsScope?: 'All Zones' | 'Assigned Zones';
  tempPassword?: string;
  requirePasswordChange?: boolean;
}

export interface UserFilterState {
  searchQuery: string;
  role: UserRole | 'All';
  status: UserStatus | 'All';
  zone: ZoneName | 'All';
  assignment: 'All' | 'Assigned' | 'Unassigned';
  activityFilter: 'All' | 'Active Today' | 'Active This Week' | 'Inactive 7+ Days';
}

export interface UserSortState {
  field: 'fullName' | 'role' | 'status' | 'lastActiveAt' | 'joinedAt' | 'id';
  direction: 'asc' | 'desc';
}

export interface UserKpiSummary {
  totalUsers: number;
  activeUsers: number;
  activePercent: number;
  driverCount: number;
  activeDriverCount: number;
  analystCount: number;
  adminCount: number;
  inactiveCount: number;
  pendingCount: number;
  suspendedCount: number;
}
