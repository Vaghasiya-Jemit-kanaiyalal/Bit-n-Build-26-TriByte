import React from 'react';
import { Activity, Flame, Truck, CheckCircle2, Clock, BrainCircuit } from 'lucide-react';
import type { LiveOperationEvent } from '../../../types/dashboard';

interface LiveOperationsFeedProps {
  events: LiveOperationEvent[];
}

export const LiveOperationsFeed: React.FC<LiveOperationsFeedProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Live Operations Feed</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
          Real-time Stream
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {events.map((evt) => {
          let icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
          let iconBg = 'bg-slate-100 text-slate-700';

          if (evt.type === 'VEHICLE') {
            icon = <Truck className="w-3.5 h-3.5 text-blue-600" />;
            iconBg = 'bg-blue-50 border-blue-100';
          } else if (evt.type === 'BIN') {
            icon = <Flame className="w-3.5 h-3.5 text-red-600" />;
            iconBg = 'bg-red-50 border-red-100';
          } else if (evt.type === 'COLLECTION') {
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
            iconBg = 'bg-emerald-50 border-emerald-100';
          } else if (evt.type === 'AI') {
            icon = <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />;
            iconBg = 'bg-purple-50 border-purple-100';
          }

          return (
            <div
              key={evt.id}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-start gap-3 hover:bg-slate-100/60 transition-colors"
            >
              <div className={`p-1.5 rounded-lg border shrink-0 ${iconBg}`}>{icon}</div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate">{evt.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{evt.timestamp}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5" dangerouslySetInnerHTML={{ __html: evt.subtitle }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
