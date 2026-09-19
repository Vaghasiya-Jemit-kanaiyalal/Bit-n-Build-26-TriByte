import React from 'react';
import { Radio, Wifi, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import type { BinKpiSummary } from '../../../types/bin';

interface NetworkHealthProps {
  summary: BinKpiSummary;
  onNavigateToMonitoring?: () => void;
}

export const NetworkHealth: React.FC<NetworkHealthProps> = ({
  summary,
  onNavigateToMonitoring,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Network Health Metrics */}
      <div className="flex items-center gap-6 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#047857] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Operational</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">95.2%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Connectivity</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">94.7%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Critical Bins</span>
            <span className="font-mono font-extrabold text-red-600 text-sm">{summary.criticalBins}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-6 hidden lg:flex">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Fill Level</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">{summary.avgFillPercent}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-6 hidden xl:flex">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Overflow &lt; 6h</span>
            <span className="font-mono font-extrabold text-amber-600 text-sm">14 bins</span>
          </div>
        </div>
      </div>

      {/* Right Link */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
          <Radio className="w-3 h-3 inline text-emerald-500 mr-1 animate-pulse" />
          Live Telemetry Active
        </span>

        {onNavigateToMonitoring && (
          <button
            onClick={onNavigateToMonitoring}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
          >
            <span>Open Full Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#047857]" />
          </button>
        )}
      </div>
    </div>
  );
};
