import React from 'react';
import { Recycle, PackageCheck, ShieldCheck, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { RecyclingKpiData } from '../../../services/recyclingAnalyticsService';

interface RecyclingAnalyticsKpisProps {
  kpis: RecyclingKpiData;
}

export const RecyclingAnalyticsKpis: React.FC<RecyclingAnalyticsKpisProps> = ({ kpis }) => {
  const cards = [
    {
      label: 'Recycling Diversion Rate',
      value: `${kpis.recyclingDiversionRate}%`,
      trend: kpis.diversionTrend,
      trendText: 'landfill diversion',
      icon: Recycle,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      label: 'Recyclable Waste Collected',
      value: `${kpis.recyclableWasteTons} Tons`,
      trend: kpis.recyclableWasteTrend,
      trendText: 'clean stream mass',
      icon: PackageCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Recovery Purity Rate',
      value: `${kpis.recoveryRate}%`,
      trend: kpis.recoveryTrend,
      trendText: 'sorting recovery',
      icon: ShieldCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'CO₂ Emission Saved',
      value: `${kpis.co2SavedTons} Tons`,
      trend: kpis.co2SavedTrend,
      trendText: 'greenhouse gas offset',
      icon: Sparkles,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
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

export default RecyclingAnalyticsKpis;
