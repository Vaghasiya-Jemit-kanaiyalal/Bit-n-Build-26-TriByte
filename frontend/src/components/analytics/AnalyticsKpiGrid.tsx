import React from 'react';
import { Scale, Activity, CheckCircle2, Recycle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import type { AnalyticsSummaryData } from '../../mock/analyticsMockData';

interface AnalyticsKpiGridProps {
  summary: AnalyticsSummaryData;
  comparePeriod: string;
}

export const AnalyticsKpiGrid: React.FC<AnalyticsKpiGridProps> = ({ summary, comparePeriod }) => {
  const cards = [
    {
      id: 'collected',
      label: 'TOTAL WASTE COLLECTED',
      value: `${summary.totalWasteCollectedTons.toLocaleString()} t`,
      trend: summary.totalWasteCollectedTrend,
      subtext: `vs ${comparePeriod.toLowerCase()}`,
      icon: Scale,
      isPositiveGood: true,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border-emerald-200/80',
      topAccent: 'bg-emerald-500',
    },
    {
      id: 'daily',
      label: 'AVERAGE DAILY WASTE',
      value: `${summary.averageDailyWasteTons} t/day`,
      trend: summary.averageDailyWasteTrend,
      subtext: `30-day rolling avg`,
      icon: Activity,
      isPositiveGood: true,
      iconColor: 'text-blue-700',
      iconBg: 'bg-blue-50 border-blue-200/80',
      topAccent: 'bg-blue-500',
    },
    {
      id: 'efficiency',
      label: 'COLLECTION EFFICIENCY',
      value: `${summary.collectionEfficiencyRate}%`,
      trend: summary.collectionEfficiencyTrend,
      subtext: `Target 90.0%`,
      icon: CheckCircle2,
      isPositiveGood: true,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50 border-emerald-200/80',
      topAccent: 'bg-emerald-600',
    },
    {
      id: 'recovery',
      label: 'RECYCLABLE RECOVERY',
      value: `${summary.recyclableRecoveryRate}%`,
      trend: summary.recyclableRecoveryTrend,
      subtext: `132.1 t diverted`,
      icon: Recycle,
      isPositiveGood: true,
      iconColor: 'text-teal-700',
      iconBg: 'bg-teal-50 border-teal-200/80',
      topAccent: 'bg-teal-500',
    },
    {
      id: 'overflow',
      label: 'OVERFLOW EVENTS',
      value: `${summary.overflowEventsCount}`,
      trend: summary.overflowEventsTrend, // -14.3% is good for overflow!
      subtext: `11 unpredicted`,
      icon: AlertTriangle,
      isPositiveGood: false, // For overflow, negative trend is good!
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50 border-amber-200/80',
      topAccent: 'bg-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => {
        const IconComp = card.icon;
        const isUp = card.trend >= 0;
        const isGood = card.isPositiveGood ? isUp : !isUp;
        const trendColorClass = isGood ? 'text-emerald-800 bg-emerald-50 border-emerald-200/80' : 'text-amber-800 bg-amber-50 border-amber-200/80';

        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group"
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.topAccent}`} />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {card.label}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {card.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.iconBg} shadow-2xs group-hover:scale-105 transition-transform`}>
                <IconComp className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold border ${trendColorClass}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3 text-emerald-700" />}
                <span>{isUp ? `+${card.trend}%` : `${card.trend}%`}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[110px]">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsKpiGrid;
