import React from 'react';
import { History, CheckCircle2, Route as RouteIcon, Truck, AlertTriangle } from 'lucide-react';
import type { DriverActivity as ActivityType } from '../../types/driver';

interface DriverActivityProps {
  activities: ActivityType[];
}

export const DriverActivity: React.FC<DriverActivityProps> = ({ activities }) => {
  const getIcon = (type: ActivityType['type']) => {
    switch (type) {
      case 'collection':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'route':
        return <RouteIcon className="w-3.5 h-3.5 text-blue-600" />;
      case 'vehicle':
        return <Truck className="w-3.5 h-3.5 text-purple-600" />;
      case 'issue':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-extrabold text-slate-900">Recent Activity</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Driver Log</span>
        </div>

        <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
          {activities.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-xs">
              <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 truncate">{item.title}</span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverActivity;
