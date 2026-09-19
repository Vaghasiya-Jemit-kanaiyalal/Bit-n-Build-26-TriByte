import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface PlanningWorkflowBannerProps {
  currentStage: number; // e.g. 4
}

export const PlanningWorkflowBanner: React.FC<PlanningWorkflowBannerProps> = ({ currentStage }) => {
  const steps = [
    { id: 1, label: 'Demand', status: currentStage > 1 ? 'completed' : currentStage === 1 ? 'current' : 'pending' },
    { id: 2, label: 'Priorities', status: currentStage > 2 ? 'completed' : currentStage === 2 ? 'current' : 'pending' },
    { id: 3, label: 'Capacity', status: currentStage > 3 ? 'completed' : currentStage === 3 ? 'current' : 'pending' },
    { id: 4, label: 'Constraints', status: currentStage > 4 ? 'completed' : currentStage === 4 ? 'current' : 'pending' },
    { id: 5, label: 'Optimization', status: currentStage > 5 ? 'completed' : currentStage === 5 ? 'current' : 'pending' },
    { id: 6, label: 'Review', status: currentStage > 6 ? 'completed' : currentStage === 6 ? 'current' : 'pending' },
  ];

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-3 mb-4 shadow-2xs overflow-x-auto">
      <div className="flex items-center justify-between min-w-max space-x-2">
        {steps.map((st, idx) => (
          <React.Fragment key={st.id}>
            <div className="flex items-center space-x-2 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  st.status === 'completed'
                    ? 'bg-[#047857] text-white'
                    : st.status === 'current'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {st.status === 'completed' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.id}
              </div>
              <div>
                <span className={`font-bold block leading-tight ${
                  st.status === 'completed' || st.status === 'current' ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {st.label}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-mono">
                  {st.status === 'completed' ? 'Done ✓' : st.status === 'current' ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PlanningWorkflowBanner;
