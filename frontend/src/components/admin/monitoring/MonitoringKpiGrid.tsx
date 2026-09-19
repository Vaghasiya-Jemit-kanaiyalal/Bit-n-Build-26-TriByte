import React from 'react';
import type { MonitoringKpiSummary } from '../../../types/monitoring';
import { Trash2, AlertTriangle, Truck, Route as RouteIcon, Activity, CheckCircle2 } from 'lucide-react';

interface MonitoringKpiGridProps {
  summary: MonitoringKpiSummary;
  onFilterClick?: (type: 'bins' | 'criticalBins' | 'vehicles' | 'routes' | 'sensors' | 'collection') => void;
}

export const MonitoringKpiGrid: React.FC<MonitoringKpiGridProps> = ({
  summary,
  onFilterClick,
}) => {
  const cards = [
    {
      id: 'bins',
      label: 'BINS MONITORED',
      value: summary.binsMonitored,
      subtext: `${summary.onlineBins} online connected`,
      icon: Trash2,
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-900',
      iconColor: 'text-slate-700',
      hoverBorder: 'hover:border-slate-400',
    },
    {
      id: 'criticalBins',
      label: 'CRITICAL BINS',
      value: summary.criticalBins,
      subtext: '>90% fill level capacity',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-950',
      iconColor: 'text-red-600',
      hoverBorder: 'hover:border-red-400',
      badge: 'URGENT',
      badgeBg: 'bg-red-200 text-red-800',
    },
    {
      id: 'vehicles',
      label: 'ACTIVE VEHICLES',
      value: `${summary.activeVehicles} / ${summary.totalVehicles}`,
      subtext: '75% fleet currently deployed',
      icon: Truck,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-950',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-400',
    },
    {
      id: 'routes',
      label: 'ACTIVE ROUTES',
      value: summary.activeRoutes,
      subtext: `${summary.onScheduleRoutes} on schedule`,
      icon: RouteIcon,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-950',
      iconColor: 'text-emerald-600',
      hoverBorder: 'hover:border-emerald-400',
    },
    {
      id: 'sensors',
      label: 'SENSOR HEALTH',
      value: `${summary.sensorHealthPct}%`,
      subtext: `${summary.offlineSensors} offline sensors`,
      icon: Activity,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-950',
      iconColor: 'text-purple-600',
      hoverBorder: 'hover:border-purple-400',
    },
    {
      id: 'collection',
      label: 'COLLECTION ACTIVITY',
      value: summary.activeStopsCount,
      subtext: 'Active stops in progress',
      icon: CheckCircle2,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-950',
      iconColor: 'text-amber-600',
      hoverBorder: 'hover:border-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick && onFilterClick(card.id as any)}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer ${card.hoverBorder} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className={`text-xl sm:text-2xl font-extrabold font-mono ${card.textColor}`}>
                  {card.value}
                </span>
                {card.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block truncate">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
