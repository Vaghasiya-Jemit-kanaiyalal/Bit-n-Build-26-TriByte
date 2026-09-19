import React from 'react';
import { BellRing, ShieldAlert, Clock, CheckCircle2, Cpu } from 'lucide-react';

interface AlertKpiGridProps {
  stats: {
    active: number;
    critical: number;
    unacknowledged: number;
    resolvedToday: number;
    aiAlerts: number;
  };
  activeKpiFilter?: string;
  onSelectKpiFilter: (filterKey: string) => void;
}

export const AlertKpiGrid: React.FC<AlertKpiGridProps> = ({
  stats,
  activeKpiFilter,
  onSelectKpiFilter,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {/* Card 1: ACTIVE ALERTS */}
      <div
        onClick={() => onSelectKpiFilter('ACTIVE')}
        className={`bg-white rounded-xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-500 h-full ${
          activeKpiFilter === 'ACTIVE' ? 'border-emerald-600 ring-1 ring-emerald-500/30 bg-emerald-50/40' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Active Alerts
          </span>
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700 shrink-0">
            <BellRing className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{stats.active}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">+4 generated today</span>
        </div>
      </div>

      {/* Card 2: CRITICAL */}
      <div
        onClick={() => onSelectKpiFilter('CRITICAL')}
        className={`bg-white rounded-xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-red-400 h-full ${
          activeKpiFilter === 'CRITICAL' ? 'border-red-500 ring-1 ring-red-500/30 bg-red-50/40' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-black text-red-800 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Critical
          </span>
          <div className="p-1.5 bg-red-50 rounded-lg text-red-600 border border-red-100 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-red-700 tracking-tight font-mono leading-none">{stats.critical}</span>
          <span className="text-[10px] font-bold text-red-600 mt-1 leading-tight block">Immediate attention</span>
        </div>
      </div>

      {/* Card 3: UNACKNOWLEDGED */}
      <div
        onClick={() => onSelectKpiFilter('UNACKNOWLEDGED')}
        className={`bg-white rounded-xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-amber-400 h-full ${
          activeKpiFilter === 'UNACKNOWLEDGED' ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/40' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Unacknowledged
          </span>
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-100 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{stats.unacknowledged}</span>
          <span className="text-[10px] font-semibold text-amber-700 mt-1 leading-tight block">Awaiting review</span>
        </div>
      </div>

      {/* Card 4: RESOLVED TODAY */}
      <div
        onClick={() => onSelectKpiFilter('RESOLVED')}
        className={`bg-white rounded-xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-400 h-full ${
          activeKpiFilter === 'RESOLVED' ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/40' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Resolved Today
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{stats.resolvedToday}</span>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 leading-tight block">78% resolution rate</span>
        </div>
      </div>

      {/* Card 5: AI ALERTS */}
      <div
        onClick={() => onSelectKpiFilter('AI_PREDICTION')}
        className={`bg-white rounded-xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-500 h-full ${
          activeKpiFilter === 'AI_PREDICTION' ? 'border-emerald-600 ring-1 ring-emerald-500/30 bg-emerald-50/40' : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            AI Predictions
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{stats.aiAlerts}</span>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 leading-tight block">Predictive telemetry</span>
        </div>
      </div>
    </div>
  );
};

export default AlertKpiGrid;
