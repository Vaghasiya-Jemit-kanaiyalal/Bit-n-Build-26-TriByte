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
      iconColor: 'text-[#047857]',
      iconBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'daily',
      label: 'AVERAGE DAILY WASTE',
      value: `${summary.averageDailyWasteTons} t/day`,
      trend: summary.averageDailyWasteTrend,
      subtext: `30-day rolling avg`,
      icon: Activity,
      isPositiveGood: true,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'efficiency',
      label: 'COLLECTION EFFICIENCY',
      value: `${summary.collectionEfficiencyRate}%`,
      trend: summary.collectionEfficiencyTrend,
      subtext: `Target 90.0%`,
      icon: CheckCircle2,
      isPositiveGood: true,
      iconColor: 'text-[#047857]',
      iconBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'recovery',
      label: 'RECYCLABLE RECOVERY',
      value: `${summary.recyclableRecoveryRate}%`,
      trend: summary.recyclableRecoveryTrend,
      subtext: `132.1 t diverted`,
      icon: Recycle,
      isPositiveGood: true,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border-teal-200',
    },
    {
      id: 'overflow',
      label: 'OVERFLOW EVENTS',
      value: `${summary.overflowEventsCount}`,
      trend: summary.overflowEventsTrend, // -14.3% is good for overflow!
      subtext: `11 unpredicted`,
      icon: AlertTriangle,
      isPositiveGood: false, // For overflow, negative trend is good!
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const IconComp = card.icon;
        const isUp = card.trend >= 0;
        // Determine if trend color is green or red/amber based on whether positive is good
        const isGood = card.isPositiveGood ? isUp : !isUp;
        const trendColorClass = isGood ? 'text-[#047857] bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';

        return (
          <div
            key={card.id}
            className="bg-white rounded-xl p-4 border border-[#e5e7eb] shadow-2xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {card.label}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {card.value}
                </span>
              </div>
              <div className={`p-2 rounded-lg border ${card.iconBg}`}>
                <IconComp className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-bold border ${trendColorClass}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isUp ? `+${card.trend}%` : `${card.trend}%`}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[110px]">
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
