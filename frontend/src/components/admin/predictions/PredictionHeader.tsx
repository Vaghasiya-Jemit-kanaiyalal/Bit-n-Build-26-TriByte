import React from 'react';
import {
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import type { ForecastHorizon, DateRangeFilter, PredictionFilterState } from '../../../types/prediction';

interface PredictionHeaderProps {
  filters: PredictionFilterState;
  onFilterChange: (updates: Partial<PredictionFilterState>) => void;
  onRefresh: () => void;
  onExport: (type: 'all' | 'overflow' | 'waste' | 'history') => void;
}

export const PredictionHeader: React.FC<PredictionHeaderProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  onExport,
}) => {
  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-5 shadow-xs flex flex-col gap-4">
      {/* Top Breadcrumb & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>ADMIN</span>
            <span>/</span>
            <span className="text-[#047857] font-bold">PREDICTIONS</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
              Prediction Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>SIMULATED / DEMO</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Forecast bin fill levels, waste generation demand, overflow risk, and upcoming collection requirements.
          </p>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 shadow-xs cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          {/* Export Menu Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors border-none">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-emerald-200" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none group-hover:pointer-events-auto py-1">
              <button
                onClick={() => onExport('all')}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-none bg-transparent"
              >
                Export All Predictions CSV
              </button>
              <button
                onClick={() => onExport('overflow')}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-none bg-transparent"
              >
                Export Overflow Risk
              </button>
              <button
                onClick={() => onExport('waste')}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-none bg-transparent"
              >
                Export Waste Forecast
              </button>
              <button
                onClick={() => onExport('history')}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer border-none bg-transparent"
              >
                Export Prediction History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
        {/* Forecast Horizon Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-bold">Horizon:</span>
          <select
            value={filters.horizon}
            onChange={(e) => onFilterChange({ horizon: e.target.value as ForecastHorizon })}
            className="bg-transparent border-none text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="6h">Next 6 Hours</option>
            <option value="12h">Next 12 Hours</option>
            <option value="24h">Next 24 Hours</option>
            <option value="48h">Next 48 Hours</option>
            <option value="7d">Next 7 Days</option>
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-bold">Range:</span>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as DateRangeFilter })}
            className="bg-transparent border-none text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-bold">Zone:</span>
          <select
            value={filters.zone}
            onChange={(e) => onFilterChange({ zone: e.target.value })}
            className="bg-transparent border-none text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="All">All Zones</option>
            <option value="Central">Central</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Industrial">Industrial</option>
            <option value="Residential">Residential</option>
          </select>
        </div>

        {/* Waste Type Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
          <span className="text-slate-500 font-bold">Material:</span>
          <select
            value={filters.wasteType}
            onChange={(e) => onFilterChange({ wasteType: e.target.value })}
            className="bg-transparent border-none text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="All">All Waste Types</option>
            <option value="Organic">Organic</option>
            <option value="Plastic">Plastic</option>
            <option value="Paper">Paper</option>
            <option value="Metal">Metal</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() =>
            onFilterChange({
              horizon: '24h',
              dateRange: 'today',
              zone: 'All',
              wasteType: 'All',
              riskLevel: 'All',
              confidence: 'All',
              searchQuery: '',
            })
          }
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer border-none bg-transparent ml-auto"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
