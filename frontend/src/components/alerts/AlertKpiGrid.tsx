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
        className={`bg-white rounded-md p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-[#738a62] ${
          activeKpiFilter === 'ACTIVE' ? 'border-[#738a62] ring-1 ring-[#738a62]/30 bg-slate-50/50' : 'border-[#e5e7eb]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            ACTIVE ALERTS
          </span>
          <div className="p-1 bg-slate-100 rounded text-slate-700">
            <BellRing className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{stats.active}</div>
          <span className="text-[11px] text-[#6b7280] font-medium">+4 generated today</span>
        </div>
      </div>

      {/* Card 2: CRITICAL */}
      <div
        onClick={() => onSelectKpiFilter('CRITICAL')}
        className={`bg-white rounded-md p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-red-400 ${
          activeKpiFilter === 'CRITICAL' ? 'border-red-500 ring-1 ring-red-500/30 bg-red-50/30' : 'border-[#e5e7eb]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
            CRITICAL
          </span>
          <div className="p-1 bg-red-50 rounded text-red-600 border border-red-100">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-red-700">{stats.critical}</div>
          <span className="text-[11px] text-red-600 font-semibold">Require immediate attention</span>
        </div>
      </div>

      {/* Card 3: UNACKNOWLEDGED */}
      <div
        onClick={() => onSelectKpiFilter('UNACKNOWLEDGED')}
        className={`bg-white rounded-md p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-amber-400 ${
          activeKpiFilter === 'UNACKNOWLEDGED' ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/30' : 'border-[#e5e7eb]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            UNACKNOWLEDGED
          </span>
          <div className="p-1 bg-amber-50 rounded text-amber-700 border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{stats.unacknowledged}</div>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting review</span>
        </div>
      </div>

      {/* Card 4: RESOLVED TODAY */}
      <div
        onClick={() => onSelectKpiFilter('RESOLVED')}
        className={`bg-white rounded-md p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-400 ${
          activeKpiFilter === 'RESOLVED' ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/30' : 'border-[#e5e7eb]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            RESOLVED TODAY
          </span>
          <div className="p-1 bg-emerald-50 rounded text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{stats.resolvedToday}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">78% resolution rate</span>
        </div>
      </div>

      {/* Card 5: AI ALERTS */}
      <div
        onClick={() => onSelectKpiFilter('AI_PREDICTION')}
        className={`bg-white rounded-md p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all hover:border-[#738a62] ${
          activeKpiFilter === 'AI_PREDICTION' ? 'border-[#738a62] ring-1 ring-[#738a62]/30 bg-emerald-50/40' : 'border-[#e5e7eb]'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#738a62] uppercase tracking-wider">
            AI ALERTS
          </span>
          <div className="p-1 bg-emerald-50 rounded text-[#738a62] border border-emerald-100">
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{stats.aiAlerts}</div>
          <span className="text-[11px] text-[#738a62] font-medium">Prediction-based alerts</span>
        </div>
      </div>
    </div>
  );
};

export default AlertKpiGrid;
