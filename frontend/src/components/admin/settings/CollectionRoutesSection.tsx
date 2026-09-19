import React from 'react';
import { Sliders } from 'lucide-react';
import type { CollectionRoutesSettings, RouteOptimizationFactors } from '../../../types/settings';

interface CollectionRoutesSectionProps {
  data: CollectionRoutesSettings;
  onChange: (data: CollectionRoutesSettings) => void;
}

export const CollectionRoutesSection: React.FC<CollectionRoutesSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof CollectionRoutesSettings, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const handleFactorChange = (factorKey: keyof RouteOptimizationFactors, val: number) => {
    const updatedFactors = { ...data.optimizationFactors, [factorKey]: val };
    onChange({ ...data, optimizationFactors: updatedFactors });
  };

  const totalWeight =
    data.optimizationFactors.distanceWeight +
    data.optimizationFactors.capacityWeight +
    data.optimizationFactors.priorityWeight +
    data.optimizationFactors.timeWeight;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Collection & Routes</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure vehicle route planning algorithms, capacity bounds, and optimization factor weights.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Enable Automated Route Optimization</span>
            <span className="text-[11px] text-slate-500">Use OR-Tools optimization engine for collection route generation</span>
          </div>
          <input
            type="checkbox"
            checked={data.routeOptimizationEnabled}
            onChange={(e) => handleChange('routeOptimizationEnabled', e.target.checked)}
            className="w-5 h-5 rounded text-[#047857] focus:ring-0 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Optimization Strategy</label>
            <select
              value={data.optimizationStrategy}
              onChange={(e) => handleChange('optimizationStrategy', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            >
              <option value="Balanced">Balanced (Distance + Time + Capacity)</option>
              <option value="Shortest Distance">Shortest Distance First</option>
              <option value="Minimum Time">Minimum Duration First</option>
              <option value="Maximum Capacity Utilization">Maximum Payload Fill</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Max Vehicle Capacity Limit (%)</label>
            <input
              type="number"
              min={70}
              max={100}
              value={data.maxCapacityUtilizationLimit}
              onChange={(e) => handleChange('maxCapacityUtilizationLimit', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Max Route Duration (Hours)</label>
            <input
              type="number"
              min={2}
              max={14}
              value={data.maxRouteDurationHours}
              onChange={(e) => handleChange('maxRouteDurationHours', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Max Stops Per Route</label>
            <input
              type="number"
              min={5}
              max={60}
              value={data.maxStopsPerRoute}
              onChange={(e) => handleChange('maxStopsPerRoute', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

        </div>

      </div>

      {/* Interactive Optimization Weight Factors Sliders */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#047857]" />
            <span>Route Optimization Factors Weight Allocation</span>
          </h3>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
            totalWeight === 100 ? 'bg-emerald-100 text-[#047857] border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Distance Minimization</span>
              <span className="font-mono text-[#047857]">{data.optimizationFactors.distanceWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.optimizationFactors.distanceWeight}
              onChange={(e) => handleFactorChange('distanceWeight', Number(e.target.value))}
              className="w-full accent-[#047857] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Capacity Payload Utilization</span>
              <span className="font-mono text-[#047857]">{data.optimizationFactors.capacityWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.optimizationFactors.capacityWeight}
              onChange={(e) => handleFactorChange('capacityWeight', Number(e.target.value))}
              className="w-full accent-[#047857] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Critical Bin Priority Weight</span>
              <span className="font-mono text-[#047857]">{data.optimizationFactors.priorityWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.optimizationFactors.priorityWeight}
              onChange={(e) => handleFactorChange('priorityWeight', Number(e.target.value))}
              className="w-full accent-[#047857] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Estimated Duration Minimization</span>
              <span className="font-mono text-[#047857]">{data.optimizationFactors.timeWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.optimizationFactors.timeWeight}
              onChange={(e) => handleFactorChange('timeWeight', Number(e.target.value))}
              className="w-full accent-[#047857] cursor-pointer"
            />
          </div>

        </div>
      </div>

    </div>
  );
};

export default CollectionRoutesSection;
