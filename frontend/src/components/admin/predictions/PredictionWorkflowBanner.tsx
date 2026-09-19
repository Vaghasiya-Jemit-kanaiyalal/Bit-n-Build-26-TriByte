import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const PredictionWorkflowBanner: React.FC = () => {
  const steps = [
    { title: '1. Historical Data', status: 'COMPLETED', subtitle: '30-day baseline' },
    { title: '2. Forecast Engine', status: 'COMPLETED', subtitle: 'v1.0 active' },
    { title: '3. Risk Detection', status: 'CURRENT', subtitle: '14 bins flagged' },
    { title: '4. Collection Demand', status: 'READY', subtitle: '42 bins queued' },
    { title: '5. Planning Rec.', status: 'READY', subtitle: 'Action items ready' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'COMPLETED';
          const isCurrent = step.status === 'CURRENT';
          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-[#064e3b] text-white ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isCurrent ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{step.subtitle}</span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
