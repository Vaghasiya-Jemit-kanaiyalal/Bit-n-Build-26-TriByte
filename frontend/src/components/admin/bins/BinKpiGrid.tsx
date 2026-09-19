import React from 'react';
import { Trash2, CheckCircle2, AlertTriangle, AlertCircle, WifiOff } from 'lucide-react';
import type { BinKpiSummary } from '../../../types/bin';

interface BinKpiGridProps {
  summary: BinKpiSummary;
}

export const BinKpiGrid: React.FC<BinKpiGridProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. TOTAL BINS */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Total Bins
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Trash2 className="w-4 h-4 text-slate-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{summary.totalBins}</span>
            <span className="text-[10px] font-bold text-emerald-600">+12/mo</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Monitored units</span>
        </div>
      </div>

      {/* 2. ACTIVE BINS */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Active Bins
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{summary.activeBins}</span>
            <span className="text-[10px] font-bold text-emerald-600">{summary.activePercent}%</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Live telemetry</span>
        </div>
      </div>

      {/* 3. NEEDING COLLECTION */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Needs Pickup
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight font-mono leading-none">{summary.needingCollection}</span>
            <span className="text-[10px] font-bold text-amber-700">{summary.needingCollectionPercent}%</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Fill &gt; 75%</span>
        </div>
      </div>

      {/* 4. CRITICAL */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-black text-red-800 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Critical
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-700 tracking-tight font-mono leading-none">{summary.criticalBins}</span>
            <span className="text-[10px] font-bold text-red-600">&lt;6h overflow</span>
          </div>
          <span className="text-[10px] font-bold text-red-600 mt-1 leading-tight block">Urgent pickup</span>
        </div>
      </div>

      {/* 5. OFFLINE */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full col-span-2 md:col-span-1">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Offline
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
            <WifiOff className="w-4 h-4 text-slate-500" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-700 tracking-tight font-mono leading-none">{summary.offlineBins}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Check sensor</span>
        </div>
      </div>
    </div>
  );
};
