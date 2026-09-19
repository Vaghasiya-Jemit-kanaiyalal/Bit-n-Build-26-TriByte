import React from 'react';

export const CollectionFunnel: React.FC = () => {
  const funnelStages = [
    { stage: 'Monitored Bins', count: 248, percentage: 100, color: 'bg-slate-800' },
    { stage: 'Bins Requiring Collection (>80%)', count: 37, percentage: 14.9, color: 'bg-[#047857]' },
    { stage: 'Assigned to Active Routes', count: 31, percentage: 12.5, color: 'bg-blue-600' },
    { stage: 'Collected by Fleet', count: 28, percentage: 11.2, color: 'bg-teal-600' },
    { stage: 'Completed & Depo Processed', count: 26, percentage: 10.5, color: 'bg-emerald-600' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Collection Pipeline Conversion Funnel</h3>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              CONVERSION PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Operational flow from bin monitoring to depot waste processing completion
          </p>
        </div>
      </div>

      {/* Funnel Stages Bars */}
      <div className="space-y-2.5">
        {funnelStages.map((st, idx) => (
          <div key={st.stage} className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 flex items-center space-x-2">
                <span className="font-mono text-slate-400 text-[10px]">0{idx + 1}.</span>
                <span>{st.stage}</span>
              </span>
              <div className="flex items-center space-x-3 font-mono">
                <strong className="text-slate-900">{st.count} Bins</strong>
                <span className="text-slate-500 text-[11px] font-semibold">({st.percentage}%)</span>
              </div>
            </div>

            {/* Funnel width bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex items-center">
              <div
                className={`h-full rounded-full transition-all duration-500 ${st.color}`}
                style={{ width: `${Math.max(10, st.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CollectionFunnel;
