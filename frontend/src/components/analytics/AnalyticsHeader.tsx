import React from 'react';
import { Calendar, RefreshCw, Download, Layers, ChevronDown, Activity } from 'lucide-react';
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
    <div className="bg-white border-b border-[#e5e7eb] px-6 py-4 shadow-2xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Title & Breadcrumbs */}
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span>ADMIN</span>
            <span>/</span>
            <span className="text-[#047857]">ANALYTICS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
            Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl leading-normal">
            Understand waste generation, collection performance, fleet efficiency, recycling recovery and AI-driven operational trends.
          </p>
        </div>

        {/* Right Actions Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Date Range Selector */}
          <div className="relative flex items-center bg-[#f9fafb] border border-[#d1d5db] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRangeType)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Compare Period Selector */}
          <div className="relative flex items-center bg-[#f9fafb] border border-[#d1d5db] rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
            <span className="text-[10px] text-slate-400 font-semibold mr-1.5">vs:</span>
            <select
              value={comparePeriod}
              onChange={(e) => onComparePeriodChange(e.target.value as ComparePeriodType)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              <option value="Previous Period">Previous Period</option>
              <option value="Previous Year">Previous Year</option>
              <option value="No Comparison">No Comparison</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#d1d5db] text-xs font-bold text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer border-none disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

        </div>

      </div>

      {/* Date Range Sub-banner */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-[#047857]" />
          <span>Analytics Period: <strong className="text-slate-900">{dateRange === 'Last 30 Days' ? 'Sep 1 – Sep 30, 2026' : dateRange}</strong></span>
          {comparePeriod !== 'No Comparison' && (
            <span className="text-slate-400 font-normal">({comparePeriod})</span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Last synced: Just now</span>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
