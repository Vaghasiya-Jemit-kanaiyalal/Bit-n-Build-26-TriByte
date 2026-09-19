/**
 * predictionAnalyticsService.ts
 * Data service for Prediction Analytics page.
 */

export interface PredictionKpiData {
  predictionAccuracy: number; // percentage (e.g. 96.4)
  predictionAccuracyTrend: number;
  averageConfidence: number; // percentage (e.g. 94.2)
  confidenceTrend: number;
  overflowAccuracy: number; // percentage (e.g. 98.1)
  overflowAccuracyTrend: number;
  forecastedWasteTons: number; // e.g. 1420
  forecastedWasteTrend: number;
}

export interface PredictionAccuracyPoint {
  day: string;
  accuracy: number;
  confidence: number;
}

export interface ActualVsPredictedPoint {
  day: string;
  actual: number;
  predicted: number;
}

export interface PredictionPerformanceItem {
  id: string;
  sector: string;
  modelName: string;
  modelVersion: string;
  accuracyRate: number;
  mae: number; // Mean Absolute Error (%)
  sampleCount: number;
  status: 'OPTIMAL' | 'CALIBRATING' | 'NEEDS_RETRAINING';
  lastUpdated: string;
}

export interface PredictionInsightItem {
  id: string;
  title: string;
  description: string;
  type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
}

export const predictionAnalyticsService = {
  getKpis(_dateRange: string = 'Last 30 Days'): PredictionKpiData {
    return {
      predictionAccuracy: 96.4,
      predictionAccuracyTrend: +2.1,
      averageConfidence: 94.2,
      confidenceTrend: +1.4,
      overflowAccuracy: 98.1,
      overflowAccuracyTrend: +0.8,
      forecastedWasteTons: 1420,
      forecastedWasteTrend: -3.5,
    };
  },

  getAccuracyTrends(_dateRange: string = 'Last 30 Days'): PredictionAccuracyPoint[] {
    return [
      { day: 'Mon', accuracy: 94.2, confidence: 92.0 },
      { day: 'Tue', accuracy: 95.8, confidence: 93.5 },
      { day: 'Wed', accuracy: 96.1, confidence: 94.0 },
      { day: 'Thu', accuracy: 97.4, confidence: 95.2 },
      { day: 'Fri', accuracy: 96.8, confidence: 94.8 },
      { day: 'Sat', accuracy: 95.5, confidence: 93.1 },
      { day: 'Sun', accuracy: 96.4, confidence: 94.2 },
    ];
  },

  getActualVsPredicted(_dateRange: string = 'Last 30 Days'): ActualVsPredictedPoint[] {
    return [
      { day: 'Mon', actual: 180, predicted: 185 },
      { day: 'Tue', actual: 210, predicted: 205 },
      { day: 'Wed', actual: 195, predicted: 198 },
      { day: 'Thu', actual: 240, predicted: 235 },
      { day: 'Fri', actual: 260, predicted: 258 },
      { day: 'Sat', actual: 220, predicted: 225 },
      { day: 'Sun', actual: 190, predicted: 188 },
    ];
  },

  getPerformanceList(): PredictionPerformanceItem[] {
    return [
      {
        id: 'MOD-01',
        sector: 'Central Commercial Zone',
        modelName: 'Commercial Fill Predictor',
        modelVersion: 'v2.4.1',
        accuracyRate: 98.2,
        mae: 1.8,
        sampleCount: 1420,
        status: 'OPTIMAL',
        lastUpdated: 'Today at 08:00 AM',
      },
      {
        id: 'MOD-02',
        sector: 'North Residential Suburb',
        modelName: 'Residential Daily Cycle Model',
        modelVersion: 'v2.3.9',
        accuracyRate: 95.6,
        mae: 3.2,
        sampleCount: 2100,
        status: 'OPTIMAL',
        lastUpdated: 'Yesterday at 11:30 PM',
      },
      {
        id: 'MOD-03',
        sector: 'Industrial Sector 4',
        modelName: 'Heavy Waste Spike Estimator',
        modelVersion: 'v2.1.0',
        accuracyRate: 91.4,
        mae: 5.6,
        sampleCount: 850,
        status: 'NEEDS_RETRAINING',
        lastUpdated: '2 days ago',
      },
      {
        id: 'MOD-04',
        sector: 'South Tech Park',
        modelName: 'High-Density Bin Model',
        modelVersion: 'v2.4.0',
        accuracyRate: 97.8,
        mae: 2.1,
        sampleCount: 1180,
        status: 'OPTIMAL',
        lastUpdated: 'Today at 06:15 AM',
      },
      {
        id: 'MOD-05',
        sector: 'West Riverfront Promenade',
        modelName: 'Event & Weekend Spike Model',
        modelVersion: 'v2.4.2',
        accuracyRate: 94.1,
        mae: 4.1,
        sampleCount: 960,
        status: 'CALIBRATING',
        lastUpdated: 'Today at 09:45 AM',
      },
    ];
  },

  getInsights(): PredictionInsightItem[] {
    return [
      {
        id: 'INS-01',
        title: 'Overflow Forecasting Precision Hit 98.1%',
        description: 'Machine learning prediction lead-time increased by 4 hours before high fill triggers.',
        type: 'POSITIVE',
      },
      {
        id: 'INS-02',
        title: 'Industrial Sector 4 Model Variance Detected',
        description: 'Unexpected weekend industrial dumping caused a 5.6% variance in predicted mass.',
        type: 'WARNING',
      },
      {
        id: 'INS-03',
        title: 'Commercial Sector Peak Hour Realignment',
        description: 'Commercial bin fill curves shifted 45 minutes earlier during morning peak hours.',
        type: 'NEUTRAL',
      },
    ];
  },
};
