export type SettingsSectionId =
  | 'organization'
  | 'profile'
  | 'waste'
  | 'bin'
  | 'routes'
  | 'vehicles'
  | 'ai'
  | 'alerts'
  | 'users'
  | 'security'
  | 'appearance'
  | 'data'
  | 'system';

export interface OrganizationSettings {
  name: string;
  id: string;
  department: string;
  operatingRegion: string;
  operatingZones: string[];
  defaultTimezone: string;
  defaultCurrency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'Operational' | 'Degraded' | 'Maintenance';
  activeSince: string;
  lastUpdated: string;
}

export interface AdminProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'ADMIN';
  roleTitle: string;
  department: string;
  zone: string;
  avatarUrl: string;
  lastLogin: string;
  lastActive: string;
  accountCreated: string;
  currentSession: string;
}

export interface WasteCategorySetting {
  id: string;
  name: string;
  isRecyclable: boolean;
  enabled: boolean;
  handlingType: string;
}

export interface WasteOperationsSettings {
  categories: WasteCategorySetting[];
  minCollectionFillThreshold: number; // e.g. 80
  criticalFillThreshold: number; // e.g. 90
  overflowThreshold: number; // e.g. 95
  predictionWarningWindowHours: number; // e.g. 24
  defaultCollectionPriority: 'AI-based' | 'Fill-based' | 'Manual';
  allowManualPriorityOverride: boolean;
}

export interface BinMonitoringSettings {
  enableLiveMonitoring: boolean;
  refreshIntervalSeconds: number; // e.g. 10
  offlineThresholdMinutes: number; // e.g. 15
  criticalFillThreshold: number; // e.g. 90
  warningFillThreshold: number; // e.g. 75
  batteryWarningPercent: number; // e.g. 25
  batteryCriticalPercent: number; // e.g. 10
  sensorHealthMonitoring: boolean;
  autoOfflineAlerts: boolean;
  autoSensorFaultAlerts: boolean;
}

export interface RouteOptimizationFactors {
  distanceWeight: number; // 30
  capacityWeight: number; // 25
  priorityWeight: number; // 25
  timeWeight: number; // 20
}

export interface CollectionRoutesSettings {
  routeOptimizationEnabled: boolean;
  optimizationStrategy: 'Balanced' | 'Shortest Distance' | 'Minimum Time' | 'Maximum Capacity Utilization';
  maxCapacityUtilizationLimit: number; // 85
  maxRouteDurationHours: number; // 8
  maxStopsPerRoute: number; // 30
  allowRouteReassignment: boolean;
  allowDriverRouteDeviation: boolean;
  requireCollectionConfirmation: boolean;
  autoRoutePriority: string;
  trafficConsideration: boolean;
  vehicleCapacityConsideration: boolean;
  wasteTypeCompatibility: boolean;
  optimizationFactors: RouteOptimizationFactors;
}

export interface VehicleSettingsData {
  capacityWarningPercent: number; // 80
  capacityCriticalPercent: number; // 90
  maxVehicleLoadPercent: number; // 100
  maintenanceReminderKm: number; // 500
  offlineThresholdMinutes: number; // 20
  autoMaintenanceAlerts: boolean;
  allowDriverVehicleReassignment: boolean;
  requireVehicleInspectionBeforeRoute: boolean;
  supportedVehicleTypes: string[];
  supportedEnergyTypes: string[];
}

export interface AISettingsData {
  aiEngineStatus: 'Operational' | 'Degraded' | 'Offline';
  predictionEngineActive: boolean;
  lastModelUpdate: string;
  predictionConfidencePercent: number; // 92.4
  enableAiPredictions: boolean;
  enableFillLevelPrediction: boolean;
  enableWasteGenerationForecasting: boolean;
  enableCollectionPriorityScoring: boolean;
  enableRouteOptimizationRecommendations: boolean;
  enableAiAnomalyDetection: boolean;
  predictionHorizonHours: number; // 24
  minPredictionConfidencePercent: number; // 75
  automaticAiAlerts: boolean;
  allowAiRecommendationsAffectPriority: boolean;
  requireAdminApprovalBeforeAutoRouteChanges: boolean;
  aiRecommendationMode: 'Advisory' | 'Semi-Automatic' | 'Automatic';
}

