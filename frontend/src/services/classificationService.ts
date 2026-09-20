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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
  return localStorage.getItem('ecotrack_token') || localStorage.getItem('wastewise_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = {
    ...authHeaders(),
    ...((init.headers as Record<string, string>) || {}),
  };
  return fetch(url, { ...init, headers });
}

let reviewQueueStore: ClassificationEvent[] = [...MOCK_REVIEW_QUEUE];
let liveEventsStore: ClassificationEvent[] = [...MOCK_LIVE_EVENTS];
let historyStore: ClassificationEvent[] = [...MOCK_CLASSIFICATION_HISTORY];

export const classificationService = {
  async getClassificationSummary(): Promise<ClassificationSummary> {
    try {
      const res = await apiFetch(`${API_BASE}/admin/classification/summary`);
      if (res.ok) {
        const body = await res.json();
        console.log('[classificationService] Summary loaded from FastAPI backend:', body);
        return {
          classifiedWeightTons: MOCK_CLASSIFICATION_SUMMARY.classifiedWeightTons,
          accuracyPercent: Math.round((body.average_confidence || 0.942) * 1000) / 10,
          accuracyTrend: MOCK_CLASSIFICATION_SUMMARY.accuracyTrend,
          recyclablePercent: MOCK_CLASSIFICATION_SUMMARY.recyclablePercent,
          nonRecyclablePercent: MOCK_CLASSIFICATION_SUMMARY.nonRecyclablePercent,
          pendingReviewCount: body.low_confidence_count ?? MOCK_CLASSIFICATION_SUMMARY.pendingReviewCount,
          lowConfidenceCount: body.low_confidence_count ?? MOCK_CLASSIFICATION_SUMMARY.lowConfidenceCount,
          totalItemsClassified: body.total_classifications ?? MOCK_CLASSIFICATION_SUMMARY.totalItemsClassified,
          highConfidenceItems: MOCK_CLASSIFICATION_SUMMARY.highConfidenceItems,
          lastModelSync: body.last_classified_at ? new Date(body.last_classified_at).toLocaleString() : MOCK_CLASSIFICATION_SUMMARY.lastModelSync,
          modelStatus: MOCK_CLASSIFICATION_SUMMARY.modelStatus,
          engineStatus: MOCK_CLASSIFICATION_SUMMARY.engineStatus,
        };
      }
    } catch (err) {
      console.warn('[classificationService] Classification summary API unreachable, using fallback:', err);
    }
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

  async uploadImage(file: File, binId?: number): Promise<ClassificationEvent> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (binId) {
        formData.append('bin_id', String(binId));
      }

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/admin/classification/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        const item = await res.json();
        console.log('[classificationService] Image uploaded & classified via backend API:', item);
        const event: ClassificationEvent = {
          id: `CLS-${String(item.id).padStart(5, '0')}`,
          timestamp: new Date(item.classified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: new Date(item.classified_at).toISOString().split('T')[0],
          binId: item.bin_code || (item.bin_id ? `BIN-${item.bin_id}` : 'BIN-C-101'),
          zone: 'Uploaded Photo Zone',
          location: file.name,
          detectedCategory: (item.waste_type || 'PLASTIC') as WasteType,
          confidence: Math.round((item.confidence || 0.95) * 100),
          estimatedWeightKg: 2.5,
          source: 'AI Vision',
          status: item.is_low_confidence ? 'LOW_CONFIDENCE' : 'CONFIRMED',
          reviewStatus: item.review_required ? 'PENDING' : 'CONFIRMED',
        };
        historyStore.unshift(event);
        liveEventsStore.unshift(event);
        return event;
      }
    } catch (err) {
      console.warn('[classificationService] uploadImage failed, falling back to local vision simulation:', err);
    }

    return this.classifyWaste({ binId, source: 'IMAGE', imageReference: file.name });
  },

  async classifyWaste(input: {
    binId?: number;
    source?: 'IMAGE' | 'SENSOR' | 'MANUAL' | 'AI_MODEL' | 'SIMULATION';
    imageReference?: string;
    manualWasteType?: WasteType;
    manualConfidence?: number;
  }): Promise<ClassificationEvent> {
    try {
      const payload = {
        bin_id: input.binId || 1,
        source: input.source || 'IMAGE',
        image_reference: input.imageReference || null,
        manual_waste_type: input.manualWasteType || null,
        manual_confidence: input.manualConfidence || null,
        metadata: {},
      };
      const res = await apiFetch(`${API_BASE}/admin/classification`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const item = await res.json();
        console.log('[classificationService] Classification created via backend API:', item);
        const event: ClassificationEvent = {
          id: `CLS-${String(item.id).padStart(5, '0')}`,
          timestamp: new Date(item.classified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: new Date(item.classified_at).toISOString().split('T')[0],
          binId: item.bin_code || (item.bin_id ? `BIN-${item.bin_id}` : 'BIN-C-101'),
          zone: 'Central Zone',
          location: 'Sector 4',
          detectedCategory: (item.waste_type || 'PLASTIC') as WasteType,
          confidence: Math.round((item.confidence || 0.95) * 100),
          estimatedWeightKg: 2.8,
          source: item.source === 'IMAGE' ? 'AI Vision' : 'Bin Sensor',
          status: item.is_low_confidence ? 'LOW_CONFIDENCE' : 'CONFIRMED',
          reviewStatus: item.review_required ? 'PENDING' : 'CONFIRMED',
        };
        historyStore.unshift(event);
        liveEventsStore.unshift(event);
        return event;
      }
    } catch (err) {
      console.warn('[classificationService] classifyWaste API offline, using local simulation:', err);
    }

    const simulatedEvent: ClassificationEvent = {
      id: `CLS-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      binId: input.binId ? `BIN-${input.binId}` : 'BIN-C-104',
      zone: 'Central Zone',
      location: 'Sector 4 Commercial Complex',
      detectedCategory: input.manualWasteType || 'PLASTIC',
      confidence: input.manualConfidence ? input.manualConfidence * 100 : 96.4,
      estimatedWeightKg: 2.8,
      source: input.source === 'MANUAL' ? 'Manual Inspection' : 'AI Vision',
      status: 'CONFIRMED',
      reviewStatus: 'CONFIRMED',
    };
    historyStore.unshift(simulatedEvent);
    liveEventsStore.unshift(simulatedEvent);
    return simulatedEvent;
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
