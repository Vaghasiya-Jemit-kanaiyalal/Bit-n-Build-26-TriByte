/**
 * recyclingAnalyticsService.ts
 * Data service for Recycling Analytics page.
 */

export interface RecyclingKpiData {
  recyclingDiversionRate: number; // percentage (e.g. 48.2)
  diversionTrend: number;
  recyclableWasteTons: number; // e.g. 120.4
  recyclableWasteTrend: number;
  recoveryRate: number; // percentage (e.g. 89.6)
  recoveryTrend: number;
  co2SavedTons: number; // e.g. 142.8
  co2SavedTrend: number;
}

export interface RecyclingTrendPoint {
  day: string;
  recyclable: number;
  nonRecyclable: number;
  diversionRate: number;
}

export type CategoryNameType =
  | 'Plastic'
  | 'Paper'
  | 'Metal'
  | 'Glass'
  | 'Organic'
  | 'Other';

export interface RecoveryCategoryItem {
  id: string;
  category: CategoryNameType;
  volumeTons: number;
  recoveryRate: number; // percentage
  contaminationRate: number; // percentage
  co2SavedTons: number;
  status: 'HIGH_RECOVERY' | 'MODERATE' | 'HIGH_CONTAMINATION';
}

export interface RecyclingInsightItem {
  id: string;
  title: string;
  description: string;
  type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
}

export const recyclingAnalyticsService = {
  getKpis(_dateRange: string = 'Last 30 Days'): RecyclingKpiData {
    return {
      recyclingDiversionRate: 48.2,
      diversionTrend: +3.1,
      recyclableWasteTons: 120.4,
      recyclableWasteTrend: +4.5,
      recoveryRate: 89.6,
      recoveryTrend: +1.8,
      co2SavedTons: 142.8,
      co2SavedTrend: +5.0,
    };
  },

  getRecyclingTrends(_dateRange: string = 'Last 30 Days'): RecyclingTrendPoint[] {
    return [
      { day: 'Mon', recyclable: 16.2, nonRecyclable: 18.5, diversionRate: 46.7 },
      { day: 'Tue', recyclable: 17.5, nonRecyclable: 18.0, diversionRate: 49.3 },
      { day: 'Wed', recyclable: 16.8, nonRecyclable: 17.2, diversionRate: 49.4 },
      { day: 'Thu', recyclable: 18.4, nonRecyclable: 19.1, diversionRate: 49.1 },
      { day: 'Fri', recyclable: 19.2, nonRecyclable: 20.4, diversionRate: 48.5 },
      { day: 'Sat', recyclable: 16.0, nonRecyclable: 16.8, diversionRate: 48.8 },
      { day: 'Sun', recyclable: 16.3, nonRecyclable: 17.0, diversionRate: 48.9 },
    ];
  },

  getCategoryRecoveryList(): RecoveryCategoryItem[] {
    return [
      {
        id: 'REC-01',
        category: 'Paper',
        volumeTons: 38.5,
        recoveryRate: 92.4,
        contaminationRate: 3.2,
        co2SavedTons: 54.2,
        status: 'HIGH_RECOVERY',
      },
      {
        id: 'REC-02',
        category: 'Plastic',
        volumeTons: 32.1,
        recoveryRate: 88.5,
        contaminationRate: 6.8,
        co2SavedTons: 41.8,
        status: 'MODERATE',
      },
      {
        id: 'REC-03',
        category: 'Glass',
        volumeTons: 22.4,
        recoveryRate: 94.1,
        contaminationRate: 2.1,
        co2SavedTons: 18.6,
        status: 'HIGH_RECOVERY',
      },
      {
        id: 'REC-04',
        category: 'Metal',
        volumeTons: 14.8,
        recoveryRate: 96.2,
        contaminationRate: 1.5,
        co2SavedTons: 22.1,
        status: 'HIGH_RECOVERY',
      },
      {
        id: 'REC-05',
        category: 'Organic',
        volumeTons: 8.6,
        recoveryRate: 78.4,
        contaminationRate: 12.4,
        co2SavedTons: 4.1,
        status: 'HIGH_CONTAMINATION',
      },
      {
        id: 'REC-06',
        category: 'Other',
        volumeTons: 4.0,
        recoveryRate: 62.0,
        contaminationRate: 15.0,
        co2SavedTons: 2.0,
        status: 'MODERATE',
      },
    ];
  },

  getInsights(): RecyclingInsightItem[] {
    return [
      {
        id: 'INS-R1',
        title: 'CO₂ Emissions Offset Exceeds 140 Tons Threshold',
        description: 'Increased paper and metal recovery averted 142.8 tons of greenhouse gas emissions this month.',
        type: 'POSITIVE',
      },
      {
        id: 'INS-R2',
        title: 'Organic Compartment Contamination Trigger',
        description: 'Organic stream contamination spiked to 12.4% in commercial food court bins.',
        type: 'WARNING',
      },
      {
        id: 'INS-R3',
        title: 'Metal & Glass Recovery Reached 95%+ Efficiency',
        description: 'Optical sorting efficiency improvements increased clean glass recovery to 94.1%.',
        type: 'POSITIVE',
      },
    ];
  },
};
