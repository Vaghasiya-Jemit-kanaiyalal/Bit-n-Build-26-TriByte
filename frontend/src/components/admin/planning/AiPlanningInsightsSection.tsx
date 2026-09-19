import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { PlanningInsight } from '../../../types/planning';

interface AiPlanningInsightsSectionProps {
  insights: PlanningInsight[];
  onNavigate: (tab: string) => void;
}

export const AiPlanningInsightsSection: React.FC<AiPlanningInsightsSectionProps> = ({
  insights,
  onNavigate,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold tracking-tight text-white">AI Operational Planning Insights</h3>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Simulated AI Intelligence
        </span>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => {
          const score = item.confidenceScore ?? 94;

          return (
            <div key={item.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-emerald-400 font-mono">{item.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">Confidence: {score}%</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Links */}
      <div className="pt-4 border-t border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Navigation Shortcuts</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => onNavigate('Routes')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold transition flex items-center space-x-1"
          >
            <span>View Routes</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={() => onNavigate('Monitoring')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold transition flex items-center space-x-1"
          >
            <span>View Monitoring</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={() => onNavigate('Alerts')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold transition flex items-center space-x-1"
          >
            <span>View Alerts</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={() => onNavigate('Vehicles')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold transition flex items-center space-x-1"
          >
            <span>View Vehicles</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={() => onNavigate('Bins')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-semibold transition flex items-center space-x-1"
          >
            <span>View Bins</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

    </div>
  );
};
