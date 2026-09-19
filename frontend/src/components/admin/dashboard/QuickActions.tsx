import React from 'react';
import {
  CalendarCheck,
  Route as RouteIcon,
  Trash2,
  Truck,
  Bell,
  Activity,
} from 'lucide-react';
import type { QuickActionItem } from '../../../types/dashboard';

interface QuickActionsProps {
  actions: QuickActionItem[];
  onNavigateTab: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onNavigateTab }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'CalendarCheck':
        return <CalendarCheck className="w-4 h-4 text-emerald-700" />;
      case 'Route':
        return <RouteIcon className="w-4 h-4 text-purple-600" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4 text-slate-600" />;
      case 'Truck':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Bell':
        return <Bell className="w-4 h-4 text-amber-600" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-teal-600" />;
      default:
        return <CalendarCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleRouteClick = (route: string) => {
    if (route.includes('/admin/planning')) onNavigateTab('Planning');
    else if (route.includes('/admin/routes')) onNavigateTab('Route');
    else if (route.includes('/admin/bins')) onNavigateTab('Bin Management');
    else if (route.includes('/admin/vehicles')) onNavigateTab('Vehicles');
    else if (route.includes('/admin/alerts')) onNavigateTab('Alerts');
    else if (route.includes('/admin/monitoring')) onNavigateTab('Monitoring');
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</span>
        <span className="text-[10px] font-bold text-slate-400">OPERATIONAL SHORTCUTS</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => handleRouteClick(act.route)}
            className="flex flex-col justify-between p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200/80 hover:border-emerald-200 transition-all cursor-pointer text-left group min-h-[72px]"
          >
            <div className="flex items-center justify-between w-full gap-1.5 mb-1.5">
              <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                {getIcon(act.iconName)}
              </div>
              {act.badge && (
                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  {act.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950 leading-snug">
              {act.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
