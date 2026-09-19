import React from 'react';
import type { BottleneckItem } from '../../mock/analyticsMockData';

interface OperationalBottlenecksProps {
  bottlenecks: BottleneckItem[];
  onNavigateTab?: (tabName: string) => void;
}

export const OperationalBottlenecks: React.FC<OperationalBottlenecksProps> = ({
  bottlenecks,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Operational Bottlenecks & Attention Areas</h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ANALYTIC OBSERVATION
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            System-detected operational friction points requiring administrative intervention
          </p>
        </div>
      </div>

      {/* Grid of Bottleneck Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bottlenecks.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-lg flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-extrabold text-amber-700">{item.id}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                  item.impact === 'High'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {item.impact} Impact
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight m-0">{item.problem}</h4>
              <span className="text-[11px] text-slate-600 font-medium block mt-0.5">{item.affectedEntity}</span>
            </div>

            <div className="p-2 bg-white rounded border border-slate-100 text-[11px] text-slate-700">
              <strong className="text-slate-900 font-bold block mb-0.5">Metric: {item.metric}</strong>
              <span className="text-slate-500">Action: {item.actionRequired}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default OperationalBottlenecks;
