import React from 'react';
import { Activity, Cpu, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { ClassificationSummary } from '../../../types/classification';

interface ClassificationStatusBarProps {
  summary: ClassificationSummary;
}

export const ClassificationStatusBar: React.FC<ClassificationStatusBarProps> = ({ summary }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 px-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Engine Status */}
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Classification Engine</span>
            <span className="font-extrabold text-emerald-700 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {summary.engineStatus}
            </span>
          </div>
        </div>

        {/* Total Items Classified */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <Activity className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Items Classified</span>
            <span className="font-extrabold text-slate-900 font-mono text-[11px]">
              {summary.totalItemsClassified.toLocaleString()}
            </span>
          </div>
        </div>

        {/* High Confidence */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Confidence</span>
            <span className="font-extrabold text-emerald-800 font-mono text-[11px]">
              {summary.highConfidenceItems.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Review</span>
            <span className="font-extrabold text-amber-700 font-mono text-[11px]">
              {summary.pendingReviewCount}
            </span>
          </div>
        </div>

        {/* Low Confidence */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Confidence</span>
            <span className="font-extrabold text-red-700 font-mono text-[11px]">
              {summary.lowConfidenceCount}
            </span>
          </div>
        </div>

        {/* Last Model Sync */}
        <div className="hidden xl:flex items-center gap-2 border-l border-slate-200 pl-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Model Sync</span>
            <span className="font-mono text-[11px] text-slate-700 font-semibold">{summary.lastModelSync}</span>
          </div>
        </div>
      </div>

      {/* Simulated AI Badge */}
      <div className="flex items-center gap-2">
        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
          Demo / Simulated AI
        </span>
      </div>
    </div>
  );
};
