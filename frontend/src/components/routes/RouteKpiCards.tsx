import React from 'react';
import { Route, Calendar, Play, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RouteKpiCardsProps {
  activeCount?: number;
  plannedCount?: number;
  inProgressCount?: number;
  completedCount?: number;
  atRiskCount?: number;
}

export const RouteKpiCards: React.FC<RouteKpiCardsProps> = ({
  activeCount = 12,
  plannedCount = 7,
  inProgressCount = 4,
  completedCount = 21,
  atRiskCount = 2,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {/* Card 1: ACTIVE ROUTES */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            ACTIVE ROUTES
          </span>
          <Route className="w-3.5 h-3.5 text-[#738a62]" />
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-[#111827]">{activeCount}</span>
        </div>
        <span className="text-[11px] text-[#6b7280] font-medium mt-1">
          8 vehicles currently active
        </span>
      </div>

      {/* Card 2: PLANNED */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            PLANNED
          </span>
          <Calendar className="w-3.5 h-3.5 text-[#3b82f6]" />
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-[#111827]">{plannedCount}</span>
        </div>
        <span className="text-[11px] text-[#6b7280] font-medium mt-1">
          Scheduled today
        </span>
      </div>

      {/* Card 3: IN PROGRESS */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            IN PROGRESS
          </span>
          <Play className="w-3.5 h-3.5 text-[#738a62]" />
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-[#111827]">{inProgressCount}</span>
        </div>
        <span className="text-[11px] text-[#6b7280] font-medium mt-1">
          Currently collecting
        </span>
      </div>

      {/* Card 4: COMPLETED */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            COMPLETED
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-[#111827]">{completedCount}</span>
        </div>
        <span className="text-[11px] text-[#6b7280] font-medium mt-1">
          Today
        </span>
      </div>

      {/* Card 5: AT RISK */}
      <div className="bg-white rounded-md p-3.5 border border-red-200 bg-red-50/20 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
            AT RISK
          </span>
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-red-700">{atRiskCount}</span>
        </div>
        <span className="text-[11px] text-red-600 font-medium mt-1">
          Require attention
        </span>
      </div>
    </div>
  );
};
