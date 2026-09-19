import React from 'react';
import { Trash2, CheckCircle2, Recycle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import type { AreaKpiData } from '../../../services/areaAnalysisService';

interface AreaAnalysisKpisProps {
  kpis: AreaKpiData;
}

export const AreaAnalysisKpis: React.FC<AreaAnalysisKpisProps> = ({ kpis }) => {
  const cards = [
    {
      label: 'Total Waste Generated',
      value: `${kpis.totalWasteTons} Tons`,
      trend: kpis.totalWasteTrend,
      trendText: 'vs previous period',
      icon: Trash2,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
    },
    {
      label: 'Collection Efficiency',
      value: `${kpis.collectionEfficiency}%`,
      trend: kpis.efficiencyTrend,
      trendText: 'pickup performance',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Recycling Rate',
      value: `${kpis.recyclingRate}%`,
      trend: kpis.recyclingTrend,
      trendText: 'waste diversion',
      icon: Recycle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Overflow Rate',
      value: `${kpis.overflowRate}%`,
      trend: kpis.overflowTrend,
      trendText: 'overflow incident rate',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const isPositive = c.trend >= 0;
        return (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
              <div className={`p-2 rounded-xl ${c.bg} ${c.color} border ${c.border}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mb-2">{c.value}</div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`inline-flex items-center font-bold ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPositive ? `+${c.trend}%` : `${c.trend}%`}
              </span>
              <span className="text-slate-400 font-medium">{c.trendText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AreaAnalysisKpis;
