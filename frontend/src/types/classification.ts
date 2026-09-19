export type WasteType = 'PLASTIC' | 'PAPER' | 'METAL' | 'GLASS' | 'ORGANIC' | 'OTHER';

export type ClassificationStatus = 'CONFIRMED' | 'REVIEW' | 'LOW_CONFIDENCE' | 'MIXED';

export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'CONFIRMED' | 'CORRECTED' | 'REJECTED';

export type DateRangeOption = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'Custom Range';

export interface ClassificationSummary {
  classifiedWeightTons: number; // e.g. 8.4
  accuracyPercent: number; // e.g. 94.2
  accuracyTrend: string; // e.g. "+2.1%"
  recyclablePercent: number; // e.g. 61.8
  nonRecyclablePercent: number; // e.g. 38.2
  pendingReviewCount: number; // e.g. 23
  lowConfidenceCount: number; // e.g. 17
  totalItemsClassified: number; // e.g. 12842
  highConfidenceItems: number; // e.g. 11903
  lastModelSync: string; // e.g. "Today, 09:42"
  modelStatus: 'ACTIVE' | 'TRAINING' | 'SYNCING';
  engineStatus: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
}

export interface WasteCategoryItem {
  category: WasteType;
  name: string;
  weightTons: number;
  percentage: number;
  itemsCount: number;
  avgConfidence: number;
  isRecyclable: boolean;
  trend: string;
  status: 'Healthy' | 'Surge' | 'Attention' | 'Normal';
  color: string;
  topZone: string;
  recyclableWeightTons?: number;
}

export interface AlternativePrediction {
  category: WasteType;
  probability: number;
}

export interface ClassificationEvent {
  id: string; // e.g. CLS-02842
  timestamp: string; // e.g. 14:42:18
  date: string; // e.g. 2026-09-19
  binId: string; // e.g. BIN-C-104
  zone: string; // e.g. Central Zone
  location: string; // e.g. Sector 4 Commercial Complex
  detectedCategory: WasteType;
  confidence: number; // e.g. 96.4
  estimatedWeightKg: number; // e.g. 2.8
  source: 'AI Vision' | 'Bin Sensor' | 'Manual Inspection' | 'Hyperspectral Camera';
  status: ClassificationStatus;
  reviewStatus?: ReviewStatus;
  reason?: string;
  explanation?: string;
  alternativePredictions?: AlternativePrediction[];
  currentFill?: string;
  lastCollection?: string;
  predictedOverflow?: string;
  reviewedBy?: string;
  correctionReason?: string;
}

export interface MixedWasteRecord {
  id: string;
  binId: string;
  zone: string;
  location: string;
  primaryMaterial: WasteType;
  secondaryMaterial: WasteType;
  confidence: number;
  estimatedWeightKg: number;
  reviewStatus: ReviewStatus;
  detectedAt: string;
}

export interface ZoneClassification {
  zone: string;
  totalWasteTons: number;
  plasticTons: number;
  paperTons: number;
  metalTons: number;
  glassTons: number;
  organicTons: number;
  otherTons: number;
  recyclablePercent: number;
  topCategory: string;
  secondCategory: string;
  avgConfidence: number;
  pendingReviews: number;
  classificationCount: number;
  trend: string;
}

export interface ConfidenceBucket {
  range: string;
  count: number;
  percentage: number;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ClassificationInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'info' | 'warning' | 'positive';
  impact: string;
  timestamp: string;
}

export interface ClassificationModel {
  name: string;
  version: string;
  status: 'ACTIVE' | 'TRAINING';
  lastUpdated: string;
  supportedClassesCount: number;
  classes: string[];
  minReviewConfidence: number;
  predictionMode: 'Simulated' | 'Inference';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  highConfidenceRate: number;
  manualCorrectionRate: number;
}

export interface ClassificationTrendPoint {
  date: string;
  totalTons: number;
  recyclableTons: number;
  nonRecyclableTons: number;
  plasticTons: number;
  paperTons: number;
  organicTons: number;
}

export interface ClassificationFilterState {
  dateRange: DateRangeOption;
  zone: string;
  wasteType: WasteType | 'ALL';
  classificationStatus: ClassificationStatus | 'ALL';
  reviewStatus: ReviewStatus | 'ALL';
  confidenceFilter: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sourceFilter: string;
  searchQuery: string;
}
