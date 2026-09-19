import React from 'react';
import { AlertTriangle, Flame, Truck, BrainCircuit, WifiOff, ArrowRight } from 'lucide-react';
import type { AttentionItem } from '../../../types/dashboard';

interface AttentionRequiredProps {
  items: AttentionItem[];
  onSelectAlert: (alert: AttentionItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const AttentionRequired: React.FC<AttentionRequiredProps> = ({
  items,
  onSelectAlert,
  onNavigateTab,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Attention Required ({items.length})</h3>
        </div>
        <button
          onClick={() => onNavigateTab('Alerts')}
          className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
        >
          View All Alerts <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {items.map((item) => {
          let bg = 'bg-slate-50 border-slate-200 text-slate-800';
          let icon = <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0" />;

          if (item.severity === 'CRITICAL') {
            bg = 'bg-red-50/80 border-red-200 text-red-950';
            icon = <Flame className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />;
          } else if (item.severity === 'HIGH') {
            bg = 'bg-amber-50/80 border-amber-200 text-amber-950';
            icon = <Truck className="w-4 h-4 text-amber-600 shrink-0" />;
          } else if (item.entityType === 'PREDICTION') {
            bg = 'bg-purple-50/80 border-purple-200 text-purple-950';
            icon = <BrainCircuit className="w-4 h-4 text-purple-600 shrink-0" />;
          } else if (item.entityType === 'SENSOR') {
            bg = 'bg-slate-100 border-slate-300 text-slate-800';
            icon = <WifiOff className="w-4 h-4 text-slate-600 shrink-0" />;
          }

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${bg}`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {icon}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold leading-tight truncate">{item.title}</span>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug font-medium truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectAlert(item)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-xs"
              >
                Review
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
