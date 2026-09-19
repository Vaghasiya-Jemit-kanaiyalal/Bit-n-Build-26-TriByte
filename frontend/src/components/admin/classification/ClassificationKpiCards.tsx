import React from 'react';
import { Scale, Target, Recycle, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import type { ClassificationSummary } from '../../../types/classification';

interface ClassificationKpiCardsProps {
  summary: ClassificationSummary;
  onSelectCardTab?: (tab: string) => void;
}

export const ClassificationKpiCards: React.FC<ClassificationKpiCardsProps> = ({
  summary,
  onSelectCardTab,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. CLASSIFIED WASTE */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Classified Waste
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 leading-none font-mono">
              {summary.classifiedWeightTons}
            </span>
            <span className="text-xs font-bold text-slate-500">t</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            Total tonnage scanned
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-emerald-600">+4.8% vs last week</span>
          <span className="text-slate-400 font-mono">Simulated</span>
        </div>
      </div>

      {/* 2. CLASSIFICATION ACCURACY */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Accuracy
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-950 leading-none font-mono">
              {summary.accuracyPercent}%
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            High precision model
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-emerald-600">{summary.accuracyTrend}</span>
          <span className="text-slate-400 font-mono">Demo AI</span>
        </div>
      </div>

      {/* 3. RECYCLABLE WASTE */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Recyclable
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Recycle className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-700 leading-none font-mono">
              {summary.recyclablePercent}%
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            5.2 tons recoverable
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-blue-600">+1.5% target boost</span>
          <span className="text-slate-400 font-mono">Simulated</span>
        </div>
      </div>

      {/* 4. NON-RECYCLABLE */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Non-Recyclable
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-800 leading-none font-mono">
              {summary.nonRecyclablePercent}%
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            3.2 tons organic/other
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-slate-600">-0.8% waste reduction</span>
          <span className="text-slate-400 font-mono">Simulated</span>
        </div>
      </div>

      {/* 5. PENDING REVIEW */}
      <div
        onClick={() => onSelectCardTab && onSelectCardTab('Review Queue')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Pending Review
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-amber-700 leading-none font-mono">
              {summary.pendingReviewCount}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            Requires human audit
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-amber-700">Click to review</span>
          <span className="text-amber-600 font-semibold font-mono">Audit Queue</span>
        </div>
      </div>

      {/* 6. LOW CONFIDENCE */}
      <div
        onClick={() => onSelectCardTab && onSelectCardTab('Review Queue')}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-red-400 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Low Confidence
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-red-700 leading-none font-mono">
              {summary.lowConfidenceCount}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            Below 70% confidence
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="font-bold text-red-600">Threshold &lt; 70%</span>
          <span className="text-slate-400 font-mono">Simulated</span>
        </div>
      </div>
    </div>
  );
};
