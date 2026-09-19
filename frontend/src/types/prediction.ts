export type ForecastHorizon = '6h' | '12h' | '24h' | '48h' | '7d';
export type DateRangeFilter = 'today' | '7days' | '30days' | '90days';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PredictionStatus = 'NEW' | 'REVIEWED' | 'PLANNED' | 'MONITORING' | 'PENDING' | 'ACCEPTED' | 'DISMISSED';
export type PredictionOutcome = 'PENDING' | 'MATCHED' | 'PARTIAL' | 'MISSED';
export type ConfidenceRating = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PredictionEngineStatus {
  status: 'OPERATIONAL' | 'CALCULATING' | 'DEGRADED' | 'OFFLINE';
  modelName: string;
  modelVersion: string;
  predictionsGenerated: number;
  averageConfidence: number;
  lastPredictionRun: string;
  horizon: string;
  isSimulated: boolean;
}

export interface PredictionKpiSummary {
  binsAtRisk: number;
  binsAtRiskChange: string;
  predictedOverflow: number;
  predictedOverflowWindow: string;
  averagePredictedFill: number;
  averageFillChange: string;
  expectedWasteTons: number;
  expectedWasteChange: string;
  forecastConfidence: number;
  confidenceChange: string;
  collectionDemandBins: number;
  collectionDemandWindow: string;
}

export interface ForecastTimeSeriesPoint {
  timeLabel: string;
  hourOffset: number;
  currentFill: number;
  predictedFill: number;
  warningThreshold: number;
  criticalThreshold: number;
  confidence: number;
}

export interface PredictionSummaryData {
  next6hWarningCount: number;
  next12hCriticalCount: number;
  next24hOverflowCount: number;
  expectedWasteTons: number;
  peakDemandWindow: string;
  highestRiskZone: string;
  averageConfidence: number;
}

export interface FillForecastBin {
  id: string;
  binCode: string;
  location: string;
  zone: string;
  wasteType: 'Organic' | 'Plastic' | 'Paper' | 'Metal' | 'Glass' | 'General' | 'E-Waste';
  currentFill: number;
  predicted6h: number;
  predicted12h: number;
  predicted24h: number;
  predictedOverflowTime: string;
  timeToOverflow: string;
  confidence: number;
  risk: RiskLevel;
  fillRatePerHour: number;
  lastCollection: string;
  nextScheduledCollection: string;
  assignedRoute?: string;
  explanation: string;
  coordinates: { x: number; y: number };
  historyAndForecast: { time: string; fill: number; isPredicted?: boolean }[];
}

export interface OverflowRiskDistribution {
  critical: { count: number; percentage: number; expectedOverflow: number; avgConfidence: number };
  high: { count: number; percentage: number; expectedOverflow: number; avgConfidence: number };
  medium: { count: number; percentage: number; expectedOverflow: number; avgConfidence: number };
  low: { count: number; percentage: number; expectedOverflow: number; avgConfidence: number };
}

export interface WasteDemandForecastPoint {
  periodLabel: string;
  generatedWaste: number;
  collectedWaste: number;
  predictedWaste: number;
}

export interface ZoneForecastItem {
  zone: string;
  currentWasteTons: number;
  predictedWasteTons: number;
  changePercentage: number;
  binsAtRisk: number;
  expectedOverflowCount: number;
  collectionDemandBins: number;
  confidence: number;
  status: RiskLevel;
  peakDemandWindow: string;
  wasteComposition: { type: string; percentage: number; color: string }[];
  topRiskBins: string[];
  recommendation: string;
}

export interface CollectionDemandBreakdown {
  todayBins: number;
  next24hBins: number;
  next48hBins: number;
  next7dBins: number;
  peakPeriodLabel: string;
  peakPeriodPriorityBins: number;
  peakPeriodExpectedWaste: number;
  peakPeriodRecommendedVehicles: number;
  hourlyDemand: { hour: string; binsCount: number; priorityCount: number }[];
}

export interface PredictionPriorityItem {
  id: string;
  priorityScore: number;
  binCode: string;
  location: string;
  zone: string;
  predictedOverflowTime: string;
  timeRemaining: string;
  confidence: number;
  estimatedWasteKg: number;
  recommendation: 'Prioritize Collection' | 'Add to Planning' | 'Monitor' | 'No Action';
  status: PredictionStatus;
}

export interface ConfidenceDistributionItem {
  rangeLabel: string;
  count: number;
  percentage: number;
  rating: ConfidenceRating;
}

export interface LowConfidencePrediction {
  id: string;
  binCode: string;
  zone: string;
  location: string;
  currentFill: number;
  predictedFill: number;
  confidence: number;
  reason: 'Insufficient historical data' | 'Sudden fill-rate change' | 'Unusual waste pattern' | 'Sensor data inconsistency' | 'Recent collection activity';
  createdAt: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'DISMISSED';
  historicalDataAvailability: string;
  predictionExplanation: string;
  alternativeForecast: number;
  recommendedAction: string;
}

export interface PredictionQualityMetrics {
  forecastAccuracy: number;
  mae: number;
  rmse: number;
  mape: number;
  highConfidencePercentage: number;
  predictionCoverage: number;
  disclaimer: string;
  accuracyTrend: { date: string; accuracy: number; error: number }[];
}

export interface PredictionModelInfo {
  status: 'ACTIVE' | 'TRAINING' | 'DEGRADED';
  modelName: string;
  version: string;
  target: string;
  horizons: string[];
  featuresUsed: string[];
  mode: 'Simulated Demo';
  lastModelUpdate: string;
}

export interface PredictionHistoryItem {
  id: string;
  date: string;
  time: string;
  binCode: string;
  zone: string;
  currentFill: number;
  predictedFill: number;
  actualFill: number;
  confidence: number;
  outcome: PredictionOutcome;
  status: PredictionStatus;
  errorPercentage: number;
}

export interface PredictionInsight {
  id: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'WARNING' | 'OPPORTUNITY' | 'ALERT' | 'INFO';
  timestamp: string;
}

export interface OperationalRecommendation {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionRoute: '/admin/planning' | '/admin/bins' | '/admin/monitoring' | '/admin/analytics';
  badge: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface PredictionFilterState {
  horizon: ForecastHorizon;
  dateRange: DateRangeFilter;
  zone: string;
  wasteType: string;
  riskLevel: string;
  confidence: string;
  searchQuery: string;
}
