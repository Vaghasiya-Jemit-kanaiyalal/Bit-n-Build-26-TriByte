/**
 * areaAnalysisService.ts
 * Data service for Area Analysis page.
 */

export interface AreaKpiData {
  totalWasteTons: number;
  totalWasteTrend: number;
  collectionEfficiency: number; // percentage (e.g. 94.2)
  efficiencyTrend: number;
  recyclingRate: number; // percentage (e.g. 48.6)
  recyclingTrend: number;
  overflowRate: number; // percentage (e.g. 2.1)
  overflowTrend: number;
}

export type ZoneNameType =
  | 'Central'
  | 'North'
  | 'South'
  | 'East'
  | 'West'
  | 'Industrial'
  | 'Residential';

export interface ZoneItem {
  id: string;
  name: ZoneNameType;
  totalWasteTons: number;
  collectionEfficiency: number;
  recyclingRate: number;
  overflowRate: number;
  activeBinsCount: number;
  activeVehiclesCount: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  shortTrend: { day: string; waste: number }[];
}

export interface AreaInsightItem {
  id: string;
  title: string;
  description: string;
  type: 'POSITIVE' | 'NEUTRAL' | 'WARNING';
}

export const areaAnalysisService = {
  getKpis(selectedZone: string = 'All', _dateRange: string = 'Last 30 Days'): AreaKpiData {
    if (selectedZone !== 'All') {
      const zoneData = this.getZoneList().find(z => z.name === selectedZone);
      if (zoneData) {
        return {
          totalWasteTons: zoneData.totalWasteTons,
          totalWasteTrend: +2.4,
          collectionEfficiency: zoneData.collectionEfficiency,
          efficiencyTrend: +1.1,
          recyclingRate: zoneData.recyclingRate,
          recyclingTrend: +1.8,
          overflowRate: zoneData.overflowRate,
          overflowTrend: -0.4,
        };
      }
    }
    return {
      totalWasteTons: 248.5,
      totalWasteTrend: +3.8,
      collectionEfficiency: 94.2,
      efficiencyTrend: +1.4,
      recyclingRate: 48.6,
      recyclingTrend: +2.2,
      overflowRate: 2.1,
      overflowTrend: -0.6,
    };
  },

  getZoneList(): ZoneItem[] {
    return [
      {
        id: 'Z-01',
        name: 'Central',
        totalWasteTons: 64.2,
        collectionEfficiency: 96.8,
        recyclingRate: 54.1,
        overflowRate: 1.2,
        activeBinsCount: 84,
        activeVehiclesCount: 6,
        status: 'OPTIMAL',
        shortTrend: [
          { day: 'Mon', waste: 8.5 },
          { day: 'Tue', waste: 9.1 },
          { day: 'Wed', waste: 9.4 },
          { day: 'Thu', waste: 9.8 },
          { day: 'Fri', waste: 10.2 },
          { day: 'Sat', waste: 9.0 },
          { day: 'Sun', waste: 8.2 },
        ],
      },
      {
        id: 'Z-02',
        name: 'North',
        totalWasteTons: 42.8,
        collectionEfficiency: 95.1,
        recyclingRate: 49.5,
        overflowRate: 1.8,
        activeBinsCount: 62,
        activeVehiclesCount: 4,
        status: 'OPTIMAL',
        shortTrend: [
          { day: 'Mon', waste: 5.8 },
          { day: 'Tue', waste: 6.0 },
          { day: 'Wed', waste: 6.2 },
          { day: 'Thu', waste: 6.4 },
          { day: 'Fri', waste: 6.8 },
          { day: 'Sat', waste: 6.1 },
          { day: 'Sun', waste: 5.5 },
        ],
      },
      {
        id: 'Z-03',
        name: 'South',
        totalWasteTons: 38.6,
        collectionEfficiency: 94.5,
        recyclingRate: 46.2,
        overflowRate: 2.4,
        activeBinsCount: 56,
        activeVehiclesCount: 4,
        status: 'MODERATE',
        shortTrend: [
          { day: 'Mon', waste: 5.2 },
          { day: 'Tue', waste: 5.4 },
          { day: 'Wed', waste: 5.6 },
          { day: 'Thu', waste: 5.8 },
          { day: 'Fri', waste: 6.0 },
          { day: 'Sat', waste: 5.5 },
          { day: 'Sun', waste: 5.1 },
        ],
      },
      {
        id: 'Z-04',
        name: 'East',
        totalWasteTons: 35.1,
        collectionEfficiency: 90.2,
        recyclingRate: 42.8,
        overflowRate: 4.5,
        activeBinsCount: 50,
        activeVehiclesCount: 3,
        status: 'CRITICAL',
        shortTrend: [
          { day: 'Mon', waste: 4.8 },
          { day: 'Tue', waste: 5.0 },
          { day: 'Wed', waste: 5.2 },
          { day: 'Thu', waste: 5.5 },
          { day: 'Fri', waste: 5.9 },
          { day: 'Sat', waste: 4.9 },
          { day: 'Sun', waste: 4.5 },
        ],
      },
      {
        id: 'Z-05',
        name: 'West',
        totalWasteTons: 31.4,
        collectionEfficiency: 93.8,
        recyclingRate: 47.9,
        overflowRate: 2.0,
        activeBinsCount: 44,
        activeVehiclesCount: 3,
        status: 'MODERATE',
        shortTrend: [
          { day: 'Mon', waste: 4.2 },
          { day: 'Tue', waste: 4.4 },
          { day: 'Wed', waste: 4.6 },
          { day: 'Thu', waste: 4.7 },
          { day: 'Fri', waste: 5.0 },
          { day: 'Sat', waste: 4.5 },
          { day: 'Sun', waste: 4.0 },
        ],
      },
      {
        id: 'Z-06',
        name: 'Industrial',
        totalWasteTons: 22.0,
        collectionEfficiency: 92.4,
        recyclingRate: 38.5,
        overflowRate: 3.1,
        activeBinsCount: 32,
        activeVehiclesCount: 2,
        status: 'MODERATE',
        shortTrend: [
          { day: 'Mon', waste: 3.0 },
          { day: 'Tue', waste: 3.2 },
          { day: 'Wed', waste: 3.3 },
          { day: 'Thu', waste: 3.5 },
          { day: 'Fri', waste: 3.8 },
          { day: 'Sat', waste: 2.8 },
          { day: 'Sun', waste: 2.4 },
        ],
      },
      {
        id: 'Z-07',
        name: 'Residential',
        totalWasteTons: 14.4,
        collectionEfficiency: 97.2,
        recyclingRate: 61.4,
        overflowRate: 0.8,
        activeBinsCount: 28,
        activeVehiclesCount: 2,
        status: 'OPTIMAL',
        shortTrend: [
          { day: 'Mon', waste: 1.8 },
          { day: 'Tue', waste: 2.0 },
          { day: 'Wed', waste: 2.1 },
          { day: 'Thu', waste: 2.2 },
          { day: 'Fri', waste: 2.4 },
          { day: 'Sat', waste: 2.1 },
          { day: 'Sun', waste: 1.8 },
        ],
      },
    ];
  },

  getInsights(): AreaInsightItem[] {
    return [
      {
        id: 'INS-A1',
        title: 'Central Zone Leads Collection Efficiency at 96.8%',
        description: 'Dense sensor coverage and optimized dispatch kept overflow incidents under 1.2%.',
        type: 'POSITIVE',
      },
      {
        id: 'INS-A2',
        title: 'East Zone Requires Route Frequency Adjustment',
        description: 'Overflow rate reached 4.5% due to high market generation between 12:00 - 15:00.',
        type: 'WARNING',
      },
      {
        id: 'INS-A3',
        title: 'Residential Sector Achieved Highest Recycling Rate (61.4%)',
        description: 'Community organic waste segregation initiatives improved purity by 8.2% this month.',
        type: 'POSITIVE',
      },
    ];
  },
};
