import React from 'react';
import { Calendar, Filter, Sparkles, FileSpreadsheet } from 'lucide-react';
import type { ReportType } from '../../../services/reportsService';

interface ReportFiltersProps {
  reportType: ReportType;
  onReportTypeChange: (type: ReportType) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  onGenerateReport: () => void;
  isGenerating?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  onReportTypeChange,
  dateRange,
  onDateRangeChange,
  selectedZone,
  onZoneChange,
  onGenerateReport,
  isGenerating = false,
}) => {
  const reportTypes: ReportType[] = [
    'Overall Analytics',
    'Waste Analytics',
    'Prediction Analytics',
    'Collection Analytics',
    'Area Analysis',
    'Recycling Analytics',
  ];

  const zonesList: string[] = ['All Zones', 'Central', 'North', 'South', 'East', 'West', 'Industrial', 'Residential'];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-slate-900">Custom Report Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Report Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            {reportTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" /> Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter</option>
          </select>
        </div>

        {/* Optional Zone Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Zone Filter (Optional)
          </label>
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            {zonesList.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Report Button */}
        <div>
          <button
            type="button"
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-emerald-700 text-white hover:bg-emerald-800 transition-all cursor-pointer border-none shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
