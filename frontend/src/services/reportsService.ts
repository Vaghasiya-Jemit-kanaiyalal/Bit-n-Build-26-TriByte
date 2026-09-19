/**
 * reportsService.ts
 * Data service for Reports management page.
 */

export type ReportType =
  | 'Overall Analytics'
  | 'Waste Analytics'
  | 'Prediction Analytics'
  | 'Collection Analytics'
  | 'Area Analysis'
  | 'Recycling Analytics';

export interface ReportTemplateItem {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  defaultFormat: 'PDF' | 'CSV' | 'JSON';
  estimatedGenerationSec: number;
}

export interface RecentReportItem {
  id: string;
  title: string;
  type: ReportType;
  dateRange: string;
  zoneFilter: string;
  createdAt: string;
  fileFormat: 'PDF' | 'CSV' | 'JSON';
  fileSizeMb: number;
  status: 'READY' | 'GENERATING' | 'FAILED';
}

export interface GeneratedReportPreview {
  id: string;
  title: string;
  type: ReportType;
  dateRange: string;
  zoneFilter: string;
  createdAt: string;
  summaryMetrics: { label: string; value: string }[];
  keyFindings: string[];
}

export const reportsService = {
  getTemplates(): ReportTemplateItem[] {
    return [
      {
        id: 'TPL-01',
        name: 'Executive Overall Performance Summary',
        type: 'Overall Analytics',
        description: 'Comprehensive high-level KPI dashboard, waste tonnage, and fleet metrics.',
        defaultFormat: 'PDF',
        estimatedGenerationSec: 3,
      },
      {
        id: 'TPL-02',
        name: 'Waste Stream Generation & Composition',
        type: 'Waste Analytics',
        description: 'Detailed analysis of daily generation rates, material splits, and peak hours.',
        defaultFormat: 'CSV',
        estimatedGenerationSec: 2,
      },
      {
        id: 'TPL-03',
        name: 'AI Forecast Precision & Accuracy Log',
        type: 'Prediction Analytics',
        description: 'Machine learning model validation scores, MAE rates, and predicted vs actual trends.',
        defaultFormat: 'PDF',
        estimatedGenerationSec: 4,
      },
      {
        id: 'TPL-04',
        name: 'Collection Dispatch & SLA Compliance Report',
        type: 'Collection Analytics',
        description: 'Planned vs completed pickup counts, turn-around times, and bottleneck breakdown.',
        defaultFormat: 'PDF',
        estimatedGenerationSec: 3,
      },
      {
        id: 'TPL-05',
        name: 'Zone-wise Sector Performance Comparison',
        type: 'Area Analysis',
        description: 'Comparative metrics across Central, North, South, East, West, and Industrial sectors.',
        defaultFormat: 'CSV',
        estimatedGenerationSec: 2,
      },
      {
        id: 'TPL-06',
        name: 'Recycling Diversion & Environmental Impact',
        type: 'Recycling Analytics',
        description: 'Material recovery percentages, stream contamination rates, and CO₂ savings.',
        defaultFormat: 'PDF',
        estimatedGenerationSec: 3,
      },
    ];
  },

  getRecentReports(): RecentReportItem[] {
    return [
      {
        id: 'REP-2026-091',
        title: 'Q3 Municipal Operations Executive Report',
        type: 'Overall Analytics',
        dateRange: 'Last 30 Days',
        zoneFilter: 'All Zones',
        createdAt: '19 Sep 2026, 09:30 AM',
        fileFormat: 'PDF',
        fileSizeMb: 2.4,
        status: 'READY',
      },
      {
        id: 'REP-2026-090',
        title: 'Central Zone Recycling Diversion Audit',
        type: 'Recycling Analytics',
        dateRange: 'Last 7 Days',
        zoneFilter: 'Central',
        createdAt: '18 Sep 2026, 04:15 PM',
        fileFormat: 'CSV',
        fileSizeMb: 1.1,
        status: 'READY',
      },
      {
        id: 'REP-2026-089',
        title: 'AI Overflow Prediction Accuracy Brief',
        type: 'Prediction Analytics',
        dateRange: 'Last 30 Days',
        zoneFilter: 'All Zones',
        createdAt: '17 Sep 2026, 11:00 AM',
        fileFormat: 'PDF',
        fileSizeMb: 3.8,
        status: 'READY',
      },
      {
        id: 'REP-2026-088',
        title: 'East Sector Collection Delay Investigation',
        type: 'Collection Analytics',
        dateRange: 'Custom Range',
        zoneFilter: 'East',
        createdAt: '15 Sep 2026, 02:45 PM',
        fileFormat: 'PDF',
        fileSizeMb: 1.8,
        status: 'READY',
      },
      {
        id: 'REP-2026-087',
        title: 'City-wide Zone Comparison Matrix',
        type: 'Area Analysis',
        dateRange: 'Last 30 Days',
        zoneFilter: 'All Zones',
        createdAt: '12 Sep 2026, 08:20 AM',
        fileFormat: 'CSV',
        fileSizeMb: 0.9,
        status: 'READY',
      },
    ];
  },

  generateReport(type: ReportType, dateRange: string, zoneFilter: string): RecentReportItem {
    const newId = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;
    return {
      id: newId,
      title: `${type} Report (${dateRange})`,
      type,
      dateRange,
      zoneFilter,
      createdAt: 'Just now',
      fileFormat: type === 'Area Analysis' || type === 'Waste Analytics' ? 'CSV' : 'PDF',
      fileSizeMb: 1.8,
      status: 'READY',
    };
  },

  getPreview(reportId: string): GeneratedReportPreview {
    return {
      id: reportId,
      title: 'Analytical Performance Summary Report',
      type: 'Overall Analytics',
      dateRange: 'Last 30 Days',
      zoneFilter: 'All Zones',
      createdAt: '19 Sep 2026',
      summaryMetrics: [
        { label: 'Total Waste Collected', value: '248.5 Tons' },
        { label: 'Collection On-Time Rate', value: '95.6%' },
        { label: 'AI Overflow Prediction Accuracy', value: '98.1%' },
        { label: 'Recycling Diversion Rate', value: '48.2%' },
        { label: 'CO₂ Emission Reduction', value: '142.8 Tons' },
      ],
      keyFindings: [
        'Central Commercial Zone maintained highest collection SLA at 97.5%.',
        'AI overflow prediction lead-time improved by 4 hours before high fill triggers.',
        'Paper and metal recycling streams contributed to 67% of total carbon offset.',
        'East Market District requires morning route re-sequencing due to alley congestion.',
      ],
    };
  },
};
