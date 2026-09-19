import React from 'react';
import { Recycle, ArrowRight } from 'lucide-react';
import type { WasteCompositionSummary } from '../../../types/dashboard';

interface WasteCompositionCardProps {
  composition: WasteCompositionSummary;
  onNavigateTab: (tab: string) => void;
}

export const WasteCompositionCard: React.FC<WasteCompositionCardProps> = ({
  composition,
  onNavigateTab,
}) => {
  return (
    <div
      onClick={() => onNavigateTab('Classification')}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Recycle className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Waste Material Composition</h3>
        </div>
        <span className="text-xs font-bold text-teal-700 group-hover:underline flex items-center gap-1">
          View Classification <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Recyclable vs Non-Recyclable Callout Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-emerald-800">Recyclable ({composition.recyclablePercentage}%)</span>
          <span className="text-lg font-mono font-extrabold text-emerald-900 mt-0.5">{composition.estimatedRecyclableTons} t</span>
        </div>
        <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-600">Non-Recyclable ({composition.nonRecyclablePercentage}%)</span>
          <span className="text-lg font-mono font-extrabold text-slate-800 mt-0.5">{composition.estimatedNonRecyclableTons} t</span>
        </div>
      </div>

      {/* Categories Breakdown Horizontal Stacked Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          {composition.categories.map((cat, idx) => (
            <div
              key={idx}
              style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
              className="h-full"
              title={`${cat.category}: ${cat.percentage}%`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold text-slate-600 pt-1">
          {composition.categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="truncate">{cat.category}: <strong className="text-slate-900">{cat.percentage}%</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
