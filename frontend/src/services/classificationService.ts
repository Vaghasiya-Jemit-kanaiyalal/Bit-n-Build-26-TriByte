import {
  MOCK_CLASSIFICATION_SUMMARY,
  MOCK_WASTE_CATEGORIES,
  MOCK_CLASSIFICATION_TREND,
  MOCK_CONFIDENCE_DISTRIBUTION,
  MOCK_LIVE_EVENTS,
  MOCK_REVIEW_QUEUE,
  MOCK_MIXED_WASTE,
  MOCK_ZONE_CLASSIFICATIONS,
  MOCK_CLASSIFICATION_INSIGHTS,
  MOCK_MODEL_INFORMATION,
  MOCK_CLASSIFICATION_HISTORY,
} from '../data/adminClassificationMock';
import type {
  ClassificationSummary,
  WasteCategoryItem,
  ClassificationTrendPoint,
  ConfidenceBucket,
  ClassificationEvent,
  MixedWasteRecord,
  ZoneClassification,
  ClassificationInsight,
  ClassificationModel,
  ClassificationFilterState,
  WasteType,
} from '../types/classification';

let reviewQueueStore: ClassificationEvent[] = [...MOCK_REVIEW_QUEUE];
let liveEventsStore: ClassificationEvent[] = [...MOCK_LIVE_EVENTS];
let historyStore: ClassificationEvent[] = [...MOCK_CLASSIFICATION_HISTORY];

