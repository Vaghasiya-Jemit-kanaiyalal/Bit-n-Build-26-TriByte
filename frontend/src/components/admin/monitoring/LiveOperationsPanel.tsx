import React, { useState } from 'react';
import type { LiveActivityEvent, EventSeverity } from '../../../types/monitoring';
import { Activity, AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

interface LiveOperationsPanelProps {
  activities: LiveActivityEvent[];
}

export const LiveOperationsPanel: React.FC<LiveOperationsPanelProps> = ({ activities }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<EventSeverity | 'All'>('All');

  const filtered = activities.filter((a) => {
    if (selectedSeverity === 'All') return true;
    return a.severity === selectedSeverity;
  });

  const getSeverityBadge = (severity: EventSeverity) => {
    if (severity === 'critical') {
      return {
        bg: 'bg-red-50 text-red-800 border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
      };
    }
    if (severity === 'warning') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: ShieldAlert,
        iconColor: 'text-amber-600',
      };
    }
    if (severity === 'success') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
      };
    }
    return {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Activity &amp; Telemetry Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 animate-pulse">
          REAL-TIME FEED
        </span>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedSeverity('All')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
            selectedSeverity === 'All'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Events ({activities.length})
        </button>
        <button
          onClick={() => setSelectedSeverity('critical')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
            selectedSeverity === 'critical'
              ? 'bg-red-700 text-white border-red-700'
              : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setSelectedSeverity('warning')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
            selectedSeverity === 'warning'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          Warnings
        </button>
      </div>

      {/* Activity Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
        {filtered.map((act) => {
          const badge = getSeverityBadge(act.severity);
          const Icon = badge.icon;
          return (
            <div
              key={act.id}
              className={`p-2.5 rounded-xl border ${badge.bg} transition-all hover:shadow-xs flex items-start gap-2.5`}
            >
              <div className="p-1 rounded-md bg-white/80 shrink-0 mt-0.5">
                <Icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-mono text-[11px] font-extrabold text-slate-900">
                    {act.entityId}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium leading-tight">{act.message}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">{act.location}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
