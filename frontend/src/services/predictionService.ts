import type {
  PredictionEngineStatus,
  PredictionKpiSummary,
  ForecastTimeSeriesPoint,
  PredictionSummaryData,
  FillForecastBin,
  OverflowRiskDistribution,
  WasteDemandForecastPoint,
  ZoneForecastItem,
  CollectionDemandBreakdown,
  PredictionPriorityItem,
  ConfidenceDistributionItem,
  LowConfidencePrediction,
  PredictionQualityMetrics,
  PredictionModelInfo,
  PredictionHistoryItem,
  PredictionInsight,
  OperationalRecommendation,
  PredictionFilterState,
} from '../types/prediction';

import {
  mockPredictionEngineStatus,
  mockPredictionKpiSummary,
  mockForecastTimeSeries,
  mockPredictionSummaryData,
  mockFillForecastBins,
  mockOverflowRiskDistribution,
  mockWasteDemandForecastPoints,
  mockZoneForecasts,
  mockCollectionDemandBreakdown,
  mockPredictionPriorityQueue,
  mockConfidenceDistribution,
  mockLowConfidencePredictions,
  mockPredictionQualityMetrics,
  mockPredictionModelInfo,
  mockPredictionHistory,
  mockPredictionInsights,
  mockOperationalRecommendations,
} from '../data/adminPredictionsMock';

class PredictionService {
  private lowConfidenceList: LowConfidencePrediction[] = [...mockLowConfidencePredictions];
  private historyList: PredictionHistoryItem[] = [...mockPredictionHistory];

  public getPredictionEngineStatus(): PredictionEngineStatus {
    return { ...mockPredictionEngineStatus };
  }

  public getKpiSummary(): PredictionKpiSummary {
    return { ...mockPredictionKpiSummary };
  }

  public getForecastTimeSeries(): ForecastTimeSeriesPoint[] {
    return [...mockForecastTimeSeries];
  }

  public getPredictionSummaryData(): PredictionSummaryData {
    return { ...mockPredictionSummaryData };
  }

  public getFillForecastBins(filters?: Partial<PredictionFilterState>): FillForecastBin[] {
    let list = [...mockFillForecastBins];
    if (!filters) return list;

    if (filters.zone && filters.zone !== 'All') {
      list = list.filter((b) => b.zone.toLowerCase() === filters.zone?.toLowerCase());
    }
    if (filters.wasteType && filters.wasteType !== 'All') {
      list = list.filter((b) => b.wasteType.toLowerCase() === filters.wasteType?.toLowerCase());
    }
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      list = list.filter((b) => b.risk.toLowerCase() === filters.riskLevel?.toLowerCase());
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.binCode.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.zone.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getOverflowRiskDistribution(): OverflowRiskDistribution {
    return { ...mockOverflowRiskDistribution };
  }

  public getWasteDemandForecastPoints(): WasteDemandForecastPoint[] {
    return [...mockWasteDemandForecastPoints];
  }

  public getZoneForecasts(zoneFilter?: string): ZoneForecastItem[] {
    if (!zoneFilter || zoneFilter === 'All') return [...mockZoneForecasts];
    return mockZoneForecasts.filter((z) => z.zone.toLowerCase() === zoneFilter.toLowerCase());
  }

  public getCollectionDemandBreakdown(): CollectionDemandBreakdown {
    return { ...mockCollectionDemandBreakdown };
  }

  public getPredictionPriorityQueue(): PredictionPriorityItem[] {
    return [...mockPredictionPriorityQueue];
  }

  public getConfidenceDistribution(): ConfidenceDistributionItem[] {
    return [...mockConfidenceDistribution];
  }

  public getLowConfidencePredictions(): LowConfidencePrediction[] {
    return [...this.lowConfidenceList];
  }

  public getPredictionQualityMetrics(): PredictionQualityMetrics {
    return { ...mockPredictionQualityMetrics };
  }

  public getPredictionModelInfo(): PredictionModelInfo {
    return { ...mockPredictionModelInfo };
  }

  public getPredictionHistory(): PredictionHistoryItem[] {
    return [...this.historyList];
  }

  public getPredictionInsights(): PredictionInsight[] {
    return [...mockPredictionInsights];
  }

  public getOperationalRecommendations(): OperationalRecommendation[] {
    return [...mockOperationalRecommendations];
  }

  public reviewPrediction(id: string, status: 'ACCEPTED' | 'DISMISSED'): boolean {
    const item = this.lowConfidenceList.find((p) => p.id === id);
    if (item) {
      item.status = status;
      return true;
    }
    return false;
  }

  public exportPredictions(type: 'all' | 'overflow' | 'waste' | 'history'): string {
    return `Simulated export generated for prediction report [${type.toUpperCase()}] on ${new Date().toISOString()}`;
  }
}

export const predictionService = new PredictionService();
