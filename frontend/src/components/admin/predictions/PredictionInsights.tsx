import React from 'react';
import { Sparkles, AlertTriangle, Clock, Lightbulb, Info } from 'lucide-react';
import type { PredictionInsight } from '../../../types/prediction';

interface PredictionInsightsProps {
  insights: PredictionInsight[];
}

export const PredictionInsights: React.FC<PredictionInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">AI Forecast Insights</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
          Simulated
        </span>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins) => {
          let bg = 'bg-slate-50 border-slate-200 text-slate-800';
          let icon = <Info className="w-4 h-4 text-blue-600 shrink-0" />;

          if (ins.type === 'ALERT') {
            bg = 'bg-red-50/80 border-red-200 text-red-950';
            icon = <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
          } else if (ins.type === 'WARNING') {
            bg = 'bg-amber-50/80 border-amber-200 text-amber-950';
            icon = <Clock className="w-4 h-4 text-amber-600 shrink-0" />;
          } else if (ins.type === 'OPPORTUNITY') {
            bg = 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
            icon = <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />;
          }

          return (
            <div key={ins.id} className={`p-3.5 rounded-xl border flex items-start gap-3 ${bg}`}>
              {icon}
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold leading-tight">{ins.title}</span>
                  <span className="text-[9px] font-bold opacity-60 shrink-0">{ins.timestamp}</span>
                </div>
                <p className="text-xs opacity-90 mt-1 leading-snug font-medium">{ins.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
