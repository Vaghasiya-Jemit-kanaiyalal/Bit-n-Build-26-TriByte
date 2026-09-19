import React from 'react';
import { Target, ArrowUpRight } from 'lucide-react';

interface CollectionPerformanceProps {
  onNavigateToRoutes?: () => void;
}

export const CollectionPerformance: React.FC<CollectionPerformanceProps> = ({ onNavigateToRoutes }) => {
  const metrics = [
    { label: 'Collection Completion', value: '91.4%', sub: 'Target 90.0%', isGood: true },
    { label: 'On-Time Collection', value: '92.0%', sub: 'Within scheduled SLA', isGood: true },
    { label: 'Avg Collection Time', value: '18 min', sub: 'Per bin stop', isGood: true },
    { label: 'Completed Stops', value: '1,248', sub: 'Past 30 days', isGood: true },
    { label: 'Missed Collections', value: '42', sub: 'Operational delays', isGood: false },
    { label: 'Avg Route Completion', value: '87.0%', sub: 'Full loop completion', isGood: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Collection Performance & SLA</h3>
            <span className="text-[10px] font-bold text-[#047857] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              OPERATIONAL SLA
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Completion rate, on-time delivery and stop efficiency against targets
          </p>
        </div>

        {onNavigateToRoutes && (
          <button
            onClick={onNavigateToRoutes}
            className="flex items-center space-x-1 text-xs font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none"
          >
            <span>View Routes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 6 Key Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              {m.label}
            </span>
            <span className={`text-lg font-black font-mono ${m.isGood ? 'text-slate-900' : 'text-amber-700'}`}>
              {m.value}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5 truncate">
              {m.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Target Comparison Bar */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-lg">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-[#047857]" />
            <span className="font-bold text-slate-900">Collection Completion vs Target (90%)</span>
          </div>
          <span className="font-bold font-mono text-[#047857]">91.4% (+1.4% above target)</span>
        </div>

        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          {/* Target marker line */}
          <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-slate-900 z-10" title="Target: 90%" />
          {/* Actual progress */}
          <div className="h-full bg-[#047857] rounded-full transition-all duration-500" style={{ width: '91.4%' }} />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1.5">
          <span>0%</span>
          <span>Target SLA: 90.0%</span>
          <span>100%</span>
        </div>
      </div>

    </div>
  );
};

export default CollectionPerformance;
