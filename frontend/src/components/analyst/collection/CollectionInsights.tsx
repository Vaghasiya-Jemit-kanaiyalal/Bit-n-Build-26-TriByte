import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { CollectionInsightItem } from '../../../services/collectionAnalyticsService';

interface CollectionInsightsProps {
  insights: CollectionInsightItem[];
}

export const CollectionInsights: React.FC<CollectionInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold tracking-tight">Collection Operational Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.slice(0, 3).map((item) => {
          const IconComp =
            item.type === 'POSITIVE'
              ? CheckCircle2
              : item.type === 'WARNING'
              ? AlertTriangle
              : Info;
          const badgeColor =
            item.type === 'POSITIVE'
              ? 'text-emerald-400 bg-emerald-500/20'
              : item.type === 'WARNING'
              ? 'text-amber-400 bg-amber-500/20'
              : 'text-blue-300 bg-blue-500/20';

          return (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${badgeColor}`}>
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-100 truncate">{item.title}</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionInsights;
