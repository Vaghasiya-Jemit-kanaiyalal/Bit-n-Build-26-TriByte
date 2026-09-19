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
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Active Routes
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <Route className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{activeCount}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">
            8 vehicles active
          </span>
        </div>
      </div>

      {/* Card 2: PLANNED */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Planned
          </span>
          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-700 border border-blue-100 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{plannedCount}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">
            Scheduled today
          </span>
        </div>
      </div>

      {/* Card 3: IN PROGRESS */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            In Progress
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{inProgressCount}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">
            Collecting now
          </span>
        </div>
      </div>

      {/* Card 4: COMPLETED */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Completed
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{completedCount}</span>
          <span className="text-[10px] font-semibold text-emerald-600 mt-1 leading-tight block">
            Today
          </span>
        </div>
      </div>

      {/* Card 5: AT RISK */}
      <div className="bg-red-50/40 rounded-xl p-3.5 border border-red-200 shadow-2xs flex flex-col justify-between h-full col-span-2 md:col-span-1">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-black text-red-800 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            At Risk
          </span>
          <div className="p-1.5 bg-red-100 rounded-lg text-red-700 border border-red-200 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-red-700 tracking-tight font-mono leading-none">{atRiskCount}</span>
          <span className="text-[10px] font-bold text-red-600 mt-1 leading-tight block">
            Action required
          </span>
        </div>
      </div>
    </div>
  );
};
