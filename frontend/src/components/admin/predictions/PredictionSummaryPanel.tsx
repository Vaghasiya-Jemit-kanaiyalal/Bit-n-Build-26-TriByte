import React from 'react';
import { Sparkles, Clock, AlertTriangle, Flame, Weight, MapPin, Award } from 'lucide-react';
import type { PredictionSummaryData } from '../../../types/prediction';

interface PredictionSummaryPanelProps {
  summary: PredictionSummaryData;
}

export const PredictionSummaryPanel: React.FC<PredictionSummaryPanelProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Title & Badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 m-0">Prediction Summary</h3>
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>AI Forecast — Simulated</span>
        </span>
      </div>

      {/* Metric Breakdown Items */}
      <div className="space-y-2.5">
        {/* Next 6 Hours */}
        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Next 6 Hours</span>
          </div>
          <span className="text-xs font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
            {summary.next6hWarningCount} bins approaching warning
          </span>
        </div>

        {/* Next 12 Hours */}
        <div className="p-2.5 bg-red-50/70 rounded-xl border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Next 12 Hours</span>
          </div>
          <span className="text-xs font-extrabold text-red-900 bg-red-200/80 px-2 py-0.5 rounded-md">
            {summary.next12hCriticalCount} bins approaching critical
          </span>
        </div>

        {/* Next 24 Hours */}
        <div className="p-2.5 bg-red-100/60 rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Next 24 Hours</span>
          </div>
          <span className="text-xs font-extrabold text-red-950 bg-red-300/80 px-2 py-0.5 rounded-md">
            {summary.next24hOverflowCount} predicted overflow events
          </span>
        </div>

        {/* Expected Waste */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Expected Waste</span>
          </div>
          <span className="text-xs font-extrabold text-slate-900 font-mono">
            {summary.expectedWasteTons} tons
          </span>
        </div>

        {/* Peak Demand */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Peak Demand Window</span>
          </div>
          <span className="text-xs font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
            {summary.peakDemandWindow}
          </span>
        </div>

        {/* Highest Risk Zone */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Highest Risk Zone</span>
          </div>
          <span className="text-xs font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
            {summary.highestRiskZone}
          </span>
        </div>

        {/* Average Confidence */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Average Confidence</span>
          </div>
          <span className="text-xs font-extrabold text-emerald-800 font-mono">
            {summary.averageConfidence}%
          </span>
        </div>
      </div>
    </div>
  );
};
