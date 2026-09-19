import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { BinKpiSummary } from '../../../types/bin';

interface BinNetworkOverviewProps {
  summary: BinKpiSummary;
  onNavigateToMonitoring?: () => void;
}

export const BinNetworkOverview: React.FC<BinNetworkOverviewProps> = ({
  summary: _summary,
  onNavigateToMonitoring,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Bin Network Overview</h3>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Real-time fill distribution across 248 municipal smart bins.
          </p>
        </div>

        {onNavigateToMonitoring && (
          <button
            onClick={onNavigateToMonitoring}
            className="text-xs font-bold text-[#047857] hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
          >
            <span>Open Full Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid: Left Zone Fill Strip, Right Simulated Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Zone Fill Status Cards (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Central Zone</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-slate-900">52 Bins</span>
              <span className="text-xs font-bold text-amber-600">71% Avg</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">North Zone</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-slate-900">41 Bins</span>
              <span className="text-xs font-bold text-emerald-600">64% Avg</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Industrial Zone</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-slate-900">35 Bins</span>
              <span className="text-xs font-bold text-red-600">86% Avg</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Residential Zone</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono font-bold text-slate-900">35 Bins</span>
              <span className="text-xs font-bold text-emerald-600">73% Avg</span>
            </div>
          </div>
        </div>

        {/* Simulated Map Graphic (7 cols) */}
        <div className="lg:col-span-7 relative h-32 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-3">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')`,
            }}
          />

          {/* Map Pins */}
          <div className="absolute top-4 left-8 bg-emerald-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            Central 71%
          </div>
          <div className="absolute top-3 right-12 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow animate-pulse">
            Industrial 86%
          </div>
          <div className="absolute bottom-4 left-24 bg-emerald-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            North 64%
          </div>
          <div className="absolute bottom-3 right-8 bg-amber-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            East 79%
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-slate-700 shadow-lg">
              Simulated Municipal Waste Network Map
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
