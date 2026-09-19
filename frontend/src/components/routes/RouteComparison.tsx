import React from 'react';
import { Sparkles, TrendingDown } from 'lucide-react';

export const RouteComparison: React.FC = () => {
  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Badge & Context */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-[#738a62]/15 text-[#738a62] flex items-center justify-center shrink-0 border border-[#738a62]/30 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827] m-0">Route Optimization Comparison</h3>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                SIMULATED OPTIMIZATION PREVIEW
              </span>
            </div>
            <p className="text-xs text-[#6b7280] font-medium mt-0.5 m-0">
              Comparing baseline sequential dispatch with AI traveling-salesperson &amp; capacity-aware solver.
            </p>
          </div>
        </div>

        {/* Right Metric Comparison Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
          
          {/* Baseline */}
          <div className="bg-[#f9fafb] p-2.5 rounded border border-[#e5e7eb] flex flex-col">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase">Baseline Route</span>
            <div className="text-xs font-bold text-[#374151] mt-0.5">22.4 km &bull; 3h 48m</div>
            <span className="text-[10px] text-[#9ca3af]">18 stops scheduled</span>
          </div>

          {/* Optimized */}
          <div className="bg-emerald-50/80 p-2.5 rounded border border-emerald-200 flex flex-col">
            <span className="text-[10px] font-bold text-[#047857] uppercase">Optimized Preview</span>
            <div className="text-xs font-bold text-[#064e3b] mt-0.5">18.7 km &bull; 3h 12m</div>
            <span className="text-[10px] text-[#047857]">18 stops re-ordered</span>
          </div>

          {/* Net Savings */}
          <div className="bg-[#738a62]/10 p-2.5 rounded border border-[#738a62]/30 flex flex-col col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-[#5f7350] uppercase flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-[#738a62]" />
              <span>Projected Savings</span>
            </span>
            <div className="text-xs font-extrabold text-[#738a62] mt-0.5">-3.7 km (-16.5%)</div>
            <span className="text-[10px] text-[#5f7350] font-semibold">-36 min transit time</span>
          </div>

        </div>
      </div>
    </div>
  );
};
