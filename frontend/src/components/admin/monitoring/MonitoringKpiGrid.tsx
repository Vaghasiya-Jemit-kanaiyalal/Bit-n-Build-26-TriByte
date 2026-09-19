import React from 'react';
import { Trash2, MapPin, AlertTriangle, Truck, Clock } from 'lucide-react';
import type { MonitoringKpiSummary } from '../../../types/monitoring';

interface MonitoringKpiGridProps {
  summary?: MonitoringKpiSummary;
  onFilterClick?: (type: 'bins' | 'criticalBins' | 'vehicles' | 'routes' | 'sensors' | 'collection') => void;
}

export const MonitoringKpiGrid: React.FC<MonitoringKpiGridProps> = ({ summary, onFilterClick }) => {
  const cards = [
    {
      id: 'bins',
      label: 'Total Bins',
      value: summary ? summary.binsMonitored.toLocaleString() : '1,245',
      icon: Trash2,
      bgColor: 'bg-[#f1f5f9]',
      iconColor: 'text-slate-700',
    },
    {
      id: 'activeBins',
      label: 'Active Bins',
      value: summary ? summary.onlineBins.toLocaleString() : '892',
      badge: '72%',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      icon: MapPin,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
    },
    {
      id: 'criticalBins',
      label: 'Near Overflow',
      value: summary ? summary.criticalBins : '28',
      badge: '2.3%',
      badgeBg: 'bg-red-100 text-red-700',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      id: 'vehicles',
      label: 'Active Vehicles',
      value: summary ? summary.activeVehicles : '8',
      icon: Truck,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-700',
    },
    {
      id: 'collection',
      label: 'Collections Today',
      value: summary ? (summary.activeStopsCount || 12) : '12',
      icon: Clock,
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick && onFilterClick(card.id as any)}
            className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full cursor-pointer hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none font-mono">
                  {card.value}
                </span>
                {card.badge && (
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
