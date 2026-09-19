import React from 'react';
import { Trash2, CheckCircle2, AlertTriangle, AlertCircle, WifiOff } from 'lucide-react';
import type { BinKpiSummary } from '../../../types/bin';

interface BinKpiGridProps {
  summary: BinKpiSummary;
}

export const BinKpiGrid: React.FC<BinKpiGridProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. TOTAL BINS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            TOTAL BINS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {summary.totalBins}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              +12 this month
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Monitored smart units
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {/* 2. ACTIVE BINS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            ACTIVE BINS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {summary.activeBins}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              {summary.activePercent}%
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Operational telemetry
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 text-[#047857]" />
        </div>
      </div>

      {/* 3. NEEDING COLLECTION */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            NEEDING COLLECTION
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 leading-none">
              {summary.needingCollection}
            </span>
            <span className="text-[10px] font-bold text-amber-700">
              {summary.needingCollectionPercent}% of total
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Fill level &gt; 75%
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* 4. CRITICAL */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            CRITICAL
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600 leading-none">
              {summary.criticalBins}
            </span>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded border border-red-100">
              &lt; 6h overflow
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Urgent action required
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
      </div>

      {/* 5. OFFLINE */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between col-span-2 md:col-span-1">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
            OFFLINE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-700 leading-none">
              {summary.offlineBins}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Needs check
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            No sensor heartbeat
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
          <WifiOff className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
