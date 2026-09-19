import React from 'react';
import type { PlanningSummary } from '../../../types/planning';

interface PlanningStatusBarProps {
  summary: PlanningSummary;
}

export const PlanningStatusBar: React.FC<PlanningStatusBarProps> = ({ summary }) => {
  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className="text-slate-400 font-sans text-xs uppercase font-bold tracking-wider">Planning Status:</span>
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
          summary.status === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          summary.status === 'CALCULATING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          summary.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
          summary.status === 'CONFLICT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-slate-800 text-slate-300'
        }`}>
          {summary.status}
        </span>
      </div>

      {/* Metric Strips */}
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Bins Analyzed</span>
          <span className="font-bold text-white">{summary.binsAnalyzed}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Priority Bins</span>
          <span className="font-bold text-emerald-400">{summary.priorityBins}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Expected Waste</span>
          <span className="font-bold text-emerald-400">{summary.expectedWasteTons} t</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Required Cap.</span>
          <span className="font-bold text-white">{summary.requiredCapacityTons} t</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Available Cap.</span>
          <span className="font-bold text-emerald-400">{summary.availableCapacityTons} t</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Vehicles Avail.</span>
          <span className="font-bold text-white">{summary.vehiclesAvailable}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans uppercase">Drivers Avail.</span>
          <span className="font-bold text-white">{summary.driversAvailable}</span>
        </div>
      </div>

    </div>
  );
};
