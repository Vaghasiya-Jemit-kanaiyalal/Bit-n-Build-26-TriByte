import React from 'react';
import { Flame, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import type { OverflowRiskDistribution } from '../../../types/prediction';

interface OverflowRiskOverviewProps {
  distribution: OverflowRiskDistribution;
}

export const OverflowRiskOverview: React.FC<OverflowRiskOverviewProps> = ({ distribution }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Critical Risk */}
      <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-red-950 uppercase tracking-wider">Critical Risk</span>
          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-red-700 leading-none">{distribution.critical.count}</span>
          <span className="text-xs font-semibold text-red-800 block mt-1">
            {distribution.critical.percentage}% of network &bull; {distribution.critical.expectedOverflow} expected overflows
          </span>
        </div>
      </div>

      {/* High Risk */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">High Risk</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-amber-800 leading-none">{distribution.high.count}</span>
          <span className="text-xs font-semibold text-amber-900 block mt-1">
            {distribution.high.percentage}% of network &bull; Avg conf: {distribution.high.avgConfidence}%
          </span>
        </div>
      </div>

      {/* Medium Risk */}
      <div className="bg-yellow-50/80 border border-yellow-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-yellow-950 uppercase tracking-wider">Medium Risk</span>
          <div className="w-8 h-8 rounded-xl bg-yellow-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Info className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-yellow-900 leading-none">{distribution.medium.count}</span>
          <span className="text-xs font-semibold text-yellow-950 block mt-1">
            {distribution.medium.percentage}% of network &bull; Monitoring queue
          </span>
        </div>
      </div>

      {/* Low Risk */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Low Risk</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-[#047857] leading-none">{distribution.low.count}</span>
          <span className="text-xs font-semibold text-emerald-800 block mt-1">
            {distribution.low.percentage}% of network &bull; Operating normally
          </span>
        </div>
      </div>
    </div>
  );
};
