import React from 'react';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import type { AiForecastSummary } from '../../../types/dashboard';

interface AIForecastCardProps {
  forecast: AiForecastSummary;
  onNavigateTab: (tab: string) => void;
}

export const AIForecastCard: React.FC<AIForecastCardProps> = ({ forecast, onNavigateTab }) => {
  const maxVal = 10;

  return (
    <div
      onClick={() => onNavigateTab('Predictions')}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">AI Collection Forecast</h3>
        </div>
        <span className="text-xs font-bold text-purple-700 group-hover:underline flex items-center gap-1">
          View Predictions <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Exp. Waste</span>
          <span className="font-mono font-extrabold text-slate-900">{forecast.expectedWasteTons} t</span>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Exp. Demand</span>
          <span className="font-mono font-extrabold text-blue-700">{forecast.expectedCollectionDemandBins} bins</span>
        </div>
        <div className="p-2 bg-red-50/70 rounded-xl border border-red-100">
          <span className="text-[10px] uppercase font-bold text-red-700 block">Pred. Overflow</span>
          <span className="font-mono font-extrabold text-red-700">{forecast.predictedOverflowBins} bins</span>
        </div>
        <div className="p-2 bg-emerald-50/70 rounded-xl border border-emerald-100">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Confidence</span>
          <span className="font-mono font-extrabold text-emerald-800">{forecast.predictionConfidence}%</span>
        </div>
      </div>

      {/* Mini Trend Line Chart Canvas */}
      <div className="relative w-full h-28 bg-slate-50 rounded-xl p-3 border border-slate-200 mt-3 flex items-end justify-between gap-2">
        {forecast.trendPoints.map((pt, idx) => {
          const height = (pt.predictedWasteTons / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                style={{ height: `${height}%` }}
                className="w-full max-w-[20px] bg-purple-600 rounded-t-xs hover:bg-purple-500 transition-all relative group-hover:bg-purple-500"
              />
              <span className="text-[9px] font-bold text-slate-500 mt-1">{pt.timeLabel}</span>
            </div>
          );
        })}
      </div>

      {/* AI Insight Box */}
      <div className="mt-3 p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-purple-900">AI Insight</span>
          <p className="text-xs text-slate-700 font-medium leading-snug mt-0.5">{forecast.aiInsightText}</p>
        </div>
      </div>
    </div>
  );
};