export interface NotificationChannelSettings {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface AlertTypeToggles {
  binOverflow: boolean;
  predictedOverflow: boolean;
  highFillLevel: boolean;
  binOffline: boolean;
  sensorFailure: boolean;
  vehicleCapacity: boolean;
  vehicleOffline: boolean;
  maintenanceDue: boolean;
  routeDelay: boolean;
  routeDeviation: boolean;
  missedCollection: boolean;
  predictionAnomaly: boolean;
  systemError: boolean;
}

export interface NotificationSettingsData {
  criticalAlertNotification: 'Immediate' | 'Scheduled';
  warningAlertNotification: 'Notification + Dashboard' | 'Dashboard Only';
  infoAlertNotification: 'Dashboard Only' | 'Silent';
  alertTypes: AlertTypeToggles;
  channels: NotificationChannelSettings;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "06:00"
  criticalBypassQuietHours: boolean;
}

export interface AccessSettingsData {
  allowAdminUserCreation: boolean;
  requireApprovalForNewAdmin: boolean;
  allowDriverSelfRegistration: boolean;
  allowAnalystSelfRegistration: boolean;
  defaultUserStatus: 'Pending' | 'Active';
  sessionTimeoutHours: number; // 8
  passwordExpirationDays: number; // 90
  requireEmailVerification: boolean;
}

export interface ActiveUserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecuritySettingsData {
  twoFactorAuth: boolean;
  allowRememberedSessions: boolean;
  sessionTimeoutHours: number;
  maxConcurrentSessions: number; // 3
  loginAttemptLimit: number; // 5
  accountLockMinutes: number; // 15
  requirePasswordChangeAfterReset: boolean;
  auditLogging: boolean;
  suspiciousLoginAlerts: boolean;
  activeSessions: ActiveUserSession[];
}

export interface AppearanceSettingsData {
  theme: 'Light' | 'Dark' | 'System';
  density: 'Comfortable' | 'Compact';
  sidebarMode: 'Expanded' | 'Collapsed';
  animations: 'Standard' | 'Reduced';
  mapStyle: 'Operations' | 'Satellite' | 'Terrain';
  dashboardAutoRefreshSeconds: number; // 30
}

export interface DataSettingsData {
  retentionOperationalActivityDays: number; // 365
  retentionAlertHistoryDays: number; // 180
  retentionTelemetryHistoryDays: number; // 90
  retentionRouteHistoryDays: number; // 365
  retentionAnalyticsHistoryDays: number; // 730
  exportFormats: string[];
  availableExportModules: string[];
}

export interface SystemServiceHealth {
  name: string;
  status: 'Connected' | 'Operational' | 'Degraded' | 'Offline';
  latencyMs: number;
}

export interface SystemInfoData {
  appName: string;
  version: string;
  environment: string;
  frontendFramework: string;
  backendFramework: string;
  database: string;
  aiServices: string;
  lastDeployment: string;
  servicesHealth: SystemServiceHealth[];
}

export interface AllAdminSettings {
  organization: OrganizationSettings;
  profile: AdminProfileSettings;
  waste: WasteOperationsSettings;
  bin: BinMonitoringSettings;
  routes: CollectionRoutesSettings;
  vehicles: VehicleSettingsData;
  ai: AISettingsData;
  notifications: NotificationSettingsData;
  access: AccessSettingsData;
  security: SecuritySettingsData;
  appearance: AppearanceSettingsData;
  data: DataSettingsData;
  system: SystemInfoData;
}
