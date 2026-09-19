import React from 'react';
import { RefreshCw, Save, Zap, AlertCircle } from 'lucide-react';
import type { PlanningHorizonType } from '../../../types/planning';

interface PlanningHeaderProps {
  date: string;
  horizon: string;
  hasUnsavedChanges: boolean;
  onDateChange: (date: string) => void;
  onHorizonChange: (horizon: PlanningHorizonType) => void;
  onRefresh: () => void;
  onSavePlan: () => void;
  onGeneratePlan: () => void;
}

export const PlanningHeader: React.FC<PlanningHeaderProps> = ({
  date,
  horizon,
  hasUnsavedChanges,
  onDateChange,
  onHorizonChange,
  onRefresh,
  onSavePlan,
  onGeneratePlan,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      
      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          <span>ADMIN</span>
          <span>/</span>
          <span className="text-emerald-700">PLANNING</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Collection Planning
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
          Plan upcoming waste collection using demand, AI predictions, priorities, fleet capacity, and operational constraints.
        </p>

        <div className="mt-3 flex items-center space-x-3 text-xs">
          <span className="text-slate-400">
            Last Updated: <strong className="text-slate-700">Just now</strong>
          </span>
          {hasUnsavedChanges && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200 flex items-center space-x-1 animate-pulse">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Unsaved Changes</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Date Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent font-mono text-slate-800 font-bold focus:outline-none cursor-pointer"
          />
        </div>

        {/* Planning Horizon Selector */}
        <select
          value={horizon}
          onChange={(e) => onHorizonChange(e.target.value as PlanningHorizonType)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="Today">Horizon: Today</option>
          <option value="Next 12 Hours">Next 12 Hours</option>
          <option value="Next 24 Hours">Next 24 Hours</option>
          <option value="Next 48 Hours">Next 48 Hours</option>
          <option value="Next 7 Days">Next 7 Days</option>
        </select>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition"
          title="Refresh Telemetry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Save Plan */}
        <button
          onClick={onSavePlan}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Plan</span>
        </button>

        {/* Generate Plan */}
        <button
          onClick={onGeneratePlan}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>Generate Plan</span>
        </button>

      </div>

    </div>
  );
};
