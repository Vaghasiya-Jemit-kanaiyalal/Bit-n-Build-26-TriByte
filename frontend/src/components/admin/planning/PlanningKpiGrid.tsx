import React from 'react';
import { Trash2, AlertTriangle, Scale, Truck, ShieldCheck, Target } from 'lucide-react';
import type { PlanningSummaryData } from '../../../types/planning';

interface PlanningKpiGridProps {
  summary: PlanningSummaryData;
}

export const PlanningKpiGrid: React.FC<PlanningKpiGridProps> = ({ summary }) => {
  const cards = [
    {
      id: 'due',
      label: 'BINS DUE FOR COLLECTION',
      value: `${summary.priorityBins}`,
      sub: 'Action required today',
      icon: Trash2,
      color: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'overflow',
      label: 'PREDICTED OVERFLOW',
      value: `${summary.predictedOverflowBins}`,
      sub: '+4 vs yesterday &bull; Critical',
      icon: AlertTriangle,
      color: 'text-amber-700',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'waste',
      label: 'ESTIMATED WASTE',
      value: `${summary.expectedWasteTons} t`,
      sub: '+11.8% vs avg',
      icon: Scale,
      color: 'text-slate-900',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'required',
      label: 'REQUIRED CAPACITY',
      value: `${summary.requiredCapacityTons} t`,
      sub: 'Safety margin included',
      icon: Truck,
      color: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'available',
      label: 'AVAILABLE CAPACITY',
      value: `${summary.availableCapacityTons} t`,
      sub: '18 Active Vehicles',
      icon: ShieldCheck,
      color: 'text-[#047857]',
      iconBg: 'bg-emerald-50 text-[#047857] border-emerald-200',
    },
    {
      id: 'coverage',
      label: 'PLANNING COVERAGE',
      value: `${summary.planningCoveragePercent}%`,
      sub: '34 of 37 Bins',
      icon: Target,
      color: 'text-[#047857]',
      iconBg: 'bg-emerald-50 text-[#047857] border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const IconComp = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white rounded-xl p-3.5 border border-[#e5e7eb] shadow-2xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-md border ${card.iconBg}`}>
                <IconComp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <span className={`text-xl font-black font-mono tracking-tight block ${card.color}`}>
                {card.value}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5" dangerouslySetInnerHTML={{ __html: card.sub }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanningKpiGrid;
