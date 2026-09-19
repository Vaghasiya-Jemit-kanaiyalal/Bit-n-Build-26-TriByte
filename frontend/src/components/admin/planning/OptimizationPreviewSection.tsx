import React from 'react';
import { Sparkles } from 'lucide-react';
import type { OptimizationPreview, OptimizationStrategy } from '../../../types/planning';

interface OptimizationPreviewSectionProps {
  optimization: OptimizationPreview;
  strategy: OptimizationStrategy;
  onStrategyChange: (strategy: OptimizationStrategy) => void;
  onWeightChange: (factor: keyof OptimizationPreview['weights'], value: number) => void;
}

export const OptimizationPreviewSection: React.FC<OptimizationPreviewSectionProps> = ({
  optimization,
  strategy,
  onStrategyChange,
  onWeightChange,
}) => {
  const dist = optimization.weights.distancePct ?? optimization.weights.distanceWeight ?? 30;
  const cap = optimization.weights.capacityPct ?? optimization.weights.capacityWeight ?? 25;
  const prio = optimization.weights.priorityPct ?? optimization.weights.priorityWeight ?? 25;
  const time = optimization.weights.timePct ?? optimization.weights.timeWeight ?? 20;

  const totalWeight = dist + cap + prio + time;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-emerald-400" />
              Optimization Factors & Objective
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Simulated AI Solver
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Tune algorithmic weights and select optimization objectives prior to generating routes.
          </p>
        </div>

        {/* Strategy Selector */}
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {(['Shortest Distance', 'Minimum Collection Time', 'Maximum Capacity Utilization', 'Balanced'] as OptimizationStrategy[]).map(
            (opt) => (
              <button
                key={opt}
                onClick={() => onStrategyChange(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  strategy === opt
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt}
              </button>
            )
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Sliders */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Factor Weights Allocation</h4>
            <span className={`text-xs font-mono font-bold ${totalWeight === 100 ? 'text-emerald-700' : 'text-red-600'}`}>
              Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
            </span>
          </div>

          {/* Distance */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Distance Factor Weight</span>
              <span className="font-mono font-bold text-slate-900">{dist}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={dist}
              onChange={(e) => onWeightChange('distancePct', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Capacity Factor Weight</span>
              <span className="font-mono font-bold text-slate-900">{cap}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={cap}
              onChange={(e) => onWeightChange('capacityPct', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Bin Urgency Priority Weight</span>
              <span className="font-mono font-bold text-slate-900">{prio}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={prio}
              onChange={(e) => onWeightChange('priorityPct', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Time */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Time Window Weight</span>
              <span className="font-mono font-bold text-slate-900">{time}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={time}
              onChange={(e) => onWeightChange('timePct', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

        </div>

        {/* RIGHT: Metric Preview Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Simulated Route Projections</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-medium text-slate-500 block">Est. Generated Routes</span>
                <span className="text-lg font-bold font-mono text-slate-900">{optimization.estimatedRoutes}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-medium text-slate-500 block">Est. Total Distance</span>
                <span className="text-lg font-bold font-mono text-emerald-800">{optimization.estimatedDistanceKm} km</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-medium text-slate-500 block">Est. Shift Duration</span>
                <span className="text-lg font-bold font-mono text-slate-900">{optimization.estimatedDurationHours || optimization.estimatedDurationHoursMin}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] font-medium text-slate-500 block">Waste Collected</span>
                <span className="text-lg font-bold font-mono text-emerald-800">{optimization.expectedWasteCollectedTons} t</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Capacity Utilization</span>
              <span className="font-mono font-bold text-slate-800">{optimization.capacityUtilizationPct ?? optimization.capacityUtilizationPercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Priority Coverage</span>
              <span className="font-mono font-bold text-emerald-700">{optimization.priorityCoveragePct ?? optimization.priorityCoveragePercent}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Unassigned Bins</span>
              <span className="font-mono font-bold text-slate-800">{optimization.unassignedBins}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
