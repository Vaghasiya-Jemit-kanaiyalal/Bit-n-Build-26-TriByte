import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import type { OperationalRecommendation } from '../../../types/prediction';

interface OperationalRecommendationsProps {
  recommendations: OperationalRecommendation[];
  onNavigate: (route: string) => void;
}

export const OperationalRecommendations: React.FC<OperationalRecommendationsProps> = ({
  recommendations,
  onNavigate,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#047857]" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Operational Recommendations</h3>
        </div>
        <span className="text-xs font-bold text-[#047857]">Action Ready</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recommendations.map((rec) => {
          let badgeColor = 'bg-slate-100 text-slate-700';
          if (rec.priority === 'CRITICAL') badgeColor = 'bg-red-100 text-red-700 font-extrabold';
          else if (rec.priority === 'HIGH') badgeColor = 'bg-amber-100 text-amber-800 font-bold';

          return (
            <div
              key={rec.id}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md inline-block mb-2 ${badgeColor}`}>
                  {rec.badge}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug m-0">{rec.title}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">{rec.description}</p>
              </div>

              <button
                onClick={() => onNavigate(rec.actionRoute)}
                className="w-full py-2 bg-white text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>{rec.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
