import React from 'react';
import type { ClassificationInsight } from '../../../types/classification';
import { Sparkles, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AIClassificationInsightsProps {
  insights: ClassificationInsight[];
}

export const AIClassificationInsights: React.FC<AIClassificationInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">AI Classification Insights</h3>
        </div>
        <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
          AI-assisted insight &bull; Simulated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins) => {
          const isWarn = ins.type === 'warning';
          const isPos = ins.type === 'positive';

          return (
            <div
              key={ins.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                isWarn
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : isPos
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}
            >
              <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-white/80 shadow-xs">
                {isWarn ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : isPos ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs leading-tight">{ins.title}</h4>
                  <span className="text-[10px] font-mono opacity-60 shrink-0">{ins.timestamp}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{ins.description}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                  <span className="font-semibold uppercase tracking-wider">{ins.category}</span>
                  <span className="font-bold">{ins.impact}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
