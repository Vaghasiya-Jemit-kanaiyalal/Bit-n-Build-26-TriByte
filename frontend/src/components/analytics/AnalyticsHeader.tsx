import React from 'react';
import { Calendar, RefreshCw, Download, Layers, ChevronDown, Activity, Sparkles, BarChart2 } from 'lucide-react';
import type { DateRangeType, ComparePeriodType } from '../../services/analyticsService';

interface AnalyticsHeaderProps {
  dateRange: DateRangeType;
  onDateRangeChange: (val: DateRangeType) => void;
  comparePeriod: ComparePeriodType;
  onComparePeriodChange: (val: ComparePeriodType) => void;
  onRefresh: () => void;
  onOpenExportModal: () => void;
  isRefreshing: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  comparePeriod,
  onComparePeriodChange,
  onRefresh,
  onOpenExportModal,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-5 shadow-xs mb-6 relative overflow-hidden">
      {/* Background Decorative Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left Title & Breadcrumbs */}
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase mb-1.5">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
              <BarChart2 className="w-3 h-3 text-emerald-600" />
              <span>ECOTRACK INTELLIGENCE</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">REAL-TIME ANALYTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            Waste Management Analytics
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-3xl leading-relaxed">
            AI-powered waste generation insights, fleet collection performance, zone-level composition, and predictive operational telemetry.
          </p>
        </div>

        {/* Right Actions Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Date Range Selector */}
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-300/80 rounded-xl px-3 py-2 shadow-2xs transition-all">
            <Calendar className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Period</span>
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value as DateRangeType)}
                className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer pr-5 appearance-none py-0.5"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Compare Period Selector */}
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-300/80 rounded-xl px-3 py-2 shadow-2xs transition-all">
            <Layers className="w-4 h-4 text-indigo-600 mr-2 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Compare</span>
              <select
                value={comparePeriod}
                onChange={(e) => onComparePeriodChange(e.target.value as ComparePeriodType)}
                className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer pr-5 appearance-none py-0.5"
              >
                <option value="Previous Period">Previous Period</option>
                <option value="Previous Year">Previous Year</option>
                <option value="No Comparison">No Comparison</option>
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300/80 text-xs font-bold text-slate-700 rounded-xl shadow-2xs transition-all hover:shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Report</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer border-none disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

        </div>

      </div>

      {/* Date Range Sub-banner */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Window: <strong className="text-slate-900 font-semibold">{dateRange === 'Last 30 Days' ? 'Sep 1 – Sep 30, 2026' : dateRange}</strong></span>
          {comparePeriod !== 'No Comparison' && (
            <span className="text-slate-400 font-normal">({comparePeriod})</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] text-slate-400 font-mono">Sensors: 248 Active | Last synced: Just now</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