export const classificationService = {
  async getClassificationSummary(): Promise<ClassificationSummary> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      ...MOCK_CLASSIFICATION_SUMMARY,
      pendingReviewCount: reviewQueueStore.filter((r) => r.reviewStatus === 'PENDING').length,
    };
  },

  async getWasteComposition(): Promise<WasteCategoryItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...MOCK_WASTE_CATEGORIES];
  },

  async getClassificationTrend(): Promise<ClassificationTrendPoint[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...MOCK_CLASSIFICATION_TREND];
  },

  async getCategoryPerformance(): Promise<WasteCategoryItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...MOCK_WASTE_CATEGORIES];
  },

  async getConfidenceDistribution(): Promise<ConfidenceBucket[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...MOCK_CONFIDENCE_DISTRIBUTION];
  },

  async getLiveClassifications(): Promise<ClassificationEvent[]> {
    await new Promise((r) => setTimeout(r, 80));
    return [...liveEventsStore];
  },

  async getReviewQueue(): Promise<ClassificationEvent[]> {
    await new Promise((r) => setTimeout(r, 80));
    return [...reviewQueueStore];
  },

  async getMixedWaste(): Promise<MixedWasteRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...MOCK_MIXED_WASTE];
  },

  async getZoneAnalysis(): Promise<ZoneClassification[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...MOCK_ZONE_CLASSIFICATIONS];
  },

  async getClassificationHistory(filters?: Partial<ClassificationFilterState>): Promise<ClassificationEvent[]> {
    await new Promise((r) => setTimeout(r, 120));
    let result = [...historyStore];

    if (filters) {
      if (filters.searchQuery?.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          (item) =>
            item.id.toLowerCase().includes(q) ||
            item.binId.toLowerCase().includes(q) ||
            item.zone.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q) ||
            item.detectedCategory.toLowerCase().includes(q)
        );
      }

      if (filters.zone && filters.zone !== 'ALL') {
        result = result.filter((item) => item.zone === filters.zone);
      }

      if (filters.wasteType && filters.wasteType !== 'ALL') {
        result = result.filter((item) => item.detectedCategory === filters.wasteType);
      }

      if (filters.classificationStatus && filters.classificationStatus !== 'ALL') {
        result = result.filter((item) => item.status === filters.classificationStatus);
      }

      if (filters.confidenceFilter && filters.confidenceFilter !== 'ALL') {
        if (filters.confidenceFilter === 'HIGH') result = result.filter((item) => item.confidence >= 90);
        else if (filters.confidenceFilter === 'MEDIUM') result = result.filter((item) => item.confidence >= 70 && item.confidence < 90);
        else if (filters.confidenceFilter === 'LOW') result = result.filter((item) => item.confidence < 70);
      }
    }

    return result;
  },

  async getClassificationInsights(): Promise<ClassificationInsight[]> {
    await new Promise((r) => setTimeout(r, 80));
    return [...MOCK_CLASSIFICATION_INSIGHTS];
  },

  async getModelInformation(): Promise<ClassificationModel> {
    await new Promise((r) => setTimeout(r, 80));
    return { ...MOCK_MODEL_INFORMATION };
  },

  async confirmClassification(id: string): Promise<ClassificationEvent> {
    await new Promise((r) => setTimeout(r, 150));
    const itemIndex = reviewQueueStore.findIndex((r) => r.id === id);
    if (itemIndex !== -1) {
      reviewQueueStore[itemIndex] = {
        ...reviewQueueStore[itemIndex],
        reviewStatus: 'CONFIRMED',
        status: 'CONFIRMED',
        reviewedBy: 'Waste Manager',
      };
    }
    const histIndex = historyStore.findIndex((r) => r.id === id);
    if (histIndex !== -1) {
      historyStore[histIndex] = {
        ...historyStore[histIndex],
        reviewStatus: 'CONFIRMED',
        status: 'CONFIRMED',
        reviewedBy: 'Waste Manager',
      };
    }
    return reviewQueueStore[itemIndex] || historyStore[histIndex];
  },

  async correctClassification(id: string, newCategory: WasteType, reason?: string): Promise<ClassificationEvent> {
    await new Promise((r) => setTimeout(r, 200));
    const itemIndex = reviewQueueStore.findIndex((r) => r.id === id);
    if (itemIndex !== -1) {
      reviewQueueStore[itemIndex] = {
        ...reviewQueueStore[itemIndex],
        detectedCategory: newCategory,
        reviewStatus: 'CORRECTED',
        status: 'CONFIRMED',
        correctionReason: reason || 'Human Supervisor Override',
        reviewedBy: 'Waste Manager',
        confidence: 100.0,
      };
    }

    const histIndex = historyStore.findIndex((r) => r.id === id);
    if (histIndex !== -1) {
      historyStore[histIndex] = {
        ...historyStore[histIndex],
        detectedCategory: newCategory,
        reviewStatus: 'CORRECTED',
        status: 'CONFIRMED',
        correctionReason: reason || 'Human Supervisor Override',
        reviewedBy: 'Waste Manager',
        confidence: 100.0,
      };
    }

    return (
      reviewQueueStore[itemIndex] ||
      historyStore[histIndex] || {
        id,
        timestamp: 'Just now',
        date: new Date().toISOString().split('T')[0],
        binId: 'BIN-C-104',
        zone: 'Central Zone',
        location: 'Sector 4',
        detectedCategory: newCategory,
        confidence: 100,
        estimatedWeightKg: 2.5,
        source: 'Manual Inspection',
        status: 'CONFIRMED',
        reviewStatus: 'CORRECTED',
      }
    );
  },

  async rejectClassification(id: string): Promise<ClassificationEvent> {
    await new Promise((r) => setTimeout(r, 150));
    const itemIndex = reviewQueueStore.findIndex((r) => r.id === id);
    if (itemIndex !== -1) {
      reviewQueueStore[itemIndex] = {
        ...reviewQueueStore[itemIndex],
        reviewStatus: 'REJECTED',
        reviewedBy: 'Waste Manager',
      };
    }
    return reviewQueueStore[itemIndex];
  },

  exportClassificationCSV(type: 'all' | 'composition' | 'review' | 'zone'): string {
    if (type === 'composition') {
      const headers = ['Category', 'Name', 'Weight (Tons)', 'Percentage (%)', 'Items Count', 'Avg Confidence (%)', 'Recyclable'];
      const rows = MOCK_WASTE_CATEGORIES.map((c) => [
        c.category,
        `"${c.name}"`,
        c.weightTons,
        c.percentage,
        c.itemsCount,
        c.avgConfidence,
        c.isRecyclable ? 'Yes' : 'No',
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (type === 'review') {
      const headers = ['Review ID', 'Bin ID', 'Zone', 'Detected Category', 'Confidence (%)', 'Weight (kg)', 'Reason', 'Status'];
      const rows = reviewQueueStore.map((r) => [
        r.id,
        r.binId,
        `"${r.zone}"`,
        r.detectedCategory,
        r.confidence,
        r.estimatedWeightKg,
        `"${r.reason || ''}"`,
        r.reviewStatus,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (type === 'zone') {
      const headers = ['Zone', 'Total Waste (t)', 'Plastic (t)', 'Paper (t)', 'Metal (t)', 'Glass (t)', 'Organic (t)', 'Other (t)', 'Recyclable %'];
      const rows = MOCK_ZONE_CLASSIFICATIONS.map((z) => [
        `"${z.zone}"`,
        z.totalWasteTons,
        z.plasticTons,
        z.paperTons,
        z.metalTons,
        z.glassTons,
        z.organicTons,
        z.otherTons,
        z.recyclablePercent,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    // Default: full history export
    const headers = ['Classification ID', 'Timestamp', 'Bin ID', 'Zone', 'Location', 'Detected Category', 'Confidence (%)', 'Weight (kg)', 'Source', 'Status'];
    const rows = historyStore.map((h) => [
      h.id,
      `"${h.date} ${h.timestamp}"`,
      h.binId,
      `"${h.zone}"`,
      `"${h.location}"`,
      h.detectedCategory,
      h.confidence,
      h.estimatedWeightKg,
      `"${h.source}"`,
      h.status,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
